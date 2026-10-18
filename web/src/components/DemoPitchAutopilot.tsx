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
  Video,
  VideoOff,
  Download,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Film,
  AlertCircle,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fixWebmDuration } from '../utils/webmDuration';

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

  // ElevenLabs Direct API Integration State
  const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState(() => localStorage.getItem('blinka_elevenlabs_api_key') || '');
  const [elevenLabsVoiceId, setElevenLabsVoiceId] = useState(() => localStorage.getItem('blinka_elevenlabs_voice_id') || '');
  const [availableVoices, setAvailableVoices] = useState<Array<{ voice_id: string; name: string; category?: string }>>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isGeneratingAudios, setIsGeneratingAudios] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  const [elevenLabsError, setElevenLabsError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Screen Video Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const voiceModeRef = useRef(voiceMode);
  const customAudioUrlsRef = useRef<Record<number, string>>({});
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentStep = DEMO_PITCH_STEPS[currentStepIndex];

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(() => {
    customAudioUrlsRef.current = customAudioUrls;
  }, [customAudioUrls]);

  // Try to load any previously saved custom ElevenLabs audio URLs from localStorage
  useEffect(() => {
    try {
      const savedAudios = localStorage.getItem('blinka_elevenlabs_demo_audios');
      if (savedAudios) {
        const parsed = JSON.parse(savedAudios);
        if (Object.keys(parsed).length > 0) {
          customAudioUrlsRef.current = parsed;
          setCustomAudioUrls(parsed);
          setVoiceMode('elevenlabs');
          voiceModeRef.current = 'elevenlabs';
        }
      }
    } catch (e) {
      console.warn('Could not read saved demo audios', e);
    }
  }, []);

  // Sync ElevenLabs credentials to localStorage
  useEffect(() => {
    if (elevenLabsApiKey) {
      localStorage.setItem('blinka_elevenlabs_api_key', elevenLabsApiKey);
    }
  }, [elevenLabsApiKey]);

  useEffect(() => {
    if (elevenLabsVoiceId) {
      localStorage.setItem('blinka_elevenlabs_voice_id', elevenLabsVoiceId);
    }
  }, [elevenLabsVoiceId]);

  // Fetch Available Voices from ElevenLabs
  const fetchElevenLabsVoices = async () => {
    const key = elevenLabsApiKey.trim();
    if (!key) {
      setElevenLabsError('Ingresa tu API Key de ElevenLabs para consultar tus voces.');
      return;
    }
    setIsLoadingVoices(true);
    setElevenLabsError(null);
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': key },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail?.message || `Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      const list = (data.voices || []).map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category || (v.labels?.cloned ? 'Clonada' : 'Estándar'),
      }));
      setAvailableVoices(list);

      // Auto-select cloned voice if none currently selected
      if (!elevenLabsVoiceId && list.length > 0) {
        const cloned = list.find((v: any) => v.category?.toLowerCase().includes('clon'));
        const chosen = cloned ? cloned.voice_id : list[0].voice_id;
        setElevenLabsVoiceId(chosen);
      }
    } catch (err: any) {
      setElevenLabsError(err.message || 'Error al conectar con la API de ElevenLabs');
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // Generate all 5 audio clips with ElevenLabs
  const generateAllElevenLabsAudios = async () => {
    const key = elevenLabsApiKey.trim();
    const voiceId = elevenLabsVoiceId.trim();

    if (!key) {
      setElevenLabsError('Por favor ingresa tu API Key de ElevenLabs.');
      return;
    }
    if (!voiceId) {
      setElevenLabsError('Por favor selecciona o ingresa tu Voice ID de ElevenLabs.');
      return;
    }

    setIsGeneratingAudios(true);
    setElevenLabsError(null);
    const updatedAudios = { ...customAudioUrlsRef.current };

    try {
      for (let i = 0; i < DEMO_PITCH_STEPS.length; i++) {
        const step = DEMO_PITCH_STEPS[i];
        setGeneratingProgress(`Sintetizando paso ${i + 1} de 5: "${step.title}" con tu voz...`);

        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: step.script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`Paso ${i + 1} falló: ${errData.detail?.message || res.statusText}`);
        }

        const blob = await res.blob();
        const base64Data: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        updatedAudios[step.id] = base64Data;
        customAudioUrlsRef.current = { ...updatedAudios };
        setCustomAudioUrls({ ...updatedAudios });
      }

      // Save to localStorage
      try {
        localStorage.setItem('blinka_elevenlabs_demo_audios', JSON.stringify(updatedAudios));
      } catch (storageErr) {
        console.warn('LocalStorage quota limit reached, audio kept in browser memory:', storageErr);
      }

      voiceModeRef.current = 'elevenlabs';
      setVoiceMode('elevenlabs');
      setGeneratingProgress(null);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      setTimeout(() => setShowElevenLabsModal(false), 1200);
    } catch (err: any) {
      setElevenLabsError(err.message || 'Error durante la síntesis');
    } finally {
      setIsGeneratingAudios(false);
      setGeneratingProgress(null);
    }
  };

  // Screen & Audio Video Recording (WebM / MP4)
  const startRecordingAndDemo = async () => {
    try {
      // 1. Prompt user to select screen/tab with selfBrowserSurface: 'include' & preferCurrentTab: true
      // This explicitly allows and highlights the current Blinka tab in the browser dialog!
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: true,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        systemAudio: 'include',
        surfaceSwitching: 'include',
      } as any);

      screenStreamRef.current = displayStream;
      recordedChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // 2. Setup Web Audio Master Mixer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const masterDestination = audioCtx.createMediaStreamDestination();

      // A) Mix Tab Audio (if user shared tab audio)
      if (displayStream.getAudioTracks().length > 0) {
        try {
          const tabSource = audioCtx.createMediaStreamSource(new MediaStream(displayStream.getAudioTracks()));
          tabSource.connect(masterDestination);
        } catch (e) {
          console.warn('Could not connect tab audio', e);
        }
      }

      // B) Mix Microphone Audio (crucial for Browser TTS played through speakers or live commentary!)
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        micStreamRef.current = micStream;
        const micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(masterDestination);
      } catch (micErr) {
        console.warn('Microphone permission not granted or mic unavailable', micErr);
      }

      // 3. Assemble Combined MediaStream (Video from tab + Master Mixed Audio)
      const combinedTracks = [
        ...displayStream.getVideoTracks(),
        ...masterDestination.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const durationMs = Date.now() - recordingStartTimeRef.current;
        if (recordedChunksRef.current.length > 0) {
          const rawBlob = new Blob(recordedChunksRef.current, { type: mimeType });

          // Patch EBML duration so the video has full seeking/scrubbing (adelantar/retrasar)!
          const seekableBlob = await fixWebmDuration(rawBlob, durationMs);

          const url = URL.createObjectURL(seekableBlob);
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          link.href = url;
          link.download = `blinka_demo_pitch_hackathon_30x_${timestamp}.webm`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setShowDownloadSuccess(true);
          setTimeout(() => setShowDownloadSuccess(false), 8000);
        }
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        // Clean up all tracks & audio context
        displayStream.getTracks().forEach((track) => track.stop());
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
          micStreamRef.current = null;
        }
        if (audioCtx.state !== 'closed') {
          audioCtx.close().catch(() => {});
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // If user ends sharing via browser native UI banner
      displayStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };

      // Automatically launch the Autopilot from Step 1 with audio
      setIsPlaying(true);
      isPlayingRef.current = true;
      goToStep(0, true);
    } catch (err: any) {
      console.warn('Recording cancelled or not supported:', err);
      setIsRecording(false);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Web Speech Synthesis (Browser TTS)
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel any previous utterance safely without triggering its callbacks
    if (activeUtteranceRef.current) {
      activeUtteranceRef.current.onend = null;
      activeUtteranceRef.current.onerror = null;
      activeUtteranceRef.current = null;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance;
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
      if (activeUtteranceRef.current !== utterance) return;
      activeUtteranceRef.current = null;
      setAudioPlaybackState('stopped');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      if (activeUtteranceRef.current !== utterance) return;
      activeUtteranceRef.current = null;
      setAudioPlaybackState('stopped');
      if (onEndCallback) onEndCallback();
    };

    setAudioPlaybackState('playing');
    window.speechSynthesis.speak(utterance);
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
        activeUtteranceRef.current = null;
      }
      window.speechSynthesis.cancel();
    }
    setAudioPlaybackState('stopped');
  };

  // Play audio for a specific step (Custom ElevenLabs mp3 or Browser TTS)
  const playStepAudio = (stepToPlay: DemoStep, onFinish?: () => void) => {
    stopAllAudio();

    const mode = voiceModeRef.current;
    const customAudio = customAudioUrlsRef.current[stepToPlay.id];

    if (mode === 'elevenlabs' && customAudio) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = customAudio;
      audioRef.current.onended = () => {
        setAudioPlaybackState('stopped');
        if (onFinish) onFinish();
      };
      audioRef.current.onerror = () => {
        console.warn(`ElevenLabs audio error on step ${stepToPlay.id}, falling back to TTS`);
        speakText(stepToPlay.script, onFinish);
      };
      setAudioPlaybackState('playing');
      audioRef.current.play().catch((e) => {
        console.warn('Audio play failed, fallback to TTS', e);
        speakText(stepToPlay.script, onFinish);
      });
    } else if (mode === 'browser_tts') {
      speakText(stepToPlay.script, onFinish);
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

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (step.autoActionName === 'process_invoices') {
      setTimeout(() => {
        onProcessAllInvoices();
      }, 450);
    } else if (step.autoActionName === 'cfo_approve') {
      setTimeout(() => {
        onCfoApproveLambda();
      }, 500);
    } else if (step.autoActionName === 'execute_sweep') {
      setTimeout(() => {
        onExecuteSweep();
      }, 450);
    } else if (step.autoActionName === 'show_copilot') {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  // Handle Step transition
  const goToStep = (stepIdx: number, andPlay = isPlayingRef.current) => {
    stopAllAudio();
    if (stepIdx < 0 || stepIdx >= DEMO_PITCH_STEPS.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const targetStep = DEMO_PITCH_STEPS[stepIdx];
    setCurrentStepIndex(stepIdx);
    executeStepAction(targetStep);

    if (andPlay) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      setTimeout(() => {
        // Only start audio if still in playing mode
        if (!isPlayingRef.current) return;

        playStepAudio(targetStep, () => {
          // Autopilot: automatically go to next step if still playing
          if (!isPlayingRef.current) return;

          if (stepIdx < DEMO_PITCH_STEPS.length - 1) {
            goToStep(stepIdx + 1, true);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            confetti({ particleCount: 90, spread: 100, origin: { y: 0.4 } });
            // Auto stop screen recording if active
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              setTimeout(() => {
                stopScreenRecording();
              }, 1500);
            }
          }
        });
      }, 450);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAllAudio();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
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
        const updated = { ...customAudioUrlsRef.current, [stepId]: result };
        customAudioUrlsRef.current = updated;
        setCustomAudioUrls(updated);
        setVoiceMode('elevenlabs');
        voiceModeRef.current = 'elevenlabs';
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
    <>
      {/* ElevenLabs API Configuration Modal */}
      {showElevenLabsModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Conexión Directa ElevenLabs</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Voz Clonada
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sintetiza los 5 audios del pitch automáticamente en un solo clic
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowElevenLabsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {elevenLabsError && (
                <div className="bg-red-950/60 border border-red-500/40 text-red-200 p-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">{elevenLabsError}</div>
                </div>
              )}

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>ElevenLabs API Key (xi-api-key)</span>
                  </span>
                  <a
                    href="https://elevenlabs.io/app/settings/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Obtener mi API Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={elevenLabsApiKey}
                    onChange={(e) => setElevenLabsApiKey(e.target.value)}
                    placeholder="sk_..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Voice ID Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Voz Clonada / Voice ID</span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchElevenLabsVoices}
                    disabled={isLoadingVoices || !elevenLabsApiKey.trim()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 disabled:opacity-40 flex items-center space-x-1 font-semibold"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingVoices ? 'animate-spin' : ''}`} />
                    <span>{isLoadingVoices ? 'Consultando...' : 'Buscar mis voces en ElevenLabs'}</span>
                  </button>
                </div>

                {availableVoices.length > 0 ? (
                  <select
                    value={elevenLabsVoiceId}
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="">-- Selecciona tu voz --</option>
                    {availableVoices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name} ({v.category}) - {v.voice_id.slice(0, 8)}...
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={elevenLabsVoiceId}
                    onChange={(e) => setElevenLabsVoiceId(e.target.value)}
                    placeholder="Pega tu Voice ID (ej: 21m00Tcm4TlvDq8ikWAM) o pulsa 'Buscar mis voces'"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                )}
              </div>

              {/* Step Synthesized Status Summary */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Estado de los 5 Pasos del Pitch:</span>
                  <span className="text-amber-400 font-mono">
                    {Object.keys(customAudioUrls).length} de 5 listos
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEMO_PITCH_STEPS.map((s) => {
                    const hasAudio = !!customAudioUrls[s.id];
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px]"
                      >
                        <div className="flex items-center space-x-2">
                          {hasAudio ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                          )}
                          <span className={hasAudio ? 'text-slate-200' : 'text-slate-400'}>
                            Paso {s.id}: {s.title}
                          </span>
                        </div>
                        {hasAudio && (
                          <button
                            type="button"
                            onClick={() => {
                              stopAllAudio();
                              const audio = new Audio(customAudioUrls[s.id]);
                              audio.play();
                            }}
                            className="text-amber-400 hover:text-amber-300 text-[10px] flex items-center space-x-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-amber-400" />
                            <span>Escuchar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress indicator */}
              {isGeneratingAudios && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-center space-y-2 animate-pulse">
                  <div className="flex items-center justify-center space-x-2 text-amber-300 font-semibold text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{generatingProgress || 'Generando audios...'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Sintetizando con ElevenLabs Multilingual V2 (calidad ultra-realista)...
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowElevenLabsModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={generateAllElevenLabsAudios}
                disabled={isGeneratingAudios || !elevenLabsApiKey.trim() || !elevenLabsVoiceId.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-900/30 transition-all"
              >
                {isGeneratingAudios ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sintetizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🚀 Sintetizar los 5 Pasos con Mi Voz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Autopilot Floating Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-auto transition-all duration-300">
        {/* Download Success Banner */}
        {showDownloadSuccess && (
          <div className="bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between mb-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">¡Video de la Demo Descargado con Éxito!</p>
                <p className="text-[11px] text-emerald-300">
                  Revisa tu carpeta de <code>Descargas</code> (archivo <code>.webm</code> con audio y video en alta definición).
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDownloadSuccess(false)}
              className="text-emerald-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
                  {isRecording && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>REC {formatTimer(recordingSeconds)}</span>
                    </span>
                  )}
                  {audioPlaybackState === 'playing' && (
                    <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{voiceMode === 'elevenlabs' ? 'Voz ElevenLabs' : 'Voz Activa'}</span>
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 mt-0.5">
                  Paso {currentStep.id} de {DEMO_PITCH_STEPS.length}: {currentStep.title}
                </h4>
              </div>
            </div>

            {/* Voice Mode Selector & ElevenLabs API Connector */}
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

              {/* ElevenLabs API Quick Button */}
              <button
                onClick={() => setShowElevenLabsModal(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 border ${
                  Object.keys(customAudioUrls).length === DEMO_PITCH_STEPS.length
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                }`}
                title="Conectar API de ElevenLabs para autogenerar todos los audios"
              >
                <Mic className="w-3 h-3" />
                <span className="hidden md:inline">
                  {Object.keys(customAudioUrls).length === DEMO_PITCH_STEPS.length
                    ? '✓ Voz Clonada Lista'
                    : '⚡ Conectar ElevenLabs'}
                </span>
                <span className="md:hidden">API</span>
              </button>

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
                  if (isRecording) stopScreenRecording();
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

                {/* ElevenLabs Status / Manual Upload fallback */}
                <div className="flex items-center space-x-2 shrink-0">
                  {customAudioUrls[currentStep.id] ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Audio ElevenLabs Listo</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowElevenLabsModal(true)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] text-amber-300 transition-all font-semibold"
                    >
                      <Mic className="w-3 h-3 text-amber-400" />
                      <span>Generar con ElevenLabs API</span>
                    </button>
                  )}
                  <label className="cursor-pointer inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-400 hover:text-white transition-all">
                    <Upload className="w-2.5 h-2.5" />
                    <span>Subir mp3</span>
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

          {/* Footer Navigation, Playback & Screen Recorder Controls */}
          <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
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

            {/* Screen Video Recorder 1-Click Button */}
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <button
                  onClick={stopScreenRecording}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 animate-pulse shadow-lg shadow-rose-900/50"
                  title="Detener la grabación y descargar el video"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>⏹ Detener y Descargar ({formatTimer(recordingSeconds)})</span>
                </button>
              ) : (
                <button
                  onClick={startRecordingAndDemo}
                  className="bg-slate-800 hover:bg-rose-600/30 text-rose-300 hover:text-white border border-rose-500/40 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-sm"
                  title="Graba la pantalla y el audio de la demo completa y descarga el video automáticamente (.webm)"
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>🔴 Grabar Video de la Demo</span>
                </button>
              )}

              <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 pl-2">
                <span className="font-mono text-slate-300">
                  {currentStep.tab.toUpperCase()}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400">
                  Autopilot sincroniza voz y clics en vivo
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
