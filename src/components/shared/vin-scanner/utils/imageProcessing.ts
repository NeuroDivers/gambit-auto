
declare const cv: any; // OpenCV.js types

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const preprocessImage = async (imageData: ImageData): Promise<{ processedImage: ImageData; boundingBox: BoundingBox | null }> => {
  try {
    // Convert ImageData to Mat
    const src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let edges = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let binary = new cv.Mat();
    
    // Preprocessing steps
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0);
    cv.Canny(gray, edges, 50, 150);
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Find best rectangle based on VIN characteristics
    let bestRect: BoundingBox | null = null;
    let maxArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);
      const rect = cv.boundingRect(approx);

      const aspectRatio = rect.width / rect.height;
      const area = rect.width * rect.height;

      // Filter based on typical VIN label characteristics:
      // - Aspect ratio between 4.5:1 and 9.5:1
      // - Minimum area to avoid noise
      if (aspectRatio > 4.5 && aspectRatio < 9.5 && area > 5000) {
        if (area > maxArea) {
          maxArea = area;
          bestRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        }
      }
      approx.delete();
      cnt.delete();
    }

    // Apply Otsu's thresholding and morphological operations if region detected
    if (bestRect) {
      const roi = gray.roi(new cv.Rect(bestRect.x, bestRect.y, bestRect.width, bestRect.height));
      cv.threshold(roi, binary, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
      
      // Apply morphological operations to clean up text
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);
      
      // Copy back to the original region
      binary.copyTo(roi);
      kernel.delete();
      roi.delete();
    }
    
    // Create output image with detection visualization
    const output = new cv.Mat();
    cv.cvtColor(gray, output, cv.COLOR_GRAY2RGBA);
    
    // Draw the detected VIN region if found
    if (bestRect) {
      const point1 = new cv.Point(bestRect.x, bestRect.y);
      const point2 = new cv.Point(
        bestRect.x + bestRect.width,
        bestRect.y + bestRect.height
      );
      cv.rectangle(output, point1, point2, [0, 255, 0, 255], 2);
    }
    
    // Convert Mat back to ImageData
    const processedImageData = new ImageData(
      new Uint8ClampedArray(output.data),
      output.cols,
      output.rows
    );
    
    // Cleanup
    src.delete();
    gray.delete();
    edges.delete();
    binary.delete();
    output.delete();
    contours.delete();
    hierarchy.delete();
    
    return {
      processedImage: processedImageData,
      boundingBox: bestRect
    };
  } catch (error) {
    console.error('Image preprocessing failed:', error);
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
    
    // Add padding around the detected region for better OCR
    const padding = {
      x: boundingBox.width * 0.05,  // Reduced horizontal padding
      y: boundingBox.height * 0.3   // Increased vertical padding for better character recognition
    };
    
    const croppedRegion = ctx.getImageData(
      Math.max(0, boundingBox.x - padding.x),
      Math.max(0, boundingBox.y - padding.y),
      Math.min(canvas.width - boundingBox.x, boundingBox.width + padding.x * 2),
      Math.min(canvas.height - boundingBox.y, boundingBox.height + padding.y * 2)
    );
    
    return croppedRegion;
  } catch (error) {
    console.error('Error cropping to VIN region:', error);
    return null;
  }
};

export const postProcessVIN = (vin: string): string => {
  // Common OCR misinterpretation corrections
  const corrections: Record<string, string> = {
    'O': '0', // 'O' is often misread as '0'
    'I': '1', // 'I' is often misread as '1'
    'S': '5', // 'S' is often misread as '5'
    'B': '8', // 'B' can sometimes be misread as '8'
    'G': '6', // 'G' can sometimes be misread as '6'
    'Q': '0', // 'Q' can be misinterpreted as '0'
    '|': '1', // Vertical bar can be misread as '1'
    'Z': '2', // 'Z' can sometimes be misread as '2'
    'D': '0', // 'D' can sometimes be misread as '0'
  };

  let correctedVIN = vin.toUpperCase().trim().replace(/\s/g, '');

  // Replace common errors based on the corrections map
  for (const [wrongChar, correctChar] of Object.entries(corrections)) {
    correctedVIN = correctedVIN.replace(new RegExp(wrongChar, 'g'), correctChar);
  }

  // Early return if length is not 17 after basic corrections
  if (correctedVIN.length !== 17) return '';

  // Check for valid VIN format (only allowed characters)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!vinRegex.test(correctedVIN)) return '';

  // Additional North American specific corrections
  if ('1234567890'.includes(correctedVIN[0])) {
    // If first character is a number but not a valid NA code
    if (!['1', '2', '3', '4', '5'].includes(correctedVIN[0])) {
      if (correctedVIN[0] === '7') correctedVIN = '1' + correctedVIN.slice(1);
      if (correctedVIN[0] === '6') correctedVIN = '5' + correctedVIN.slice(1);
    }
  }

  // Final validation of the corrected VIN
  return vinRegex.test(correctedVIN) ? correctedVIN : '';
};
