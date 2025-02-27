
import { MutableRefObject } from "react";

export type VehicleInfo = {
  vin: string;
  make?: string;
  model?: string;
  year?: string;
};

export type ScanMode = 'text' | 'barcode';

export interface ExtendedTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export interface VinScannerProps {
  scanMode: ScanMode;
  setIsScanning: (isScanning: boolean) => void;
  addLog: (message: string) => void;
  setTextDetected: (detected: boolean) => void;
  setIsFlashOn: (isOn: boolean) => void;
  setHasFlash: (hasFlash: boolean) => void;
  setDetectedVehicle: (vehicle: VehicleInfo | null) => void;
  setIsConfirmationView: (isConfirmationView: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export interface ScannerViewportProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  detectedVehicle: VehicleInfo | null;
  isFlashingRed: MutableRefObject<boolean>;
  textDetected: boolean;
}

export interface ScannerControlsProps {
  scanMode: ScanMode;
  handleScanModeChange: (value: ScanMode) => void;
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
}

export interface LogsViewerProps {
  logs: string[];
  logsEndRef: MutableRefObject<HTMLDivElement | null>;
}

export interface ConfirmationViewProps {
  detectedVehicle: VehicleInfo | null;
  isLoading: boolean;
  vinDetails: any;
  onTryAgain: () => void;
  onConfirm: () => void;
}

export interface ManualVinEntryProps {
  handleManualVinSubmit: () => void;
}
