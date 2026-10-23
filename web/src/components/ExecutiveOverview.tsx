import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Zap,
  Building,
  Coins,
  Copy,
  Check,
  Clock,
  Sparkles,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Sliders,
  Lock,
} from 'lucide-react';
import { Account, Transaction } from '../blinka-core/types';
import { DecisionNetworkGraph } from './DecisionNetworkGraph';
import confetti from 'canvas-confetti';

interface ExecutiveOverviewProps {
  accounts: Account[];
  transactions: Transaction[];
  onExecuteSweep: () => void;
  onOpenCopilot: () => void;
  highlightSweep?: boolean;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  accounts,
  transactions,
  onExecuteSweep,
  onOpenCopilot,
  highlightSweep = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);

  const checking = accounts.find((a) => a.type === 'CHECKING' && a.settlementStrategy === 'USD');
  const treasury = accounts.find((a) => a.type === 'TREASURY');
  const usdc = accounts.find((a) => a.settlementStrategy === 'USDC');

  const checkingBal = checking ? checking.balance / 100 : 0;
  const treasuryBal = treasury ? treasury.balance / 100 : 0;
  const usdcBal = usdc ? usdc.balance / 100 : 0;
  const totalBalance = checkingBal + treasuryBal + usdcBal;

  const annualYield = treasuryBal * 0.0485;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSweepClick = () => {
    onExecuteSweep();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2a4bd0', '#10b981', '#ffffff'],
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Mandato-inspired Hero Autonomy & Decision Bar Panel */}
      <div className="bg-white rounded-2xl border border-[#e3e3dc] p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#576071] mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mandato de Autonomía en Ejecución Continua</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c253a] tracking-tight">
              107 de 146 facturas decididas sin una persona <span className="text-[#2a4bd0]">(73,3%)</span>
            </h1>
            <p className="text-xs md:text-sm text-[#576071] mt-1">
              El agente ejecuta desembolsos en milisegundos bajo 18 controles deterministas. Las excepciones y montos elevados se escalan con firma del CFO.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowNetworkGraph(!showNetworkGraph)}
              className="inline-flex items-center space-x-2 text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2a4bd0] via-indigo-600 to-[#1e3bb3] hover:from-[#1e3bb3] hover:to-indigo-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#2a4bd0]/20"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse" />
              <span>{showNetworkGraph ? 'Ocultar Red en Vivo' : '⚡ Ver Red en Vivo (Simulación en Tiempo Real)'}</span>
              {showNetworkGraph ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Proportional Tri-State Decision Bar */}
        <div className="space-y-2">
          <div className="barra-decisiones" title="Distribución de decisiones del agente">
            <span className="seg seg--pagar" style={{ width: '73.3%' }} title="107 Pagadas (73.3%)" />
            <span className="seg seg--escalar" style={{ width: '15.6%' }} title="23 Escaladas (15.6%)" />
            <span className="seg seg--frenar" style={{ width: '11.1%' }} title="16 Frenadas (11.1%)" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#576071]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="punto punto--pagar" />
                <strong className="text-[#1c253a]">107 Pagadas</strong> autónomas (73,3%)
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="punto punto--escalar" />
                <strong className="text-[#1c253a]">23 Escaladas</strong> para firma CFO (15,6%)
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="punto punto--frenar" />
                <strong className="text-[#1c253a]">16 Frenadas</strong> por Zero-Trust (11,1%)
              </span>
            </div>
            <div className="font-mono text-[11px] text-[#576071]">
              146 registros auditados · 0 errores
            </div>
          </div>
        </div>

        {/* Operational Invariants Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                0 pagos fuera de reglas
              </div>
              <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                Verificado formalmente: ninguna dispersión excedió los límites ni se pagó a cuentas bancarias alteradas.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <Lock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-blue-900">
                Registro íntegro encadenado con SHA-256
              </div>
              <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                Trazabilidad inmutable: cada decisión y desembolso incluye sello hash no repudiable para auditoría fiscal.
              </p>
            </div>
          </div>
        </div>

        {/* Tabular Metric List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#e3e3dc] text-xs">
          <div>
            <span className="text-[#576071] block">Tiempo Mediano</span>
            <span className="text-lg font-bold font-mono text-[#1c253a]">1,4 s</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">vs 8 días tradicional</span>
          </div>
          <div>
            <span className="text-[#576071] block">Dispersiones Autónomas</span>
            <span className="text-lg font-bold font-mono text-[#1c253a]">$45,210.00</span>
            <span className="text-[10px] text-[#576071] block">Liquidación T+0</span>
          </div>
          <div>
            <span className="text-[#576071] block">Rendimiento Tesorería</span>
            <span className="text-lg font-bold font-mono text-emerald-600">4.85% APY</span>
            <span className="text-[10px] text-[#576071] block">BNY Mellon Dreyfus</span>
          </div>
          <div>
            <span className="text-[#576071] block">Ataques Adversariales</span>
            <span className="text-lg font-bold font-mono text-[#1c253a]">1.056 de 1.056</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">0 pagados (100% parados)</span>
          </div>
        </div>
      </div>

      {/* Optional Expandable Visual Decision Network SVG */}
      {showNetworkGraph && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <DecisionNetworkGraph />
        </div>
      )}
      
      {/* Dynamic Animated Banner when Sweep is executed */}
      {highlightSweep && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 text-white p-4 md:p-5 rounded-2xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-3 border border-emerald-400/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
              <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  ⚡ Barrido de Tesorería Ejecutado
                </span>
                <span className="bg-emerald-400 text-slate-950 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  +$25,000.00 USD
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Excedente de Checking transferido a BNY Mellon Dreyfus (4.85% APY). Saldo Treasury actualizado a <strong>${treasuryBal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong>.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[11px] font-mono text-emerald-200 bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
              Liquidez T+0 · 4.85% APY
            </span>
          </div>
        </div>
      )}

      {/* Top Banner: Total Portfolio & Yield Optimizer */}
      <div className="blinka-card p-6 md:p-8 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#2a4bd0]/5 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#576071]">
              <span>Acme Global Ventures LLC</span>
              <span>·</span>
              <span className="flex items-center text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Portage Bank FDIC Insured
              </span>
            </div>
            
            <div className="mt-2 flex items-baseline space-x-3">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1c253a]">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-semibold text-[#576071]">USD Total Disponible</span>
            </div>

            <p className="mt-2 text-xs md:text-sm text-[#576071]">
              Sincronizado en tiempo real con rieles ACH, Fedwire, BNY Mellon Dreyfus y Base Network.
            </p>
          </div>

          {/* Quick Treasury Sweep Callout */}
          <div className="bg-[#f7f7f4] border border-[#e3e3dc] rounded-xl p-4 md:w-80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c253a] flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#2a4bd0]" />
                Optimizador de Tesorería
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                4.85% APY
              </span>
            </div>
            
            <div className="mt-2 text-xs text-[#576071]">
              Generando <strong className="text-[#1c253a]">${annualYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/año</strong> en rendimientos pasivos.
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={handleSweepClick}
                className="flex-1 bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Barrer $25k a BNY</span>
              </button>

              <button
                onClick={onOpenCopilot}
                className="bg-white hover:bg-[#ecebe6] text-[#1c253a] border border-[#e3e3dc] text-xs font-semibold py-2 px-2.5 rounded-lg transition-all"
                title="Consultar al Agente IA"
              >
                IA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Operating Checking */}
        <div className="blinka-card p-5 blinka-card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2a4bd0] flex items-center justify-center font-bold text-sm">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c253a]">Cuenta Operativa Checking</h3>
                  <p className="text-[11px] text-[#576071]">Portage Bank (Member FDIC)</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#2a4bd0]">
                Primaria
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black text-[#1c253a] flex items-center space-x-2">
                <span>${checkingBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                {highlightSweep && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                    -$25k Barrido
                  </span>
                )}
              </div>
              <p className="text-xs text-[#576071] mt-0.5">Saldo para nómina y pagos AP diarios</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eeeee8] flex items-center justify-between text-xs text-[#576071]">
            <span>Rutas: ACH · Wire · SWIFT · Bre-B</span>
            <button
              onClick={() => copyToClipboard('021000021', 'chk_routing')}
              className="text-[#2a4bd0] hover:underline flex items-center space-x-1"
            >
              {copiedId === 'chk_routing' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>Ruta: 021000021</span>
            </button>
          </div>
        </div>

        {/* Card 2: BNY Mellon Treasury */}
        <div
          className={`blinka-card p-5 blinka-card-interactive flex flex-col justify-between transition-all duration-500 ${
            highlightSweep ? 'ring-4 ring-emerald-500 shadow-2xl scale-[1.02] bg-emerald-50/40' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c253a]">Blinka Treasury Vault</h3>
                  <p className="text-[11px] text-[#576071]">BNY Mellon Dreyfus (DSHXX)</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                4.85% APY
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black text-[#1c253a] flex items-center space-x-2">
                <span>${treasuryBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                {highlightSweep && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                    +$25k Recibido
                  </span>
                )}
              </div>
              <p className="text-xs text-[#576071] mt-0.5">Generando rendimientos diarios con liquidez T+0</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eeeee8] flex items-center justify-between text-xs text-[#576071]">
            <span>Custodia: Atomic Brokerage LLC</span>
            <span className="text-emerald-700 font-medium">Interés Compuesto</span>
          </div>
        </div>

        {/* Card 3: USDC Multichain */}
        <div className="blinka-card p-5 blinka-card-interactive flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c253a]">Bóveda USDC Multi-Chain</h3>
                  <p className="text-[11px] text-[#576071]">Rieles Base & Solana</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Instantáneo
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black text-[#1c253a]">
                {usdcBal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </div>
              <p className="text-xs text-[#576071] mt-0.5">Liquidación internacional 24/7 sin comisiones bancarias</p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eeeee8] flex items-center justify-between text-xs text-[#576071]">
            <span>Contrato: Circle USDC</span>
            <button
              onClick={() => copyToClipboard('0x71C...BlinkaBaseVault', 'usdc_addr')}
              className="text-[#2a4bd0] hover:underline flex items-center space-x-1"
            >
              {copiedId === 'usdc_addr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>0x71C...Vault</span>
            </button>
          </div>
        </div>

      </div>

      {/* Recent Ledger Activity */}
      <div className="blinka-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e3e3dc] flex items-center justify-between bg-white">
          <div>
            <h3 className="text-base font-bold text-[#1c253a]">Libro Mayor & Movimientos Recientes</h3>
            <p className="text-xs text-[#576071]">Dispersiones autónomas, pagos aprobados y transferencias internas</p>
          </div>
          <span className="text-xs font-medium text-[#576071] bg-[#f7f7f4] px-2.5 py-1 rounded-md border border-[#e3e3dc]">
            {transactions.length} Transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f7f4] text-[#576071] text-xs font-semibold uppercase tracking-wider border-b border-[#e3e3dc]">
              <tr>
                <th className="px-6 py-3">Tipo / Estado</th>
                <th className="px-6 py-3">Contraparte / Concepto</th>
                <th className="px-6 py-3">Riel</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeee8] bg-white">
              {transactions.map((tx) => {
                const isPayout = tx.kind === 'PAYOUT';
                return (
                  <tr key={tx.id} className="hover:bg-[#fcfcf9] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isPayout ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {isPayout ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1c253a]">{tx.kind}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">{tx.status}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1c253a]">{tx.counterpartyName || 'Blinka Internal'}</div>
                      <div className="text-xs text-[#576071] truncate max-w-xs">{tx.memo || tx.notes}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#f7f7f4] text-[#1c253a] border border-[#e3e3dc]">
                        {tx.method || 'ACH'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-[#576071]">
                      {new Date(tx.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className={`text-sm font-bold ${
                          isPayout ? 'text-[#1c253a]' : 'text-emerald-600'
                        }`}
                      >
                        {isPayout ? '-' : '+'}${(tx.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
                      </div>
                      {tx.feeCents !== null && tx.feeCents > 0 && (
                        <div className="text-[10px] text-[#576071]">
                          Fee: ${(tx.feeCents / 100).toFixed(2)}
                        </div>
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
  );
};
