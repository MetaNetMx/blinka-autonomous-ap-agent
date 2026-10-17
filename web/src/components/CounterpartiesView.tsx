import React, { useState } from 'react';
import {
  Users,
  Building,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { Counterparty, PayoutMethod } from '../blinka-core/types';
import confetti from 'canvas-confetti';

interface CounterpartiesViewProps {
  counterparties: Counterparty[];
  onApprovePayoutMethod: (id: string) => void;
  onAddCounterparty: (name: string, email?: string) => void;
  onAddPayoutMethod: (
    counterpartyId: string,
    methodType: PayoutMethod['methodType'],
    accountEnding: string
  ) => void;
}

export const CounterpartiesView: React.FC<CounterpartiesViewProps> = ({
  counterparties,
  onApprovePayoutMethod,
  onAddCounterparty,
  onAddPayoutMethod,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [selectedCpIdForMethod, setSelectedCpIdForMethod] = useState<string | null>(null);
  const [newMethodType, setNewMethodType] = useState<PayoutMethod['methodType']>('ACH');
  const [newAccountEnding, setNewAccountEnding] = useState('');

  const handleApprove = (pmId: string) => {
    onApprovePayoutMethod(pmId);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#2a4bd0', '#10b981'],
    });
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName) return;
    onAddCounterparty(newVendorName, newVendorEmail);
    setNewVendorName('');
    setNewVendorEmail('');
    setShowAddModal(false);
  };

  const handleCreateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCpIdForMethod || !newAccountEnding) return;
    onAddPayoutMethod(selectedCpIdForMethod, newMethodType, newAccountEnding);
    setSelectedCpIdForMethod(null);
    setNewAccountEnding('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="blinka-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1c253a]">Directorio de Proveedores & Métodos de Pago</h2>
          <p className="text-xs md:text-sm text-[#576071] mt-0.5">
            Cuentas bancarias verificadas y rieles de liquidación vinculados a cada beneficiario en Blinka.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#2a4bd0] hover:bg-[#1e3bb3] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Security Banner Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Lock className="w-4 h-4 text-[#2a4bd0] mt-0.5 shrink-0" />
        <div>
          <strong className="font-semibold">Protocolo de Seguridad Blinka:</strong> Cualquier método de pago añadido entra por defecto como <span className="font-bold underline text-amber-700">Pendiente de Aprobación</span>. Los fondos no pueden moverse hacia esa cuenta hasta que un administrador o CFO haga clic en "Aprobar Método".
        </div>
      </div>

      {/* Counterparties Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {counterparties.map((cp) => (
          <div key={cp.id} className="blinka-card p-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f7f7f4] border border-[#e3e3dc] flex items-center justify-center text-[#1c253a] font-bold">
                    <Building className="w-5 h-5 text-[#2a4bd0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1c253a]">{cp.name}</h3>
                    <p className="text-xs text-[#576071]">{cp.email}</p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {cp.status}
                </span>
              </div>

              {/* Payout Methods List */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#576071]">
                  Métodos de Pago Registrados
                </div>

                {cp.payoutMethods.length === 0 ? (
                  <div className="text-xs text-[#576071] italic py-2">
                    Sin métodos de pago registrados.
                  </div>
                ) : (
                  cp.payoutMethods.map((pm) => {
                    const isApproved = pm.approval.status === 'approved';
                    return (
                      <div
                        key={pm.id}
                        className="bg-[#f7f7f4] border border-[#e3e3dc] rounded-lg p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-[#576071]" />
                          <div>
                            <span className="font-bold text-[#1c253a]">{pm.methodType}</span>{' '}
                            <span className="font-mono text-[#576071]">•••• {pm.accountEnding}</span>
                            {pm.routingNumber && (
                              <span className="text-[10px] text-[#576071] block">Ruta: {pm.routingNumber}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          {isApproved ? (
                            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Aprobado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(pm.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Aprobar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#eeeee8] flex justify-end">
              <button
                onClick={() => setSelectedCpIdForMethod(cp.id)}
                className="text-xs text-[#2a4bd0] hover:text-[#1e3bb3] font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Método de Pago</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#e3e3dc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <h3 className="text-base font-bold text-[#1c253a]">Registrar Proveedor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#576071] hover:text-[#1c253a] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Anthropic PBC"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Email de Facturación</label>
                <input
                  type="email"
                  placeholder="billing@anthropic.com"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#eeeee8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-[#576071]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#2a4bd0] text-white rounded-lg"
                >
                  Crear Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payout Method Modal */}
      {selectedCpIdForMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#e3e3dc] space-y-4">
            <div className="flex items-center justify-between border-b border-[#eeeee8] pb-3">
              <h3 className="text-base font-bold text-[#1c253a]">Nuevo Método de Pago</h3>
              <button
                onClick={() => setSelectedCpIdForMethod(null)}
                className="text-[#576071] hover:text-[#1c253a] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMethod} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Tipo de Riel</label>
                <select
                  value={newMethodType}
                  onChange={(e) => setNewMethodType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] focus:outline-[#2a4bd0]"
                >
                  <option value="ACH">ACH Bancario (EE.UU.)</option>
                  <option value="WIRE">Fedwire Bancario</option>
                  <option value="BRE_B">Bre-B / Transfiya (Colombia)</option>
                  <option value="CRYPTO">USDC (Base Network)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c253a] mb-1">Últimos 4 Dígitos de Cuenta</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="8821"
                  value={newAccountEnding}
                  onChange={(e) => setNewAccountEnding(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#e3e3dc] font-mono focus:outline-[#2a4bd0]"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg text-[11px] text-amber-800 border border-amber-200">
                ⚠️ El método quedará en estado <strong>Pendiente de Aprobación</strong> de acuerdo a las directivas de seguridad de Blinka.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#eeeee8]">
                <button
                  type="button"
                  onClick={() => setSelectedCpIdForMethod(null)}
                  className="px-3 py-2 text-xs font-medium text-[#576071]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#2a4bd0] text-white rounded-lg"
                >
                  Guardar Método
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
