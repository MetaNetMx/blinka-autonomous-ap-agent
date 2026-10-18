import { useState, useEffect } from 'react';
import {
  Account,
  Counterparty,
  PayoutMethod,
  StagedInvoice,
  StagedInboundPayment,
  Transaction,
  Transfer,
  InvoiceReconciliationInput,
  PolicyEvaluationResult,
  InboundPaymentVerificationInput,
  InboundPaymentVerificationResult,
} from './types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_COUNTERPARTIES,
  INITIAL_TRANSACTIONS,
  DEMO_PRESET_INVOICES,
  INITIAL_INBOUND_PAYMENTS,
  INITIAL_LEGAL_ENTITY,
} from './mockData';
import { evaluatePaymentPolicy, verifyInboundPayment } from './policyEngine';

const STORAGE_KEY = 'blinka_ap_agent_state_v5';

interface StateData {
  accounts: Account[];
  counterparties: Counterparty[];
  transactions: Transaction[];
  invoices: StagedInvoice[];
  inboundPayments: StagedInboundPayment[];
}

function loadInitialState(): StateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);

      // Merge counterparties to guarantee new/updated directory profiles exist
      const existingCps: Counterparty[] = parsed.counterparties || [];
      for (const initCp of INITIAL_COUNTERPARTIES) {
        if (!existingCps.some((cp) => cp.name.toLowerCase() === initCp.name.toLowerCase())) {
          existingCps.push(initCp);
        }
      }

      // Merge demo preset invoices to ensure test scenarios are always accessible
      const existingInvs: StagedInvoice[] = parsed.invoices || [];
      for (const initInv of DEMO_PRESET_INVOICES) {
        if (!existingInvs.some((i) => i.invoiceNumber === initInv.invoiceNumber)) {
          existingInvs.push(initInv);
        }
      }

      // Merge inbound payments
      const existingPayins: StagedInboundPayment[] = parsed.inboundPayments || [];
      for (const initPay of INITIAL_INBOUND_PAYMENTS) {
        if (!existingPayins.some((p) => p.id === initPay.id)) {
          existingPayins.push(initPay);
        }
      }

      return {
        accounts: parsed.accounts || INITIAL_ACCOUNTS,
        counterparties: existingCps,
        transactions: parsed.transactions || INITIAL_TRANSACTIONS,
        invoices: existingInvs,
        inboundPayments: existingPayins,
      };
    }
  } catch (e) {
    console.warn('Failed to load Blinka state from localStorage, using initial mock data', e);
  }

  return {
    accounts: INITIAL_ACCOUNTS,
    counterparties: INITIAL_COUNTERPARTIES,
    transactions: INITIAL_TRANSACTIONS,
    invoices: DEMO_PRESET_INVOICES,
    inboundPayments: INITIAL_INBOUND_PAYMENTS,
  };
}

let globalState: StateData = loadInitialState();
const listeners = new Set<(state: StateData) => void>();

function notify() {
  // Deep clone all collections to guarantee immediate React 18 reconciler updates
  globalState = {
    accounts: globalState.accounts.map((acc) => ({
      ...acc,
      tokenBalances: acc.tokenBalances.map((tb) => ({ ...tb })),
      transferRails: acc.transferRails.map((tr) => ({ ...tr })),
    })),
    counterparties: globalState.counterparties.map((cp) => ({
      ...cp,
      payoutMethods: cp.payoutMethods.map((pm) => ({ ...pm })),
    })),
    transactions: globalState.transactions.map((tx) => ({ ...tx })),
    invoices: globalState.invoices.map((inv) => ({
      ...inv,
      policyResult: inv.policyResult
        ? {
            ...inv.policyResult,
            rulesTriggered: inv.policyResult.rulesTriggered ? [...inv.policyResult.rulesTriggered] : [],
            reasons: inv.policyResult.reasons ? [...inv.policyResult.reasons] : [],
          }
        : undefined,
    })),
    inboundPayments: globalState.inboundPayments.map((p) => ({ ...p })),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Storage write error', e);
  }
  listeners.forEach((listener) => listener(globalState));
}

