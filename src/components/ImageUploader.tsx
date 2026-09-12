import { useRef, useState, useEffect } from "react";
import { Upload, X, Loader2, Link as LinkIcon, ImageIcon } from "lucide-react";
import { compressImage, bytesFromDataUrl, formatBytes } from "../utils/imageUpload";

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
  emojiFallback?: string;
  color?: string;
};

export default function ImageUploader({ value, onChange, emojiFallback = "🌿", color = "#7f4d9c" }: Props) {
  const [mode, setMode] = useState<"upload" | "url">(value?.startsWith("http") || value?.startsWith("/") ? "url" : "upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState(mode === "url" ? value : "");

  useEffect(() => {
    if (mode === "url" && !value) setUrlDraft("");
  }, [mode, value]);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Arquivo muito grande (máximo 8MB).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      onChange(compressed);
      setMode("upload");
    } catch (e: any) {
      setError(e?.message || "Erro ao processar imagem.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    onChange("");
    setUrlDraft("");
    setError(null);
  };

  const sizeInfo = value?.startsWith("data:") ? formatBytes(bytesFromDataUrl(value)) : null;

  return (
    <div className="space-y-3">
      {/* Toggle mode */}
      <div className="flex gap-1 rounded-full bg-plum-50 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 transition ${mode === "upload" ? "bg-plum-700 text-cream-50 shadow" : "text-plum-700 hover:bg-plum-100"}`}
        >
          <Upload size={13} /> Enviar do dispositivo
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 transition ${mode === "url" ? "bg-plum-700 text-cream-50 shadow" : "text-plum-700 hover:bg-plum-100"}`}
        >
          <LinkIcon size={13} /> Colar URL
        </button>
      </div>

      {/* Preview */}
      {value ? (
        <div className="flex items-center gap-3 rounded-2xl border border-plum-100 bg-white p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-50">
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-plum-800">
              {value.startsWith("data:") ? "Imagem enviada" : value.startsWith("/") ? "Imagem local" : "Imagem por URL"}
            </p>
            {sizeInfo && <p className="text-xs text-plum-900/50">Tamanho: {sizeInfo}</p>}
            {!sizeInfo && !value.startsWith("data:") && (
              <p className="truncate text-xs text-plum-900/50">{value}</p>
            )}
          </div>
          <button
            type="button"
            onClick={clear}
            className="rounded-full p-2 text-rose-deep hover:bg-rose-deep/10"
            title="Remover imagem"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-plum-200 bg-cream-50 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl text-3xl" style={{ backgroundColor: `${color}22` }}>
            {emojiFallback}
          </div>
          <p className="flex-1 text-xs text-plum-900/55">
            Nenhuma imagem selecionada. Este emoji será usado como fallback.
          </p>
        </div>
      )}

      {/* Upload area */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragActive ? "border-plum-600 bg-plum-100/50" : "border-plum-200 bg-cream-50 hover:border-plum-400 hover:bg-plum-50/40"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={24} className="animate-spin text-plum-600" />
              <p className="text-sm font-medium text-plum-700">Processando imagem...</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-100 text-plum-700">
                <ImageIcon size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-plum-800">
                  Clique ou arraste uma imagem aqui
                </p>
                <p className="mt-0.5 text-xs text-plum-900/55">
                  PNG, JPG, WEBP · Máx. 8MB · Comprimida automaticamente
                </p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* URL area */}
      {mode === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="/images/prod.jpg ou https://..."
            className="flex-1 rounded-xl border border-plum-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-plum-400"
          />
          <button
            type="button"
            onClick={() => {
              onChange(urlDraft.trim());
            }}
            disabled={!urlDraft.trim()}
            className="rounded-xl bg-plum-700 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-plum-800 disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
      )}

      {error && <p className="rounded-xl bg-rose-deep/10 px-4 py-2.5 text-sm text-rose-deep">{error}</p>}
    </div>
  );
}
