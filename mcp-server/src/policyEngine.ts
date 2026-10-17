import {
  Account,
  Counterparty,
  InboundPaymentVerificationInput,
  InboundPaymentVerificationResult,
  InvoiceReconciliationInput,
  PolicyEvaluationResult,
  Transaction,
} from './types.js';

export interface PolicyContext {
  accounts: Account[];
  counterparties: Counterparty[];
  transactions: Transaction[];
  companyRules?: {
    autoApprovalLimitCents: number; // e.g., $500.00 = 50,000
    requireDualApprovalAboveCents: number; // e.g., $5,000.00 = 500,000
    allowCryptoPayouts: boolean;
  };
}

const DEFAULT_RULES = {
  autoApprovalLimitCents: 50000, // $500.00
  requireDualApprovalAboveCents: 500000, // $5,000.00
  allowCryptoPayouts: true,
};

export class BlinkaPolicyEngine {
  /**
   * Reconciles an invoice against registered counterparties and past transactions
   */
  static reconcileInvoice(
    invoice: InvoiceReconciliationInput,
    context: PolicyContext
  ): {
    matchedCounterparty: Counterparty | null;
    isDuplicate: boolean;
    duplicateTransaction: Transaction | null;
    hasSufficientBalance: boolean;
    recommendedSourceAccount: Account | null;
    reconciliationNotes: string[];
  } {
    const notes: string[] = [];

    // 1. Match counterparty by name
    const normalizedName = invoice.vendorName.toLowerCase().trim();
    const matchedCounterparty =
      context.counterparties.find(
        (cp) =>
          cp.name.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(cp.name.toLowerCase())
      ) || null;

    if (matchedCounterparty) {
      notes.push(`Proveedor emparejado con éxito: '${matchedCounterparty.name}' (ID: ${matchedCounterparty.id})`);
    } else {
      notes.push(`Proveedor no registrado en Blinka. Se debe registrar el counterparty antes de pagar.`);
    }

    // 2. Check for duplicate invoices
    const duplicateTransaction =
      context.transactions.find((tx) => {
        const memoHasInvoice = tx.memo?.includes(invoice.invoiceNumber);
        const notesHasInvoice = tx.notes?.includes(invoice.invoiceNumber);
        const sameAmount = Math.abs(tx.amountCents) === invoice.amountCents;
        return (memoHasInvoice || notesHasInvoice) && sameAmount;
      }) || null;

    const isDuplicate = !!duplicateTransaction;
    if (isDuplicate) {
      notes.push(
        `ALERTA DE DUPLICIDAD: La factura #${invoice.invoiceNumber} ya fue pagada el ${duplicateTransaction.executedAt} (TX: ${duplicateTransaction.id}).`
      );
    }

    // 3. Find recommended account with sufficient balance
    const primaryAccount =
      context.accounts.find((acc) => acc.settlementStrategy === invoice.currency && acc.type === 'CHECKING') ||
      context.accounts[0];

    const estimatedFeeCents = 25; // standard ACH fee
    const hasSufficientBalance = primaryAccount
      ? primaryAccount.balance >= invoice.amountCents + estimatedFeeCents
      : false;

    if (!hasSufficientBalance && primaryAccount) {
      const shortByCents = invoice.amountCents + estimatedFeeCents - primaryAccount.balance;
      notes.push(
        `Balance insuficiente en cuenta principal (${primaryAccount.id}). Faltan $${(shortByCents / 100).toFixed(2)} USD.`
      );
    }

    return {
      matchedCounterparty,
      isDuplicate,
      duplicateTransaction,
      hasSufficientBalance,
      recommendedSourceAccount: primaryAccount || null,
      reconciliationNotes: notes,
    };
  }

