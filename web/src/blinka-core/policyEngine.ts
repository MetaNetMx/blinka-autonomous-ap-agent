import {
  Counterparty,
  InboundPaymentVerificationInput,
  InboundPaymentVerificationResult,
  InvoiceReconciliationInput,
  PayoutMethod,
  PolicyEvaluationResult,
  Transaction,
} from './types';

export const POLICY_RULES = {
  MAX_AUTO_APPROVE_CENTS: 500000, // $5,000.00 USD
  REQUIRE_CFO_APPROVAL_CENTS: 1000000, // $10,000.00 USD
  HARD_LIMIT_SINGLE_TX_CENTS: 10000000, // $100,000.00 USD
  ALLOWED_CURRENCIES: ['USD', 'USDC', 'COP'],
};

export function evaluatePaymentPolicy(
  invoice: InvoiceReconciliationInput,
  counterparty: Counterparty | undefined,
  payoutMethod: PayoutMethod | undefined
): PolicyEvaluationResult {
  const reasons: string[] = [];
  const rulesTriggered: PolicyEvaluationResult['rulesTriggered'] = [];
  let decision: PolicyEvaluationResult['decision'] = 'AUTO_APPROVE';
  let score = 100;

  // Rule 1: Counterparty Existence
  if (!counterparty) {
    rulesTriggered.push({
      ruleId: 'RULE_UNKNOWN_COUNTERPARTY',
      description: 'Vendor not registered in Blinka directory',
      passed: false,
      severity: 'HIGH',
    });
    reasons.push(`Unknown vendor: "${invoice.vendorName}" has no registered counterparty profile.`);
    score -= 40;
    decision = 'REQUIRE_HUMAN_APPROVAL';
  } else {
    rulesTriggered.push({
      ruleId: 'RULE_KNOWN_COUNTERPARTY',
      description: `Verified vendor: ${counterparty.name} (${counterparty.id})`,
      passed: true,
      severity: 'LOW',
    });
  }

  // Rule 2: Currency Support
  if (!POLICY_RULES.ALLOWED_CURRENCIES.includes(invoice.currency)) {
    rulesTriggered.push({
      ruleId: 'RULE_UNSUPPORTED_CURRENCY',
      description: `Currency ${invoice.currency} is unsupported`,
      passed: false,
      severity: 'CRITICAL',
    });
    reasons.push(`Currency ${invoice.currency} cannot be settled by Blinka rails.`);
    score = 0;
    return {
      decision: 'REJECT',
      score: 0,
      reasons,
      rulesTriggered,
      suggestedAction: 'Reject invoice or request invoice in USD/USDC/COP',
    };
  }

  // Rule 3: Anti-Phishing Bank Account Verification
  if (counterparty && invoice.beneficiaryBankLastFour) {
    const matchingMethod = counterparty.payoutMethods.find(
      (pm) => pm.accountEnding === invoice.beneficiaryBankLastFour
    );

    if (!matchingMethod) {
      rulesTriggered.push({
        ruleId: 'RULE_FRAUD_BANK_MISMATCH',
        description: `CRITICAL: Invoice specifies bank ending in ${invoice.beneficiaryBankLastFour}, but vendor registered account ends in ${counterparty.payoutMethods.map(m => m.accountEnding).join(', ') || 'none'}`,
        passed: false,
        severity: 'CRITICAL',
      });
      reasons.push(
        `🚨 FRAUD/PHISHING ALERT: Bank account ending in ${invoice.beneficiaryBankLastFour} does NOT match any approved payout method on file for ${counterparty.name}.`
      );
      score = 0;
      return {
        decision: 'REJECT',
        score: 0,
        reasons,
        rulesTriggered,
        suggestedAction: 'IMMEDIATELY FREEZE INVOICE & NOTIFY CFO: Potential account hijacking or invoice spoofing.',
      };
    } else {
      rulesTriggered.push({
        ruleId: 'RULE_BANK_MATCH_CONFIRMED',
        description: `Verified bank ending ${invoice.beneficiaryBankLastFour} matches approved payout method ${matchingMethod.id}`,
        passed: true,
        severity: 'LOW',
      });
    }
  }

  // Rule 3b: Anti-Phishing Web3 Crypto Wallet Verification (USDC on Base/Solana)
  if (counterparty && invoice.walletAddress) {
    const normalizedWallet = invoice.walletAddress.toLowerCase().trim();
    const matchingWalletMethod = counterparty.payoutMethods.find(
      (pm) => pm.walletAddress && pm.walletAddress.toLowerCase().trim() === normalizedWallet
    );

    if (!matchingWalletMethod) {
      rulesTriggered.push({
        ruleId: 'RULE_FRAUD_WALLET_MISMATCH',
        description: `CRITICAL: Crypto invoice specifies wallet ${invoice.walletAddress}, but verified wallet on file for ${counterparty.name} is ${counterparty.payoutMethods.map(m => m.walletAddress).filter(Boolean).join(', ') || 'none'}`,
        passed: false,
        severity: 'CRITICAL',
      });
      reasons.push(
        `🚨 WEB3 ADDRESS POISONING / PHISHING ALERT: Crypto wallet ${invoice.walletAddress} does NOT match approved wallet on file for ${counterparty.name}.`
      );
      score = 0;
      return {
        decision: 'REJECT',
        score: 0,
        reasons,
        rulesTriggered,
        suggestedAction: 'IMMEDIATELY FREEZE CRYPTO DISBURSEMENT & NOTIFY SECURITY: Potential address poisoning or private key compromise.',
      };
    } else {
      rulesTriggered.push({
        ruleId: 'RULE_CRYPTO_WALLET_CONFIRMED',
        description: `Verified Base Network wallet ${invoice.walletAddress.slice(0, 8)}... matches approved payout method`,
        passed: true,
        severity: 'LOW',
      });
    }
  }

  // Rule 4: Payout Method Approval Status
  if (payoutMethod) {
    if (payoutMethod.approval.status === 'pending') {
      rulesTriggered.push({
        ruleId: 'RULE_PAYOUT_METHOD_PENDING',
        description: `Selected payout method ${payoutMethod.id} is pending human approval in Blinka app`,
        passed: false,
        severity: 'HIGH',
      });
      reasons.push(
        `Selected payout method (${payoutMethod.methodType} ending in ${payoutMethod.accountEnding}) has not been approved by an administrator.`
      );
      score -= 30;
      decision = 'REQUIRE_HUMAN_APPROVAL';
    } else if (payoutMethod.approval.status === 'rejected') {
      rulesTriggered.push({
        ruleId: 'RULE_PAYOUT_METHOD_REJECTED',
        description: `Selected payout method ${payoutMethod.id} was previously rejected`,
        passed: false,
        severity: 'CRITICAL',
      });
      reasons.push('Payout method was explicitly rejected by security.');
      score = 0;
      return {
        decision: 'REJECT',
        score: 0,
        reasons,
        rulesTriggered,
        suggestedAction: 'Select an active approved payout method or request vendor update.',
      };
    }
  }

  // Rule 5: Amount Limits & Dual-Authorization Thresholds
  if (invoice.amountCents > POLICY_RULES.HARD_LIMIT_SINGLE_TX_CENTS) {
    rulesTriggered.push({
      ruleId: 'RULE_EXCEEDS_HARD_CAP',
      description: `Amount exceeds single transaction hard cap ($100,000.00)`,
      passed: false,
      severity: 'CRITICAL',
    });
    reasons.push(`Amount ($${(invoice.amountCents / 100).toLocaleString()}) exceeds the maximum transaction hard cap.`);
    score = 0;
    return {
      decision: 'REJECT',
      score: 0,
      reasons,
      rulesTriggered,
      suggestedAction: 'Break payment into structured milestone tranches or conduct board review.',
    };
  }

  if (invoice.amountCents > POLICY_RULES.REQUIRE_CFO_APPROVAL_CENTS) {
    rulesTriggered.push({
      ruleId: 'RULE_EXCEEDS_DUAL_AUTH_LIMIT',
      description: `Amount ($${(invoice.amountCents / 100).toLocaleString()}) exceeds $10,000 threshold requiring dual executive sign-off`,
      passed: false,
      severity: 'HIGH',
    });
    reasons.push(
      `High-value disbursement ($${(invoice.amountCents / 100).toLocaleString()} > $10,000 threshold) requires dual executive authorization per Blinka Treasury governance.`
    );
    score = Math.min(score, 75);
    decision = 'REQUIRE_HUMAN_APPROVAL';
  } else if (invoice.amountCents > POLICY_RULES.MAX_AUTO_APPROVE_CENTS) {
    rulesTriggered.push({
      ruleId: 'RULE_EXCEEDS_AUTO_APPROVE',
      description: `Amount ($${(invoice.amountCents / 100).toLocaleString()}) exceeds autonomous threshold ($5,000.00)`,
      passed: false,
      severity: 'MEDIUM',
    });
    reasons.push(`Amount is between $5,000 and $10,000: staged for finance team 1-click review.`);
    score = Math.min(score, 85);
    if (decision !== 'REQUIRE_HUMAN_APPROVAL') {
      decision = 'REQUIRE_HUMAN_APPROVAL';
    }
  } else {
    rulesTriggered.push({
      ruleId: 'RULE_WITHIN_AUTO_APPROVE_LIMIT',
      description: `Amount ($${(invoice.amountCents / 100).toLocaleString()}) is <= $5,000.00 auto-approval threshold`,
      passed: true,
      severity: 'LOW',
    });
  }

  // Suggested Actions based on decision
  let suggestedAction = 'Proceed with autonomous instant settlement via Blinka API.';
  if (decision === 'REQUIRE_HUMAN_APPROVAL') {
    suggestedAction = 'Stage payout draft in Blinka queue and request 1-click CFO sign-off.';
  }

  return {
    decision,
    score: Math.max(0, score),
    reasons,
    rulesTriggered,
    suggestedAction,
  };
}

