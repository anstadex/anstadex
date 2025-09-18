// Helper function to convert a File object to the format required by the Google GenAI SDK,
// resizing and cropping it to fill the target aspect ratio.
export const fileToGenerativePart = async (file: File, targetAspectRatio: string) => {
  const [aspectWidth, aspectHeight] = targetAspectRatio.split(':').map(Number);
  if (isNaN(aspectWidth) || isNaN(aspectHeight) || aspectHeight === 0) {
    throw new Error(`Invalid aspect ratio provided: ${targetAspectRatio}`);
  }
  const targetRatio = aspectWidth / aspectHeight;

  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }

        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalRatio = originalWidth / originalHeight;

        // Use a reasonable max dimension to avoid creating excessively large base64 strings
        const maxDimension = 1024;
        let canvasWidth, canvasHeight;
        
        if (targetRatio >= 1) { // Landscape or square
            canvasWidth = maxDimension;
            canvasHeight = Math.round(maxDimension / targetRatio);
        } else { // Portrait
            canvasHeight = maxDimension;
            canvasWidth = Math.round(maxDimension * targetRatio);
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        let sx, sy, sWidth, sHeight;

        if (originalRatio > targetRatio) {
          // Original image is wider than target, crop horizontally
          sHeight = originalHeight;
          sWidth = originalHeight * targetRatio;
          sx = (originalWidth - sWidth) / 2;
          sy = 0;
        } else {
          // Original image is taller than target, crop vertically
          sWidth = originalWidth;
          sHeight = originalWidth / targetRatio;
          sx = 0;
          sy = (originalHeight - sHeight) / 2;
        }
        
        // Draw the cropped portion of the original image onto the canvas, filling it completely.
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        // Get the base64 string from the canvas
        const dataUrl = canvas.toDataURL(file.type, 0.95); // Use high quality JPEG
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (error) => reject(error);
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Failed to read file as a data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};
