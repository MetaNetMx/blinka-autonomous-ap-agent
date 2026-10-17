import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { AgentChatMessage } from '../blinka-core/types';
import { processAgentQuery } from '../blinka-core/agentBrain';
import { useBlinkaStore } from '../blinka-core/store';

interface AgentCopilotProps {
  store: ReturnType<typeof useBlinkaStore>;
}

export const AgentCopilot: React.FC<AgentCopilotProps> = ({ store }) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init_welcome',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `👋 **¡Bienvenido a la consola del Agente Blinka AP & Treasury!**\n\nEstoy conectado directamente al servidor **Model Context Protocol (MCP)** de Blinka y tengo acceso a los rieles bancarios de **Portage Bank**, **BNY Mellon Treasury** y **Base Network**.\n\n¿Qué tarea financiera deseas ejecutar?`,
      thoughts: ['Initialized MCP connection with blinka tools', 'Ledger synchronizer active'],
      toolCalls: [
        {
          toolName: 'blinka_list_accounts',
          parameters: { legalEntityId: '018f6734-7123-789a-bcde-0123456789ab' },
          result: { status: 'READY', accountsAvailable: 3 },
        },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>('init_welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || isProcessing) return;

    const userMsg: AgentChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const response = await processAgentQuery(text, store);
      setMessages((prev) => [...prev, response]);
      setExpandedTraceId(response.id);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `Ocurrió un error al ejecutar las herramientas MCP: ${err?.message || err}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestions = [
    {
      label: '🧾 Reconciliar Facturas',
      prompt: 'Reconcilia y evalúa todas las facturas de la bandeja de entrada',
    },
    {
      label: '📈 Barrido de Tesorería ($25k)',
      prompt: 'Ejecuta un Treasury Sweep de $25,000 para optimizar el rendimiento a 4.85% APY',
    },
    {
      label: '🛡️ Auditoría Anti-Fraude',
      prompt: 'Audita si existen facturas con cuentas bancarias no autorizadas o discrepancias',
    },
    {
      label: '💵 Consulta de Liquidez',
      prompt: '¿Cuál es la liquidez total disponible en checking, treasury y usdc?',
    },
  ];

  return (
    <div className="blinka-card bg-white h-[calc(100vh-12rem)] min-h-[580px] flex flex-col overflow-hidden">
      
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-[#e3e3dc] flex items-center justify-between bg-[#fcfcf9]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#2a4bd0] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#1c253a]">Blinka Autonomous Agent (MCP)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                MCP Tools Active
              </span>
            </div>
            <p className="text-[11px] text-[#576071]">
              Equipado con 11 herramientas MCP de banca, AP autónomo y control de políticas.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-[#576071] bg-white px-2.5 py-1 rounded-md border border-[#e3e3dc]">
          <Terminal className="w-3.5 h-3.5 text-[#2a4bd0]" />
          <span>blinka-mcp-server v1.0.0</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f7f7f4]/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTraceOpen = expandedTraceId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center space-x-2 px-1 text-[11px] text-[#576071]">
                <span className="font-semibold">{isUser ? 'Tú (Finanzas / CFO)' : 'Agente Autónomo Blinka'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1c253a] text-white rounded-tr-xs shadow-sm'
                    : 'bg-white text-[#1c253a] border border-[#e3e3dc] rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Agent Cognitive Thoughts & MCP Trace */}
                {!isUser && (msg.thoughts || msg.toolCalls) && (
                  <div className="mt-3 pt-3 border-t border-[#eeeee8]">
                    <button
                      onClick={() => setExpandedTraceId(isTraceOpen ? null : msg.id)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-[#2a4bd0] hover:text-[#1e3bb3]"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>
                        {isTraceOpen ? 'Ocultar Traza de Herramientas MCP' : 'Ver Ejecución de Herramientas MCP'}
                      </span>
                      {isTraceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isTraceOpen && (
                      <div className="mt-2.5 space-y-2 text-xs">
                        {/* Thoughts */}
                        {msg.thoughts && msg.thoughts.length > 0 && (
                          <div className="bg-[#f7f7f4] rounded-lg p-2.5 border border-[#e3e3dc] space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#576071]">
                              🧠 Cadena de Pensamiento (Chain of Thought):
                            </div>
                            {msg.thoughts.map((th, i) => (
                              <div key={i} className="text-[#1c253a] font-mono text-[11px] flex items-center space-x-1.5">
                                <span className="text-[#2a4bd0]">›</span>
                                <span>{th}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tool Calls Payload */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="space-y-2">
                            {msg.toolCalls.map((tc, idx) => (
                              <div
                                key={idx}
                                className="bg-[#121722] text-slate-200 rounded-lg p-3 font-mono text-[11px] space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-emerald-400 font-bold">
                                  <span>⚙️ Tool: {tc.toolName}</span>
                                  <span className="text-[10px] text-slate-400">MCP Call #{idx + 1}</span>
                                </div>
                                <div className="text-slate-400 text-[10px]">Parámetros de Entrada:</div>
                                <pre className="text-blue-300 overflow-x-auto text-[10px]">
                                  {JSON.stringify(tc.parameters, null, 2)}
                                </pre>
                                <div className="text-slate-400 text-[10px] pt-1">Respuesta de la Herramienta:</div>
                                <pre className="text-emerald-300 overflow-x-auto text-[10px]">
                                  {JSON.stringify(tc.result, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-[#576071] p-3 bg-white border border-[#e3e3dc] rounded-xl max-w-sm">
            <Bot className="w-4 h-4 text-[#2a4bd0] animate-spin" />
            <span>El agente está evaluando políticas y ejecutando herramientas MCP...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Row */}
      <div className="px-4 py-2 border-t border-[#e3e3dc] bg-[#fcfcf9] overflow-x-auto flex items-center space-x-2">
        <span className="text-[11px] font-bold text-[#576071] whitespace-nowrap flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-[#2a4bd0]" />
          Sugerencias rápidas:
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            disabled={isProcessing}
            onClick={() => handleSend(s.prompt)}
            className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#e3e3dc] hover:border-[#2a4bd0] hover:text-[#2a4bd0] whitespace-nowrap transition-all shadow-2xs disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-[#e3e3dc] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuery}
            disabled={isProcessing}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Pregúntale al agente o pídele una tarea (ej: 'Reconcilia las facturas pendientes')..."
            className="flex-1 text-xs md:text-sm p-3 rounded-xl border border-[#e3e3dc] focus:outline-[#2a4bd0] focus:ring-1 focus:ring-[#2a4bd0]"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="bg-[#2a4bd0] hover:bg-[#1e3bb3] disabled:opacity-40 text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