  /**
   * Evaluates corporate policies and guardrails to decide if payment can proceed
   */
  static evaluatePolicy(
    invoice: InvoiceReconciliationInput,
    context: PolicyContext
  ): PolicyEvaluationResult {
    const rules = context.companyRules || DEFAULT_RULES;
    const reasons: string[] = [];
    const rulesTriggered: PolicyEvaluationResult['rulesTriggered'] = [];

    const reconciliation = this.reconcileInvoice(invoice, context);

    // Rule 1: Duplicate Invoice Check
    const dupRulePassed = !reconciliation.isDuplicate;
    rulesTriggered.push({
      ruleId: 'GUARD_NO_DUPLICATE_PAYMENT',
      description: 'Verificar que la factura no haya sido pagada con anterioridad',
      passed: dupRulePassed,
      severity: 'CRITICAL',
    });
    if (!dupRulePassed) {
      reasons.push(`Factura #${invoice.invoiceNumber} rechazada por intento de pago duplicado.`);
      return {
        decision: 'REJECT',
        score: 0,
        reasons,
        rulesTriggered,
        suggestedAction: 'Rechazar la factura y notificar al proveedor que ya fue saldada.',
      };
    }

    // Rule 2: Counterparty Registered
    const cpRulePassed = !!reconciliation.matchedCounterparty;
    rulesTriggered.push({
      ruleId: 'GUARD_COUNTERPARTY_EXISTS',
      description: 'El beneficiario debe estar registrado en el workspace de Blinka',
      passed: cpRulePassed,
      severity: 'HIGH',
    });
    if (!cpRulePassed) {
      reasons.push(`El proveedor '${invoice.vendorName}' no está registrado como contraparte.`);
    }

    // Rule 3: Payout Method Approved by Human
    let approvedPayoutMethod = false;
    if (reconciliation.matchedCounterparty) {
      const approvedMethods = reconciliation.matchedCounterparty.payoutMethods.filter(
        (pm) => pm.approval.status === 'approved'
      );
      approvedPayoutMethod = approvedMethods.length > 0;

      // Check if invoice provides bank account ending and matches (Fiat ACH/Wire)
      if (invoice.beneficiaryBankLastFour) {
        const matchesBank = approvedMethods.some(
          (m) => m.accountEnding === invoice.beneficiaryBankLastFour
        );
        if (!matchesBank) {
          rulesTriggered.push({
            ruleId: 'GUARD_BANK_ACCOUNT_MATCH',
            description: 'La cuenta bancaria de la factura debe coincidir con el método aprobado en Blinka',
            passed: false,
            severity: 'CRITICAL',
          });
          reasons.push(
            `Alerta de seguridad: La cuenta bancaria de la factura (*${invoice.beneficiaryBankLastFour}) no coincide con los métodos bancarios aprobados para este proveedor.`
          );
        }
      }

      // Check if invoice provides crypto wallet address and matches (Crypto USDC on Base/Solana)
      if (invoice.walletAddress) {
        const normalizedWallet = invoice.walletAddress.toLowerCase().trim();
        const matchesWallet = approvedMethods.some(
          (m) => m.walletAddress && m.walletAddress.toLowerCase().trim() === normalizedWallet
        );
        if (!matchesWallet) {
          rulesTriggered.push({
            ruleId: 'GUARD_CRYPTO_WALLET_MATCH',
            description: 'La dirección de billetera cripto (USDC / Base) debe coincidir con la registrada en Blinka',
            passed: false,
            severity: 'CRITICAL',
          });
          reasons.push(
            `Alerta de Ciberseguridad Web3: La dirección de wallet (${invoice.walletAddress}) no coincide con la billetera verificada para este proveedor. Posible ataque de Address Poisoning o Phishing.`
          );
        }
      }
    }

    rulesTriggered.push({
      ruleId: 'GUARD_PAYOUT_METHOD_APPROVED',
      description: 'El método de pago del proveedor debe estar previamente autorizado por un administrador',
      passed: approvedPayoutMethod,
      severity: 'CRITICAL',
    });
    if (!approvedPayoutMethod && cpRulePassed) {
      reasons.push('El proveedor existe pero sus métodos de pago están pendientes de aprobación en Blinka.');
    }

    // Rule 4: Balance Availability
    rulesTriggered.push({
      ruleId: 'GUARD_SUFFICIENT_LIQUIDITY',
      description: 'La cuenta operativa debe contar con fondos suficientes incluyendo comisiones de red',
      passed: reconciliation.hasSufficientBalance,
      severity: 'HIGH',
    });
    if (!reconciliation.hasSufficientBalance) {
      reasons.push('Fondos insuficientes en la cuenta operativa para cubrir el monto y fee.');
    }

    // Rule 5: Blinka API Ceiling ($2,000,000 max)
    const MAX_CEILING_CENTS = 200000000;
    const withinCeiling = invoice.amountCents <= MAX_CEILING_CENTS;
    rulesTriggered.push({
      ruleId: 'GUARD_BLINKA_CEILING',
      description: 'El monto no debe exceder el límite máximo por transferencia de Blinka ($2,000,000.00)',
      passed: withinCeiling,
      severity: 'CRITICAL',
    });
    if (!withinCeiling) {
      reasons.push('El monto excede el tope operacional permitido de $2M USD.');
      return {
        decision: 'REJECT',
        score: 0,
        reasons,
        rulesTriggered,
        suggestedAction: 'El monto sobrepasa los límites de la red.',
      };
    }

    // Determine Final Decision
    const criticalFailures = rulesTriggered.filter((r) => !r.passed && r.severity === 'CRITICAL');
    const highFailures = rulesTriggered.filter((r) => !r.passed && r.severity === 'HIGH');

    if (criticalFailures.length > 0) {
      return {
        decision: 'REJECT',
        score: 15,
        reasons,
        rulesTriggered,
        suggestedAction: 'Bloquear el pago de inmediato. Se requiere subsanar discrepancias críticas de seguridad o fraude.',
      };
    }

    if (highFailures.length > 0) {
      return {
        decision: 'REQUIRE_HUMAN_APPROVAL',
        score: 60,
        reasons,
        rulesTriggered,
        suggestedAction: 'Borrador creado. Enviar solicitud de aprobación humana al portal Blinka o Slack/WhatsApp del CFO.',
      };
    }

    // Check Auto-Approval Threshold
    if (invoice.amountCents <= rules.autoApprovalLimitCents && approvedPayoutMethod) {
      reasons.push(
        `Monto ($${(invoice.amountCents / 100).toFixed(2)}) menor al umbral de auto-aprobación ($${(rules.autoApprovalLimitCents / 100).toFixed(2)}) para proveedor recurrente verificado.`
      );
      return {
        decision: 'AUTO_APPROVE',
        score: 98,
        reasons,
        rulesTriggered,
        suggestedAction: 'Ejecutar transferencia inmediata vía Blinka API.',
      };
    } else {
      reasons.push(
        `Monto ($${(invoice.amountCents / 100).toFixed(2)}) supera el umbral de auto-aprobación o requiere confirmación estándar de tesorería.`
      );
      return {
        decision: 'REQUIRE_HUMAN_APPROVAL',
        score: 85,
        reasons,
        rulesTriggered,
        suggestedAction: 'Generar transferencia en estado "draft" y notificar para doble factor de aprobación en app.blinka.co.',
      };
    }
  }

