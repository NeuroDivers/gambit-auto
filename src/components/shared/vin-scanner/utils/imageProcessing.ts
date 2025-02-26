
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
