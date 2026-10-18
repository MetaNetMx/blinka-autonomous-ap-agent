import React from 'react';
import { ShieldCheck, RotateCcw, Zap, ExternalLink, Bot, Landmark, FileText, Users, Sliders } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot';
  setActiveTab: (tab: 'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot') => void;
  onReset: () => void;
  pendingApprovalsCount: number;
  totalBalanceCents?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  pendingApprovalsCount,
  totalBalanceCents,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#f7f7f4]/90 backdrop-blur-md border-b border-[#e3e3dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src="/logo_white.svg"
                alt="Blinka"
                className="h-7 w-auto object-contain cursor-pointer"
                onClick={() => setActiveTab('overview')}
              />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2a4bd0]/10 text-[#2a4bd0] border border-[#2a4bd0]/20 tracking-wide uppercase">
                YC F26
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1.5 pl-3 border-l border-[#e3e3dc] text-xs text-[#576071]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portage Bank · Member FDIC</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1c253a] text-white shadow-sm'
                  : 'text-[#576071] hover:text-[#1c253a] hover:bg-[#ecebe6]'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Tesorería & Cuentas</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'inbox'
                  ? 'bg-[#1c253a] text-white shadow-sm'
                  : 'text-[#576071] hover:text-[#1c253a] hover:bg-[#ecebe6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bandeja AP Autónoma</span>
              {pendingApprovalsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guardrails')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guardrails'
                  ? 'bg-[#1c253a] text-white shadow-sm'
                  : 'text-[#576071] hover:text-[#1c253a] hover:bg-[#ecebe6]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Políticas & Guardrails</span>
            </button>

            <button
              onClick={() => setActiveTab('counterparties')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'counterparties'
                  ? 'bg-[#1c253a] text-white shadow-sm'
                  : 'text-[#576071] hover:text-[#1c253a] hover:bg-[#ecebe6]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Proveedores (AP)</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'copilot'
                  ? 'bg-[#2a4bd0] text-white shadow-sm'
                  : 'text-[#2a4bd0] hover:bg-[#2a4bd0]/10'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Blinka AI Copilot (MCP)</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            {totalBalanceCents !== undefined && (
              <button
                onClick={() => setActiveTab('overview')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#e3e3dc] rounded-lg text-[#1c253a] text-xs font-bold hover:bg-[#f7f7f4] transition-all shadow-2xs group"
                title="Liquidez total combinada en tiempo real (Checking + Treasury + USDC)"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-medium text-[#576071]">Total:</span>
                <span className="font-extrabold text-[#1c253a] group-hover:text-[#2a4bd0]">
                  ${(totalBalanceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </button>
            )}

            <button
              onClick={onReset}
              title="Restaurar estado de prueba demo inicial"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-[#576071] hover:text-[#1c253a] bg-white border border-[#e3e3dc] rounded-lg shadow-2xs hover:bg-[#ecebe6] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <a
              href="https://blinka.co"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1 text-xs text-[#576071] hover:text-[#2a4bd0] px-2 py-1"
            >
              <span>blinka.co</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto space-x-1 py-2 border-t border-[#e3e3dc] text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#1c253a] text-white' : 'text-[#576071]'
            }`}
          >
            Tesorería
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1 rounded-md whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'inbox' ? 'bg-[#1c253a] text-white' : 'text-[#576071]'
            }`}
          >
            <span>Bandeja AP</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('guardrails')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'guardrails' ? 'bg-[#1c253a] text-white' : 'text-[#576071]'
            }`}
          >
            Guardrails
          </button>
          <button
            onClick={() => setActiveTab('counterparties')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'counterparties' ? 'bg-[#1c253a] text-white' : 'text-[#576071]'
            }`}
          >
            Proveedores
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1 rounded-md whitespace-nowrap text-[#2a4bd0] font-semibold ${
              activeTab === 'copilot' ? 'bg-[#2a4bd0] text-white' : ''
            }`}
          >
            Copilot (MCP)
          </button>
        </div>

      </div>
    </header>
  );
};
