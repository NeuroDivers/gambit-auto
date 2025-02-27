
export interface VehicleInfo {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
}

export interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export type ScanMode = 'text' | 'barcode';

export interface VinScannerProps {
  scanMode: ScanMode;
  setIsScanning: (val: boolean) => void;
  addLog: (message: string) => void;
  setTextDetected: (val: boolean) => void;
  setIsFlashOn: (val: boolean) => void;
  setHasFlash: (val: boolean) => void;
  setDetectedVehicle: (vehicle: VehicleInfo | null) => void;
  setIsConfirmationView: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
}

export interface ScannerViewportProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  detectedVehicle: VehicleInfo | null;
  isFlashingRed: boolean;
  textDetected: boolean;
}

export interface ScannerControlsProps {
  scanMode: ScanMode;
  handleScanModeChange: (mode: ScanMode) => void;
  showLogs: boolean;
  setShowLogs: (val: boolean) => void;
}

export interface ManualVinEntryProps {
  handleManualVinSubmit: () => void;
}

export interface LogsViewerProps {
  logs: string[];
  logsEndRef: React.RefObject<HTMLDivElement>;
}

export interface ConfirmationViewProps {
  detectedVehicle: VehicleInfo | null;
  isLoading: boolean;
  vinDetails: {
    country: string;
    manufacturer: string;
    vehicleType: string;
  } | null;
  onTryAgain: () => void;
  onConfirm: () => void;
}
