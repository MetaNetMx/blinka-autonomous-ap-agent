import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Mic,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Landmark,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface DemoStep {
  id: number;
  title: string;
  tab: 'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot';
  timeLabel: string;
  badge: string;
  headline: string;
  script: string;
  bulletPoints: string[];
  actionLabel: string;
  autoActionName?: 'process_invoices' | 'cfo_approve' | 'execute_sweep' | 'show_copilot';
}

interface DemoPitchAutopilotProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot';
  setActiveTab: (tab: 'overview' | 'inbox' | 'guardrails' | 'counterparties' | 'copilot') => void;
  onProcessAllInvoices: () => void;
  onCfoApproveLambda: () => void;
  onExecuteSweep: () => void;
}

export const DEMO_PITCH_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'El Problema Invertido & Dinero Ocioso',
    tab: 'overview',
    timeLabel: '0:00 - 0:35',
    badge: 'Tesorería & APY',
    headline: '¿Cómo destruir las finanzas de una empresa en 24 horas?',
    script:
      'Diógenes, jurados de 30X: Si quisiéramos garantizar la quiebra de una startup global hoy, haríamos tres cosas: pagaríamos facturas por email a ojos cerrados cayendo en phishing bancario o address poisoning, dejaríamos el capital ocioso en cuentas al 0% de interés en lugar de rentabilizarlo, y obligaríamos al CFO a revisar cada micro-gasto a mano. Blinka Autonomous AP convierte a Blinka en la primera banca inteligente que no solo custodia dinero, sino que lo protege y lo rentabiliza en tiempo real.',
    bulletPoints: [
      '$184k USD en checking operativo Portage Bank (FDIC)',
      '$50k USD en BNY Mellon Dreyfus generando 4.85% APY',
      '18,500 USDC en Bóveda Base Network lista para dispersiones',
    ],
    actionLabel: 'Resaltar Balances & Rendimiento BNY',
  },
  {
    id: 2,
    title: 'Conciliación AP & Escudo Anti-Phishing',
    tab: 'inbox',
    timeLabel: '0:35 - 1:15',
    badge: 'Ciberseguridad Zero-Trust',
    headline: 'Evaluación de Facturas & Neutralización de Ataque en 200ms',
    script:
      'Entremos a la Bandeja AP Autónoma. El agente evalúa las facturas con su motor de políticas determinista. La factura legítima de Vercel de $3,200 se aprueba y paga automáticamente vía ACH. Pero miren la factura de Stripe: un atacante modificó la cuenta bancaria a terminación 9999. Nuestra Regla Cero Zero-Trust la BLOQUEA DE INMEDIATO con score cero, neutralizando el ataque y salvando $14,250 dólares de la compañía.',
    bulletPoints: [
      'Vercel ($3,200 USD): Auto-pagado vía ACH en milisegundos',
      'Stripe Tampered (*9999): BLOQUEADO por Escudo Anti-Phishing',
      'Alchemy Cripto ($1,850 USDC): Verificado en Base Network',
    ],
    actionLabel: 'Evaluar Facturas & Activar Escudo Phishing',
    autoActionName: 'process_invoices',
  },
  {
    id: 3,
    title: 'Control Dual CFO para Pagos de Alta Cuantía',
    tab: 'inbox',
    timeLabel: '1:15 - 1:50',
    badge: 'Gobernanza SOX-404',
    headline: 'Firma Ejecutiva Dual para Desembolsos Mayores a $10,000 USD',
    script:
      'Para pagos de alta cuantía mayores a $10,000 dólares, como este cluster de GPUs de Lambda Labs de $48,500, el agente jamás dispersa a ciegas. Prepara el borrador y exige autorización dual del CFO con controles SOX. El CFO revisa los detalles y con un solo clic seguro autoriza el desembolso por Fedwire, generando un recibo oficial inmutable con trazabilidad bancaria completa.',
    bulletPoints: [
      'Lambda Labs ($48,500 USD): Retenido preventivamente (> $10k)',
      'Firma Dual del CFO: 1-clic con registro criptográfico',
      'Desembolso seguro vía Fedwire / Portage Bank',
    ],
    actionLabel: 'Firmar Desembolso Dual como CFO',
    autoActionName: 'cfo_approve',
  },
  {
    id: 4,
    title: 'Treasury Sweep Automatizado a BNY Mellon',
    tab: 'overview',
    timeLabel: '1:50 - 2:25',
    badge: 'Optimización de Liquidez',
    headline: 'Barrido de $25,000 USD a Fondo 4.85% APY con Liquidez T+0',
    script:
      'El agente no solo gestiona pagos; optimiza activamente la tesorería de la startup. Al detectar capital excedente en la cuenta checking de Portage Bank, ejecuta un barrido automático de $25,000 dólares hacia el fondo de mercado monetario BNY Mellon Dreyfus. Esto asegura 4.85% de rendimiento anual con liquidez inmediata en T+0 sin que el fundador tenga que mover un dedo.',
    bulletPoints: [
      'Barrido instantáneo de $25,000 USD de Checking a Treasury',
      'Rendimiento institucional: 4.85% APY compuesto',
      'Liquidez garantizada para nómina y gastos operativos',
    ],
    actionLabel: 'Ejecutar Treasury Sweep ($25k a BNY)',
    autoActionName: 'execute_sweep',
  },
  {
    id: 5,
    title: 'Dual-Rail Cripto (Base USDC) & Servidor MCP',
    tab: 'copilot',
    timeLabel: '2:25 - 3:00',
    badge: 'Arquitectura & Cierre',
    headline: '13 Herramientas MCP, Protocolo Abierto & 9/9 Tests Pasados',
    script:
      'Blinka opera en rieles duales: liquida en Fiat bancario y en Cripto sobre Base Network en USDC con protección contra Address Poisoning. Todo esto está respaldado por nuestro Servidor MCP con 13 herramientas nativas probadas al 100%. El agente expone su cadena de pensamiento y cada llamada a la API de Blinka. Esto convierte a Blinka en la primera banca inteligente que no solo custodia dinero, sino que lo protege y lo hace crecer.',
    bulletPoints: [
      '13 Herramientas MCP conectables a Claude, Cursor y Antigravity',
      '9/9 Test suites pasando en el repositorio oficial de GitHub',
      'Cero alucinaciones financieras: Motor determinista inmutable',
    ],
    actionLabel: 'Inspeccionar Servidor MCP & Copilot',
    autoActionName: 'show_copilot',
  },
];

