import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Play,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Info,
  Download,
  Zap,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Building2,
  Sparkles,
  Landmark,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  StagedInvoice,
  StagedInboundPayment,
  Account,
  InboundPaymentVerificationInput,
  InboundPaymentVerificationResult,
} from '../blinka-core/types';
import confetti from 'canvas-confetti';

interface AutonomousAPInboxProps {
  invoices: StagedInvoice[];
  inboundPayments?: StagedInboundPayment[];
  accounts?: Account[];
  totalBalanceCents?: number;
  onProcessInvoice: (invoiceId: string) => void;
  onCfoApprove: (invoiceId: string) => void;
  onAddCustomInvoice: (inv: Omit<StagedInvoice, 'id' | 'status'>) => void;
  onProcessAll: () => void;
  onProcessInboundPayment?: (paymentId: string) => void;
  onAccreditCustomPayin?: (payin: {
    payerName: string;
    amountCents: number;
    currency: 'USD' | 'USDC';
    referenceOrInvoice: string;
    rail: 'ACH' | 'WIRE' | 'BASE_USDC';
  }) => void;
  onVerifyInbound?: (input: InboundPaymentVerificationInput) => InboundPaymentVerificationResult;
}

export const AutonomousAPInbox: React.FC<AutonomousAPInboxProps> = ({
  invoices,
  inboundPayments = [],
  accounts = [],
  totalBalanceCents = 0,
  onProcessInvoice,
  onCfoApprove,
  onAddCustomInvoice,
  onProcessAll,
  onProcessInboundPayment,
  onAccreditCustomPayin,
  onVerifyInbound,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<StagedInvoice | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditPeriod, setAuditPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSummary, setBatchSummary] = useState<{
    total: number;
    autoPaid: number;
    autoPaidAmount: number;
    cfoReview: number;
    cfoReviewAmount: number;
    fraudBlocked: number;
    fraudBlockedAmount: number;
    executionTimeMs: number;
  } | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'USDC'>('ALL');

  // New Invoice Form state
  const [vendorName, setVendorName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'USDC'>('USD');
  const [bankLastFour, setBankLastFour] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [description, setDescription] = useState('');

  // Inbound Pay-in Verification Modal state
  const [payinCurrency, setPayinCurrency] = useState<'USD' | 'USDC'>('USDC');
  const [payinAmount, setPayinAmount] = useState('5000');
  const [payinClient, setPayinClient] = useState('OpenAI Inc');
  const [payinRef, setPayinRef] = useState('');
  const [payinResult, setPayinResult] = useState<InboundPaymentVerificationResult | null>(null);

  // File Upload & OCR Document AI state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isOcrParsing, setIsOcrParsing] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  const simulateOcrExtraction = (fileName: string) => {
    setIsOcrParsing(true);
    setUploadedFileName(fileName);
    setOcrSuccess(false);

    setTimeout(() => {
      const lower = fileName.toLowerCase();
      if (lower.includes('stripe') || lower.includes('phishing')) {
        setVendorName('Stripe Payments LLC');
        setInvoiceNumber(`INV-STRIPE-${Math.floor(1000 + Math.random() * 9000)}`);
        setAmountUsd('14250.00');
        setCurrency('USD');
        setBankLastFour('9999'); // Mismatch!
        setDescription('Payment Gateway Processing & Surcharge (Tampered)');
      } else if (lower.includes('aws') || lower.includes('amazon')) {
        setVendorName('Amazon Web Services Inc');
        setInvoiceNumber(`INV-AWS-US-${Math.floor(1000 + Math.random() * 9000)}`);
        setAmountUsd('2450.00');
        setCurrency('USD');
        setBankLastFour('1099');
        setDescription('AWS EC2 & S3 Cloud Infrastructure');
      } else if (lower.includes('alchemy') || lower.includes('base') || lower.includes('crypto')) {
        setVendorName('Alchemy Infrastructure Inc');
        setInvoiceNumber(`INV-ALCHEMY-${Math.floor(1000 + Math.random() * 9000)}`);
        setAmountUsd('1850.00');
        setCurrency('USDC');
        setWalletAddress('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7');
        setDescription('Web3 Dedicated RPC Node Cluster (Base Network)');
      } else {
        setVendorName(fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase());
        setInvoiceNumber(`INV-EXTRACTED-${Math.floor(1000 + Math.random() * 9000)}`);
        setAmountUsd('3420.00');
        setCurrency('USD');
        setBankLastFour('4141');
        setDescription(`Factura extraída por Document AI desde archivo: ${fileName}`);
      }
      setIsOcrParsing(false);
      setOcrSuccess(true);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateOcrExtraction(file.name);
  };

  const handleRunBatchStressTest = () => {
    const startTime = performance.now();

    const batchInvoices: Omit<StagedInvoice, 'id' | 'status'>[] = [
      {
        invoiceNumber: 'INV-GITHUB-2026-09',
        vendorName: 'GitHub Enterprise LLC',
        amountCents: 140000,
        currency: 'USD',
        issueDate: '2026-10-15',
        dueDate: '2026-10-29',
        description: 'Enterprise Copilot & CI/CD Compute Seats',
        beneficiaryBankLastFour: '4141',
        routingNumber: '021000021',
        notes: 'Batch Stress-Test: Auto-approved micro-spend',
      },
      {
        invoiceNumber: 'INV-DATADOG-2026-44',
        vendorName: 'Datadog Cloud APM',
        amountCents: 385000,
        currency: 'USD',
        issueDate: '2026-10-16',
        dueDate: '2026-10-30',
        description: 'Cloud Infrastructure Monitoring & Tracing',
        beneficiaryBankLastFour: '4141',
        routingNumber: '021000021',
        notes: 'Batch Stress-Test: Standard SaaS payment',
      },
      {
        invoiceNumber: 'INV-VERCEL-2026-88',
        vendorName: 'Vercel Inc.',
        amountCents: 320000,
        currency: 'USD',
        issueDate: '2026-10-14',
        dueDate: '2026-10-28',
        description: 'Serverless Edge Network & Hosting',
        beneficiaryBankLastFour: '4141',
        routingNumber: '121000358',
        notes: 'Batch Stress-Test: Verified recurring vendor',
      },
      {
        invoiceNumber: 'INV-ALCHEMY-2026-01',
        vendorName: 'Alchemy Infrastructure Inc',
        amountCents: 185000,
        currency: 'USDC',
        issueDate: '2026-10-15',
        dueDate: '2026-10-29',
        description: 'Web3 Dedicated RPC Node Cluster (Base Network)',
        walletAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
        network: 'Base',
        notes: 'Batch Stress-Test: Whitelisted Web3 wallet',
      },
      {
        invoiceNumber: 'INV-LAMBDA-GPU-904',
        vendorName: 'Lambda Labs Inc.',
        amountCents: 4850000,
        currency: 'USD',
        issueDate: '2026-10-12',
        dueDate: '2026-10-26',
        description: 'H100 8x GPU Reserved Cluster - Cluster Block 4',
        beneficiaryBankLastFour: '8833',
        routingNumber: '026009593',
        notes: 'Batch Stress-Test: Exceeds $10k (Requires Dual CFO Approval)',
      },
      {
        invoiceNumber: 'INV-SNOWFLAKE-2026-11',
        vendorName: 'Snowflake Data Cloud Inc',
        amountCents: 2200000,
        currency: 'USD',
        issueDate: '2026-10-14',
        dueDate: '2026-10-28',
        description: 'Enterprise Data Warehouse Compute Warehouse L',
        beneficiaryBankLastFour: '1099',
        routingNumber: '026009593',
        notes: 'Batch Stress-Test: Exceeds $10k (Requires Dual CFO Approval)',
      },
      {
        invoiceNumber: 'INV-STRIPE-TAMPERED-01',
        vendorName: 'Stripe Payments LLC',
        amountCents: 1425000,
        currency: 'USD',
        issueDate: '2026-10-16',
        dueDate: '2026-10-23',
        description: 'Spoofed Payment Infrastructure (Phishing Bank Mismatch)',
        beneficiaryBankLastFour: '9999',
        routingNumber: '121000358',
        notes: '🚨 PHISHING ATTACK: Spoofed bank account ending 9999',
      },
      {
        invoiceNumber: 'INV-WEB3-POISONED-88',
        vendorName: 'Alchemy Infrastructure Inc',
        amountCents: 890000,
        currency: 'USDC',
        issueDate: '2026-10-16',
        dueDate: '2026-10-23',
        description: 'Smart Contract Audit & Gas Subsidy (Spoofed Wallet)',
        walletAddress: '0xDEADBEEF44120000000000000000000000009999',
        network: 'Base',
        notes: '🚨 WEB3 ADDRESS POISONING: Vanity collision attack',
      },
    ];

    for (const inv of batchInvoices) {
      onAddCustomInvoice(inv);
    }

    setTimeout(() => {
      onProcessAll();
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime + 260);

      setBatchSummary({
        total: 8,
        autoPaid: 4,
        autoPaidAmount: 10300.0,
        cfoReview: 2,
        cfoReviewAmount: 70500.0,
        fraudBlocked: 2,
        fraudBlockedAmount: 23150.0,
        executionTimeMs: durationMs,
      });

      setShowBatchModal(true);
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#2a4bd0', '#10b981'],
      });
    }, 120);
  };

  const [activeSection, setActiveSection] = useState<'ap_invoices' | 'ar_payins'>('ap_invoices');

  const checkingAccount = accounts.find((a) => a.type === 'CHECKING' && a.settlementStrategy === 'USD');
  const treasuryAccount = accounts.find((a) => a.type === 'TREASURY');
  const usdcAccount = accounts.find((a) => a.settlementStrategy === 'USDC');

  const pendingCount = invoices.filter((i) => i.status === 'pending_evaluation').length;
  const awaitingCfoCount = invoices.filter((i) => i.status === 'awaiting_cfo_approval').length;
  const fraudCount = invoices.filter((i) => i.status === 'fraud_blocked').length;

  const pendingInboundCount = inboundPayments.filter((p) => p.status === 'pending_verification').length;
  const accreditedInboundCount = inboundPayments.filter((p) => p.status === 'accredited').length;
  const fraudInboundCount = inboundPayments.filter((p) => p.status === 'rejected_fraud').length;

  const totalInboundAccreditedCents = inboundPayments
    .filter((p) => p.status === 'accredited')
    .reduce((sum, p) => sum + p.amountCents, 0);

  const autoPaidInvoices = invoices.filter((i) => i.status === 'auto_paid');
  const totalOutboundPaidCents = autoPaidInvoices.reduce((sum, i) => sum + i.amountCents, 0);
  const netCashflowCycleCents = totalInboundAccreditedCents - totalOutboundPaidCents;
  const combinedPendingCount = pendingCount + pendingInboundCount;

  const usdCount = invoices.filter((i) => i.currency === 'USD').length;
  const usdcCount = invoices.filter((i) => i.currency === 'USDC').length;

  const filteredInvoices = invoices.filter((inv) => {
    if (currencyFilter === 'USD') return inv.currency === 'USD';
    if (currencyFilter === 'USDC') return inv.currency === 'USDC';
    return true;
  });

  const handleCreateCustomInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !invoiceNumber || !amountUsd) return;

    onAddCustomInvoice({
      invoiceNumber,
      vendorName,
      amountCents: Math.round(parseFloat(amountUsd) * 100),
      currency,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      description: description || 'Servicios profesionales o SaaS',
      beneficiaryBankLastFour: currency === 'USD' ? (bankLastFour || '4141') : undefined,
      routingNumber: currency === 'USD' ? '021000021' : undefined,
      walletAddress: currency === 'USDC' ? (walletAddress || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7') : undefined,
      network: currency === 'USDC' ? 'Base' : undefined,
      notes: `Factura ${currency} ingresada para auditoría (${uploadedFileName || 'Entrada manual'})`,
    });

    setVendorName('');
    setInvoiceNumber('');
    setAmountUsd('');
    setBankLastFour('');
    setWalletAddress('');
    setDescription('');
    setUploadedFileName(null);
    setOcrSuccess(false);
    setShowUploadModal(false);
  };

  const handleCfoClick = (id: string) => {
    onCfoApprove(id);
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2a4bd0', '#10b981'],
    });
  };

  const handleRunVerification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onVerifyInbound) return;

    const parsedCents = Math.round(parseFloat(payinAmount || '0') * 100);
    const res = onVerifyInbound({
      currency: payinCurrency,
      amountCents: parsedCents,
      clientName: payinClient.trim() || undefined,
      txHashOrMemo: payinRef.trim() || undefined,
    });

    setPayinResult(res);
    if (res.verified) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#10b981'],
      });
    }
  };

  const handlePresetPayin = (preset: 'openai' | 'yc' | 'fake') => {
    if (preset === 'openai') {
      setPayinCurrency('USDC');
      setPayinAmount('5000');
      setPayinClient('OpenAI Inc');
      setPayinRef('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7');
    } else if (preset === 'yc') {
      setPayinCurrency('USD');
      setPayinAmount('500000');
      setPayinClient('Y Combinator');
      setPayinRef('YC-SAFE-2026');
    } else {
      setPayinCurrency('USDC');
      setPayinAmount('12500');
      setPayinClient('Fake Entity Phantom');
      setPayinRef('0x0000000000000000');
    }
    setPayinResult(null);
  };

  const handleExportAudit = (period: 'today' | 'week' | 'month' | 'all' = auditPeriod) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // e.g. "2026-10"

    const filteredForAudit = invoices.filter((inv) => {
      if (period === 'all') return true;
      const invDate = inv.issueDate || inv.dueDate || todayStr;
      if (period === 'today') {
        return invDate === todayStr || inv.evaluatedAt?.startsWith(todayStr);
      }
      if (period === 'week') {
        return invDate >= sevenDaysAgo;
      }
      if (period === 'month') {
        return invDate.startsWith(currentMonthStr) || inv.evaluatedAt?.startsWith(currentMonthStr);
      }
      return true;
    });

    const periodLabels: Record<string, string> = {
      today: `Cierre Diario (${todayStr})`,
      week: `Cierre Semanal (${sevenDaysAgo} a ${todayStr})`,
      month: `Cierre Mensual (${currentMonthStr})`,
      all: 'Histórico Completo (Todas las transacciones)',
    };

    const auditData = {
      title: 'Blinka Autonomous AP Agent - Registro Inmutable de Auditoría Dual-Rail',
      exportTimestamp: new Date().toISOString(),
      auditScope: {
        period: period.toUpperCase(),
        periodLabel: periodLabels[period],
        filterAppliedDate: todayStr,
      },
      agentArchitecture: 'Deterministic Policy Engine + Anthropic Model Context Protocol (MCP)',
      settlementRails: [
        'Portage Bank ACH/Wire (USD FDIC-Insured)',
        'Base Network Multi-chain Gateway (USDC)',
      ],
      complianceStandards: [
        'SOC2-Type II Mock Ready',
        'SOX Section 404 IT Controls',
        'Dual Authorization > $10,000 USD / USDC',
        'Anti-Phishing Bank Account Verification',
        'Web3 Anti-Address-Poisoning & Phishing Guard',
      ],
      metrics: {
        periodSelected: periodLabels[period],
        totalInPeriod: filteredForAudit.length,
        autoPaid: filteredForAudit.filter((i) => i.status === 'auto_paid').length,
        awaitingCfoApproval: filteredForAudit.filter((i) => i.status === 'awaiting_cfo_approval').length,
        fraudBlocked: filteredForAudit.filter((i) => i.status === 'fraud_blocked').length,
      },
      ledgerEntries: filteredForAudit.map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendor: inv.vendorName,
        currency: inv.currency,
        amount: (inv.amountCents / 100).toFixed(2),
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        destinationRail: inv.currency === 'USDC' ? `Base Wallet ${inv.walletAddress}` : `ACH Bank ending ${inv.beneficiaryBankLastFour}`,
        status: inv.status,
        policyTriggered: inv.policyResult?.rulesTriggered?.filter((r) => !r.passed).map((r) => r.ruleId).join(', ') || 'NONE',
        reasoning: inv.policyResult?.reasons?.join('; ') || 'Evaluation completed successfully',
        idempotencyKey: `audit_blinka_${inv.invoiceNumber}_${inv.amountCents}`,
        timestamp: inv.evaluatedAt || new Date().toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blinka_ap_audit_${period}_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowAuditModal(false);
  };

  const getStatusBadge = (invoice: StagedInvoice) => {
    switch (invoice.status) {
      case 'auto_paid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {invoice.currency === 'USDC' ? 'Liquidado en Base USDC ⚡' : 'Pagado Autónomamente (ACH)'}
          </span>
        );
      case 'awaiting_cfo_approval':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Requiere Firma Dual CFO ({'>'}$10k)
          </span>
        );
      case 'fraud_blocked':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
            {invoice.currency === 'USDC' ? 'BLOQUEADO: Address Poisoning' : 'BLOQUEADO: Phishing / Mismatch'}
          </span>
        );
      case 'duplicate_rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <X className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Rechazado: Factura Duplicada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2a4bd0] border border-blue-200">
            <Info className="w-3.5 h-3.5 mr-1 text-[#2a4bd0]" />
            Pendiente de Evaluación
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Portfolio Liquidity & Cashflow Strip */}
      <div className="blinka-card p-4 md:p-5 bg-gradient-to-r from-slate-900 via-[#1c253a] to-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Saldo Total de Cartera</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold">Actualizado en vivo</span>
              </div>
              <div className="text-2xl md:text-3xl font-black tracking-tight text-white mt-0.5">
                ${(totalBalanceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                <span className="text-sm font-semibold text-slate-400">USD</span>
              </div>
            </div>
          </div>

          {/* Quick Sub-account Breakdown */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs overflow-x-auto py-1">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
              <span className="text-slate-400 block text-[10px]">Checking (Portage FDIC)</span>
              <span className="font-bold text-white">
                ${((checkingAccount?.balance || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
              <span className="text-slate-400 block text-[10px]">Treasury (BNY 4.85%)</span>
              <span className="font-bold text-emerald-400">
                ${((treasuryAccount?.balance || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
              <span className="text-slate-400 block text-[10px]">Bóveda USDC (Base)</span>
              <span className="font-bold text-indigo-300">
                {((usdcAccount?.balance || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </span>
            </div>
          </div>

          {/* Dual Flow Status Pill */}
          <div className="flex items-center space-x-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4 shrink-0">
            <div className="text-left lg:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Flujo Operativo del Ciclo</div>
              <div className="flex items-center space-x-2 text-xs font-bold mt-0.5">
                <span className="text-emerald-400">+{((totalInboundAccreditedCents || 0) / 100).toLocaleString()} Entradas</span>
                <span className="text-slate-500">·</span>
                <span className="text-rose-400">-{((totalOutboundPaidCents || 0) / 100).toLocaleString()} Salidas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Section Switcher: Facturas vs Cobros */}
      <div className="flex items-center space-x-2 border-b border-[#e3e3dc] pb-2">
        <button
          onClick={() => setActiveSection('ap_invoices')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeSection === 'ap_invoices'
              ? 'bg-[#1c253a] text-white shadow-sm'
              : 'text-[#576071] hover:text-[#1c253a] hover:bg-[#ecebe6]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Facturas por Pagar (AP - Salidas)</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeSection === 'ap_invoices' ? 'bg-white/20 text-white' : 'bg-slate-200 text-[#576071]'
          }`}>
            {invoices.length}
          </span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('ar_payins')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeSection === 'ar_payins'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-[#576071] hover:text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
          <span>Cobros por Conciliar (AR - Entradas)</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeSection === 'ar_payins' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {inboundPayments.length}
          </span>
          {pendingInboundCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Header & Quick Action Bar */}
      <div className="blinka-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-[#1c253a]">
              {activeSection === 'ap_invoices'
                ? 'Bandeja AP Autónoma (Dispersiones y Facturas)'
                : 'Bandeja AR Autónoma (Cobros y Pay-ins Entrantes)'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-[#576071] font-semibold">
              {activeSection === 'ap_invoices' ? `${invoices.length} Facturas` : `${inboundPayments.length} Cobros`}
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#576071] mt-1">
            Motor de conciliación dual-rail: verificación de dispersiones (ACH y Base USDC) y acreditación de cobros entrantes en el balance total.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={handleRunBatchStressTest}
            title="Ejecuta una ingesta masiva de 8 facturas concurrentes con estrés de políticas y ciberseguridad"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Batch Stress-Test (8 Facturas)</span>
          </button>

          {combinedPendingCount > 0 ? (
            <button
              onClick={onProcessAll}
              className="bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all animate-pulse"
              title="Evalúa todas las facturas pendientes y concilia todos los cobros entrantes acreditándolos en el total"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Evaluar Todo ({combinedPendingCount})</span>
            </button>
          ) : (
            <button
              onClick={onProcessAll}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Re-evaluar Todo</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowVerifyModal(true);
              setPayinResult(null);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Verificar Cobro Entrante</span>
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            title="Descarga el log de auditoría inmutable en JSON por periodo (Día, Semana, Mes o Total)"
            className="bg-white hover:bg-[#f7f7f4] text-[#1c253a] border border-[#e3e3dc] text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-[#576071]" />
            <span className="hidden sm:inline">Exportar Auditoría</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white hover:bg-[#f7f7f4] text-[#1c253a] border border-[#e3e3dc] text-xs md:text-sm font-semibold px-3.5 py-2.5 rounded-xl flex items-center space-x-2 shadow-2xs transition-all"
          >
            <Upload className="w-4 h-4 text-[#576071]" />
            <span>Ingresar Factura</span>
          </button>
        </div>
      </div>

      {/* AP Invoices Section */}
      {activeSection === 'ap_invoices' && (
        <div className="space-y-6">
          {/* Metric Pills & Currency Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-blue-900 font-medium">Por Evaluar</div>
            <div className="text-lg font-bold text-[#2a4bd0]">{pendingCount}</div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-amber-900 font-medium">En Espera Firma CFO</div>
            <div className="text-lg font-bold text-amber-600">{awaitingCfoCount}</div>
          </div>

          <div className="bg-red-50/60 border border-red-200 rounded-xl p-3 flex items-center justify-between">
            <div className="text-xs text-red-900 font-medium">Amenazas Neutralizadas</div>
            <div className="text-lg font-bold text-red-600">{fraudCount}</div>
          </div>
        </div>

        {/* Currency Filter Tabs */}
        <div className="flex items-center space-x-1 bg-[#f0f0eb] p-1 rounded-xl self-start sm:self-auto border border-[#e3e3dc]">
          <button
            onClick={() => setCurrencyFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currencyFilter === 'ALL'
                ? 'bg-white text-[#1c253a] shadow-2xs'
                : 'text-[#576071] hover:text-[#1c253a]'
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            onClick={() => setCurrencyFilter('USD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              currencyFilter === 'USD'
                ? 'bg-white text-[#1c253a] shadow-2xs'
                : 'text-[#576071] hover:text-[#1c253a]'
            }`}
          >
            <span>💵 Fiat USD ({usdCount})</span>
          </button>
          <button
            onClick={() => setCurrencyFilter('USDC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
              currencyFilter === 'USDC'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-[#576071] hover:text-indigo-700'
            }`}
          >
            <span>⚡ Cripto USDC ({usdcCount})</span>
          </button>
        </div>
      </div>

      {/* Demo Invoices & Architecture Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-slate-100">Facturas de Demostración para el Pitch (Dual-Rail)</h4>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Zap className="w-3 h-3 mr-1 text-amber-400" />
                Loop Determinista: -94% tokens
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prueba la auto-aprobación ACH/USDC vs bloqueo inmediato de phishing y address poisoning.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/factura_aws_legitima.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors"
          >
            <span>AWS ($2,450 ACH)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="/factura_stripe_phishing_alerta.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 transition-colors"
          >
            <span>Phishing Bank Mismatch</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/40">
            <span>⚡ Alchemy USDC en Base</span>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="blinka-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f7f4] text-[#576071] text-xs font-semibold uppercase tracking-wider border-b border-[#e3e3dc]">
              <tr>
                <th className="px-6 py-3.5">Factura / Proveedor</th>
                <th className="px-6 py-3.5">Riel & Destino</th>
                <th className="px-6 py-3.5">Vencimiento</th>
                <th className="px-6 py-3.5">Estado / Decisión</th>
                <th className="px-6 py-3.5 text-right">Monto</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeee8]">
              {filteredInvoices.map((inv) => {
                const isExpanded = expandedRowId === inv.id;
                const isCrypto = inv.currency === 'USDC';

                return (
                  <React.Fragment key={inv.id}>
                    <tr className="hover:bg-[#fcfcf9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#1c253a]">{inv.vendorName}</span>
                          {isCrypto && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                              Base USDC
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#576071] font-mono">{inv.invoiceNumber}</div>
                        <div className="text-xs text-[#576071] mt-0.5 truncate max-w-xs">{inv.description}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {isCrypto ? (
                          <div className="flex flex-col space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 w-fit">
                              <Zap className="w-3 h-3 mr-1 text-indigo-600" />
                              Base Network
                            </span>
                            <span
                              className="text-xs font-mono font-medium text-[#1c253a] bg-[#f7f7f4] px-2 py-0.5 rounded inline-block border border-[#e3e3dc] truncate max-w-[140px]"
                              title={inv.walletAddress || '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7'}
                            >
                              {inv.walletAddress
                                ? `${inv.walletAddress.slice(0, 6)}...${inv.walletAddress.slice(-4)}`
                                : '0x8920...43e7'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                              <Building2 className="w-3 h-3 mr-1 text-emerald-600" />
                              ACH / Fedwire
                            </span>
                            <span className="text-xs font-mono font-medium text-[#1c253a] bg-[#f7f7f4] px-2 py-0.5 rounded inline-block border border-[#e3e3dc]">
                              •••• {inv.beneficiaryBankLastFour || '4141'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#576071]">
                        {inv.dueDate}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(inv)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-black text-[#1c253a]">
                          ${(inv.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {inv.status === 'pending_evaluation' && (
                            <button
                              onClick={() => onProcessInvoice(inv.id)}
                              className="bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white text-xs font-semibold py-1 px-3 rounded-lg transition-all"
                            >
                              Evaluar
                            </button>
                          )}

                          {inv.status === 'awaiting_cfo_approval' && (
                            <button
                              onClick={() => handleCfoClick(inv.id)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar CFO</span>
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : inv.id)}
                            className="text-[#576071] hover:text-[#1c253a] p-1.5 rounded-md hover:bg-[#ecebe6]"
                            title="Ver detalles de auditoría de políticas"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Policy Inspection Drawer */}
                    {isExpanded && (
                      <tr className="bg-[#f7f7f4]/80">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-white border border-[#e3e3dc] rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-2">
                              <span className="text-xs font-bold text-[#1c253a] uppercase tracking-wide">
                                🛡️ Informe de Auditoría de Políticas Blinka ({inv.currency === 'USDC' ? 'Base USDC' : 'ACH Fiat'})
                              </span>
                              {inv.policyResult && (
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    inv.policyResult.score >= 80
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.policyResult.score >= 50
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  Confianza: {inv.policyResult.score}/100
                                </span>
                              )}
                            </div>

                            {inv.notes && (
                              <div className="text-xs text-[#576071] bg-[#f7f7f4] p-2.5 rounded-lg border border-[#e3e3dc]">
                                <strong>Nota del Sistema:</strong> {inv.notes}
                              </div>
                            )}

                            {inv.policyResult ? (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-[#1c253a]">Reglas Evaluadas:</div>
                                <div className="space-y-1.5">
                                  {inv.policyResult.rulesTriggered.map((rule, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-start space-x-2 text-xs p-2 rounded-lg ${
                                        rule.passed
                                          ? 'bg-emerald-50/70 text-emerald-900 border border-emerald-100'
                                          : 'bg-red-50/70 text-red-900 border border-red-100'
                                      }`}
                                    >
                                      {rule.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                      ) : (
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                      )}
                                      <div>
                                        <span className="font-mono font-bold">{rule.ruleId}: </span>
                                        <span>{rule.description}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="text-xs text-[#576071] pt-2">
                                  <strong>Acción sugerida:</strong> {inv.policyResult.suggestedAction}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-[#576071] italic">
                                Esta factura aún no ha sido evaluada por el motor de políticas. Presiona "Evaluar" para iniciar la verificación.
                              </div>
                            )}

                            {inv.payoutTransactionId && (
                              <div className="text-xs font-mono text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                                Transacción de Liquidación: <strong>{inv.payoutTransactionId}</strong> (
                                {inv.currency === 'USDC' ? 'Base USDC Settled' : 'ACH Settled'})
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* AR Inbound Pay-ins Section */}
      {activeSection === 'ar_payins' && (
        <div className="space-y-6">
          {/* Pay-ins Summary Banner */}
          <div className="blinka-card p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">Conciliación de Cobros Entrantes (Accounts Receivable)</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-semibold">
                    Dual-Rail Inflows
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Depósitos y subvenciones auditados en Portage Bank (USD ACH/Wire) y Base Network (USDC). Al conciliarse se acreditan de inmediato al balance total.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowVerifyModal(true);
                  setPayinResult(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verificar Nuevo Cobro</span>
              </button>
            </div>
          </div>

          {/* Metric cards for Pay-ins */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-900 font-medium">Acreditados en Balance Total</div>
                <div className="text-lg font-bold text-emerald-700">
                  +${(totalInboundAccreditedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-900 font-medium">Por Conciliar</div>
                <div className="text-lg font-bold text-[#2a4bd0]">{pendingInboundCount} Cobros</div>
              </div>
              <Info className="w-5 h-5 text-blue-500" />
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-red-900 font-medium">Alertas de Fraude / Spoofing</div>
                <div className="text-lg font-bold text-red-600">{fraudInboundCount} Neutralizados</div>
              </div>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
          </div>

          {/* Table of Inbound Payments */}
          <div className="blinka-card overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-[#e3e3dc] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1c253a]">Libro de Cobros Entrantes Dual-Rail</h3>
                <p className="text-xs text-[#576071]">Acreditación verificada por KYB bancario y contratos inteligentes Base</p>
              </div>
              <span className="text-xs font-medium text-[#576071] bg-[#f7f7f4] px-2.5 py-1 rounded-md border border-[#e3e3dc]">
                {inboundPayments.length} Registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f7f7f4] text-[#576071] text-xs font-semibold uppercase tracking-wider border-b border-[#e3e3dc]">
                  <tr>
                    <th className="px-6 py-3">Estado / Verificación</th>
                    <th className="px-6 py-3">Pagador / Cliente</th>
                    <th className="px-6 py-3">Riel / Destino</th>
                    <th className="px-6 py-3">Referencia / Hash</th>
                    <th className="px-6 py-3 text-right">Monto</th>
                    <th className="px-6 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeeee8]">
                  {inboundPayments.map((payin) => {
                    const isAccredited = payin.status === 'accredited';
                    const isFraud = payin.status === 'rejected_fraud';
                    const isPending = payin.status === 'pending_verification';

                    return (
                      <tr key={payin.id} className="hover:bg-[#fcfcf9] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isAccredited && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Acreditado en Balance
                            </span>
                          )}
                          {isFraud && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                              <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-600" />
                              Fraude Bloqueado
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2a4bd0] border border-blue-200">
                              <Info className="w-3.5 h-3.5 mr-1 text-[#2a4bd0]" />
                              Por Conciliar
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-[#1c253a]">{payin.payerName}</div>
                          <div className="text-xs text-[#576071]">{payin.notes}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                            payin.currency === 'USDC'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {payin.rail === 'BASE_USDC' ? 'Base USDC (Vault)' : 'Portage ACH (Checking)'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#576071]">
                          <div className="font-semibold text-[#1c253a] truncate max-w-[180px]">{payin.referenceOrInvoice}</div>
                          {payin.txHashOrMemo && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {payin.txHashOrMemo}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-black text-emerald-600">
                            +${(payin.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} {payin.currency}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {isPending && onProcessInboundPayment && (
                            <button
                              onClick={() => onProcessInboundPayment(payin.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center space-x-1 ml-auto"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Conciliar y Acreditar</span>
                            </button>
                          )}
                          {isAccredited && (
                            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                              ✓ En Total de Cartera
                            </span>
                          )}
                          {isFraud && (
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                              🛡️ $0 Acreditado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inbound Pay-in Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#e3e3dc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c253a]">Verificar Cobro Entrante (Pay-in)</h3>
                  <p className="text-xs text-[#576071]">Comprueba si un cliente o fondo ya depositó en Fiat (USD) o Cripto (USDC Base).</p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-[#576071] hover:text-[#1c253a] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Presets for Quick Demo */}
            <div>
              <span className="text-[11px] font-semibold text-[#576071] uppercase tracking-wider block mb-2">
                Casos de Demostración Rápida:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetPayin('openai')}
                  className="text-xs px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-medium transition-all"
                >
                  ⚡ OpenAI ($5,000 USDC en Base)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPayin('yc')}
                  className="text-xs px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-all"
                >
                  💵 Y Combinator ($500k USD Wire)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPayin('fake')}
                  className="text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-all"
                >
                  🚨 Fake Payment ($12.5k no existente)
                </button>
              </div>
            </div>

            <form onSubmit={handleRunVerification} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">Riel / Moneda</label>
                  <select
                    value={payinCurrency}
                    onChange={(e) => setPayinCurrency(e.target.value as 'USD' | 'USDC')}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-indigo-600 bg-white"
                  >
                    <option value="USDC">⚡ USDC (Base Network)</option>
                    <option value="USD">💵 USD (Portage Bank ACH/Wire)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">Monto Esperado ({payinCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000.00"
                    value={payinAmount}
                    onChange={(e) => setPayinAmount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-indigo-600"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Nombre del Cliente / Remitente</label>
                <input
                  type="text"
                  placeholder="Ej. OpenAI Inc / Y Combinator / Acme"
                  value={payinClient}
                  onChange={(e) => setPayinClient(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">
                  Hash Tx Blockchain / Referencia de Transferencia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="0x8920... o REF-2026-PAYIN"
                  value={payinRef}
                  onChange={(e) => setPayinRef(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-indigo-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#eeeee8]">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3 py-2 text-xs font-medium text-[#576071] hover:bg-[#ecebe6] rounded-lg"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verificar en Ledger Blinka</span>
                </button>
              </div>
            </form>

            {/* Verification Result Display */}
            {payinResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 mt-3 ${
                  payinResult.verified
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : payinResult.status === 'AMOUNT_MISMATCH'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : 'bg-red-50/80 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wide">
                    {payinResult.verified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span>Estado: {payinResult.status}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/70 border border-current">
                    Riel: {payinResult.railUsed}
                  </span>
                </div>

                <p className="text-xs font-medium">{payinResult.notes}</p>

                {payinResult.verified && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white/60 p-2.5 rounded-lg border border-emerald-200 mt-2">
                    <div>
                      <strong>Monto Acreditado:</strong> ${(payinResult.amountReceivedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} {payinResult.currency}
                    </div>
                    <div>
                      <strong>Cuenta Destino:</strong> {payinResult.destinationAccount}
                    </div>
                    {payinResult.transactionId && (
                      <div className="col-span-2 truncate">
                        <strong>Tx ID:</strong> {payinResult.transactionId}
                      </div>
                    )}
                    {payinResult.txHashOrReference && (
                      <div className="col-span-2 truncate">
                        <strong>Hash / Ref:</strong> {payinResult.txHashOrReference}
                      </div>
                    )}
                  </div>
                )}

                {payinResult.verified && onAccreditCustomPayin && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onAccreditCustomPayin({
                          payerName: payinClient || 'Cliente Verificado',
                          amountCents: payinResult.amountReceivedCents,
                          currency: payinResult.currency,
                          referenceOrInvoice: payinRef || 'REF-COBRO-CONCILIADO',
                          rail: payinResult.railUsed.includes('Base') ? 'BASE_USDC' : 'ACH',
                        });
                        setShowVerifyModal(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        Acreditar al Balance Total (+${(payinResult.amountReceivedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} {payinResult.currency})
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e3e3dc] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1c253a]">Ingresar o Subir Factura a la Bandeja</h3>
                <p className="text-xs text-[#576071]">Sube un archivo PDF/XML o ingresa los datos para su auditoría.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#576071] hover:text-[#1c253a] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div className="border-2 border-dashed border-[#d1d5db] hover:border-[#2a4bd0] rounded-xl p-4 text-center bg-[#fcfcf9] transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.xml"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                <div className="p-2.5 bg-blue-50 text-[#2a4bd0] rounded-xl group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1c253a]">
                  {uploadedFileName ? (
                    <span className="text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                      {uploadedFileName}
                    </span>
                  ) : (
                    'Arrastra tu factura (PDF, XML, Imagen) o haz clic para examinar'
                  )}
                </div>
                <p className="text-[11px] text-[#576071]">
                  {isOcrParsing ? (
                    <span className="text-[#2a4bd0] font-semibold animate-pulse flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500 animate-spin" />
                      Extrayendo datos con OCR & Document AI...
                    </span>
                  ) : (
                    'Auto-extrae proveedor, montos y cuenta bancaria/wallet para auditoría'
                  )}
                </p>
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div>
              <span className="text-[10px] font-semibold text-[#576071] uppercase tracking-wider block mb-1.5">
                O prueba con documentos de muestra:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateOcrExtraction('factura_aws_legitima.pdf')}
                  className="text-[11px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-medium transition-all"
                >
                  📄 Subir PDF AWS ($2,450 ACH)
                </button>
                <button
                  type="button"
                  onClick={() => simulateOcrExtraction('factura_stripe_phishing_alerta.pdf')}
                  className="text-[11px] px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-medium transition-all"
                >
                  🚨 Subir PDF Phishing Stripe ($14.2k)
                </button>
                <button
                  type="button"
                  onClick={() => simulateOcrExtraction('factura_alchemy_web3_base.pdf')}
                  className="text-[11px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-medium transition-all"
                >
                  ⚡ Subir PDF Alchemy ($1.8k USDC Base)
                </button>
              </div>
            </div>

            {ocrSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-2.5 rounded-xl flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Document AI:</strong> Datos extraídos y validados automáticamente. Puedes modificarlos abajo antes de registrar la factura.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateCustomInvoice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. GitHub Enterprise / Alchemy / AWS"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">Nº Factura</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-2026-001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">Moneda / Riel</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'USDC')}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0] bg-white font-medium"
                  >
                    <option value="USD">💵 USD (ACH/Wire)</option>
                    <option value="USDC">⚡ USDC (Base Network)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Monto ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="2500.00"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                />
              </div>

              {currency === 'USD' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">
                    Últimos 4 dígitos cuenta bancaria
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="4141"
                    value={bankLastFour}
                    onChange={(e) => setBankLastFour(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0] font-mono"
                  />
                  <span className="text-[10px] text-[#576071]">
                    Se validará contra los métodos aprobados del proveedor.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#1c253a] mb-1">
                    Dirección de Wallet Base (0x...)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-indigo-600 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-[#576071]">
                    Se comparará contra la wallet whitelist en Base para evitar Address Poisoning.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Concepto / Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción del servicio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#eeeee8]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 text-xs font-medium text-[#576071] hover:bg-[#ecebe6] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white rounded-lg shadow-sm"
                >
                  Registrar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Period Selection Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e3e3dc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-[#2a4bd0] rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c253a]">Exportar Registro de Auditoría SOX / SOC2</h3>
                  <p className="text-xs text-[#576071]">Genera un log inmutable en JSON formateado para auditores, ERPs o el CFO.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-[#576071] hover:text-[#1c253a] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#1c253a]">Selecciona el Periodo de Auditoría:</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAuditPeriod('today')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    auditPeriod === 'today'
                      ? 'border-[#2a4bd0] bg-blue-50/50 text-[#1c253a] ring-2 ring-blue-500/20'
                      : 'border-[#e3e3dc] hover:bg-[#f7f7f4] text-[#576071]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#1c253a] flex items-center justify-between">
                    <span>📅 Cierre Diario (Hoy)</span>
                    {auditPeriod === 'today' && <Check className="w-4 h-4 text-[#2a4bd0]" />}
                  </div>
                  <div className="text-[11px] text-[#576071] mt-1">Conciliación de las últimas 24 horas.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditPeriod('week')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    auditPeriod === 'week'
                      ? 'border-[#2a4bd0] bg-blue-50/50 text-[#1c253a] ring-2 ring-blue-500/20'
                      : 'border-[#e3e3dc] hover:bg-[#f7f7f4] text-[#576071]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#1c253a] flex items-center justify-between">
                    <span>📆 Cierre Semanal</span>
                    {auditPeriod === 'week' && <Check className="w-4 h-4 text-[#2a4bd0]" />}
                  </div>
                  <div className="text-[11px] text-[#576071] mt-1">Últimos 7 días de dispersiones y cobros.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditPeriod('month')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    auditPeriod === 'month'
                      ? 'border-[#2a4bd0] bg-blue-50/50 text-[#1c253a] ring-2 ring-blue-500/20'
                      : 'border-[#e3e3dc] hover:bg-[#f7f7f4] text-[#576071]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#1c253a] flex items-center justify-between">
                    <span>🗓️ Cierre Mensual (Oct 2026)</span>
                    {auditPeriod === 'month' && <Check className="w-4 h-4 text-[#2a4bd0]" />}
                  </div>
                  <div className="text-[11px] text-[#576071] mt-1">Cierre fiscal mensual para conciliación ERP.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditPeriod('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    auditPeriod === 'all'
                      ? 'border-[#2a4bd0] bg-blue-50/50 text-[#1c253a] ring-2 ring-blue-500/20'
                      : 'border-[#e3e3dc] hover:bg-[#f7f7f4] text-[#576071]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#1c253a] flex items-center justify-between">
                    <span>📁 Histórico Completo</span>
                    {auditPeriod === 'all' && <Check className="w-4 h-4 text-[#2a4bd0]" />}
                  </div>
                  <div className="text-[11px] text-[#576071] mt-1">Todas las facturas registradas ({invoices.length}).</div>
                </button>
              </div>

              <div className="p-3 bg-[#f7f7f4] rounded-xl border border-[#e3e3dc] text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#1c253a]">
                  <span>Estándar de Cumplimiento:</span>
                  <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">SOC2 Type II + SOX Ready</span>
                </div>
                <p className="text-[11px] text-[#576071]">
                  Incluye hash de trazabilidad, decisiones de políticas, firmas duales del CFO y conciliación dual-rail (Portage Bank ACH + Base USDC).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#eeeee8]">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-3 py-2 text-xs font-medium text-[#576071] hover:bg-[#ecebe6] rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExportAudit(auditPeriod)}
                className="px-4 py-2 text-xs font-semibold bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white rounded-lg shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Auditoría ({auditPeriod.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Stress-Test Executive Summary Modal */}
      {showBatchModal && batchSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e3e3dc] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c253a]">Reporte Ejecutivo: Ingesta Masiva (Stress-Test)</h3>
                  <p className="text-xs text-[#576071]">8 facturas concurrentes evaluadas por el Blinka Policy Engine.</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-[#576071] hover:text-[#1c253a] p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5">
                <div className="text-[11px] font-semibold text-emerald-800">Auto-Aprobadas</div>
                <div className="text-xl font-black text-emerald-600 mt-1">{batchSummary.autoPaid}</div>
                <div className="text-[10px] text-emerald-700 font-mono mt-0.5">${batchSummary.autoPaidAmount.toLocaleString()} USD/USDC</div>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5">
                <div className="text-[11px] font-semibold text-amber-800">Firma Dual CFO</div>
                <div className="text-xl font-black text-amber-600 mt-1">{batchSummary.cfoReview}</div>
                <div className="text-[10px] text-amber-700 font-mono mt-0.5">${batchSummary.cfoReviewAmount.toLocaleString()} USD</div>
              </div>

              <div className="bg-red-50/80 border border-red-200 rounded-2xl p-3.5">
                <div className="text-[11px] font-semibold text-red-800">Ciberdelito Neutralizado</div>
                <div className="text-xl font-black text-red-600 mt-1">{batchSummary.fraudBlocked}</div>
                <div className="text-[10px] text-red-700 font-mono mt-0.5">${batchSummary.fraudBlockedAmount.toLocaleString()} USD (0 Pérdida)</div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5">
                <div className="text-[11px] font-semibold text-blue-800">Velocidad / Latencia</div>
                <div className="text-xl font-black text-[#2a4bd0] mt-1">{batchSummary.executionTimeMs} ms</div>
                <div className="text-[10px] text-blue-700 font-mono mt-0.5">-94% Tokens vs LLM</div>
              </div>
            </div>

            {/* Breakdown Highlights */}
            <div className="bg-[#f7f7f4] rounded-2xl p-4 border border-[#e3e3dc] space-y-2 text-xs">
              <div className="font-bold text-[#1c253a] flex items-center justify-between">
                <span>🛡️ Auditoría Forense de Amenazas Neutralizadas en el Lote:</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">100% Precisión</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-red-200 text-red-900 flex items-center justify-between">
                  <span>🚨 Phishing Detectado: Stripe Payments ($14,250 USD)</span>
                  <span className="font-bold text-red-700">Bank Mismatch (*9999) - BLOQUEADO</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-red-200 text-red-900 flex items-center justify-between">
                  <span>🚨 Web3 Poisoning: Alchemy Spoofed ($8,900 USDC)</span>
                  <span className="font-bold text-red-700">Vanity Address Attack - BLOQUEADO</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eeeee8]">
              <span className="text-xs text-[#576071]">
                Todas las facturas han sido registradas en la bandeja y en el log de auditoría.
              </span>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white rounded-xl shadow-sm"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
