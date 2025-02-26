
declare const cv: any;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const preprocessImage = async (imageData: ImageData): Promise<{ processedImage: ImageData; boundingBox: BoundingBox | null }> => {
  try {
    // Convert ImageData to Mat
    let src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let processed = new cv.Mat();
    
    try {
      // Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply adaptive thresholding
      cv.adaptiveThreshold(
        gray,
        processed,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );

      // Apply noise reduction
      let denoised = new cv.Mat();
      cv.fastNlMeansDenoising(processed, denoised);
      
      // Find contours for VIN region detection
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(
        denoised,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      let boundingBox: BoundingBox | null = null;
      let maxArea = 0;

      // Look for rectangle-shaped contours with appropriate aspect ratio
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const rect = cv.boundingRect(contour);
        const area = rect.width * rect.height;
        const aspectRatio = rect.width / rect.height;

        // VIN label typically has aspect ratio between 4:1 and 8:1
        if (aspectRatio >= 4 && aspectRatio <= 8 && area > 5000) {
          if (area > maxArea) {
            maxArea = area;
            boundingBox = {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            };
          }
        }
      }

      // Convert processed image back to ImageData
      let processedImageData = new ImageData(
        new Uint8ClampedArray(denoised.data),
        denoised.cols,
        denoised.rows
      );

      // Cleanup OpenCV objects
      contours.delete();
      hierarchy.delete();
      denoised.delete();

      return {
        processedImage: processedImageData,
        boundingBox
      };

    } finally {
      // Ensure we clean up OpenCV objects
      src.delete();
      gray.delete();
      processed.delete();
    }
    
  } catch (error) {
    console.error('Error in preprocessImage:', error);
    // Return original image if processing fails
    return {
      processedImage: imageData,
      boundingBox: null
    };
  }
};

export const cropToVinRegion = (
  canvas: HTMLCanvasElement,
  boundingBox: BoundingBox
): ImageData | null => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Add some padding around the detected region
    const padding = 10;
    const x = Math.max(0, boundingBox.x - padding);
    const y = Math.max(0, boundingBox.y - padding);
    const width = Math.min(canvas.width - x, boundingBox.width + 2 * padding);
    const height = Math.min(canvas.height - y, boundingBox.height + 2 * padding);

    return ctx.getImageData(x, y, width, height);
  } catch (error) {
    console.error('Error in cropToVinRegion:', error);
    return null;
  }
};

export const postProcessVIN = (text: string): string => {
  if (!text) return '';
  
  // Remove spaces and convert to uppercase
  let processedText = text.replace(/\s+/g, '').toUpperCase();

  // Common OCR substitutions
  const substitutions: { [key: string]: string } = {
    'O': '0',
    'I': '1',
    'Q': '0',
    'S': '5',
    'Z': '2',
    '|': '1',
    'B': '8',
    'D': '0'
  };

  // Apply substitutions
  for (const [from, to] of Object.entries(substitutions)) {
    processedText = processedText.replace(new RegExp(from, 'g'), to);
  }

  // Remove any characters that aren't valid in a VIN
  processedText = processedText.replace(/[^A-HJ-NPR-Z0-9]/g, '');

  // Return empty string if not the right length
  if (processedText.length !== 17) return '';

  // Validate first character for North American VINs
  if (/[0-9]/.test(processedText[0])) {
    if (!['1', '2', '3', '4', '5'].includes(processedText[0])) {
      return '';
    }
  }

  return processedText;
};
