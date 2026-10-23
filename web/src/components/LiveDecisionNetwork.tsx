import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';

interface LiveInvoiceEvent {
  id: string;
  number: string;
  vendor: string;
  amount: number;
  currency: 'USD' | 'USDC';
  channel: 'pdf' | 'eml' | 'xml' | 'api' | 'crypto';
  channelLabel: string;
  decision: 'PAGAR' | 'ESCALAR' | 'FRENAR';
  decisiveRuleId?: string;
  decisiveRuleName?: string;
  explanation: string;
  rail: string;
  sha256: string;
}

const LIVE_QUEUE: LiveInvoiceEvent[] = [
  {
    id: 'evt_01',
    number: 'INV-VERCEL-2026-88',
    vendor: 'Vercel Inc.',
    amount: 3200.0,
    currency: 'USD',
    channel: 'pdf',
    channelLabel: 'PDF Factura',
    decision: 'PAGAR',
    decisiveRuleId: '18 CONTROLES OK',
    decisiveRuleName: '18 controles en orden',
    explanation: 'Monto dentro del límite ($3,200 < $5,000), proveedor en maestro y cuenta BCP coincidente.',
    rail: 'Portage Bank ACH (T+0)',
    sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
  },
  {
    id: 'evt_02',
    number: 'INV-STRIPE-TAMPERED-01',
    vendor: 'Stripe Payments LLC',
    amount: 14250.0,
    currency: 'USD',
    channel: 'eml',
    channelLabel: 'Correo EML',
    decision: 'FRENAR',
    decisiveRuleId: 'R02',
    decisiveRuleName: 'Cuenta coincide con el maestro',
    explanation: 'La cuenta bancaria en el PDF (*9999) no coincide con la cuenta registrada (*1029). Intento de BEC.',
    rail: 'Desembolso Bloqueado',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  },
  {
    id: 'evt_03',
    number: 'INV-LAMBDA-GPU-904',
    vendor: 'Lambda Labs Inc.',
    amount: 48500.0,
    currency: 'USD',
    channel: 'api',
    channelLabel: 'API Conector',
    decision: 'ESCALAR',
    decisiveRuleId: 'R08',
    decisiveRuleName: 'Umbral de aprobación humana ($10k)',
    explanation: 'Factura excede límite de auto-aprobación ($48,500 > $10,000). Requiere doble firma del CFO.',
    rail: 'En cola CFO (Fedwire)',
    sha256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
  },
  {
    id: 'evt_04',
    number: 'INV-ALCHEMY-2026-01',
    vendor: 'Alchemy Infrastructure',
    amount: 1850.0,
    currency: 'USDC',
    channel: 'crypto',
    channelLabel: 'Web3 Bóveda',
    decision: 'PAGAR',
    decisiveRuleId: '18 CONTROLES OK',
    decisiveRuleName: 'Bóveda Base USDC verificada',
    explanation: 'Wallet de destino en whitelist sin alertas de Address Poisoning. Dispersión cripto aprobada.',
    rail: 'Base Network (USDC Rail)',
    sha256: '3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012',
  },
  {
    id: 'evt_05',
    number: 'NWH-2026-10-188',
    vendor: 'Northwind Hosting LLC',
    amount: 7200.0,
    currency: 'USD',
    channel: 'pdf',
    channelLabel: 'PDF Factura',
    decision: 'FRENAR',
    decisiveRuleId: 'R01',
    decisiveRuleName: 'Beneficiario permitido',
    explanation: 'Proveedor no registrado en catálogo maestro KYC de Blinka. Riesgo de proveedor fantasma.',
    rail: 'Desembolso Bloqueado',
    sha256: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
  },
  {
    id: 'evt_06',
    number: 'INV-FORMA-STUDIO-77',
    vendor: 'Forma Studio LLC',
    amount: 8500.0,
    currency: 'USD',
    channel: 'xml',
    channelLabel: 'XML Factura-e',
    decision: 'ESCALAR',
    decisiveRuleId: 'R08',
    decisiveRuleName: 'Umbral de aprobación humana ($5k)',
    explanation: 'Monto mayor a $5,000 USD pero menor al tope estricto. Requiere verificación de hitos SOX-404.',
    rail: 'En cola CFO (Wire)',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
  },
  {
    id: 'evt_07',
    number: 'INV-AWS-US-EAST-4412',
    vendor: 'Amazon Web Services',
    amount: 2450.0,
    currency: 'USD',
    channel: 'pdf',
    channelLabel: 'PDF Factura',
    decision: 'FRENAR',
    decisiveRuleId: 'R04',
    decisiveRuleName: 'Duplicado exacto',
    explanation: 'Factura con identificador idéntico ya liquidada en ciclo anterior. Intento de cobro doble.',
    rail: 'Desembolso Bloqueado',
    sha256: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
  },
  {
    id: 'evt_08',
    number: 'INV-LINEAR-ORBIT-29',
    vendor: 'Linear Orbit Inc.',
    amount: 128.0,
    currency: 'USD',
    channel: 'eml',
    channelLabel: 'Correo EML',
    decision: 'PAGAR',
    decisiveRuleId: '18 CONTROLES OK',
    decisiveRuleName: 'Micro-gasto recurrente verificado',
    explanation: 'Suscripción recurrente mensual menor a $500 USD de SaaS verificado. Pago instantáneo.',
    rail: 'Portage Bank ACH (T+0)',
    sha256: '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451',
  },
  {
    id: 'evt_09',
    number: 'INV-PROMPT-INJECT-99',
    vendor: 'Security Probe Lab',
    amount: 9800.0,
    currency: 'USD',
    channel: 'pdf',
    channelLabel: 'PDF Factura',
    decision: 'FRENAR',
    decisiveRuleId: 'J01',
    decisiveRuleName: 'Inyección de prompt en OCR/PDF',
    explanation: 'JEV detectó 99% de probabilidad de jailbreak instruyendo al agente a eludir los controles de saldo.',
    rail: 'Desembolso Bloqueado',
    sha256: '2c624232cdd221771294dfbb310aca000a0df6ec8b6602f32070f7d45f3f4c6e',
  },
];

