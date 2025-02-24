
# VIN Scanner Component

This component provides a versatile VIN (Vehicle Identification Number) scanner with both text OCR and barcode/QR code scanning capabilities.

## Dependencies

Make sure to install these dependencies in your project:

```bash
npm install tesseract.js @zxing/library lucide-react sonner
```

## Required UI Components

The component uses these shadcn/ui components:
- Button
- Dialog
- ToggleGroup

## Features

- Text OCR scanning using Tesseract.js
- Barcode/QR code scanning using ZXing
- Camera access with environment facing preference
- Real-time scanning feedback
- Input validation for VIN format
- Responsive design
- Debug logging display

## Usage

```tsx
import { VinScanner } from './components/vin-scanner/VinScanner'

function MyComponent() {
  const handleVinScanned = (vin: string) => {
    console.log('Scanned VIN:', vin)
  }

  return <VinScanner onScan={handleVinScanned} />
}
```

## Notes

- The scanner automatically requests camera permissions
- Supports both printed VIN text and VIN barcodes/QR codes
- Validates VIN format before accepting the scan
- Provides visual feedback for scan positioning
- Shows real-time debug logs
