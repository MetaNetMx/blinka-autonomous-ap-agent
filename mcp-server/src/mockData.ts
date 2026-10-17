import { Account, Counterparty, Transaction, StagedInvoice } from './types.js';

export const INITIAL_LEGAL_ENTITY = {
  id: '018f6734-7123-789a-bcde-0123456789ab',
  name: 'Acme Global Ventures LLC',
  type: 'LLC',
  slug: 'acme-global',
  contactEmail: 'finance@acmeglobal.co',
  settlementStrategy: 'USD' as const,
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_usd_primary_4821',
    type: 'CHECKING',
    balance: 18441860, // $184,418.60 (matching Blinka landing page)
    balanceAsOf: new Date().toISOString(),
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    legalEntityName: INITIAL_LEGAL_ENTITY.name,
    settlementStrategy: 'USD',
    tokenBalances: [
      {
        symbol: 'USD',
        type: 'fiat',
        balance: 18441860,
      },
    ],
    transferRails: [
      {
        railType: 'ACH_WIRE',
        label: 'US Domestic ACH & Wire',
        currency: 'USD',
        beneficiaryName: 'Acme Global Ventures LLC',
        beneficiaryAddress: '1209 Orange St, Wilmington, DE 19801',
        routingNumber: '021000021',
        accountNumber: '••••••••4821',
        bankName: 'Portage Bank, Member FDIC',
        bankAddress: 'Seattle, WA',
        supportedCurrencies: ['USD'],
      },
      {
        railType: 'IBAN_BIC',
        label: 'International SWIFT Transfer',
        currency: 'USD',
        beneficiaryName: 'Acme Global Ventures LLC',
        iban: 'US89PORB02100002100000004821',
        bic: 'PORBUS33XXX',
        bankName: 'Portage Bank',
      },
      {
        railType: 'LOCAL_BANK',
        label: 'Colombia Bre-B & Transfiya',
        currency: 'COP',
        breBKey: 'nit:901458291',
        bankName: 'Blinka Local Colombia Partner',
      },
    ],
  },
  {
    id: 'acc_treasury_dreyfus_9921',
    type: 'TREASURY',
    balance: 5000000, // $50,000.00
    balanceAsOf: new Date().toISOString(),
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    legalEntityName: INITIAL_LEGAL_ENTITY.name,
    settlementStrategy: 'USD',
    tokenBalances: [
      {
        symbol: 'USD',
        type: 'fiat',
        balance: 5000000,
      },
    ],
    transferRails: [
      {
        railType: 'ACH_WIRE',
        label: 'BNY Dreyfus Institutional Money Market (DSHXX)',
        currency: 'USD',
        bankName: 'Atomic Brokerage LLC / BNY Mellon',
      },
    ],
  },
  {
    id: 'acc_usdc_multichain_3310',
    type: 'CHECKING',
    balance: 1850000, // 18,500.00 USDC
    balanceAsOf: new Date().toISOString(),
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    legalEntityName: INITIAL_LEGAL_ENTITY.name,
    settlementStrategy: 'USDC',
    tokenBalances: [
      {
        symbol: 'USDC',
        type: 'blockchain',
        balance: 1850000,
      },
    ],
    transferRails: [
      {
        railType: 'CRYPTO_ADDRESS',
        label: 'USDC on Base & Solana',
        currency: 'USDC',
        walletAddress: '0x71C...BlinkaBaseVault',
        network: 'Base',
        supportedCurrencies: ['USDC'],
      },
    ],
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_019283a',
    accountId: 'acc_usd_primary_4821',
    transferId: null,
    kind: 'PAYOUT',
    status: 'COMPLETED',
    counterpartyName: 'Linear Orbit Inc',
    method: 'CARD',
    amountCents: 12800, // -$128.00
    currency: 'USD',
    memo: 'Software Subscription',
    notes: 'Monthly engineering seats',
    feeCents: 0,
    createdAt: '2026-10-15T14:20:00Z',
    executedAt: '2026-10-15T14:20:02Z',
  },
  {
    id: 'tx_019283b',
    accountId: 'acc_usd_primary_4821',
    transferId: null,
    kind: 'PAYIN',
    status: 'COMPLETED',
    counterpartyName: 'Northstar Group Capital',
    method: 'WIRE',
    amountCents: 2500000, // +$25,000.00
    currency: 'USD',
    memo: 'Series A Tranche Settlement',
    notes: 'Approved funding wire',
    feeCents: 1500,
    createdAt: '2026-10-14T09:12:00Z',
    executedAt: '2026-10-14T10:05:00Z',
  },
  {
    id: 'tx_019283c',
    accountId: 'acc_usd_primary_4821',
    transferId: null,
    kind: 'PAYOUT',
    status: 'COMPLETED',
    counterpartyName: 'Forma Studio LLC',
    method: 'ACH',
    amountCents: 245000, // -$2,450.00
    currency: 'USD',
    memo: 'Design & UX Milestone 2',
    notes: 'Invoice #FS-2026-102',
    feeCents: 25,
    createdAt: '2026-10-12T16:45:00Z',
    executedAt: '2026-10-13T08:30:00Z',
  },
  {
    id: 'tx_payin_usdc_01',
    accountId: 'acc_usdc_multichain_3310',
    transferId: null,
    kind: 'PAYIN',
    status: 'COMPLETED',
    counterpartyName: 'OpenAI Foundation LLC',
    method: 'BASE_USDC',
    amountCents: 500000, // +$5,000.00 USDC
    currency: 'USDC',
    memo: 'AI Research Grant Q3',
    notes: 'Invoice #INV-OPENAI-9901 | txHash: 0x8a92f01c4482',
    feeCents: 5,
    createdAt: '2026-10-15T12:00:00Z',
    executedAt: '2026-10-15T12:01:00Z',
  },
];