// Coordinates of nodes on a 1000 x 520 canvas matching Mandato aesthetic
const CHANNELS = [
  { id: 'in-pdf', label: 'PDF', x: 85, y: 75 },
  { id: 'in-eml', label: 'Correo', x: 85, y: 160 },
  { id: 'in-xml', label: 'XML', x: 85, y: 245 },
  { id: 'in-api', label: 'API / ERP', x: 85, y: 330 },
  { id: 'in-crypto', label: 'Web3 Base', x: 85, y: 415 },
];

const READERS = [
  { id: 'lec-a', label: 'Lectura A (Claude)', x: 280, y: 190 },
  { id: 'lec-b', label: 'Lectura B (Gemini)', x: 280, y: 330 },
];

const CONTROLS_COL1 = ['R00', 'R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08'].map((id, i) => ({
  id: `c-${id}`,
  code: id,
  x: 480,
  y: 50 + i * 50,
}));

const CONTROLS_COL2 = ['R09', 'R10', 'R11', 'R12', 'R13', 'J01', 'J02', 'J03', 'J04'].map((id, i) => ({
  id: `c-${id}`,
  code: id,
  x: 580,
  y: 50 + i * 50,
}));

const ALL_CONTROLS = [...CONTROLS_COL1, ...CONTROLS_COL2];

const OUTPUTS = [
  { id: 'out-PAGAR', label: 'PAGAR (Autónomo)', x: 840, y: 140, color: '#1f9a62', bg: '#e8f4ee' },
  { id: 'out-ESCALAR', label: 'ESCALAR (CFO)', x: 840, y: 260, color: '#d9922b', bg: '#fbf1df' },
  { id: 'out-FRENAR', label: 'FRENAR (Zero-Trust)', x: 840, y: 380, color: '#d4483b', bg: '#fdecea' },
];