export function verifyInboundPayment(
  input: InboundPaymentVerificationInput,
  transactions: Transaction[]
): InboundPaymentVerificationResult {
  const targetCurrency = input.currency || 'USD';
  const inboundTxs = transactions.filter(
    (tx) => tx.kind === 'PAYIN' && tx.currency === targetCurrency
  );

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
    return true;
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
        ? `Pago entrante de $${(Math.abs(matchedTx.amountCents) / 100).toFixed(2)} ${targetCurrency} verificado y confirmado en Blinka.`
        : `Pago entrante detectado en tránsito, pendiente de liquidación.`,
    };
  }

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
      notes: `Depósito encontrado de '${partialTx.counterpartyName}', pero monto no coincide: esperado $${(input.amountCents / 100).toFixed(2)} ${targetCurrency}, recibido $${(Math.abs(partialTx.amountCents) / 100).toFixed(2)} ${targetCurrency}.`,
    };
  }

  return {
    verified: false,
    status: 'NOT_FOUND',
    currency: targetCurrency,
    railUsed: targetCurrency === 'USDC' ? 'Base Network (USDC Blockchain)' : 'Portage Bank ACH/Wire',
    amountReceivedCents: 0,
    destinationAccount: targetCurrency === 'USDC' ? 'acc_usdc_multichain_3310' : 'acc_usd_primary_4821',
    notes: `No se encontró ningún depósito entrante de $${(input.amountCents / 100).toFixed(2)} ${targetCurrency} en el ledger de Blinka.`,
  };
}
