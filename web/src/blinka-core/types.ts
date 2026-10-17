/**
 * Blinka Core Types - Aligned with Blinka OpenAPI 3.1.0 Specification
 * Reference: https://api.app.blinka.co/v1/openapi.json
 */

export type SettlementStrategy = 'USD' | 'USDC';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'TREASURY';

export type TransferRailType = 'ACH_WIRE' | 'IBAN_BIC' | 'CRYPTO_ADDRESS' | 'LOCAL_BANK';

export interface TransferRail {
  railType: TransferRailType;
  label: string;
  currency: string;
  beneficiaryName?: string;
  beneficiaryAddress?: string;
  routingNumber?: string;
  accountNumber?: string;
  iban?: string;
  bic?: string;
  accountType?: string;
  bankName?: string;
  bankAddress?: string;
  walletAddress?: string;
  network?: string;
  supportedCurrencies?: string[];
  pixCode?: string;
  breBKey?: string;
}

export interface TokenBalance {
  symbol: string;
  type: 'blockchain' | 'fiat';
  balance: number; // in cents / minor units
}

export interface Account {
  id: string;
  type: AccountType;
  balance: number; // in cents
  balanceAsOf: string | null;
  tokenBalances: TokenBalance[];
  transferRails: TransferRail[];
  legalEntityId: string;
  legalEntityName: string;
  settlementStrategy: SettlementStrategy;
}

export type TransactionKind = 'PAYIN' | 'PAYOUT' | 'EXTERNAL_PAYOUT' | 'REFUNDED_PAYOUT' | 'FEE';
export type TransactionStatus = 'AWAITING_FUNDS' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface Transaction {
  id: string;
  accountId: string;
  transferId: string | null;
  kind: TransactionKind;
  status: TransactionStatus;
  counterpartyName: string | null;
  method: string | null;
  amountCents: number;
  currency: string;
  memo: string | null;
  notes: string | null;
  feeCents: number | null;
  createdAt: string;
  executedAt: string;
}

export interface Counterparty {
  id: string;
  legalEntityId: string;
  type: 'business' | 'individual';
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status: 'active' | 'archived';
  createdAt: string;
  payoutMethods: PayoutMethod[];
}

export type PayoutRail = 'usdDomestic' | 'blockchainWallet' | 'localRail';

export interface PayoutMethod {
  id: string;
  counterpartyId: string;
  rail: PayoutRail;
  methodType: 'ACH' | 'WIRE' | 'CRYPTO' | 'SPEI' | 'PIX' | 'BRE_B';
  accountEnding: string;
  routingNumber?: string;
  walletAddress?: string;
  network?: string;
  approval: {
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
  };
  createdAt: string;
}

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amountCents: number;
  memo?: string;
  idempotencyKey: string;
}

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amountCents: number;
  feeCents: number;
  status: 'executed' | 'settled' | 'failed' | 'canceled';
  memo: string | null;
  idempotencyKey: string;
  createdAt: string;
  executedAt: string;
  settledAt: string | null;
}

export interface InvoiceReconciliationInput {
  invoiceNumber: string;
  vendorName: string;
  amountCents: number;
  currency: string;
  issueDate?: string;
  dueDate: string;
  taxId?: string;
  description?: string;
  beneficiaryBankLastFour?: string;
  routingNumber?: string;
}

export interface PolicyEvaluationResult {
  decision: 'AUTO_APPROVE' | 'REQUIRE_HUMAN_APPROVAL' | 'REJECT';
  score: number; // 0 to 100 confidence
  reasons: string[];
  rulesTriggered: {
    ruleId: string;
    description: string;
    passed: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  suggestedAction: string;
}

export interface StagedInvoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amountCents: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  description: string;
  beneficiaryBankLastFour: string;
  routingNumber: string;
  status: 'pending_evaluation' | 'auto_paid' | 'awaiting_cfo_approval' | 'fraud_blocked' | 'duplicate_rejected';
  policyResult?: PolicyEvaluationResult;
  payoutTransactionId?: string;
  payoutMethodId?: string;
  evaluatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  thoughts?: string[];
  toolCalls?: {
    toolName: string;
    parameters: any;
    result: any;
  }[];
}
