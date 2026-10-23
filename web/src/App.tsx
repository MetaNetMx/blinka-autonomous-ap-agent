import React, { useState } from 'react';
import { useBlinkaStore } from './blinka-core/store';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { AutonomousAPInbox } from './components/AutonomousAPInbox';
import { GuardrailsMatrix } from './components/GuardrailsMatrix';
import { CounterpartiesView } from './components/CounterpartiesView';
import { AgentCopilot } from './components/AgentCopilot';
import { DemoPitchAutopilot } from './components/DemoPitchAutopilot';
import { SecurityArenaView } from './components/SecurityArenaView';
import { ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const store = useBlinkaStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot' | 'arena'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDemoAutopilotOpen, setIsDemoAutopilotOpen] = useState(false);
  const [highlightSweep, setHighlightSweep] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleExecuteSweep = () => {
    try {
      const checking = store.state.accounts.find((a) => a.type === 'CHECKING' && a.settlementStrategy === 'USD');
      const treasury = store.state.accounts.find((a) => a.type === 'TREASURY');
      if (!checking || !treasury) return;

      store.executeInternalTransfer(
        checking.id,
        treasury.id,
        2500000,
        'Autonomous Yield Sweep - Idle Cash Optimization'
      );
      setHighlightSweep(true);
      setTimeout(() => setHighlightSweep(false), 9000);
      showToast('⚡ Barrido de $25,000 USD transferido con éxito a Blinka Treasury (4.85% APY)');
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.35 },
        colors: ['#10b981', '#f59e0b', '#2a4bd0'],
      });
    } catch (e: any) {
      showToast(`Error en barrido: ${e?.message || e}`);
    }
  };

  const totalBalanceCents = store.getTotalBalanceCents();

  const handleProcessInboundPayment = (paymentId: string) => {
    try {
      const res = store.evaluateAndProcessInboundPayment(paymentId);
      if (res.accredited) {
        showToast(`✅ Cobro de ${res.payment.payerName} conciliado y acreditado (+ $${(res.payment.amountCents / 100).toLocaleString()} ${res.payment.currency}) en ${res.targetAccount}. Saldo total actualizado.`);
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      } else {
        showToast(`🚨 DEPÓSITO BLOQUEADO: ${res.reason}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message || e}`);
    }
  };

  const handleAccreditCustomPayin = (payin: {
    payerName: string;
    amountCents: number;
    currency: 'USD' | 'USDC';
    referenceOrInvoice: string;
    rail: 'ACH' | 'WIRE' | 'BASE_USDC';
  }) => {
    const staged = store.stageInboundPayment(payin);
    handleProcessInboundPayment(staged.id);
  };

  const handleProcessInvoice = (invoiceId: string) => {
    try {
      const res = store.evaluateAndProcessInvoice(invoiceId);
      if (res.policyResult.decision === 'AUTO_APPROVE') {
        showToast(`✅ Factura de ${res.invoice.vendorName} pagada automáticamente vía ACH.`);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      } else if (res.policyResult.decision === 'REQUIRE_HUMAN_APPROVAL') {
        showToast(`⚠️ Factura de ${res.invoice.vendorName} requiere aprobación del CFO.`);
      } else {
        showToast(`🚨 FACTURA BLOQUEADA: ${res.policyResult.reasons[0]}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message || e}`);
    }
  };

  const handleProcessAllInvoices = () => {
    const res = store.evaluateAll({ includeInbound: true, includeOutbound: true });
    const netFormatted = res.netCashflowCents >= 0
      ? `+$${(res.netCashflowCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      : `-$${(Math.abs(res.netCashflowCents) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    showToast(
      `⚡ Conciliación Dual: +$${(res.totalEntradasCents / 100).toLocaleString()} entradas acreditadas, -$${(res.totalSalidasCents / 100).toLocaleString()} salidas liquidadas. Flujo Neto: ${netFormatted} USD. Total: $${(res.newTotalCents / 100).toLocaleString()} USD.`
    );
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
  };

  const handleCfoApprove = (invoiceId: string) => {
    try {
      const inv = store.cfoApproveInvoice(invoiceId);
      showToast(`✅ Desembolso de $${(inv.amountCents / 100).toLocaleString()} USD aprobado por CFO y liberado vía Wire.`);
      return inv;
    } catch (e: any) {
      showToast(`Error: ${e?.message || e}`);
      throw e;
    }
  };

  const handleCfoApproveLambda = () => {
    try {
      const lambdaInv = store.state.invoices.find((i) => i.vendorName.includes('Lambda') || i.amountCents === 4850000);
      if (lambdaInv) {
        if (lambdaInv.status === 'pending_evaluation') {
          store.evaluateAndProcessInvoice(lambdaInv.id);
        }
        if (lambdaInv.status === 'awaiting_cfo_approval') {
          store.cfoApproveInvoice(lambdaInv.id);
          showToast('✅ Desembolso de $48,500 USD (Lambda Labs GPU) firmado y liberado como CFO.');
          confetti({ particleCount: 60, spread: 75, origin: { y: 0.5 } });
        }
      }
    } catch (e: any) {
      console.warn('CFO Lambda sign error in autopilot', e);
    }
  };

  const pendingApprovalsCount =
    store.state.invoices.filter((i) => i.status === 'awaiting_cfo_approval' || i.status === 'pending_evaluation').length +
    store.state.inboundPayments.filter((p) => p.status === 'pending_verification').length;

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#1c253a] flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1c253a] text-white text-xs md:text-sm px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={() => {
          store.resetToDefaults();
          showToast('Estado demo restaurado a los valores predeterminados.');
        }}
        pendingApprovalsCount={pendingApprovalsCount}
        totalBalanceCents={totalBalanceCents}
        onOpenDemoAutopilot={() => setIsDemoAutopilotOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            accounts={store.state.accounts}
            transactions={store.state.transactions}
            onExecuteSweep={handleExecuteSweep}
            onOpenCopilot={() => setActiveTab('copilot')}
            highlightSweep={highlightSweep}
          />
        )}

        {activeTab === 'inbox' && (
          <AutonomousAPInbox
            invoices={store.state.invoices}
            inboundPayments={store.state.inboundPayments}
            accounts={store.state.accounts}
            transactions={store.state.transactions}
            totalBalanceCents={totalBalanceCents}
            onProcessInvoice={handleProcessInvoice}
            onCfoApprove={handleCfoApprove}
            onAddCustomInvoice={(inv) => {
              const staged = store.stageInvoice(inv);
              showToast(`Factura ${inv.invoiceNumber} registrada en la bandeja.`);
              return staged;
            }}
            onProcessAll={handleProcessAllInvoices}
            onProcessInboundPayment={handleProcessInboundPayment}
            onAccreditCustomPayin={handleAccreditCustomPayin}
            onVerifyInbound={store.verifyInboundPaymentAction}
          />
        )}

        {activeTab === 'guardrails' && <GuardrailsMatrix />}

        {activeTab === 'arena' && <SecurityArenaView />}

        {activeTab === 'counterparties' && (
          <CounterpartiesView
            counterparties={store.state.counterparties}
            onApprovePayoutMethod={(id) => {
              store.approvePayoutMethod(id);
              showToast('Método de pago aprobado. Ahora está habilitado para dispersiones.');
            }}
            onAddCounterparty={(name, email) => {
              store.addCounterparty(name, email);
              showToast(`Proveedor "${name}" creado exitosamente.`);
            }}
            onAddPayoutMethod={(cpId, methodType, accountEnding) => {
              store.addPayoutMethod(cpId, methodType, accountEnding);
              showToast(`Nuevo método ${methodType} añadido (Pendiente de Aprobación).`);
            }}
          />
        )}

        {activeTab === 'copilot' && <AgentCopilot store={store} />}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-[#e3e3dc] bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#576071]">
          <div className="flex items-center space-x-3">
            <img src="/logo_white.svg" alt="Blinka" className="h-5 w-auto opacity-75" />
            <span>·</span>
            <span>Hackathon 30X · Desafío Blinka (YC F26)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              Banca por Portage Bank, Miembro FDIC
            </span>
            <span>·</span>
            <a
              href="https://blinka.co"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#2a4bd0] flex items-center space-x-1"
            >
              <span>blinka.co</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Pitch Autopilot Tour Player */}
      <DemoPitchAutopilot
        isOpen={isDemoAutopilotOpen}
        onClose={() => setIsDemoAutopilotOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProcessAllInvoices={handleProcessAllInvoices}
        onCfoApproveLambda={handleCfoApproveLambda}
        onExecuteSweep={handleExecuteSweep}
      />

    </div>
  );
}

export default App;
