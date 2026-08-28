import { useEffect, useState } from "react";
import { Check, ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

type MediaKind = "image" | "video";

interface MediaUploadProps {
  kind: MediaKind;
  value?: string | null;
  onUploaded: (url: string) => void;
  label?: string;
  maxSizeMb?: number;
}

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];

export function MediaUpload({
  kind,
  value,
  onUploaded,
  label = "Cargar archivo desde tu dispositivo",
  maxSizeMb = kind === "video" ? 100 : 10,
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [localError, setLocalError] = useState("");
  const { uploadFile, isUploading, progress, error } = useUpload();

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const chooseFile = async (file: File) => {
    setLocalError("");
    const accepted = kind === "image" ? imageTypes : videoTypes;
    if (!accepted.includes(file.type)) {
      setLocalError(kind === "image" ? "Usa JPG, PNG, WEBP o AVIF." : "Usa MP4, WEBM o MOV.");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`El archivo debe pesar menos de ${maxSizeMb} MB.`);
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    const uploaded = await uploadFile(file);
    if (uploaded) onUploaded(`/api/storage${uploaded.objectPath}`);
  };

  const displayError = localError || error?.message;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#68727b]">{label}</label>
        <span className="text-[11px] text-[#8b9295]">Máx. {maxSizeMb} MB</span>
      </div>
      <label className={`group relative flex min-h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#AF9275]/60 bg-white px-4 py-5 text-center transition hover:border-[#BB9445] hover:bg-[#fffdf9] ${isUploading ? "pointer-events-none opacity-80" : ""}`}>
        <input
          type="file"
          className="sr-only"
          accept={kind === "image" ? imageTypes.join(",") : videoTypes.join(",")}
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void chooseFile(file);
            event.currentTarget.value = "";
          }}
        />
        {preview && kind === "image" ? (
          <img src={preview} alt={fileName || "Vista previa"} className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:opacity-25" />
        ) : preview && kind === "video" ? (
          <video src={preview} className="absolute inset-0 h-full w-full object-cover opacity-25" muted />
        ) : null}
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#2F4055] text-white shadow-sm">
          {isUploading ? <LoaderCircle className="animate-spin" size={20} /> : kind === "image" ? <ImagePlus size={20} /> : <UploadCloud size={20} />}
        </span>
        <span className="relative mt-3 text-sm font-semibold text-[#2F4055]">
          {isUploading ? `Subiendo… ${progress}%` : preview ? "Elegir otro archivo" : "Seleccionar archivo"}
        </span>
        <span className="relative mt-1 max-w-sm text-xs text-[#68727b]">
          {fileName || (kind === "image" ? "Desde tu computadora o celular" : "MP4, WEBM o MOV desde tu dispositivo")}
        </span>
        {fileType && !isUploading && <span className="relative mt-1 text-[11px] uppercase tracking-wider text-[#8b9295]">{fileType.split("/")[1]}</span>}
        {isUploading && <span className="absolute bottom-0 left-0 h-1 bg-[#BB9445] transition-all" style={{ width: `${progress}%` }} />}
      </label>
      {preview && !isUploading && (
        <div className="flex items-center justify-between rounded-md border border-[#AF9275]/20 bg-[#f8f6f1] px-3 py-2 text-xs text-[#68727b]">
          <span className="flex min-w-0 items-center gap-2 truncate"><Check size={14} className="shrink-0 text-emerald-700" /> Archivo listo para guardar{fileType ? ` · ${fileType.split("/")[1]}` : ""}</span>
          <button type="button" onClick={() => { setPreview(null); setFileName(""); setFileType(""); onUploaded(""); }} className="shrink-0 p-1 text-[#68727b] hover:text-[#A83525]" aria-label="Quitar archivo"><X size={14} /></button>
        </div>
      )}
      {displayError && <p className="text-xs text-[#A83525]">{displayError}</p>}
    </div>
  );
}