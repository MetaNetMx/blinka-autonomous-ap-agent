import {
  Account,
  Counterparty,
  InboundPaymentVerificationInput,
  InboundPaymentVerificationResult,
  InvoiceReconciliationInput,
  PayoutMethod,
  PolicyEvaluationResult,
  Transaction,
  Transfer,
  TransferRequest,
  StagedInvoice,
} from './types.js';
import {
  INITIAL_ACCOUNTS,
  INITIAL_COUNTERPARTIES,
  INITIAL_LEGAL_ENTITY,
  INITIAL_TRANSACTIONS,
  DEMO_PRESET_INVOICES,
} from './mockData.js';
import { BlinkaPolicyEngine } from './policyEngine.js';

export class BlinkaClient {
  private apiKey: string | null;
  private isMock: boolean;

  // In-memory state for mock / demo mode
  private accounts: Account[] = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
  private transactions: Transaction[] = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  private counterparties: Counterparty[] = JSON.parse(JSON.stringify(INITIAL_COUNTERPARTIES));
  private pendingInvoices: StagedInvoice[] = JSON.parse(JSON.stringify(DEMO_PRESET_INVOICES));
  private transfers: Transfer[] = [];
  private idempotencyStore = new Map<string, Transfer>();

  constructor(apiKey?: string, forceMock = false) {
    this.apiKey = apiKey || process.env.BLINKA_API_KEY || null;
    this.isMock = forceMock || !this.apiKey || process.env.BLINKA_MOCK_MODE === 'true';
  }

  isMockMode(): boolean {
    return this.isMock;
  }