export const INITIAL_COUNTERPARTIES: Counterparty[] = [
  {
    id: 'cp_forma_studio',
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    type: 'business',
    name: 'Forma Studio LLC',
    email: 'billing@formastudio.design',
    status: 'active',
    createdAt: '2026-08-01T00:00:00Z',
    payoutMethods: [
      {
        id: 'pm_forma_ach_1',
        counterpartyId: 'cp_forma_studio',
        rail: 'usdDomestic',
        methodType: 'ACH',
        accountEnding: '9124',
        routingNumber: '021000021',
        approval: {
          status: 'approved',
          approvedBy: 'founder@acmeglobal.co',
          approvedAt: '2026-08-01T10:00:00Z',
        },
        createdAt: '2026-08-01T09:00:00Z',
      },
    ],
  },
  {
    id: 'cp_linear_orbit',
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    type: 'business',
    name: 'Linear Orbit Inc',
    email: 'payments@linear.app',
    status: 'active',
    createdAt: '2026-07-15T00:00:00Z',
    payoutMethods: [
      {
        id: 'pm_linear_card_1',
        counterpartyId: 'cp_linear_orbit',
        rail: 'usdDomestic',
        methodType: 'ACH',
        accountEnding: '5512',
        routingNumber: '121000358',
        approval: {
          status: 'approved',
          approvedBy: 'founder@acmeglobal.co',
          approvedAt: '2026-07-15T12:00:00Z',
        },
        createdAt: '2026-07-15T11:00:00Z',
      },
    ],
  },
  {
    id: 'cp_aws_cloud',
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    type: 'business',
    name: 'Amazon Web Services Inc',
    email: 'aws-receivables@amazon.com',
    status: 'active',
    createdAt: '2026-06-01T00:00:00Z',
    payoutMethods: [
      {
        id: 'pm_aws_wire_1',
        counterpartyId: 'cp_aws_cloud',
        rail: 'usdDomestic',
        methodType: 'WIRE',
        accountEnding: '1099',
        routingNumber: '026009593',
        approval: {
          status: 'approved',
          approvedBy: 'founder@acmeglobal.co',
          approvedAt: '2026-06-01T08:00:00Z',
        },
        createdAt: '2026-06-01T08:00:00Z',
      },
    ],
  },
  {
    id: 'cp_alchemy_nodes',
    legalEntityId: INITIAL_LEGAL_ENTITY.id,
    type: 'business',
    name: 'Alchemy Infrastructure Inc',
    email: 'billing@alchemy.com',
    status: 'active',
    createdAt: '2026-06-15T00:00:00Z',
    payoutMethods: [
      {
        id: 'pm_alchemy_base_1',
        counterpartyId: 'cp_alchemy_nodes',
        rail: 'blockchainWallet',
        methodType: 'CRYPTO_ADDRESS',
        accountEnding: '43e7',
        walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
        network: 'Base',
        approval: {
          status: 'approved',
          approvedBy: 'founder@acmeglobal.co',
          approvedAt: '2026-06-15T10:00:00Z',
        },
        createdAt: '2026-06-15T09:00:00Z',
      },
    ],
  },
];

