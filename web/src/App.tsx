import React, { useState } from 'react';
import { useBlinkaStore } from './blinka-core/store';
import { Navbar } from './components/Navbar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { AutonomousAPInbox } from './components/AutonomousAPInbox';
import { GuardrailsMatrix } from './components/GuardrailsMatrix';
import { CounterpartiesView } from './components/CounterpartiesView';
import { AgentCopilot } from './components/AgentCopilot';
import { ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const store = useBlinkaStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
      showToast('⚡ Barrido de $25,000 USD transferido con éxito a Blinka Treasury (4.85% APY)');
    } catch (e: any) {
      showToast(`Error en barrido: ${e?.message || e}`);
    }
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
    const pending = store.state.invoices.filter((i) => i.status === 'pending_evaluation');
    let autoApproved = 0;
    let requiringCfo = 0;
    let blocked = 0;

    for (const inv of pending) {
      const res = store.evaluateAndProcessInvoice(inv.id);
      if (res.policyResult.decision === 'AUTO_APPROVE') autoApproved++;
      else if (res.policyResult.decision === 'REQUIRE_HUMAN_APPROVAL') requiringCfo++;
      else blocked++;
    }

    showToast(`🤖 Auditoría completada: ${autoApproved} pagadas, ${requiringCfo} para firma CFO, ${blocked} bloqueadas por fraude.`);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const handleCfoApprove = (invoiceId: string) => {
    try {
      const inv = store.cfoApproveInvoice(invoiceId);
      showToast(`✅ Desembolso de $${(inv.amountCents / 100).toLocaleString()} USD aprobado por CFO y liberado vía Wire.`);
    } catch (e: any) {
      showToast(`Error: ${e?.message || e}`);
    }
  };

  const pendingApprovalsCount = store.state.invoices.filter(
    (i) => i.status === 'awaiting_cfo_approval' || i.status === 'pending_evaluation'
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#1c253a] flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c253a] text-white text-xs md:text-sm px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 animate-bounce">
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
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            accounts={store.state.accounts}
            transactions={store.state.transactions}
            onExecuteSweep={handleExecuteSweep}
            onOpenCopilot={() => setActiveTab('copilot')}
          />
        )}

        {activeTab === 'inbox' && (
          <AutonomousAPInbox
            invoices={store.state.invoices}
            onProcessInvoice={handleProcessInvoice}
            onCfoApprove={handleCfoApprove}
            onAddCustomInvoice={(inv) => {
              store.stageInvoice(inv);
              showToast(`Factura ${inv.invoiceNumber} registrada en la bandeja.`);
            }}
            onProcessAll={handleProcessAllInvoices}
          />
        )}

        {activeTab === 'guardrails' && <GuardrailsMatrix />}

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

    </div>
  );
}

export default App;