  async listAccounts(): Promise<Account[]> {
    if (!this.isMock && this.apiKey) {
      try {
        const res = await fetch('https://api.app.blinka.co/v1/accounts', {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (res.ok) {
          const json = (await res.json()) as { data: Account[] };
          return json.data;
        }
      } catch (e) {
        console.error('Failed to query live Blinka API, falling back to local store', e);
      }
    }
    return this.accounts;
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const accounts = await this.listAccounts();
    return accounts.find((a) => a.id === accountId) || null;
  }

  async listTransactions(filters?: {
    limit?: number;
    currency?: string;
    from?: string;
    to?: string;
  }): Promise<Transaction[]> {
    let txs = [...this.transactions];
    if (filters?.currency) {
      txs = txs.filter((t) => t.currency.toUpperCase() === filters.currency?.toUpperCase());
    }
    if (filters?.limit) {
      txs = txs.slice(0, filters.limit);
    }
    return txs;
  }

  async listPendingInvoices(): Promise<StagedInvoice[]> {
    return this.pendingInvoices;
  }

  async listCounterparties(): Promise<Counterparty[]> {
    return this.counterparties.filter((cp) => cp.status === 'active');
  }

  async createCounterparty(data: {
    type: 'business' | 'individual';
    name: string;
    email?: string;
  }): Promise<Counterparty> {
    const newCp: Counterparty = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      legalEntityId: INITIAL_LEGAL_ENTITY.id,
      type: data.type,
      name: data.name,
      email: data.email,
      status: 'active',
      createdAt: new Date().toISOString(),
      payoutMethods: [],
    };
    this.counterparties.push(newCp);
    return newCp;
  }

  async addPayoutMethod(data: {
    counterpartyId: string;
    rail: 'usdDomestic' | 'blockchainWallet' | 'localRail';
    methodType: 'ACH' | 'WIRE' | 'CRYPTO' | 'SPEI' | 'PIX' | 'BRE_B';
    accountEnding: string;
    routingNumber?: string;
    walletAddress?: string;
    network?: string;
  }): Promise<PayoutMethod> {
    const cp = this.counterparties.find((c) => c.id === data.counterpartyId);
    if (!cp) {
      throw new Error(`Counterparty not found: ${data.counterpartyId}`);
    }

    // Per Blinka security policy: API-created payout methods start in PENDING approval
    const newMethod: PayoutMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      counterpartyId: data.counterpartyId,
      rail: data.rail,
      methodType: data.methodType,
      accountEnding: data.accountEnding,
      routingNumber: data.routingNumber,
      walletAddress: data.walletAddress,
      network: data.network,
      approval: {
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
    };

    cp.payoutMethods.push(newMethod);
    return newMethod;
  }

  async approvePayoutMethod(methodId: string, approvedBy: string): Promise<PayoutMethod> {
    for (const cp of this.counterparties) {
      const pm = cp.payoutMethods.find((m) => m.id === methodId);
      if (pm) {
        pm.approval = {
          status: 'approved',
          approvedBy,
          approvedAt: new Date().toISOString(),
        };
        return pm;
      }
    }
    throw new Error(`Payout method not found: ${methodId}`);
  }

  async createInternalTransfer(req: TransferRequest): Promise<Transfer> {
    // 1. Idempotency check
    if (this.idempotencyStore.has(req.idempotencyKey)) {
      return this.idempotencyStore.get(req.idempotencyKey)!;
    }

    // 2. Validate accounts
    const source = this.accounts.find((a) => a.id === req.sourceAccountId);
    const dest = this.accounts.find((a) => a.id === req.destinationAccountId);

    if (!source || !dest) {
      throw new Error(`Accounts not found: source=${req.sourceAccountId}, dest=${req.destinationAccountId}`);
    }
    if (source.id === dest.id) {
      throw new Error('SAME_ACCOUNT: Source and destination must be different');
    }
    if (source.settlementStrategy !== dest.settlementStrategy) {
      throw new Error('CURRENCY_MISMATCH: Source and destination accounts must settle in the same currency');
    }

    const feeCents = 25; // ACH fee
    const totalRequired = req.amountCents + feeCents;

    if (source.balance < totalRequired) {
      throw new Error(
        `INSUFFICIENT_BALANCE: Source balance (${source.balance} cents) is insufficient for amount + fee (${totalRequired} cents)`
      );
    }

    // Deduct and credit
    source.balance -= totalRequired;
    dest.balance += req.amountCents;

    const now = new Date().toISOString();
    const transfer: Transfer = {
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourceAccountId: req.sourceAccountId,
      destinationAccountId: req.destinationAccountId,
      amountCents: req.amountCents,
      feeCents,
      status: 'executed',
      memo: req.memo || 'Internal Transfer',
      idempotencyKey: req.idempotencyKey,
      createdAt: now,
      executedAt: now,
      settledAt: null,
    };

    this.transfers.push(transfer);
    this.idempotencyStore.set(req.idempotencyKey, transfer);

    // Record transactions
    this.transactions.unshift({
      id: `tx_${Date.now()}_src`,
      accountId: source.id,
      transferId: transfer.id,
      kind: 'PAYOUT',
      status: 'COMPLETED',
      counterpartyName: dest.legalEntityName,
      method: 'ACH',
      amountCents: totalRequired,
      currency: source.settlementStrategy,
      memo: req.memo || 'Internal Transfer Debit',
      notes: `Transfer ID: ${transfer.id}`,
      feeCents,
      createdAt: now,
      executedAt: now,
    });

    this.transactions.unshift({
      id: `tx_${Date.now()}_dst`,
      accountId: dest.id,
      transferId: transfer.id,
      kind: 'PAYIN',
      status: 'COMPLETED',
      counterpartyName: source.legalEntityName,
      method: 'ACH',
      amountCents: req.amountCents,
      currency: dest.settlementStrategy,
      memo: req.memo || 'Internal Transfer Credit',
      notes: `Transfer ID: ${transfer.id}`,
      feeCents: 0,
      createdAt: now,
      executedAt: now,
    });

    return transfer;
  }

  async reconcileInvoiceAndEvaluate(
    invoice: InvoiceReconciliationInput
  ): Promise<{
    reconciliation: ReturnType<typeof BlinkaPolicyEngine.reconcileInvoice>;
    policy: PolicyEvaluationResult;
  }> {
    const context = {
      accounts: this.accounts,
      counterparties: this.counterparties,
      transactions: this.transactions,
    };

    const reconciliation = BlinkaPolicyEngine.reconcileInvoice(invoice, context);
    const policy = BlinkaPolicyEngine.evaluatePolicy(invoice, context);

    return {
      reconciliation,
      policy,
    };
  }

  async verifyInboundPayment(
    input: InboundPaymentVerificationInput
  ): Promise<InboundPaymentVerificationResult> {
    const context = {
      accounts: this.accounts,
      counterparties: this.counterparties,
      transactions: this.transactions,
    };
    return BlinkaPolicyEngine.verifyInboundPayment(input, context);
  }

  async executeVendorPayment(data: {
    invoice: InvoiceReconciliationInput;
    forceOverride?: boolean;
    authorizedBy?: string;
  }): Promise<{
    success: boolean;
    transfer?: Transfer;
    transaction?: Transaction;
    policyResult: PolicyEvaluationResult;
    message: string;
  }> {
    const { reconciliation, policy } = await this.reconcileInvoiceAndEvaluate(data.invoice);

    if (policy.decision === 'REJECT') {
      return {
        success: false,
        policyResult: policy,
        message: `Pago rechazado por políticas de riesgo: ${policy.reasons.join(' | ')}`,
      };
    }

    if (policy.decision === 'REQUIRE_HUMAN_APPROVAL' && !data.forceOverride) {
      return {
        success: false,
        policyResult: policy,
        message: `El pago requiere autorización humana en el portal Blinka o confirmación del CFO. Motivos: ${policy.reasons.join(' | ')}`,
      };
    }

    // Execute payout
    const sourceAccount = reconciliation.recommendedSourceAccount || this.accounts[0];
    const feeCents = 25;
    sourceAccount.balance -= data.invoice.amountCents + feeCents;

    const now = new Date().toISOString();
    const tx: Transaction = {
      id: `tx_pay_${Date.now()}`,
      accountId: sourceAccount.id,
      transferId: null,
      kind: 'PAYOUT',
      status: 'COMPLETED',
      counterpartyName: data.invoice.vendorName,
      method: 'ACH',
      amountCents: data.invoice.amountCents,
      currency: data.invoice.currency,
      memo: `Invoice #${data.invoice.invoiceNumber}`,
      notes: `Autonomous payment executed by AP Agent. Authorized by: ${data.authorizedBy || 'Policy Engine (Auto-Approve)'}`,
      feeCents,
      createdAt: now,
      executedAt: now,
    };

    this.transactions.unshift(tx);

    return {
      success: true,
      transaction: tx,
      policyResult: policy,
      message: `Pago de $${(data.invoice.amountCents / 100).toFixed(2)} USD procesado exitosamente a '${data.invoice.vendorName}'. TX: ${tx.id}`,
    };
  }
}
