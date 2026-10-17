#!/usr/bin/env node

/**
 * Blinka Model Context Protocol (MCP) Server
 * Standardized banking and Autonomous Accounts Payable (AP) Agent toolset for Blinka.
 * Conforms to Blinka OpenAPI 3.1.0 Specification (v2.0.0).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { BlinkaClient } from './client.js';

const client = new BlinkaClient();

const server = new McpServer({
  name: 'blinka-mcp-server',
  version: '1.0.0',
});

// Helper for formatted money output
function formatCents(cents: number, currency = 'USD'): string {
  const amount = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${amount} ${currency}`;
}

// -------------------------------------------------------------
// TOOL 1: blinka_list_accounts
// -------------------------------------------------------------
server.tool(
  'blinka_list_accounts',
  'List all financial accounts and balances across the Blinka workspace (Checking, Savings, Treasury, USDC). Returns balances in minor units (cents) and deposit instructions (transfer rails).',
  {},
  async () => {
    try {
      const accounts = await client.listAccounts();
      const formatted = accounts.map((acc) => ({
        id: acc.id,
        type: acc.type,
        legalEntity: acc.legalEntityName,
        settlementCurrency: acc.settlementStrategy,
        balanceCents: acc.balance,
        formattedBalance: formatCents(acc.balance, acc.settlementStrategy),
        balanceAsOf: acc.balanceAsOf,
        depositRails: acc.transferRails.map((r) => ({
          type: r.railType,
          label: r.label,
          currency: r.currency,
          beneficiary: r.beneficiaryName,
          routingNumber: r.routingNumber,
          accountEnding: r.accountNumber ? r.accountNumber.slice(-4) : undefined,
          cryptoNetwork: r.network,
          cryptoAddress: r.walletAddress,
          breBKey: r.breBKey,
        })),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                mode: client.isMockMode() ? 'MOCK_SANDBOX' : 'LIVE_PRODUCTION',
                totalAccounts: formatted.length,
                accounts: formatted,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error listing accounts: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 2: blinka_get_account
// -------------------------------------------------------------
server.tool(
  'blinka_get_account',
  'Get details, real-time reconciled balance, and deposit instructions for a single Blinka account by ID.',
  {
    accountId: z.string().describe('The ID of the account (e.g. acc_usd_primary_4821)'),
  },
  async ({ accountId }) => {
    try {
      const acc = await client.getAccount(accountId);
      if (!acc) {
        return {
          content: [{ type: 'text', text: `Account not found with ID: ${accountId}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...acc,
                formattedBalance: formatCents(acc.balance, acc.settlementStrategy),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error retrieving account: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 3: blinka_list_transactions
// -------------------------------------------------------------
server.tool(
  'blinka_list_transactions',
  'List transactions across all accounts, newest first. Includes payins (wires, ACH), payouts, fees, card settlements, and counterparties.',
  {
    limit: z.number().optional().describe('Maximum transactions to return (1-250, default 50)'),
    currency: z.string().optional().describe('Filter by currency (e.g. USD, USDC)'),
  },
  async ({ limit, currency }) => {
    try {
      const txs = await client.listTransactions({ limit, currency });
      const formatted = txs.map((t) => ({
        id: t.id,
        kind: t.kind,
        status: t.status,
        counterparty: t.counterpartyName,
        method: t.method,
        amount: formatCents(t.amountCents, t.currency),
        amountCents: t.amountCents,
        memo: t.memo,
        notes: t.notes,
        fee: t.feeCents !== null ? formatCents(t.feeCents, t.currency) : 'N/A',
        executedAt: t.executedAt,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                total: formatted.length,
                transactions: formatted,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error listing transactions: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 4: blinka_list_counterparties
// -------------------------------------------------------------
server.tool(
  'blinka_list_counterparties',
  'List all registered counterparties (vendors, contractors, suppliers) in the workspace, along with their approved or pending payout methods (bank accounts, crypto wallets).',
  {},
  async () => {
    try {
      const counterparties = await client.listCounterparties();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                total: counterparties.length,
                counterparties,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error listing counterparties: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 5: blinka_create_counterparty
// -------------------------------------------------------------
server.tool(
  'blinka_create_counterparty',
  'Create a new counterparty (vendor or contractor) in the Blinka workspace.',
  {
    type: z.enum(['business', 'individual']).describe('Type of counterparty entity'),
    name: z.string().describe('Full company name or personal name'),
    email: z.string().optional().describe('Contact / billing email address'),
  },
  async ({ type, name, email }) => {
    try {
      const cp = await client.createCounterparty({ type, name, email });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Counterparty '${name}' created successfully.`,
                counterparty: cp,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error creating counterparty: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 6: blinka_create_payout_method
// -------------------------------------------------------------
server.tool(
  'blinka_create_payout_method',
  'Register a payout method (US bank account, crypto wallet, or local rail) for a counterparty. Note: per Blinka protocol, API-created methods start with approval.status = pending until authorized by an administrator.',
  {
    counterpartyId: z.string().describe('The ID of the counterparty to add the payout method to'),
    rail: z.enum(['usdDomestic', 'blockchainWallet', 'localRail']).describe('Payout rail category'),
    methodType: z.enum(['ACH', 'WIRE', 'CRYPTO', 'SPEI', 'PIX', 'BRE_B']).describe('Specific transfer method'),
    accountEnding: z.string().describe('Last 4 digits of bank account or wallet identifier'),
    routingNumber: z.string().optional().describe('US routing number (for ACH or WIRE)'),
    walletAddress: z.string().optional().describe('Blockchain wallet address (for CRYPTO)'),
    network: z.string().optional().describe('Blockchain network (e.g. Base, Polygon, Solana)'),
  },
  async (args) => {
    try {
      const pm = await client.addPayoutMethod(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: 'Payout method created successfully and submitted for workspace security review.',
                securityNotice:
                  'Every payout method created via API requires approval in the Blinka app before funds can be dispatched.',
                payoutMethod: pm,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error adding payout method: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 7: blinka_approve_payout_method
// -------------------------------------------------------------
server.tool(
  'blinka_approve_payout_method',
  'Authorize a pending payout method (simulates Human-in-the-Loop admin approval in Blinka portal).',
  {
    methodId: z.string().describe('The ID of the payout method to approve'),
    approvedBy: z.string().describe('Email or name of authorizing admin (e.g. cfo@company.com)'),
  },
  async ({ methodId, approvedBy }) => {
    try {
      const pm = await client.approvePayoutMethod(methodId, approvedBy);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Payout method ${methodId} is now APPROVED. Transfers can now be executed to this method.`,
                payoutMethod: pm,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Error approving payout method: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 8: blinka_create_transfer
// -------------------------------------------------------------
server.tool(
  'blinka_create_transfer',
  'Execute a synchronous internal transfer between two Blinka accounts in your workspace (e.g., sweep funds from Treasury to Operating Checking). Requires an Idempotency-Key.',
  {
    sourceAccountId: z.string().describe('Source account ID'),
    destinationAccountId: z.string().describe('Destination account ID'),
    amountCents: z.number().positive().describe('Transfer amount in minor units (cents). Max $2,000,000.00'),
    memo: z.string().optional().describe('Accounting memo (max 120 chars)'),
    idempotencyKey: z.string().describe('Unique UUID idempotency key to prevent double charging'),
  },
  async (args) => {
    try {
      const transfer = await client.createInternalTransfer(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Transfer of ${formatCents(transfer.amountCents)} executed successfully.`,
                transfer,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Transfer failed: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 9: blinka_reconcile_invoice (Autonomous AP)
// -------------------------------------------------------------
server.tool(
  'blinka_reconcile_invoice',
  'Autonomous AP Tool: Reconcile an incoming vendor invoice against Blinka counterparties, historical transaction records, and liquidity balances. Detects duplicate invoices and checks bank details.',
  {
    invoiceNumber: z.string().describe('Invoice reference number (e.g. INV-2026-904)'),
    vendorName: z.string().describe('Name of the vendor issuing the invoice'),
    amountCents: z.number().positive().describe('Total invoice amount in cents (e.g. 245000 for $2,450.00)'),
    currency: z.string().default('USD').describe('Invoice currency (USD or USDC)'),
    dueDate: z.string().describe('Invoice due date (ISO 8601 or YYYY-MM-DD)'),
    beneficiaryBankLastFour: z.string().optional().describe('Beneficiary account last 4 digits on invoice for anti-phishing match (Fiat ACH/Wire)'),
    walletAddress: z.string().optional().describe('Beneficiary crypto wallet address (e.g. 0x... for USDC on Base Network) for Web3 anti-phishing match'),
    network: z.string().optional().describe('Blockchain network for crypto payout (e.g. Base, Solana, Ethereum)'),
    description: z.string().optional().describe('Line items or service description'),
  },
  async (args) => {
    try {
      const { reconciliation, policy } = await client.reconcileInvoiceAndEvaluate(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                reconciliationSummary: {
                  invoiceNumber: args.invoiceNumber,
                  vendorMatched: reconciliation.matchedCounterparty ? reconciliation.matchedCounterparty.name : 'NO MATCH',
                  isDuplicate: reconciliation.isDuplicate,
                  hasSufficientFunds: reconciliation.hasSufficientBalance,
                  recommendedAccount: reconciliation.recommendedSourceAccount?.id,
                  notes: reconciliation.reconciliationNotes,
                },
                preliminaryPolicyDecision: policy.decision,
                confidenceScore: `${policy.score}%`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Reconciliation error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 10: blinka_evaluate_payment_policy (Guardrails & Risk)
// -------------------------------------------------------------
server.tool(
  'blinka_evaluate_payment_policy',
  'Policy Guardrail Engine: Evaluates compliance, anti-fraud, counterparty verification, bank account continuity, and spending thresholds before any payout is triggered.',
  {
    invoiceNumber: z.string().describe('Invoice reference number'),
    vendorName: z.string().describe('Vendor name'),
    amountCents: z.number().positive().describe('Invoice amount in cents'),
    currency: z.string().default('USD').describe('Currency (USD or USDC)'),
    dueDate: z.string().describe('Payment due date'),
    beneficiaryBankLastFour: z.string().optional().describe('Bank account ending on invoice to prevent bank-switch phishing (Fiat)'),
    walletAddress: z.string().optional().describe('Beneficiary crypto wallet address to prevent address poisoning phishing (Crypto)'),
    network: z.string().optional().describe('Blockchain network (Base, Solana, etc.)'),
  },
  async (args) => {
    try {
      const { policy } = await client.reconcileInvoiceAndEvaluate(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                decision: policy.decision,
                confidenceScore: `${policy.score}%`,
                reasons: policy.reasons,
                rulesAuditTrail: policy.rulesTriggered,
                suggestedAction: policy.suggestedAction,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Policy evaluation error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 11: blinka_execute_vendor_payout
// -------------------------------------------------------------
server.tool(
  'blinka_execute_vendor_payout',
  'Autonomous AP Execution: Executes or stages a payout to a vendor. Enforces policy engine checks; rejects fraudulent or unverified payouts, and requires Human-in-the-Loop approval for high-value or unapproved bank details.',
  {
    invoiceNumber: z.string().describe('Invoice reference number'),
    vendorName: z.string().describe('Vendor name'),
    amountCents: z.number().positive().describe('Invoice amount in cents'),
    currency: z.string().default('USD').describe('Currency'),
    dueDate: z.string().describe('Invoice due date'),
    beneficiaryBankLastFour: z.string().optional().describe('Beneficiary account last 4 digits on invoice'),
    forceOverride: z.boolean().optional().describe('Set to true only if authorized by CFO/Founder to override approval threshold'),
    authorizedBy: z.string().optional().describe('Signer name/email if override is provided'),
  },
  async (args) => {
    try {
      const result = await client.executeVendorPayment({
        invoice: {
          invoiceNumber: args.invoiceNumber,
          vendorName: args.vendorName,
          amountCents: args.amountCents,
          currency: args.currency,
          dueDate: args.dueDate,
          beneficiaryBankLastFour: args.beneficiaryBankLastFour,
        },
        forceOverride: args.forceOverride,
        authorizedBy: args.authorizedBy,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Payout execution error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// TOOL 12: blinka_verify_inbound_payment (Dual Rail: Fiat & Crypto Pay-ins)
// -------------------------------------------------------------
server.tool(
  'blinka_verify_inbound_payment',
  'Dual-Rail Pay-in Verification: Validates whether an incoming client payment has been received and confirmed in Blinka via traditional Fiat (USD ACH/Fedwire via Portage Bank FDIC) or Crypto (USDC on Base Network blockchain). Reconciles amounts, sender, reference memo, or transaction hash.',
  {
    amountCents: z.number().positive().describe('Expected payment amount in cents (e.g. 500000 for $5,000.00)'),
    currency: z.enum(['USD', 'USDC']).default('USD').describe('Payment currency: USD (Fiat) or USDC (Crypto Stablecoin)'),
    invoiceNumber: z.string().optional().describe('Optional invoice number expected in payment memo or reference notes'),
    clientName: z.string().optional().describe('Name of the client who allegedly sent the payment'),
    txHashOrMemo: z.string().optional().describe('Blockchain transaction hash (0x...) or wire reference number'),
  },
  async (args) => {
    try {
      const result = await client.verifyInboundPayment({
        amountCents: args.amountCents,
        currency: args.currency,
        invoiceNumber: args.invoiceNumber,
        clientName: args.clientName,
        txHashOrMemo: args.txHashOrMemo,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `Inbound verification error: ${e.message}` }],
        isError: true,
      };
    }
  }
);

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Blinka MCP Server] Running on stdio transport.');
}

main().catch((error) => {
  console.error('[Blinka MCP Server] Fatal error:', error);
  process.exit(1);
});