  /**
   * Validates inbound payments (Pay-ins) received in either Fiat (USD ACH/Wire) or Crypto (USDC on Base)
   */
  static verifyInboundPayment(
    input: InboundPaymentVerificationInput,
    context: PolicyContext
  ): InboundPaymentVerificationResult {
    const targetCurrency = input.currency || 'USD';
    const inboundTxs = context.transactions.filter(
      (tx) => tx.kind === 'PAYIN' && tx.currency === targetCurrency
    );

    // Search by memo / txHash / invoice number / clientName / amount
    const matchedTx = inboundTxs.find((tx) => {
      const matchAmount = Math.abs(tx.amountCents) === input.amountCents;
      if (!matchAmount) return false;

      if (input.invoiceNumber && (tx.notes?.includes(input.invoiceNumber) || tx.memo?.includes(input.invoiceNumber))) {
        return true;
      }
      if (input.txHashOrMemo && (tx.notes?.includes(input.txHashOrMemo) || tx.memo?.includes(input.txHashOrMemo))) {
        return true;
      }
      if (input.clientName && tx.counterpartyName?.toLowerCase().includes(input.clientName.toLowerCase())) {
        return true;
      }
      return true; // Match by exact amount and currency
    });

    if (matchedTx) {
      const isSettled = matchedTx.status === 'COMPLETED';
      return {
        verified: isSettled,
        status: isSettled ? 'CONFIRMED' : 'PENDING_SETTLEMENT',
        currency: targetCurrency,
        railUsed: targetCurrency === 'USDC' ? 'Base Network (USDC Blockchain)' : 'Portage Bank ACH/Wire (USD FDIC)',
        amountReceivedCents: Math.abs(matchedTx.amountCents),
        destinationAccount: matchedTx.accountId,
        transactionId: matchedTx.id,
        txHashOrReference: matchedTx.notes || matchedTx.memo || 'N/A',
        settledAt: matchedTx.executedAt,
        notes: isSettled
          ? `Pago de $${(Math.abs(matchedTx.amountCents) / 100).toFixed(2)} ${targetCurrency} verificado y acreditado exitosamente.`
          : `Pago detectado en tránsito pero en espera de confirmación bancaria/blockchain.`,
      };
    }

    // Check if partial or different amount exists for client
    const partialTx = inboundTxs.find((tx) =>
      input.clientName ? tx.counterpartyName?.toLowerCase().includes(input.clientName.toLowerCase()) : false
    );
    if (partialTx) {
      return {
        verified: false,
        status: 'AMOUNT_MISMATCH',
        currency: targetCurrency,
        railUsed: targetCurrency === 'USDC' ? 'Base Network (USDC Blockchain)' : 'Portage Bank ACH/Wire',
        amountReceivedCents: Math.abs(partialTx.amountCents),
        destinationAccount: partialTx.accountId,
        transactionId: partialTx.id,
        notes: `Se recibió un pago de '${partialTx.counterpartyName}', pero por monto diferente: esperado $${(input.amountCents / 100).toFixed(2)} ${targetCurrency}, recibido $${(Math.abs(partialTx.amountCents) / 100).toFixed(2)} ${targetCurrency}.`,
      };
    }

    return {
      verified: false,
      status: 'NOT_FOUND',
      currency: targetCurrency,
      railUsed: targetCurrency === 'USDC' ? 'Base Network (USDC Blockchain)' : 'Portage Bank ACH/Wire',
      amountReceivedCents: 0,
      destinationAccount: targetCurrency === 'USDC' ? 'acc_usdc_multichain_3310' : 'acc_usd_primary_4821',
      notes: `No se encontró ningún depósito entrante de $${(input.amountCents / 100).toFixed(2)} ${targetCurrency} en las cuentas de Blinka.`,
    };
  }
}