export const LiveDecisionNetwork: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1); // 1 = 2.4s, 2 = 1.4s, 3 = 0.8s
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [stepPhase, setStepPhase] = useState<'IDLE' | 'READING' | 'CONTROLS' | 'VERDICT'>('IDLE');
  
  // Dynamic visual states for nodes
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeReaders, setActiveReaders] = useState<boolean>(false);
  const [activeControlStates, setActiveControlStates] = useState<Record<string, 'OK' | 'ESCALAR' | 'FRENAR' | null>>({});
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);
  
  // Flying pulses state
  const [pulseParticles, setPulseParticles] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number; color: string; duration: number }>
  >([]);

  // Real-time counter tickers
  const [counters, setCounters] = useState({
    total: 0,
    pagadas: 0,
    escaladas: 0,
    frenadas: 0,
  });

  // Event history log
  const [eventHistory, setEventHistory] = useState<LiveInvoiceEvent[]>([]);

  const pulseCounterRef = useRef(0);
  const timerRef = useRef<any>(null);

  const currentInvoice = LIVE_QUEUE[currentIndex];

  const triggerPulses = (
    fromNodes: Array<{ x: number; y: number }>,
    toNodes: Array<{ x: number; y: number }>,
    color: string,
    durationMs: number
  ) => {
    const newParticles: typeof pulseParticles = [];
    fromNodes.forEach((from) => {
      toNodes.forEach((to) => {
        pulseCounterRef.current += 1;
        newParticles.push({
          id: pulseCounterRef.current,
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          color,
          duration: durationMs / 1000,
        });
      });
    });

    setPulseParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setPulseParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, durationMs + 50);
  };

  // Run a full single invoice cycle
  const runInvoiceCycle = (inv: LiveInvoiceEvent) => {
    const baseDuration = speed === 1 ? 2600 : speed === 2 ? 1600 : 900;
    const p1 = baseDuration * 0.25;
    const p2 = baseDuration * 0.45;
    const p3 = baseDuration * 0.3;

    // Reset temporary highlights
    setActiveOutputId(null);
    setActiveControlStates({});

    // Phase 1: Channel Ingestion -> Dual Reading
    setStepPhase('READING');
    const ch = CHANNELS.find((c) => c.id === `in-${inv.channel}`) || CHANNELS[0];
    setActiveChannelId(ch.id);
    setActiveReaders(true);

    triggerPulses([ch], READERS, '#2a4bd0', p1);

    setTimeout(() => {
      // Phase 2: Dual Readers -> 18 Controls
      setStepPhase('CONTROLS');
      triggerPulses(
        READERS,
        ALL_CONTROLS.filter((_, idx) => idx % 2 === 0),
        '#2a4bd0',
        p2 * 0.5
      );

      // Color the controls based on outcome
      const newCtrlStates: Record<string, 'OK' | 'ESCALAR' | 'FRENAR'> = {};
      ALL_CONTROLS.forEach((c) => {
        newCtrlStates[c.code] = 'OK';
      });

      if (inv.decision === 'FRENAR' && inv.decisiveRuleId) {
        newCtrlStates[inv.decisiveRuleId] = 'FRENAR';
      } else if (inv.decision === 'ESCALAR' && inv.decisiveRuleId) {
        newCtrlStates[inv.decisiveRuleId] = 'ESCALAR';
      }

      setActiveControlStates(newCtrlStates);

      setTimeout(() => {
        // Phase 3: Controls -> Final Verdict
        setStepPhase('VERDICT');
        const targetOutput = OUTPUTS.find((o) => o.id === `out-${inv.decision}`) || OUTPUTS[0];
        setActiveOutputId(targetOutput.id);

        const activeCtrlCoords = inv.decisiveRuleId && inv.decision !== 'PAGAR'
          ? ALL_CONTROLS.filter((c) => c.code === inv.decisiveRuleId)
          : ALL_CONTROLS.filter((_, idx) => idx % 4 === 0);

        triggerPulses(activeCtrlCoords, [targetOutput], targetOutput.color, p3 * 0.6);

        // Update counters & history
        setCounters((prev) => ({
          total: prev.total + 1,
          pagadas: inv.decision === 'PAGAR' ? prev.pagadas + 1 : prev.pagadas,
          escaladas: inv.decision === 'ESCALAR' ? prev.escaladas + 1 : prev.escaladas,
          frenadas: inv.decision === 'FRENAR' ? prev.frenadas + 1 : prev.frenadas,
        }));

        setEventHistory((prev) => [inv, ...prev.slice(0, 7)]);
      }, p2);
    }, p1);
  };

  // Main streaming loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = speed === 1 ? 3200 : speed === 2 ? 2000 : 1200;

    // Run first step immediately
    runInvoiceCycle(LIVE_QUEUE[currentIndex]);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % LIVE_QUEUE.length;
        runInvoiceCycle(LIVE_QUEUE[next]);
        return next;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, currentIndex]);

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCounters({ total: 0, pagadas: 0, escaladas: 0, frenadas: 0 });
    setEventHistory([]);
    setCurrentIndex(0);
    setActiveChannelId(null);
    setActiveReaders(false);
    setActiveControlStates({});
    setActiveOutputId(null);
    setPulseParticles([]);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    const next = (currentIndex + 1) % LIVE_QUEUE.length;
    setCurrentIndex(next);
    runInvoiceCycle(LIVE_QUEUE[next]);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e3e3dc] p-6 shadow-xs space-y-5">
      
      {/* Top Header & Live Status Indicators */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e3e3dc]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            </span>
            <h2 className="text-lg font-bold text-[#1c253a]">
              Red de Decisión Autónoma · En Vivo
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
              {isPlaying ? 'TRANSMISIÓN EN TIEMPO REAL' : 'PAUSADO'}
            </span>
          </div>
          <p className="text-xs text-[#576071] mt-0.5">
            Observa el flujo real de partículas atravesando la ingesta, lectura dual con consenso y la matriz de 18 controles deterministas.
          </p>
        </div>

        {/* Live Controller Toolbar */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={handleStepForward}
            className="p-1.5 rounded-lg border border-[#e3e3dc] text-[#576071] hover:text-[#1c253a] hover:bg-[#f7f7f4] transition-all cursor-pointer"
            title="Siguiente factura en lote"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-[#e3e3dc] text-[#576071] hover:text-[#1c253a] hover:bg-[#f7f7f4] transition-all cursor-pointer"
            title="Reiniciar simulación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center rounded-lg border border-[#e3e3dc] p-0.5 bg-[#f7f7f4] text-[11px] font-mono">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  speed === s ? 'bg-white text-[#2a4bd0] shadow-xs' : 'text-[#576071] hover:text-[#1c253a]'
                }`}
              >
                {s === 1 ? '1x' : s === 2 ? '2x' : '3x'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Ticker Bar (Mandato Counters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f7f7f4] p-3.5 rounded-xl border border-[#e3e3dc] text-xs">
        <div>
          <span className="text-[#576071] block text-[11px]">Procesadas en Vivo</span>
          <span className="text-xl font-black font-mono text-[#1c253a]">{counters.total}</span>
          <span className="text-[10px] text-[#576071] block">facturas evaluadas</span>
        </div>
        <div>
          <span className="text-[#576071] block text-[11px] flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#1f9a62]" />
            <span>Pagar (Autónomas)</span>
          </span>
          <span className="text-xl font-black font-mono text-emerald-700">{counters.pagadas}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Rieles ACH & USDC</span>
        </div>
        <div>
          <span className="text-[#576071] block text-[11px] flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#d9922b]" />
            <span>Escalar (Doble Firma)</span>
          </span>
          <span className="text-xl font-black font-mono text-amber-700">{counters.escaladas}</span>
          <span className="text-[10px] text-amber-600 font-semibold block">En cola CFO SOX-404</span>
        </div>
        <div>
          <span className="text-[#576071] block text-[11px] flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#d4483b]" />
            <span>Frenar (Zero-Trust)</span>
          </span>
          <span className="text-xl font-black font-mono text-red-700">{counters.frenadas}</span>
          <span className="text-[10px] text-red-600 font-semibold block">0 fugas de capital</span>
        </div>
      </div>

      {/* SVG Interactive Canvas: Responsive with 1000x500 coordinates */}
      <div className="relative border border-[#e3e3dc] rounded-2xl bg-[#fafaf8] overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto max-h-[520px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer 1: Edges (Aristas) */}
          <g id="aristas" stroke="rgba(28, 37, 58, 0.11)" strokeWidth="1.5">
            {/* From Channels to Readers */}
            {CHANNELS.map((ch) =>
              READERS.map((rd) => (
                <line
                  key={`${ch.id}-${rd.id}`}
                  x1={ch.x}
                  y1={ch.y}
                  x2={rd.x}
                  y2={rd.y}
                  stroke={activeChannelId === ch.id ? 'rgba(42, 75, 208, 0.35)' : 'rgba(28, 37, 58, 0.11)'}
                  strokeWidth={activeChannelId === ch.id ? 2 : 1.5}
                />
              ))
            )}

            {/* From Readers to Controls */}
            {READERS.map((rd) =>
              ALL_CONTROLS.map((c) => (
                <line
                  key={`${rd.id}-${c.id}`}
                  x1={rd.x}
                  y1={rd.y}
                  x2={c.x}
                  y2={c.y}
                  stroke={activeReaders ? 'rgba(42, 75, 208, 0.18)' : 'rgba(28, 37, 58, 0.08)'}
                />
              ))
            )}

            {/* From Controls to Outputs */}
            {ALL_CONTROLS.map((c) =>
              OUTPUTS.map((out) => (
                <line
                  key={`${c.id}-${out.id}`}
                  x1={c.x}
                  y1={c.y}
                  x2={out.x}
                  y2={out.y}
                  stroke={activeOutputId === out.id ? out.color : 'rgba(28, 37, 58, 0.08)'}
                  strokeOpacity={activeOutputId === out.id ? 0.35 : 0.08}
                  strokeWidth={activeOutputId === out.id ? 1.8 : 1}
                />
              ))
            )}
          </g>

          {/* Layer 2: Flying Animated Pulses */}
          <g id="pulsos">
            {pulseParticles.map((p) => (
              <circle key={p.id} r="5" fill={p.color} className="filter drop-shadow-sm">
                <animate
                  attributeName="cx"
                  from={p.x1}
                  to={p.x2}
                  dur={`${p.duration}s`}
                  begin="0s"
                  fill="freeze"
                />
                <animate
                  attributeName="cy"
                  from={p.y1}
                  to={p.y2}
                  dur={`${p.duration}s`}
                  begin="0s"
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.9;0"
                  dur={`${p.duration}s`}
                  begin="0s"
                  fill="freeze"
                />
              </circle>
            ))}
          </g>

          {/* Layer 3: Nodes (Nodos) */}
          <g id="nodos">
            {/* Channel Nodes */}
            {CHANNELS.map((ch) => {
              const isActive = activeChannelId === ch.id;
              return (
                <g key={ch.id} className="cursor-pointer">
                  <circle
                    cx={ch.x}
                    cy={ch.y}
                    r={isActive ? 22 : 18}
                    fill={isActive ? '#2a4bd0' : '#ffffff'}
                    stroke={isActive ? '#1e3bb3' : 'rgba(28, 37, 58, 0.22)'}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  {isActive && (
                    <circle
                      cx={ch.x}
                      cy={ch.y}
                      r="28"
                      fill="none"
                      stroke="#2a4bd0"
                      strokeWidth="1.5"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}
                  <text
                    x={ch.x - 28}
                    y={ch.y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight={isActive ? '700' : '500'}
                    fill={isActive ? '#1c253a' : '#576071'}
                    fontFamily="Inter, ui-sans-serif, system-ui"
                  >
                    {ch.label}
                  </text>
                </g>
              );
            })}

            {/* Dual Reader Nodes */}
            {READERS.map((rd) => {
              const isActive = activeReaders;
              return (
                <g key={rd.id}>
                  <circle
                    cx={rd.x}
                    cy={rd.y}
                    r={isActive ? 26 : 22}
                    fill={isActive ? '#f3f5fd' : '#ffffff'}
                    stroke={isActive ? '#2a4bd0' : 'rgba(28, 37, 58, 0.22)'}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={rd.x}
                    y={rd.y + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={isActive ? '#2a4bd0' : '#1c253a'}
                  >
                    {rd.id === 'lec-a' ? 'Mod A' : 'Mod B'}
                  </text>
                  <text
                    x={rd.x}
                    y={rd.y + 36}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="500"
                    fill="#576071"
                  >
                    {rd.label}
                  </text>
                </g>
              );
            })}

            {/* 18 Controls Nodes */}
            {ALL_CONTROLS.map((c) => {
              const state = activeControlStates[c.code];
              let fill = '#ffffff';
              let stroke = 'rgba(28, 37, 58, 0.2)';
              let textFill = '#576071';

              if (state === 'OK') {
                fill = '#e8f4ee';
                stroke = '#1f9a62';
                textFill = '#0f7b4b';
              } else if (state === 'ESCALAR') {
                fill = '#fbf1df';
                stroke = '#d9922b';
                textFill = '#8a5300';
              } else if (state === 'FRENAR') {
                fill = '#fdecea';
                stroke = '#d4483b';
                textFill = '#b42318';
              }

              return (
                <g key={c.id}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={state ? 18 : 16}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={state ? 2.5 : 1.5}
                    className="transition-all duration-200"
                  />
                  <text
                    x={c.x}
                    y={c.y + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={state ? '800' : '600'}
                    fill={textFill}
                    fontFamily="monospace"
                  >
                    {c.code}
                  </text>
                </g>
              );
            })}

            {/* 3 Terminal Output Nodes */}
            {OUTPUTS.map((out) => {
              const isActive = activeOutputId === out.id;
              return (
                <g key={out.id} className="cursor-pointer">
                  <circle
                    cx={out.x}
                    cy={out.y}
                    r={isActive ? 32 : 26}
                    fill={isActive ? out.color : out.bg}
                    stroke={out.color}
                    strokeWidth={isActive ? 4 : 2}
                    className="transition-all duration-200"
                  />
                  {isActive && (
                    <circle
                      cx={out.x}
                      cy={out.y}
                      r="40"
                      fill="none"
                      stroke={out.color}
                      strokeWidth="2"
                      opacity="0.4"
                      className="animate-ping"
                    />
                  )}
                  <text
                    x={out.x + 40}
                    y={out.y + 5}
                    fontSize="13"
                    fontWeight={isActive ? '800' : '600'}
                    fill={isActive ? out.color : '#1c253a'}
                    fontFamily="Inter, ui-sans-serif, system-ui"
                  >
                    {out.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Dynamic Watermark Indicator */}
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-[#576071] bg-white/80 px-2 py-1 rounded-md border border-[#e3e3dc]">
          Flujo Determinista SSE · 60 FPS
        </div>
      </div>

      {/* Live Active Inspection Card (Current Invoice in Transit) */}
      <div className="bg-[#f7f7f4] border border-[#e3e3dc] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3e3dc] pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#576071]">
              Factura en Tránsito:
            </span>
            <span className="font-extrabold text-[#1c253a] text-sm">
              {currentInvoice.vendor}
            </span>
            <span className="font-mono text-xs text-[#576071]">
              {currentInvoice.number}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-sm text-[#1c253a]">
              ${currentInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs text-[#576071]">{currentInvoice.currency}</span>
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 ${
                currentInvoice.decision === 'PAGAR'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentInvoice.decision === 'ESCALAR'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {currentInvoice.decision === 'PAGAR' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {currentInvoice.decision === 'ESCALAR' && <AlertTriangle className="w-3.5 h-3.5" />}
              {currentInvoice.decision === 'FRENAR' && <AlertOctagon className="w-3.5 h-3.5" />}
              <span>{currentInvoice.decision}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[#576071] block text-[10px]">Regla Decisiva:</span>
            <span className="font-bold text-[#1c253a]">{currentInvoice.decisiveRuleName}</span>
          </div>
          <div>
            <span className="text-[#576071] block text-[10px]">Riel de Liquidación:</span>
            <span className="font-mono font-semibold text-[#1c253a]">{currentInvoice.rail}</span>
          </div>
          <div>
            <span className="text-[#576071] block text-[10px]">Sello Criptográfico SHA-256:</span>
            <span className="font-mono text-[10px] text-[#576071] truncate block">
              {currentInvoice.sha256}
            </span>
          </div>
        </div>

        <div className="text-xs text-[#576071] bg-white p-2.5 rounded-lg border border-[#e3e3dc]">
          <strong>Razón de la decisión:</strong> {currentInvoice.explanation}
        </div>
      </div>

      {/* Live Event Stream Feed (List of recent decisions) */}
      {eventHistory.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#e3e3dc]">
          <div className="flex items-center justify-between text-xs font-bold text-[#576071]">
            <span>Historial de Decisiones en Vivo</span>
            <span className="font-mono text-[11px]">Últimos {eventHistory.length} registros</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {eventHistory.map((ev, i) => (
              <div
                key={`${ev.id}-${i}`}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e3e3dc] text-xs hover:bg-[#f7f7f4] transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      ev.decision === 'PAGAR'
                        ? 'bg-[#1f9a62]'
                        : ev.decision === 'ESCALAR'
                        ? 'bg-[#d9922b]'
                        : 'bg-[#d4483b]'
                    }`}
                  />
                  <span className="font-bold text-[#1c253a]">{ev.vendor}</span>
                  <span className="font-mono text-[11px] text-[#576071]">{ev.number}</span>
                  <span className="text-[11px] text-[#576071] hidden sm:inline">
                    · {ev.decisiveRuleName}
                  </span>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-mono font-bold text-[#1c253a]">
                    ${ev.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {ev.currency}
                  </span>
                  <span
                    className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      ev.decision === 'PAGAR'
                        ? 'bg-emerald-50 text-emerald-800'
                        : ev.decision === 'ESCALAR'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {ev.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
