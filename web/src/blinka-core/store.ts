import { useState, useEffect } from 'react';
import {
  Account,
  Counterparty,
  PayoutMethod,
  StagedInvoice,
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
  INITIAL_LEGAL_ENTITY,
} from './mockData';
import { evaluatePaymentPolicy, verifyInboundPayment } from './policyEngine';

const STORAGE_KEY = 'blinka_ap_agent_state_v1';

interface StateData {
  accounts: Account[];
  counterparties: Counterparty[];
  transactions: Transaction[];
  invoices: StagedInvoice[];
}

function loadInitialState(): StateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load Blinka state from localStorage, using initial mock data', e);
  }

  return {
    accounts: INITIAL_ACCOUNTS,
    counterparties: INITIAL_COUNTERPARTIES,
    transactions: INITIAL_TRANSACTIONS,
    invoices: DEMO_PRESET_INVOICES,
  };
}

let globalState: StateData = loadInitialState();
const listeners = new Set<(state: StateData) => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Storage write error', e);
  }
  listeners.forEach((listener) => listener({ ...globalState }));
}

export function useBlinkaStore() {
  const [state, setState] = useState<StateData>(globalState);

  useEffect(() => {
    const handler = (newState: StateData) => setState(newState);
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
      (pm) => pm.accountEnding === inv.beneficiaryBankLastFour
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
    };

    const policy = evaluatePaymentPolicy(input, counterparty, payoutMethod);
    inv.policyResult = policy;
    inv.evaluatedAt = new Date().toISOString();

    if (policy.decision === 'REJECT') {
      inv.status = 'fraud_blocked';
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
  };
}