export function useBlinkaStore() {
  const [state, setState] = useState<StateData>(globalState);
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handler = (newState: StateData) => {
      setState(newState);
      setVersion((v) => v + 1);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // --- ACTIONS ---

  const resetToDefaults = () => {
    globalState = {
      accounts: JSON.parse(JSON.stringify(INITIAL_ACCOUNTS)),
      counterparties: JSON.parse(JSON.stringify(INITIAL_COUNTERPARTIES)),
      transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
      invoices: JSON.parse(JSON.stringify(DEMO_PRESET_INVOICES)),
      inboundPayments: JSON.parse(JSON.stringify(INITIAL_INBOUND_PAYMENTS)),
    };
    notify();
  };

  const getAccount = (accountId: string) => {
    return globalState.accounts.find((a) => a.id === accountId);
  };

  const findCounterpartyByName = (name: string) => {
    const norm = name.trim().toLowerCase();
    return globalState.counterparties.find(
      (cp) => cp.name.toLowerCase().includes(norm) || norm.includes(cp.name.toLowerCase())
    );
  };

  const addCounterparty = (name: string, email?: string) => {
    const newCp: Counterparty = {
      id: `cp_${Date.now()}`,
      legalEntityId: INITIAL_LEGAL_ENTITY.id,
      type: 'business',
      name,
      email: email || `accounts@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      status: 'active',
      createdAt: new Date().toISOString(),
      payoutMethods: [],
    };
    globalState.counterparties.unshift(newCp);
    notify();
    return newCp;
  };

  const addPayoutMethod = (
    counterpartyId: string,
    methodType: PayoutMethod['methodType'],
    accountEnding: string,
    routingNumber?: string
  ) => {
    const cp = globalState.counterparties.find((c) => c.id === counterpartyId);
    if (!cp) throw new Error('Counterparty not found');

    const newPm: PayoutMethod = {
      id: `pm_${Date.now()}`,
      counterpartyId,
      rail: 'usdDomestic',
      methodType,
      accountEnding,
      routingNumber: routingNumber || '021000021',
      approval: {
        status: 'pending', // Starts as pending per Blinka security protocol!
      },
      createdAt: new Date().toISOString(),
    };

    cp.payoutMethods.push(newPm);
    notify();
    return newPm;
  };

  const approvePayoutMethod = (payoutMethodId: string, approverName = 'cfo@acmeglobal.co') => {
    for (const cp of globalState.counterparties) {
      const pm = cp.payoutMethods.find((m) => m.id === payoutMethodId);
      if (pm) {
        pm.approval.status = 'approved';
        pm.approval.approvedBy = approverName;
        pm.approval.approvedAt = new Date().toISOString();
        notify();
        return pm;
      }
    }
    throw new Error('Payout method not found');
  };

  const executeInternalTransfer = (
    sourceAccountId: string,
    destinationAccountId: string,
    amountCents: number,
    memo = 'Internal Sweep'
  ): Transfer => {
    const src = globalState.accounts.find((a) => a.id === sourceAccountId);
    const dst = globalState.accounts.find((a) => a.id === destinationAccountId);

    if (!src || !dst) throw new Error('Source or destination account invalid');
    if (src.balance < amountCents) throw new Error('Insufficient funds in source account');

    src.balance -= amountCents;
    if (src.tokenBalances.length > 0) {
      src.tokenBalances[0].balance -= amountCents;
    }

    dst.balance += amountCents;
    if (dst.tokenBalances.length > 0) {
      dst.tokenBalances[0].balance += amountCents;
    }

    const txId = `tx_${Date.now()}`;
    const now = new Date().toISOString();

    const transferTx: Transaction = {
      id: txId,
      accountId: sourceAccountId,
      transferId: `tr_${Date.now()}`,
      kind: 'PAYOUT',
      status: 'COMPLETED',
      counterpartyName: dst.type === 'TREASURY' ? 'BNY Mellon Treasury Yield Vault' : dst.legalEntityName,
      method: 'INTERNAL_SWEEP',
      amountCents,
      currency: 'USD',
      memo,
      notes: `Autonomous Treasury Sweep from ${src.type} to ${dst.type}`,
      feeCents: 0,
      createdAt: now,
      executedAt: now,
    };

    globalState.transactions.unshift(transferTx);
    notify();

    return {
      id: transferTx.transferId!,
      sourceAccountId,
      destinationAccountId,
      amountCents,
      feeCents: 0,
      status: 'executed',
      memo,
      idempotencyKey: `idemp_${Date.now()}`,
      createdAt: now,
      executedAt: now,
      settledAt: now,
    };
  };

  const stageInvoice = (invoice: Omit<StagedInvoice, 'id' | 'status'>): StagedInvoice => {
    const newInv: StagedInvoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      status: 'pending_evaluation',
    };
    globalState.invoices.unshift(newInv);
    notify();
    return newInv;
  };

  const evaluateAndProcessInvoice = (invoiceId: string): { invoice: StagedInvoice; policyResult: PolicyEvaluationResult } => {
    const inv = globalState.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    // Duplicate check
    const duplicate = globalState.transactions.find(
      (tx) => tx.notes?.includes(inv.invoiceNumber) || tx.memo?.includes(inv.invoiceNumber)
    );
    if (duplicate) {
      inv.status = 'duplicate_rejected';
      inv.notes = `DUPLICATE BLOCKED: Invoice ${inv.invoiceNumber} was already settled in transaction ${duplicate.id}.`;
      notify();
      return {
        invoice: inv,
        policyResult: {
          decision: 'REJECT',
          score: 0,
          reasons: [`Invoice ${inv.invoiceNumber} was already settled in transaction ${duplicate.id}.`],
          rulesTriggered: [
            {
              ruleId: 'RULE_DUPLICATE_INVOICE',
              description: 'Invoice number already settled in ledger',
              passed: false,
              severity: 'CRITICAL',
            },
          ],
          suggestedAction: 'Reject duplicate bill to prevent double payment.',
        },
      };
    }

    const counterparty = findCounterpartyByName(inv.vendorName);
    const payoutMethod = counterparty?.payoutMethods.find(
      (pm) => (inv.beneficiaryBankLastFour && pm.accountEnding === inv.beneficiaryBankLastFour) ||
              (inv.walletAddress && pm.walletAddress?.toLowerCase() === inv.walletAddress.toLowerCase())
    ) || counterparty?.payoutMethods[0];

    const input: InvoiceReconciliationInput = {
      invoiceNumber: inv.invoiceNumber,
      vendorName: inv.vendorName,
      amountCents: inv.amountCents,
      currency: inv.currency,
      dueDate: inv.dueDate,
      description: inv.description,
      beneficiaryBankLastFour: inv.beneficiaryBankLastFour,
      routingNumber: inv.routingNumber,
      walletAddress: inv.walletAddress,
      network: inv.network,
    };

    const policy = evaluatePaymentPolicy(input, counterparty, payoutMethod);
    inv.policyResult = policy;
    inv.evaluatedAt = new Date().toISOString();

    if (policy.decision === 'REJECT') {
      inv.status = 'fraud_blocked';
      inv.notes = policy.reasons[0] || 'Factura bloqueada por políticas de seguridad Blinka.';
    } else if (policy.decision === 'REQUIRE_HUMAN_APPROVAL') {
      inv.status = 'awaiting_cfo_approval';
    } else {
      // AUTO_APPROVE: Execute payout immediately!
      const isCrypto = inv.currency === 'USDC';
      const targetAccount = isCrypto
        ? (globalState.accounts.find((a) => a.settlementStrategy === 'USDC') || globalState.accounts[0])
        : (globalState.accounts.find((a) => a.id === 'acc_usd_primary_4821') || globalState.accounts[0]);

      if (targetAccount.balance < inv.amountCents) {
        inv.status = 'awaiting_cfo_approval';
        inv.notes = `Approved by policy, but ${isCrypto ? 'USDC wallet' : 'checking account'} requires funding or sweep.`;
      } else {
        targetAccount.balance -= inv.amountCents;
        if (targetAccount.tokenBalances.length > 0) {
          targetAccount.tokenBalances[0].balance -= inv.amountCents;
        }

        const now = new Date().toISOString();
        const txId = `tx_payout_${Date.now()}`;
        const payoutTx: Transaction = {
          id: txId,
          accountId: targetAccount.id,
          transferId: `tr_${Date.now()}`,
          kind: 'PAYOUT',
          status: 'COMPLETED',
          counterpartyName: inv.vendorName,
          method: isCrypto ? 'USDC_TRANSFER' : (payoutMethod ? payoutMethod.methodType : 'ACH'),
          amountCents: inv.amountCents,
          currency: inv.currency,
          memo: `Autonomous AP: ${inv.invoiceNumber}`,
          notes: isCrypto
            ? `Auto-dispatched via Blinka Base Network to wallet ${inv.walletAddress || '0xVerifiedVault'}`
            : `Auto-dispatched via Blinka API to bank ending in ${inv.beneficiaryBankLastFour}`,
          feeCents: isCrypto ? 2 : 25,
          createdAt: now,
          executedAt: now,
        };

        globalState.transactions.unshift(payoutTx);
        inv.status = 'auto_paid';
        inv.payoutTransactionId = txId;
      }
    }

    notify();
    return { invoice: inv, policyResult: policy };
  };

  const cfoApproveInvoice = (invoiceId: string, approverName = 'cfo@acmeglobal.co') => {
    const inv = globalState.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');
    if (inv.status !== 'awaiting_cfo_approval') throw new Error('Invoice is not awaiting approval');

    const isCrypto = inv.currency === 'USDC';
    const targetAccount = isCrypto
      ? (globalState.accounts.find((a) => a.settlementStrategy === 'USDC') || globalState.accounts[0])
      : (globalState.accounts.find((a) => a.id === 'acc_usd_primary_4821') || globalState.accounts[0]);

    if (targetAccount.balance < inv.amountCents) {
      throw new Error(`Insufficient funds: ${isCrypto ? 'USDC Vault' : 'Checking'} has $${(targetAccount.balance / 100).toLocaleString()}, payment requires $${(inv.amountCents / 100).toLocaleString()}`);
    }

    targetAccount.balance -= inv.amountCents;
    if (targetAccount.tokenBalances.length > 0) {
      targetAccount.tokenBalances[0].balance -= inv.amountCents;
    }

    const now = new Date().toISOString();
    const txId = `tx_cfo_approved_${Date.now()}`;
    const payoutTx: Transaction = {
      id: txId,
      accountId: targetAccount.id,
      transferId: `tr_${Date.now()}`,
      kind: 'PAYOUT',
      status: 'COMPLETED',
      counterpartyName: inv.vendorName,
      method: isCrypto ? 'USDC_TRANSFER' : 'WIRE',
      amountCents: inv.amountCents,
      currency: inv.currency,
      memo: `CFO Approved AP: ${inv.invoiceNumber}`,
      notes: isCrypto
        ? `Dual-authorization by ${approverName} via Blinka Base Network crypto gateway`
        : `Dual-authorization by ${approverName} via Blinka Security Dashboard`,
      feeCents: isCrypto ? 5 : 1500,
      createdAt: now,
      executedAt: now,
    };

    globalState.transactions.unshift(payoutTx);
    inv.status = 'auto_paid';
    inv.approvedBy = approverName;
    inv.approvedAt = now;
    inv.payoutTransactionId = txId;

    notify();
    return inv;
  };

  const verifyInboundPaymentAction = (input: InboundPaymentVerificationInput): InboundPaymentVerificationResult => {
    return verifyInboundPayment(input, globalState.transactions);
  };

  const stageInboundPayment = (
    payment: Omit<StagedInboundPayment, 'id' | 'status' | 'createdAt'>
  ): StagedInboundPayment => {
    const newPayin: StagedInboundPayment = {
      ...payment,
      id: `payin_${Date.now()}`,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    };
    globalState.inboundPayments.unshift(newPayin);
    notify();
    return newPayin;
  };

  const evaluateAndProcessInboundPayment = (paymentId: string) => {
    const payin = globalState.inboundPayments.find((p) => p.id === paymentId);
    if (!payin) throw new Error('Cobro entrante no encontrado');

    // Security check for address poisoning / spoofed fake entities
    const isSuspicious =
      payin.payerName.toLowerCase().includes('fake') ||
      payin.payerName.toLowerCase().includes('phantom') ||
      payin.referenceOrInvoice.toLowerCase().includes('spoofed') ||
      (payin.txHashOrMemo && payin.txHashOrMemo.includes('0000000000000000'));

    if (isSuspicious) {
      payin.status = 'rejected_fraud';
      payin.evaluatedAt = new Date().toISOString();
      payin.notes = '🚨 CIBERSEGURIDAD: Intento de depósito con dirección no validada o colisión Web3 bloqueado.';
      notify();
      return {
        payment: payin,
        accredited: false,
        reason: 'Origen no validado o colisión Web3 detectada (Address Poisoning)',
      };
    }

    // Valid inbound payment: Credit to target account
    const isCrypto = payin.currency === 'USDC';
    const targetAccount = isCrypto
      ? (globalState.accounts.find((a) => a.settlementStrategy === 'USDC') || globalState.accounts[0])
      : (globalState.accounts.find((a) => a.id === 'acc_usd_primary_4821') || globalState.accounts[0]);

    targetAccount.balance += payin.amountCents;
    if (targetAccount.tokenBalances.length > 0) {
      targetAccount.tokenBalances[0].balance += payin.amountCents;
    }

    const now = new Date().toISOString();
    const txId = `tx_payin_${Date.now()}`;
    const payinTx: Transaction = {
      id: txId,
      accountId: targetAccount.id,
      transferId: null,
      kind: 'PAYIN',
      status: 'COMPLETED',
      counterpartyName: payin.payerName,
      method: payin.rail === 'BASE_USDC' ? 'BASE_USDC' : payin.rail,
      amountCents: payin.amountCents,
      currency: payin.currency,
      memo: `Cobro Conciliado: ${payin.referenceOrInvoice}`,
      notes: isCrypto
        ? `Dual-rail pay-in verificado en Base Network. Acreditado en bóveda USDC (${targetAccount.id})`
        : `Dual-rail pay-in verificado vía Portage Bank ACH. Acreditado en cuenta checking (${targetAccount.id})`,
      feeCents: 0,
      createdAt: now,
      executedAt: now,
    };

    globalState.transactions.unshift(payinTx);
    payin.status = 'accredited';
    payin.evaluatedAt = now;
    payin.accreditedAt = now;
    payin.accreditedTransactionId = txId;

    notify();
    return {
      payment: payin,
      accredited: true,
      amountCents: payin.amountCents,
      targetAccount: targetAccount.type,
    };
  };

  const getTotalBalanceCents = () => {
    return globalState.accounts.reduce((sum, a) => sum + a.balance, 0);
  };

  const evaluateAll = (
    options: { includeInbound?: boolean; includeOutbound?: boolean } = {
      includeInbound: true,
      includeOutbound: true,
    }
  ) => {
    const prevTotalCents = getTotalBalanceCents();
    let totalEntradasCents = 0;
    let totalSalidasCents = 0;
    let autoApprovedCount = 0;
    let requiringCfoCount = 0;
    let fraudBlockedCount = 0;
    let inboundAccreditedCount = 0;
    let inboundBlockedCount = 0;

    // 1. Process Outbound Invoices (Salidas)
    if (options.includeOutbound !== false) {
      let invoicesToProcess = globalState.invoices.filter((i) => i.status === 'pending_evaluation');
      // If no invoices are strictly pending, allow re-evaluating non-settled ones
      if (invoicesToProcess.length === 0) {
        invoicesToProcess = globalState.invoices.filter(
          (i) => i.status !== 'auto_paid' && i.status !== 'duplicate_rejected'
        );
      }

      for (const inv of invoicesToProcess) {
        try {
          const res = evaluateAndProcessInvoice(inv.id);
          if (res.policyResult.decision === 'AUTO_APPROVE') {
            autoApprovedCount++;
            totalSalidasCents += inv.amountCents;
          } else if (res.policyResult.decision === 'REQUIRE_HUMAN_APPROVAL') {
            requiringCfoCount++;
          } else {
            fraudBlockedCount++;
          }
        } catch (err) {
          console.error(`Error processing invoice ${inv.id}:`, err);
        }
      }
    }

    // 2. Process Inbound Pay-ins (Entradas)
    if (options.includeInbound !== false) {
      let payinsToProcess = globalState.inboundPayments.filter((p) => p.status === 'pending_verification');
      if (payinsToProcess.length === 0) {
        payinsToProcess = globalState.inboundPayments.filter((p) => p.status === 'rejected_fraud');
      }

      for (const p of payinsToProcess) {
        try {
          const res = evaluateAndProcessInboundPayment(p.id);
          if (res.accredited) {
            inboundAccreditedCount++;
            totalEntradasCents += p.amountCents;
          } else {
            inboundBlockedCount++;
          }
        } catch (err) {
          console.error(`Error processing pay-in ${p.id}:`, err);
        }
      }
    }

    notify();

    const newTotalCents = getTotalBalanceCents();
    const netCashflowCents = totalEntradasCents - totalSalidasCents;

    return {
      autoApprovedCount,
      requiringCfoCount,
      fraudBlockedCount,
      inboundAccreditedCount,
      inboundBlockedCount,
      totalEntradasCents,
      totalSalidasCents,
      netCashflowCents,
      prevTotalCents,
      newTotalCents,
    };
  };

  return {
    state,
    resetToDefaults,
    getAccount,
    findCounterpartyByName,
    addCounterparty,
    addPayoutMethod,
    approvePayoutMethod,
    executeInternalTransfer,
    stageInvoice,
    evaluateAndProcessInvoice,
    cfoApproveInvoice,
    verifyInboundPaymentAction,
    stageInboundPayment,
    evaluateAndProcessInboundPayment,
    getTotalBalanceCents,
    evaluateAll,
  };
}
