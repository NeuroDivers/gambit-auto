
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
    const dst = new cv.Mat();
    
    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    
    // Apply Gaussian blur to reduce noise
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(dst, dst, ksize, 0);
    
    // Apply adaptive thresholding
    cv.adaptiveThreshold(
      dst,
      dst,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2
    );
    
    // Find edges using Canny
    cv.Canny(dst, dst, 50, 150);
    
    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      dst,
      contours,
      hierarchy,
      cv.RETR_LIST,
      cv.CHAIN_APPROX_SIMPLE
    );
    
    // Find the most likely VIN rectangle
    let maxRect: BoundingBox | null = null;
    let maxScore = 0;
    
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour);
      
      // VIN aspect ratio is typically around 8:1 to 10:1
      const aspectRatio = rect.width / rect.height;
      
      // Score the rectangle based on aspect ratio and size
      if (aspectRatio >= 6 && aspectRatio <= 12) {
        const area = rect.width * rect.height;
        const score = area * (1 - Math.abs(9 - aspectRatio) / 9);
        
        if (score > maxScore) {
          maxScore = score;
          maxRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        }
      }
      
      contour.delete();
    }
    
    // Create output image
    const output = new cv.Mat();
    cv.cvtColor(dst, output, cv.COLOR_GRAY2RGBA);
    
    // Draw the detected VIN region if found
    if (maxRect) {
      const point1 = new cv.Point(maxRect.x, maxRect.y);
      const point2 = new cv.Point(
        maxRect.x + maxRect.width,
        maxRect.y + maxRect.height
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
    dst.delete();
    output.delete();
    contours.delete();
    hierarchy.delete();
    
    return {
      processedImage: processedImageData,
      boundingBox: maxRect
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
    
    // Add padding around the detected region
    const padding = {
      x: boundingBox.width * 0.1,
      y: boundingBox.height * 0.5
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
