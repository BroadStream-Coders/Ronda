export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  fileType = "image/jpeg",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(file);
      }
    }, fileType);
  });
}

export async function centerCropFile(
  file: File,
  aspect: number,
): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = await createImage(url);
    const width = Math.min(image.width, image.height * aspect);
    const height = width / aspect;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(
      image,
      (image.width - width) / 2,
      (image.height - height) / 2,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const type = file.type || "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, 0.92),
    );
    return blob ? new File([blob], file.name, { type }) : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
