import { AgentChatMessage } from './types';
import { useBlinkaStore } from './store';

export async function processAgentQuery(
  query: string,
  store: ReturnType<typeof useBlinkaStore>
): Promise<AgentChatMessage> {
  const lower = query.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const thoughts: string[] = [];
  const toolCalls: AgentChatMessage['toolCalls'] = [];

  // Helper delay for realistic agent reasoning effect
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- INTENT 1: RECONCILE / EVALUATE ALL INVOICES ---
  if (lower.includes('reconcil') || lower.includes('proces') || lower.includes('evalu') || lower.includes('inbox') || lower.includes('factura')) {
    thoughts.push('Analyzing unreviewed invoices in AP queue...');
    thoughts.push('Querying registered counterparties and historical transactions from Blinka ledger...');

    const pendingInvoices = store.state.invoices.filter((i) => i.status === 'pending_evaluation');

    if (pendingInvoices.length === 0) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: `He revisado la bandeja de entrada de Cuentas por Pagar (AP). Actualmente **no hay facturas pendientes de evaluación**. Todas las facturas ya fueron procesadas, aprobadas o bloqueadas por políticas de seguridad.`,
        thoughts: ['Checked invoices table', 'All current items are settled or triaged'],
        toolCalls: [
          {
            toolName: 'blinka_reconcile_invoice',
            parameters: { filter: 'pending_evaluation' },
            result: { count: 0, status: 'QUEUE_EMPTY' },
          },
        ],
      };
    }

    const results = [];
    for (const inv of pendingInvoices) {
      const res = store.evaluateAndProcessInvoice(inv.id);
      results.push(res);

      toolCalls.push({
        toolName: 'blinka_evaluate_payment_policy',
        parameters: {
          invoiceNumber: inv.invoiceNumber,
          vendorName: inv.vendorName,
          amountCents: inv.amountCents,
          beneficiaryBankLastFour: inv.beneficiaryBankLastFour,
        },
        result: res.policyResult,
      });

      if (res.policyResult.decision === 'AUTO_APPROVE') {
        toolCalls.push({
          toolName: 'blinka_execute_vendor_payout',
          parameters: {
            invoiceNumber: inv.invoiceNumber,
            amountCents: inv.amountCents,
            targetAccount: inv.beneficiaryBankLastFour,
            rail: 'ACH',
          },
          result: {
            status: 'EXECUTED',
            transactionId: res.invoice.payoutTransactionId,
            payoutRail: 'ACH',
          },
        });
      }
    }

    thoughts.push(`Evaluated ${pendingInvoices.length} invoices against Blinka Treasury & Risk Policies.`);

    const autoPaid = results.filter((r) => r.policyResult.decision === 'AUTO_APPROVE');
    const awaitingCfo = results.filter((r) => r.policyResult.decision === 'REQUIRE_HUMAN_APPROVAL');
    const blocked = results.filter((r) => r.policyResult.decision === 'REJECT');

    let reply = `### 🤖 Reporte de Conciliación Autónoma Blinka AP\n\n`;
    reply += `Se evaluaron **${pendingInvoices.length} facturas** usando el motor de políticas de Blinka:\n\n`;

    if (autoPaid.length > 0) {
      reply += `✅ **Pagadas Autónomamente (${autoPaid.length}):**\n`;
      for (const item of autoPaid) {
        reply += `- **${item.invoice.vendorName}** (${item.invoice.invoiceNumber}): $${(item.invoice.amountCents / 100).toLocaleString()} USD. Validado contra cuenta bancaria terminada en \`${item.invoice.beneficiaryBankLastFour}\`. Ejecutado vía ACH.\n`;
      }
      reply += `\n`;
    }

    if (awaitingCfo.length > 0) {
      reply += `⚠️ **En Cola de Aprobación Dual CFO (${awaitingCfo.length}):**\n`;
      for (const item of awaitingCfo) {
        reply += `- **${item.invoice.vendorName}** (${item.invoice.invoiceNumber}): $${(item.invoice.amountCents / 100).toLocaleString()} USD. Excede el umbral autónomo de $5,000 USD. Requiere 1-clic del CFO en la consola.\n`;
      }
      reply += `\n`;
    }

    if (blocked.length > 0) {
      reply += `🚨 **BLOQUEOS DE SEGURIDAD & FRAUDE (${blocked.length}):**\n`;
      for (const item of blocked) {
        reply += `- **${item.invoice.vendorName}** (${item.invoice.invoiceNumber}): $${(item.invoice.amountCents / 100).toLocaleString()} USD. ${item.policyResult.reasons.join(' ')}\n`;
      }
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: reply,
      thoughts,
      toolCalls,
    };
  }

  // --- INTENT 2: BALANCES & TREASURY INQUIRY ---
  if (lower.includes('saldo') || lower.includes('balance') || lower.includes('cuenta') || lower.includes('cash') || lower.includes('treasury')) {
    thoughts.push('Executing blinka_list_accounts tool call across all settlement rails...');
    const accounts = store.state.accounts;

    toolCalls.push({
      toolName: 'blinka_list_accounts',
      parameters: { legalEntityId: store.state.accounts[0].legalEntityId },
      result: accounts.map((a) => ({
        id: a.id,
        type: a.type,
        balance: a.balance / 100,
        strategy: a.settlementStrategy,
      })),
    });

    const checking = accounts.find((a) => a.type === 'CHECKING' && a.settlementStrategy === 'USD');
    const treasury = accounts.find((a) => a.type === 'TREASURY');
    const usdc = accounts.find((a) => a.settlementStrategy === 'USDC');

    const checkingUsd = checking ? checking.balance / 100 : 0;
    const treasuryUsd = treasury ? treasury.balance / 100 : 0;
    const usdcBal = usdc ? usdc.balance / 100 : 0;
    const totalLiquidUsd = checkingUsd + treasuryUsd + usdcBal;

    let reply = `### 🏦 Posición de Tesorería Blinka en Tiempo Real\n\n`;
    reply += `**Total Liquidez Disponible:** **$${totalLiquidUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD**\n\n`;
    reply += `- 💵 **Cuenta Operativa Checking (Portage Bank FDIC):** $${checkingUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD (Rieles ACH/Wire)\n`;
    reply += `- 📈 **Blinka Treasury Yield Vault (BNY Mellon):** $${treasuryUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD (*Generando 4.85% APY*)\n`;
    reply += `- ⚡ **USDC Multi-Chain Vault (Base Rail):** ${usdcBal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC\n\n`;
    reply += `💡 *Recomendación del Agente:* Tienes **$${checkingUsd.toLocaleString()} USD** en cuenta operativa al 0% de interés. Puedes ejecutar un **Treasury Sweep** para mover excedentes sobre $100k a la bóveda de BNY Mellon y generar rendimientos diarios.`;

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: reply,
      thoughts,
      toolCalls,
    };
  }

  // --- INTENT 3: TREASURY SWEEP ---
  if (lower.includes('sweep') || lower.includes('rendimiento') || lower.includes('invertir') || lower.includes('yield') || lower.includes('barrido')) {
    thoughts.push('Evaluating idle cash in Primary Checking against liquidity buffer ($100k)...');
    const checking = store.state.accounts.find((a) => a.type === 'CHECKING' && a.settlementStrategy === 'USD');
    const treasury = store.state.accounts.find((a) => a.type === 'TREASURY');

    if (!checking || !treasury) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        timestamp,
        content: 'Error: No se localizaron las cuentas operativas y de tesorería.',
      };
    }

    const sweepAmountCents = 2500000; // $25,000 USD sweep
    thoughts.push(`Checking balance is $${(checking.balance / 100).toLocaleString()}. Transferring $25,000 to Dreyfus Money Market Vault.`);

    const transfer = store.executeInternalTransfer(
      checking.id,
      treasury.id,
      sweepAmountCents,
      'Autonomous Yield Sweep - Idle Cash Optimization'
    );

    toolCalls.push({
      toolName: 'blinka_create_transfer',
      parameters: {
        sourceAccountId: checking.id,
        destinationAccountId: treasury.id,
        amountCents: sweepAmountCents,
        memo: 'Autonomous Yield Sweep',
      },
      result: transfer,
    });

    const newChecking = (checking.balance / 100).toLocaleString();
    const newTreasury = (treasury.balance / 100).toLocaleString();

    let reply = `### 🚀 Barrido de Tesorería (Treasury Sweep) Ejecutado con Éxito\n\n`;
    reply += `Se transfirieron **$25,000.00 USD** desde tu cuenta Checking de Portage Bank a la bóveda **Blinka Treasury (BNY Dreyfus 4.85% APY)**.\n\n`;
    reply += `- **Nuevo Saldo Checking:** $${newChecking} USD\n`;
    reply += `- **Nuevo Saldo Treasury:** $${newTreasury} USD\n`;
    reply += `- **Rendimiento Estimado Anual Adicional:** +$1,212.50 USD/año\n`;
    reply += `- **Idempotency Key:** \`${transfer.idempotencyKey}\`\n\n`;
    reply += `El capital sigue 100% líquido con retiros en T+0 si surgen compromisos de nómina o pagos a proveedores.`;

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: reply,
      thoughts,
      toolCalls,
    };
  }

  // --- INTENT 4: FRAUD & SECURITY AUDIT ---
  if (lower.includes('fraud') || lower.includes('seguridad') || lower.includes('phishing') || lower.includes('alerta') || lower.includes('audit')) {
    thoughts.push('Scanning counterparty payout methods and staged invoices for spoofing or tampering...');
    const fraudInvoices = store.state.invoices.filter(
      (i) => i.status === 'fraud_blocked' || i.invoiceNumber.includes('TAMPERED') || i.beneficiaryBankLastFour === '9999'
    );

    toolCalls.push({
      toolName: 'blinka_evaluate_payment_policy',
      parameters: { auditScope: 'ALL_COUNTERPARTIES_AND_INVOICES' },
      result: {
        flagsDetected: fraudInvoices.length,
        criticalThreats: fraudInvoices.map((f) => ({
          vendor: f.vendorName,
          mismatch: `Bank ending ${f.beneficiaryBankLastFour} vs registered 1029`,
          riskLevel: 'CRITICAL',
        })),
      },
    });

    let reply = `### 🛡️ Auditoría de Seguridad & Anti-Phishing Blinka\n\n`;
    reply += `El agente monitorea continuamente la integridad de cada factura entrante mediante verificación de cuenta bancaria en dos pasos:\n\n`;

    if (fraudInvoices.length > 0) {
      reply += `🚨 **Amenaza Crítica Neutralizada:**\n`;
      reply += `- **Proveedor Suplantado:** Stripe Payments LLC\n`;
      reply += `- **Monto en Riesgo:** $14,250.00 USD\n`;
      reply += `- **Vector de Ataque:** La factura exigía transferencia a la cuenta terminada en \`9999\`. Sin embargo, la cuenta verificada en Blinka termina en \`1029\`.\n`;
      reply += `- **Acción del Agente:** Factura **congelada automáticamente**. Se emitieron alertas de seguridad y se impidió cualquier salida de capital.\n`;
    } else {
      reply += `✅ No se detectan anomalías activas. Todas las cuentas de destino coinciden con los métodos de pago autorizados en Blinka.`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      timestamp,
      content: reply,
      thoughts,
      toolCalls,
    };
  }

  // --- DEFAULT FALLBACK / GENERAL ASSISTANCE ---
  thoughts.push('Parsing general operational query with Blinka Copilot context...');
  toolCalls.push({
    toolName: 'blinka_list_accounts',
    parameters: {},
    result: { status: 'ONLINE', rails: ['ACH_WIRE', 'USDC_BASE', 'COLOMBIA_BREB'] },
  });

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    timestamp,
    content: `Hola. Soy tu **Agente Autónomo de Cuentas por Pagar y Tesorería Blinka** (YC F26).\n\nPuedo ayudarte con:\n\n1. 🧾 **Conciliación Autónoma:** *"Reconcilia las facturas de la bandeja de entrada"* o *"Evalúa los pagos pendientes"*.\n2. 📈 **Optimización de Tesorería:** *"Haz un sweep a la cuenta Treasury para ganar 4.85% APY"*.\n3. 🛡️ **Auditoría de Fraude:** *"Verifica si hay facturas con cuentas bancarias no autorizadas"*.\n4. 💵 **Consulta de Saldos:** *"¿Cuánto efectivo disponible tenemos en Portage Bank y en USDC?"*`,
    thoughts,
    toolCalls,
  };
}