export const DemoPitchAutopilot: React.FC<DemoPitchAutopilotProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onProcessAllInvoices,
  onCfoApproveLambda,
  onExecuteSweep,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'elevenlabs' | 'browser_tts' | 'teleprompter'>('browser_tts');
  const [isExpanded, setIsExpanded] = useState(true);
  const [customAudioUrls, setCustomAudioUrls] = useState<Record<number, string>>({});
  const [audioPlaybackState, setAudioPlaybackState] = useState<'stopped' | 'playing' | 'paused'>('stopped');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentStep = DEMO_PITCH_STEPS[currentStepIndex];

  // Try to load any previously saved custom ElevenLabs audio URLs from localStorage
  useEffect(() => {
    try {
      const savedAudios = localStorage.getItem('blinka_elevenlabs_demo_audios');
      if (savedAudios) {
        setCustomAudioUrls(JSON.parse(savedAudios));
        setVoiceMode('elevenlabs');
      }
    } catch (e) {
      console.warn('Could not read saved demo audios', e);
    }
  }, []);

  // Web Speech Synthesis (Browser TTS)
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es-MX') || v.lang.startsWith('es-ES') || v.lang.startsWith('es')
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      setAudioPlaybackState('stopped');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setAudioPlaybackState('stopped');
      if (onEndCallback) onEndCallback();
    };

    setAudioPlaybackState('playing');
    window.speechSynthesis.speak(utterance);
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioPlaybackState('stopped');
  };

  // Play audio for current step (Custom ElevenLabs mp3 or Browser TTS)
  const playCurrentStepAudio = (onFinish?: () => void) => {
    stopAllAudio();

    const customAudio = customAudioUrls[currentStep.id];
    if (voiceMode === 'elevenlabs' && customAudio) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = customAudio;
      audioRef.current.onended = () => {
        setAudioPlaybackState('stopped');
        if (onFinish) onFinish();
      };
      audioRef.current.onerror = () => {
        console.warn('ElevenLabs custom audio error, falling back to TTS');
        speakText(currentStep.script, onFinish);
      };
      setAudioPlaybackState('playing');
      audioRef.current.play().catch((e) => {
        console.warn('Audio play failed, fallback to TTS', e);
        speakText(currentStep.script, onFinish);
      });
    } else if (voiceMode === 'browser_tts') {
      speakText(currentStep.script, onFinish);
    } else {
      // Teleprompter (mute): simulate timer duration
      setAudioPlaybackState('playing');
      const timer = setTimeout(() => {
        setAudioPlaybackState('stopped');
        if (onFinish) onFinish();
      }, 22000);
      return () => clearTimeout(timer);
    }
  };

  // Execute step action in the UI
  const executeStepAction = (step: DemoStep) => {
    if (activeTab !== step.tab) {
      setActiveTab(step.tab);
    }

    if (step.autoActionName === 'process_invoices') {
      setTimeout(() => {
        onProcessAllInvoices();
      }, 400);
    } else if (step.autoActionName === 'cfo_approve') {
      setTimeout(() => {
        onCfoApproveLambda();
      }, 500);
    } else if (step.autoActionName === 'execute_sweep') {
      setTimeout(() => {
        onExecuteSweep();
      }, 400);
    } else if (step.autoActionName === 'show_copilot') {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  // Handle Step transition
  const goToStep = (stepIdx: number, andPlay = isPlaying) => {
    stopAllAudio();
    if (stepIdx < 0 || stepIdx >= DEMO_PITCH_STEPS.length) {
      setIsPlaying(false);
      return;
    }

    const nextStep = DEMO_PITCH_STEPS[stepIdx];
    setCurrentStepIndex(stepIdx);
    executeStepAction(nextStep);

    if (andPlay) {
      setTimeout(() => {
        playCurrentStepAudio(() => {
          // Autopilot: automatically go to next step if still playing
          if (stepIdx < DEMO_PITCH_STEPS.length - 1) {
            goToStep(stepIdx + 1, true);
          } else {
            setIsPlaying(false);
            confetti({ particleCount: 90, spread: 100, origin: { y: 0.4 } });
          }
        });
      }, 350);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAllAudio();
    } else {
      setIsPlaying(true);
      goToStep(currentStepIndex, true);
    }
  };

  const handleFileUpload = (stepId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updated = { ...customAudioUrls, [stepId]: result };
        setCustomAudioUrls(updated);
        setVoiceMode('elevenlabs');
        try {
          localStorage.setItem('blinka_elevenlabs_demo_audios', JSON.stringify(updated));
        } catch (err) {
          console.warn('Could not cache audio to localStorage (file may be large)', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      executeStepAction(currentStep);
    } else {
      stopAllAudio();
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-auto transition-all duration-300">
      <div className="bg-gradient-to-r from-slate-950 via-[#1c253a] to-slate-950 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden backdrop-blur-xl">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  🎬 Pitch Autopilot (3 Minutos)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentStep.timeLabel}
                </span>
                {audioPlaybackState === 'playing' && (
                  <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{voiceMode === 'elevenlabs' ? 'ElevenLabs Audio' : 'Voz Activa'}</span>
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-200 mt-0.5">
                Paso {currentStep.id} de {DEMO_PITCH_STEPS.length}: {currentStep.title}
              </h4>
            </div>
          </div>

          {/* Voice Mode Selector & Min-Max Toggle */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
              <button
                onClick={() => {
                  setVoiceMode('browser_tts');
                  stopAllAudio();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  voiceMode === 'browser_tts' ? 'bg-[#2a4bd0] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Narración con voz en español del navegador"
              >
                Voz Navegador
              </button>
              <button
                onClick={() => {
                  setVoiceMode('elevenlabs');
                  stopAllAudio();
                }}
                className={`px-2 py-1 rounded transition-all flex items-center space-x-1 ${
                  voiceMode === 'elevenlabs' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Reproducir clips generados con tu voz clonada en ElevenLabs"
              >
                <Mic className="w-3 h-3" />
                <span>ElevenLabs</span>
              </button>
              <button
                onClick={() => {
                  setVoiceMode('teleprompter');
                  stopAllAudio();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  voiceMode === 'teleprompter' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Modo silencioso para que hables tú mismo mirando el guion"
              >
                Teleprompter
              </button>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              title={isExpanded ? 'Contraer guion' : 'Expandir guion'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                stopAllAudio();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
              title="Salir del modo Pitch"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-800 h-1 flex">
          {DEMO_PITCH_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => goToStep(idx, isPlaying)}
              className={`flex-1 h-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Ir a ${step.title}`}
            />
          ))}
        </div>

        {/* Expanded Teleprompter Body */}
        {isExpanded && (
          <div className="p-5 space-y-4 max-h-[38vh] overflow-y-auto">
            {/* Headline Banner */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm md:text-base font-extrabold text-white">
                {currentStep.headline}
              </span>
              <button
                onClick={() => executeStepAction(currentStep)}
                className="shrink-0 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{currentStep.actionLabel}</span>
              </button>
            </div>

            {/* Script Text Box (Teleprompter) */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              <span className="text-amber-400 font-bold mr-1.5">🎙️ Guion a decir:</span>
              "{currentStep.script}"
            </div>

            {/* Key Bullet Points & ElevenLabs Audio Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
              <div className="flex items-center space-x-2 overflow-x-auto text-slate-300 py-1">
                {currentStep.bulletPoints.map((bp, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] whitespace-nowrap text-slate-300"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1 shrink-0" />
                    <span>{bp}</span>
                  </span>
                ))}
              </div>

              {/* Upload ElevenLabs Audio Clip */}
              <div className="flex items-center space-x-2 shrink-0">
                <label className="cursor-pointer inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all">
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>
                    {customAudioUrls[currentStep.id] ? '✓ Audio ElevenLabs Cargado' : 'Subir Audio ElevenLabs (.mp3)'}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(currentStep.id, e)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation & Playback Controls */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToStep(currentStepIndex - 1, isPlaying)}
              disabled={currentStepIndex === 0}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
              title="Paso anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gradient-to-r from-[#2a4bd0] to-indigo-600 hover:from-[#223fa8] hover:to-indigo-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pausar Autopilot</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Autopilot (Narrar & Navegar)</span>
                </>
              )}
            </button>

            <button
              onClick={() => goToStep(currentStepIndex + 1, isPlaying)}
              disabled={currentStepIndex === DEMO_PITCH_STEPS.length - 1}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all"
              title="Siguiente paso"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="hidden md:inline font-mono">
              Pestaña: <strong className="text-white">{currentStep.tab.toUpperCase()}</strong>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">
              Usa las flechas o Autopilot para sincronizar tu voz con la pantalla
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
