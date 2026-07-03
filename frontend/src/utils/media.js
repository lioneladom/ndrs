const IMAGE_MAX_DIMENSION = 1600;
const IMAGE_QUALITY = 0.78;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function loadImage(file) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to load image'));
    };
    img.src = url;
  });
}

export async function compressReportImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  const image = await loadImage(file);
  const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  if (typeof image.close === 'function') {
    image.close();
  }

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, outputType === 'image/jpeg' ? IMAGE_QUALITY : undefined);

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const extension = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'report-photo';

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export async function prepareReportMedia(files) {
  return Promise.all(
    Array.from(files).map((file) => (
      file.type.startsWith('image/') ? compressReportImage(file).catch(() => file) : file
    ))
  );
}
