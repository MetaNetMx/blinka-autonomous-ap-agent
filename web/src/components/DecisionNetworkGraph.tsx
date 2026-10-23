import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Lock,
  Zap,
  Info,
} from 'lucide-react';

export const DecisionNetworkGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>('guardrails');

  return (
    <div className="bg-white rounded-2xl border border-[#e3e3dc] p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e3e3dc]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-[#1c253a]">
              Red de Decisión Autónoma & Flujo de Control
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              18 Controles Deterministas
            </span>
          </div>
          <p className="text-xs text-[#576071] mt-0.5">
            Arquitectura de tubería determinista: desde la ingesta del documento hasta la dispersión dual-rail y el sellado criptográfico.
          </p>
        </div>
        <div className="text-xs font-mono text-[#576071] flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1f9a62]" />
            <span>Pagar</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d9922b]" />
            <span>Escalar</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4483b]" />
            <span>Frenar</span>
          </span>
        </div>
      </div>

      {/* Interactive Responsive Decision Network Diagram */}
      <div className="relative overflow-x-auto py-4">
        <div className="min-w-[760px] flex items-center justify-between gap-3">
          
          {/* Step 1: Input Ingestion */}
          <div
            onClick={() => setSelectedNode('ingest')}
            className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
              selectedNode === 'ingest'
                ? 'bg-[#2a4bd0]/5 border-[#2a4bd0] shadow-sm ring-2 ring-[#2a4bd0]/20'
                : 'bg-[#f7f7f4] border-[#e3e3dc] hover:border-slate-400'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#1c253a]">1. Ingesta Multi-Canal</div>
            <div className="text-[10px] text-[#576071] mt-0.5 font-mono">PDF · EML · API · ERP</div>
          </div>

          <div className="text-slate-400 font-bold shrink-0">→</div>

          {/* Step 2: Dual Consensus Extraction */}
          <div
            onClick={() => setSelectedNode('dual')}
            className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
              selectedNode === 'dual'
                ? 'bg-[#2a4bd0]/5 border-[#2a4bd0] shadow-sm ring-2 ring-[#2a4bd0]/20'
                : 'bg-[#f7f7f4] border-[#e3e3dc] hover:border-slate-400'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 mx-auto flex items-center justify-center mb-2">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#1c253a]">2. Extracción Dual</div>
            <div className="text-[10px] text-[#576071] mt-0.5 font-mono">Consenso Modelo A & B</div>
          </div>

          <div className="text-slate-400 font-bold shrink-0">→</div>

          {/* Step 3: Deterministic Guardrails Matrix */}
          <div
            onClick={() => setSelectedNode('guardrails')}
            className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
              selectedNode === 'guardrails'
                ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-[#f7f7f4] border-[#e3e3dc] hover:border-slate-400'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#1c253a]">3. 18 Guardrails</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 font-mono">Reglas en Código Puro</div>
          </div>

          <div className="text-slate-400 font-bold shrink-0">→</div>

          {/* Step 4: Tri-State Terminal Verdicts */}
          <div className="flex-[1.4] flex flex-col gap-1.5">
            <div
              onClick={() => setSelectedNode('pagar')}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                selectedNode === 'pagar'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>PAGAR (Autónomo)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700">Portage / Base</span>
            </div>

            <div
              onClick={() => setSelectedNode('escalar')}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                selectedNode === 'escalar'
                  ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>ESCALAR (Doble Firma)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-700">Cola CFO SOX-404</span>
            </div>

            <div
              onClick={() => setSelectedNode('frenar')}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                selectedNode === 'frenar'
                  ? 'bg-red-100 text-red-900 border-red-400 shadow-xs'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                <span>FRENAR (Zero-Trust)</span>
              </span>
              <span className="text-[10px] font-mono text-red-700">Bloqueo de Seguridad</span>
            </div>
          </div>

          <div className="text-slate-400 font-bold shrink-0">→</div>

          {/* Step 5: Cryptographic Ledger & Treasury Sweep */}
          <div
            onClick={() => setSelectedNode('ledger')}
            className={`flex-1 p-3.5 rounded-xl border transition-all cursor-pointer text-center ${
              selectedNode === 'ledger'
                ? 'bg-[#2a4bd0]/5 border-[#2a4bd0] shadow-sm ring-2 ring-[#2a4bd0]/20'
                : 'bg-[#f7f7f4] border-[#e3e3dc] hover:border-slate-400'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center mb-2">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#1c253a]">5. Ledger & Yield</div>
            <div className="text-[10px] text-[#576071] mt-0.5 font-mono">SHA-256 · 4.85% APY</div>
          </div>

        </div>
      </div>

      {/* Node Description Details Banner */}
      <div className="p-3.5 rounded-xl bg-[#f7f7f4] border border-[#e3e3dc] text-xs space-y-1">
        {selectedNode === 'ingest' && (
          <div>
            <span className="font-bold text-[#1c253a]">Paso 1: Ingesta Multi-Canal Zero-Trust: </span>
            <span className="text-[#576071]">
              Las facturas ingresan automáticamente mediante conectores IMAP/Google Workspace, APIs de facturación electrónica o carga manual. Se calcula el hash SHA-256 del binario original inmediatamente para garantizar que el archivo nunca pueda ser adulterado.
            </span>
          </div>
        )}

        {selectedNode === 'dual' && (
          <div>
            <span className="font-bold text-[#1c253a]">Paso 2: Extracción Dual con Validación Cruzada (JEV): </span>
            <span className="text-[#576071]">
              Dos modelos independientes leen el documento en paralelo y extraen proveedor, cuenta bancaria, RFC, monto y vencimiento. Si existe discrepancia de más de $0.01 o disparidad en el IBAN/número de cuenta, la factura se escala automáticamente sin proceder al pago.
            </span>
          </div>
        )}

        {selectedNode === 'guardrails' && (
          <div>
            <span className="font-bold text-[#1c253a]">Paso 3: Matriz de 18 Controles Deterministas en Código: </span>
            <span className="text-[#576071]">
              El núcleo no depende de texto probabilístico generado por IA: ejecuta 18 funciones deterministas en TypeScript (R00 Legibilidad, R01 Beneficiario permitido, R02 Coincidencia con cuenta maestra, R03 Moneda, R04 Duplicados exactos, R05 Levenshtein near-duplicate, R06 Límite por pago, R08 Umbral humano, R10 Anti-smurfing, R13 SPF/DKIM y J01 Heurística anti-inyección de prompt).
            </span>
          </div>
        )}

        {selectedNode === 'pagar' && (
          <div>
            <span className="font-bold text-emerald-800">Resultado: Desembolso Autónomo (Verde): </span>
            <span className="text-emerald-700">
              Cumple los 18 controles, proveedor verificado, monto &lt; $5,000 USD y cuenta en maestro. El agente emite la dispersión directa mediante Portage Bank ACH/Fedwire o Base USDC en milisegundos sin requerir intervención humana.
            </span>
          </div>
        )}

        {selectedNode === 'escalar' && (
          <div>
            <span className="font-bold text-amber-800">Resultado: Escalado a CFO (Ámbar): </span>
            <span className="text-amber-700">
              Monto &gt; $5,000 USD, primera factura de nuevo proveedor, o casi duplicado. El agente pausa la dispersión, redacta la ficha de contexto para el CFO y exige firma criptográfica con doble factor de aprobación en app.blinka.co.
            </span>
          </div>
        )}

        {selectedNode === 'frenar' && (
          <div>
            <span className="font-bold text-red-800">Resultado: Frenado por Zero-Trust (Rojo): </span>
            <span className="text-red-700">
              Cuenta bancaria alterada (BEC), proveedor no registrado, factura duplicada o inyección de prompt maliciosa. Un solo control negativo congela el comprobante en seco y activa el protocolo de aislamiento forense.
            </span>
          </div>
        )}

        {selectedNode === 'ledger' && (
          <div>
            <span className="font-bold text-[#1c253a]">Paso 5: Ledger Inmutable & Optimización de Rendimiento de Tesorería: </span>
            <span className="text-[#576071]">
              Cada desembolso o cobro genera un registro encadenado con SHA-256 inmutable. Simultáneamente, el agente evalúa los saldos ociosos de la cuenta Checking y ejecuta barridos automatizados a BNY Mellon Dreyfus generando 4.85% APY con liquidez T+0.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