export const DEMO_PRESET_INVOICES: StagedInvoice[] = [
  {
    id: 'inv_preset_vercel',
    invoiceNumber: 'INV-VERCEL-2026-88',
    vendorName: 'Vercel Inc.',
    amountCents: 320000, // $3,200.00
    currency: 'USD',
    issueDate: '2026-10-10',
    dueDate: '2026-10-24',
    description: 'Enterprise Edge Network & Serverless Hosting',
    beneficiaryBankLastFour: '4141',
    routingNumber: '121000358',
    status: 'pending_evaluation',
    notes: 'Standard recurring monthly vendor. Within $5,000 auto-approval threshold.',
  },
  {
    id: 'inv_preset_lambda',
    invoiceNumber: 'INV-LAMBDA-GPU-904',
    vendorName: 'Lambda Labs Inc.',
    amountCents: 4850000, // $48,500.00
    currency: 'USD',
    issueDate: '2026-10-12',
    dueDate: '2026-10-26',
    description: 'H100 8x GPU Reserved Cluster - Cluster Block 4',
    beneficiaryBankLastFour: '8833',
    routingNumber: '026009593',
    status: 'pending_evaluation',
    notes: 'Exceeds $10,000 threshold. Requires CFO dual-authorization before dispatch.',
  },
  {
    id: 'inv_preset_fraud_stripe',
    invoiceNumber: 'INV-STRIPE-TAMPERED-01',
    vendorName: 'Stripe Payments LLC',
    amountCents: 1425000, // $14,250.00
    currency: 'USD',
    issueDate: '2026-10-14',
    dueDate: '2026-10-21',
    description: 'Spoofed Payment Infrastructure & Processing Surcharge',
    beneficiaryBankLastFour: '9999', // MISMATCH! Registered is 1029
    routingNumber: '121000358',
    status: 'pending_evaluation',
    notes: '🚨 PHISHING ALERT: Beneficiary bank ending 9999 does NOT match verified ending 1029!',
  },
  {
    id: 'inv_preset_dup_aws',
    invoiceNumber: 'INV-AWS-US-EAST-4412',
    vendorName: 'Amazon Web Services Inc',
    amountCents: 245000, // $2,450.00
    currency: 'USD',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    description: 'EC2 & S3 Cloud Infrastructure (Duplicate claim)',
    beneficiaryBankLastFour: '1099',
    routingNumber: '026009593',
    status: 'pending_evaluation',
    notes: 'Duplicate invoice test: already processed in prior cycle.',
  },
  {
    id: 'inv_preset_crypto_alchemy',
    invoiceNumber: 'INV-ALCHEMY-2026-01',
    vendorName: 'Alchemy Infrastructure Inc',
    amountCents: 185000, // 1,850.00 USDC
    currency: 'USDC',
    issueDate: '2026-10-15',
    dueDate: '2026-10-29',
    description: 'Web3 RPC Dedicated Node Cluster (Base Network)',
    beneficiaryBankLastFour: '43e7',
    routingNumber: 'BASE_NETWORK',
    walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    network: 'Base',
    status: 'pending_evaluation',
    notes: '⚡ CRIPTO: Liquidación instantánea en USDC sobre Base Network. Billetera verificada.',
  },
  {
    id: 'inv_preset_crypto_poisoning',
    invoiceNumber: 'INV-WEB3-POISONED-88',
    vendorName: 'Alchemy Infrastructure Inc',
    amountCents: 890000, // 8,900.00 USDC
    currency: 'USDC',
    issueDate: '2026-10-16',
    dueDate: '2026-10-23',
    description: 'Smart Contract Audit & Gas Subsidy (Spoofed Address)',
    beneficiaryBankLastFour: '9999',
    routingNumber: 'BASE_NETWORK',
    walletAddress: '0xDEADBEEF44120000000000000000000000009999', // MISMATCH!
    network: 'Base',
    status: 'pending_evaluation',
    notes: '🚨 ALERTA CRIPTO: Dirección de wallet no coincide con la registrada. Intento de Address Poisoning.',
  },
];

