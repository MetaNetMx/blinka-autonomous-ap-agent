import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  FileCode,
  AlertOctagon,
  Scale,
  Sliders,
} from 'lucide-react';

export const GuardrailsMatrix: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="blinka-card p-6 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a4bd0]/10 text-[#2a4bd0] flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1c253a]">Matriz de Políticas & Guardrails Institucionales</h2>
            <p className="text-xs md:text-sm text-[#576071] mt-0.5">
              Protocolos de seguridad y límites de autonomía diseñados para la infraestructura bancaria de Blinka.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 6 Guardrail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Guardrail 1 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2a4bd0]">
                Protocolo Anti-Tamper
              </span>
              <Lock className="w-4 h-4 text-[#2a4bd0]" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">1. Aprobación de Cuentas Destino</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              Cualquier método de pago creado vía API entra en estado <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">approval.status = pending</code>. Ningún agente ni usuario puede dispersar fondos hacia cuentas bancarias que no hayan sido aprobadas previamente por un humano en la consola.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Protección contra inyección de cuentas maliciosas
          </div>
        </div>

        {/* Guardrail 2 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                Anti-Phishing Activo
              </span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">2. Verificación de Cuenta Bancaria</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              El agente extrae el número de cuenta y routing de la factura entrante y lo valida contra los rieles autorizados del proveedor. Si hay discrepancia (ej. factura falsa de Stripe con cuenta desconocida), se bloquea al instante y genera alerta crítica.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-red-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Bloqueo inmediato de spoofing y BEC (Business Email Compromise)
          </div>
        </div>

        {/* Guardrail 3 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                Umbral Autónomo
              </span>
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">3. Pagos Menores a $5,000 USD</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              Facturas recurrentes de proveedores verificados que no superen $5,000.00 USD son aprobadas y pagadas automáticamente vía riel ACH o Tarjeta Blinka, eliminando fricción operativa para suscripciones de software y hosting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Cero latencia para gastos operativos cotidianos
          </div>
        </div>

        {/* Guardrail 4 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                Control Dual
              </span>
              <Scale className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">4. Firma Dual CFO ({'>'}$10,000 USD)</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              Cualquier desembolso superior a $10,000.00 USD (como clusters de GPU o servicios profesionales mayores) es preparado en borrador y requiere autorización explícita de 1-clic del CFO o fundador antes de que salgan los fondos.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-amber-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Cumplimiento con estándares SOX y gobierno corporativo
          </div>
        </div>

        {/* Guardrail 5 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Tope Máximo
              </span>
              <AlertOctagon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">5. Techo Hard-Cap ($100,000 USD)</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              Límite estricto por transacción individual. Ninguna orden de pago que exceda $100,000.00 USD puede ser procesada por el agente bajo ninguna circunstancia. Requiere dispersión manual directa o aprobación de junta directiva.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-purple-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Protección de balance contra fallos catastróficos
          </div>
        </div>

        {/* Guardrail 6 */}
        <div className="blinka-card p-5 bg-white border border-[#e3e3dc] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2a4bd0]">
                Idempotencia
              </span>
              <FileCode className="w-4 h-4 text-[#2a4bd0]" />
            </div>
            <h3 className="text-sm font-bold text-[#1c253a]">6. Escudo Anti-Facturas Duplicadas</h3>
            <p className="text-xs text-[#576071] mt-2 leading-relaxed">
              Cada factura se indexa mediante su número fiscal y hash de contenido. Si un proveedor o empleado envía dos veces la misma factura, el agente detecta la colisión en el libro mayor y cancela el intento para evitar pagos dobles.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeee8] text-[11px] font-semibold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Garantía de idempotencia en red bancaria
          </div>
        </div>

      </div>

      {/* Code Snippet Demonstration */}
      <div className="blinka-card p-6 bg-[#1c253a] text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-mono text-slate-400 ml-2">blinka-mcp/policyEngine.ts</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">Policy Guardrails v2.0</span>
        </div>

        <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-[#121722] rounded-lg leading-relaxed">
{`// Verificación estricta de cuenta bancaria anti-spoofing
if (counterparty && invoice.beneficiaryBankLastFour) {
  const matches = counterparty.payoutMethods.some(
    (pm) => pm.accountEnding === invoice.beneficiaryBankLastFour && pm.approval.status === 'approved'
  );

  if (!matches) {
    return {
      decision: 'REJECT',
      score: 0,
      suggestedAction: 'IMMEDIATELY FREEZE INVOICE & NOTIFY CFO: Potential account hijacking or spoofing.'
    };
  }
}`}
        </pre>
      </div>

    </div>
  );
};
