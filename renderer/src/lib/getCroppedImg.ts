export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
): Promise<Blob> {
  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.setAttribute('crossOrigin', 'anonymous');
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const rotationInRadians = getRadianAngle(rotation);
  const rotatedSize = rotateSize(image.width, image.height, rotation);

  canvas.width = Math.round(rotatedSize.width);
  canvas.height = Math.round(rotatedSize.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotationInRadians);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.round(pixelCrop.width);
  croppedCanvas.height = Math.round(pixelCrop.height);

  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) throw new Error('Failed to get cropped canvas context');

  const imageData = ctx.getImageData(
    Math.round(pixelCrop.x),
    Math.round(pixelCrop.y),
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height),
  );

  croppedCtx.putImageData(imageData, 0, 0);

  return await new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) throw new Error('Canvas is empty');
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}
