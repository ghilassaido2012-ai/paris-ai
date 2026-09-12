import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import Markdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/analyse")({
  head: () => ({
    meta: [
      { title: "Paris AI — Espace d'Analyse Documentaire" },
      {
        name: "description",
        content:
          "Analysez vos documents, images, PDF et fichiers de données avec la puissance multimodale de Paris AI.",
      },
      { property: "og:title", content: "Paris AI — Analyse de documents" },
      {
        property: "og:description",
        content: "Extraction d'insights, résumés et analyses approfondies de fichiers.",
      },
    ],
  }),
  component: Analyse,
});

type UploadedDoc = {
  name: string;
  size: string;
  type: string;
  dataUrl: string;
  analysis?: string;
  timestamp: number;
};

function Analyse() {
  const [activeFile, setActiveFile] = useState<UploadedDoc | null>(null);
  const [fileHistory, setFileHistory] = useState<UploadedDoc[]>([]);
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const doc: UploadedDoc = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type || "application/octet-stream",
        dataUrl: reader.result as string,
        timestamp: Date.now(),
      };
      setActiveFile(doc);
      setFileHistory((prev) => [doc, ...prev]);
      runAnalysis(
        doc,
        "Fais une analyse synthétique et structurée de ce document : points clés, résumé exécutif et recommandations.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const runAnalysis = async (doc: UploadedDoc, customPrompt?: string) => {
    const p =
      customPrompt || question || "Analyse ce document en détail et dégage les points clés.";
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: doc.dataUrl,
          mimeType: doc.type,
          prompt: p,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Échec de l'analyse.");
      }

      const data = await res.json();
      const resultText = data.analysis || "Aucune analyse retournée.";

      const updatedDoc = { ...doc, analysis: resultText };
      setActiveFile(updatedDoc);
      setFileHistory((prev) => prev.map((f) => (f.timestamp === doc.timestamp ? updatedDoc : f)));
      setQuestion("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      setErrorMessage(msg || "Erreur lors de l'analyse.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (activeFile?.analysis) {
      navigator.clipboard.writeText(activeFile.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppShell title="Paris AI — Analyse Documentaire" showAmbientGlow>
      <main className="relative flex h-full flex-1 flex-col overflow-y-auto px-sm pb-24 pt-md md:px-lg">
        <div className="mx-auto flex w-full max-w-[950px] flex-col gap-6">
          {/* Header */}
          <div className="text-center md:text-left">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">
              Espace de Travail Documentaire
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Importez vos fichiers (PDF, PNG, JPG, CSV, TXT) et laissez Paris AI les analyser en
              profondeur.
            </p>
          </div>

          {/* Dropzone Area */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/*,.csv,.txt,.json,.md"
            className="hidden"
          />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-lowest/50 p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-surface-container hover:shadow-[0_0_30px_rgba(99,102,241,0.08)]"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
              <MaterialIcon name="cloud_upload" className="text-[30px]" />
            </div>
            <h3 className="mb-1 text-base font-bold text-on-surface">
              Glissez-déposez vos fichiers ici
            </h3>
            <p className="mb-4 max-w-sm text-xs text-on-surface-variant">
              Supporte PDF, PNG, JPG, CSV, TXT. L'analyse est traitée de manière sécurisée.
            </p>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <MaterialIcon name="add" className="text-[18px]" />
              Choisir un fichier
            </button>
          </div>

          {/* Active File Analysis Card */}
          {activeFile && (
            <div className="glass-card flex flex-col gap-4 rounded-2xl border border-primary/30 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <MaterialIcon
                      name={
                        activeFile.type.includes("image")
                          ? "image"
                          : activeFile.type.includes("pdf")
                            ? "picture_as_pdf"
                            : "description"
                      }
                      className="text-[20px]"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface truncate max-w-xs md:max-w-md">
                      {activeFile.name}
                    </h4>
                    <span className="text-xs text-on-surface-variant">
                      {activeFile.size} • Prêt pour l'analyse
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFile.analysis && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded-lg border border-outline-variant/20 px-2.5 py-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <MaterialIcon
                        name={copied ? "check" : "content_copy"}
                        className="text-[14px]"
                      />
                      <span>{copied ? "Copié" : "Copier"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveFile(null)}
                    className="text-xs text-on-surface-variant hover:text-error"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Analysis Result */}
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <MaterialIcon
                    name="auto_awesome"
                    className="animate-spin text-3xl text-primary"
                  />
                  <p className="text-xs font-semibold text-primary">
                    Paris AI examine le document et extrait les informations clés...
                  </p>
                </div>
              ) : activeFile.analysis ? (
                <div className="prose prose-invert max-w-none text-sm text-on-surface leading-relaxed [&_code]:rounded [&_code]:bg-surface-container-lowest [&_code]:px-1 [&_code]:font-mono [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                  <Markdown>{activeFile.analysis}</Markdown>
                </div>
              ) : null}

              {/* Follow-up question input */}
              <div className="mt-2 flex items-center gap-2 border-t border-outline-variant/10 pt-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runAnalysis(activeFile)}
                  placeholder="Posez une question spécifique sur ce document..."
                  className="flex-1 rounded-xl border border-outline-variant/30 bg-surface-container/60 px-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => runAnalysis(activeFile)}
                  disabled={isAnalyzing || !question.trim()}
                  className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-container disabled:opacity-50"
                >
                  <MaterialIcon name="send" className="text-[16px]" />
                  <span>Demander</span>
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
              {errorMessage}
            </div>
          )}

          {/* Recent Files */}
          {fileHistory.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Fichiers analysés dans cette session ({fileHistory.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fileHistory.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveFile(file)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container p-3 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MaterialIcon name="insert_drive_file" className="text-primary" />
                      <span className="text-xs font-medium text-on-surface truncate">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
