import { useState, useEffect, useRef } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceChatModal({ isOpen, onClose }: VoiceChatModalProps) {
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "speaking" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [transcripts, setTranscripts] = useState<Array<{ sender: "user" | "model"; text: string }>>(
    [],
  );
  const [inputText, setInputText] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setStatus("idle");
  };

  const playNextInQueue = async (ctx: AudioContext) => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setStatus("listening");
      return;
    }

    isPlayingRef.current = true;
    setStatus("speaking");
    const rawBuffer = audioQueueRef.current.shift()!;

    try {
      // Decode 24kHz or 16kHz PCM audio or WAV
      const pcm16 = new Int16Array(rawBuffer);
      const audioBuffer = ctx.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        playNextInQueue(ctx);
      };
      source.start();
    } catch (e) {
      console.warn("Error playing audio chunk:", e);
      playNextInQueue(ctx);
    }
  };

  const startVoiceSession = async () => {
    try {
      setStatus("connecting");
      setErrorMessage("");

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const loc = window.location;
      const wsProtocol = loc.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${loc.host}/live`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setStatus("listening");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
            },
          });
          mediaStreamRef.current = stream;

          const source = ctx.createMediaStreamSource(stream);
          const processor = ctx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32Array to 16-bit PCM
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            const bytes = new Uint8Array(pcm16.buffer);
            let binary = "";
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            ws.send(JSON.stringify({ audio: base64 }));
          };

          source.connect(processor);
          processor.connect(ctx.destination);
        } catch (micErr: unknown) {
          const msg = micErr instanceof Error ? micErr.message : String(micErr);
          console.warn("Microphone access unavailable or denied:", msg);
          setErrorMessage(
            "Microphone non accessible. Vous pouvez envoyer des messages vocaux par texte ci-dessous.",
          );
          setStatus("listening");
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setErrorMessage(data.error);
            setStatus("error");
          }

          if (data.text) {
            setTranscripts((prev) => [...prev, { sender: "model", text: data.text }]);
          }

          if (data.audio) {
            // Received base64 audio data
            const binary = atob(data.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            audioQueueRef.current.push(bytes.buffer);
            if (!isPlayingRef.current) {
              playNextInQueue(ctx);
            }
          }

          if (data.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setStatus("listening");
          }
        } catch (err) {
          console.error("Failed to parse websocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("Live WebSocket error:", err);
        setErrorMessage("Erreur de connexion avec le serveur vocal.");
        setStatus("error");
      };

      ws.onclose = () => {
        if (status !== "idle") {
          setStatus("idle");
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Voice start error:", msg);
      setErrorMessage(msg || "Erreur lors du démarrage vocal.");
      setStatus("error");
    }
  };

  const sendTextQuery = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;

    setTranscripts((prev) => [...prev, { sender: "user", text: q }]);
    setInputText("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: q }));
    } else {
      // Fallback via /api/chat + /api/tts
      setStatus("speaking");
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          model: "gemini-3.5-flash",
          systemInstruction:
            "Tu es Paris, l'assistant vocal intelligent. Réponds en une ou deux phrases courtes, fluides et naturelles en français.",
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.text) {
            setTranscripts((prev) => [...prev, { sender: "model", text: data.text }]);

            // Synthesize voice
            try {
              const ttsRes = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: data.text }),
              });
              const ttsData = await ttsRes.json();
              if (ttsData.audioData) {
                const audio = new Audio(`data:audio/mp3;base64,${ttsData.audioData}`);
                audio.play();
              }
            } catch (ttsErr) {
              console.warn("TTS failed:", ttsErr);
            }
          }
          setStatus("listening");
        })
        .catch((err) => {
          console.error("Fallback chat error:", err);
          setStatus("listening");
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex w-[94vw] max-w-[480px] min-w-[300px] sm:w-[480px] flex-col overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-high/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
              <MaterialIcon name="graphic_eq" className="text-[20px]" />
            </div>
            <div>
              <h3 className="font-headline-lg-mobile text-base font-bold text-on-surface">
                Paris AI Vocal (Live API)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Modèle : gemini-3.1-flash-live-preview
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-variant/50"
            aria-label="Fermer"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        {/* Visualizer & Status Area */}
        <div className="my-8 flex flex-col items-center justify-center gap-6">
          <div className="relative flex h-36 w-36 items-center justify-center">
            {/* Pulsing rings */}
            <div
              className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-700 ${
                status === "listening" || status === "speaking"
                  ? "animate-ping opacity-60"
                  : "scale-90 opacity-20"
              }`}
            />
            <div
              className={`absolute inset-3 rounded-full bg-gradient-to-tr from-primary to-secondary transition-transform duration-300 ${
                status === "speaking"
                  ? "scale-110 shadow-[0_0_40px_rgba(128,131,255,0.6)]"
                  : status === "listening"
                    ? "scale-105 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                    : "scale-100 opacity-80"
              }`}
            />
            <button
              onClick={() => {
                if (status === "idle" || status === "error") {
                  startVoiceSession();
                } else {
                  cleanup();
                }
              }}
              className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <MaterialIcon
                name={
                  status === "speaking"
                    ? "volume_up"
                    : status === "listening"
                      ? "mic"
                      : status === "connecting"
                        ? "hourglass_empty"
                        : "mic_none"
                }
                className="text-[36px]"
              />
            </button>
          </div>

          <div className="text-center">
            <span className="font-label-md text-sm font-semibold uppercase tracking-wider text-primary">
              {status === "speaking"
                ? "Paris vous répond..."
                : status === "listening"
                  ? "À l'écoute en direct..."
                  : status === "connecting"
                    ? "Connexion au flux vocal..."
                    : status === "error"
                      ? "Erreur de connexion"
                      : "Appuyez pour démarrer"}
            </span>
            {errorMessage && <p className="mt-2 text-xs text-error">{errorMessage}</p>}
          </div>
        </div>

        {/* Transcripts preview */}
        {transcripts.length > 0 && (
          <div className="mb-4 max-h-36 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-low/50 p-3 text-xs leading-relaxed text-on-surface-variant no-scrollbar">
            {transcripts.slice(-4).map((t, idx) => (
              <div key={idx} className="mb-1.5 last:mb-0">
                <span className="font-bold text-primary">
                  {t.sender === "user" ? "Vous : " : "Paris : "}
                </span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Voice Starters */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {[
            "Bonjour Paris, comment vas-tu ?",
            "Raconte-moi une anecdote fascinante sur l'espace.",
            "Quelles sont les trois priorités pour réussir un projet ?",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                if (status === "idle") {
                  startVoiceSession().then(() => sendTextQuery(prompt));
                } else {
                  sendTextQuery(prompt);
                }
              }}
              className="rounded-full border border-outline-variant/20 bg-surface-container/60 px-3 py-1 text-xs text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Fallback Text Input */}
        <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendTextQuery()}
            placeholder="Écrivez ou posez une question..."
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
          <button
            onClick={() => sendTextQuery()}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-on-primary transition-transform hover:scale-105 active:scale-95"
          >
            <MaterialIcon name="arrow_upward" className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
