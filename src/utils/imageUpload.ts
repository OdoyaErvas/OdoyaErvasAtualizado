/**
 * Converte um arquivo de imagem para Data URL comprimida.
 * Redimensiona para no máximo 1200px de largura e comprime como JPEG.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Arquivo não é uma imagem."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Erro ao processar imagem."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Erro ao carregar imagem."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

export function bytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
