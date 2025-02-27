import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { PageTitle } from "@/components/shared/PageTitle";
import { CheckSquare, Square } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface ProcessingSettings {
  autoInvert: boolean;
  autoInvertDark: boolean;
  edgeEnhancement: boolean;
  noiseReduction: boolean;
  adaptiveContrast: boolean;
  deskewing: boolean;
  angleCorrection: boolean;
  grayscaleMethod: 'luminosity' | 'average' | 'blue-channel' | 'green-channel' | 'red-channel';
  blueEmphasis: 'zero' | 'normal' | 'high' | 'very-high';
  thresholdMethod: 'global' | 'adaptive' | 'otsu';
  thresholdValue: number;
  adaptiveBlockSize: number;
  adaptiveConstant: number;
  contrastAdjustment: number;
  brightnessAdjustment: number;
  sharpenAmount: number;
  tesseractConfig: {
    psm: number;
    oem: number;
    whitelist: string;
    blacklist: string;
    minConfidence: number;
  };
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  settings: ProcessingSettings;
}

const defaultPresets: Preset[] = [
  {
    id: "default",
    name: "Default",
    description: "Balanced settings for most VIN scanning scenarios",
    isDefault: true,
    settings: {
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: false,
      angleCorrection: false,
      grayscaleMethod: 'luminosity',
      blueEmphasis: 'normal',
      thresholdMethod: 'adaptive',
      thresholdValue: 127,
      adaptiveBlockSize: 11,
      adaptiveConstant: 2,
      contrastAdjustment: 0,
      brightnessAdjustment: 0,
      sharpenAmount: 0.5,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 60
      }
    }
  },
  {
    id: "windshield",
    name: "Windshield VIN",
    description: "Optimized for reading VINs through windshield glass",
    settings: {
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: true,
      angleCorrection: true,
      grayscaleMethod: 'blue-channel',
      blueEmphasis: 'high',
      thresholdMethod: 'adaptive',
      thresholdValue: 127,
      adaptiveBlockSize: 15,
      adaptiveConstant: 5,
      contrastAdjustment: 20,
      brightnessAdjustment: 10,
      sharpenAmount: 0.7,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 50
      }
    }
  },
  {
    id: "low-light",
    name: "Low Light",
    description: "Enhanced for poor lighting conditions",
    settings: {
      autoInvert: true,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: false,
      angleCorrection: false,
      grayscaleMethod: 'luminosity',
      blueEmphasis: 'normal',
      thresholdMethod: 'adaptive',
      thresholdValue: 100,
      adaptiveBlockSize: 19,
      adaptiveConstant: 3,
      contrastAdjustment: 30,
      brightnessAdjustment: 20,
      sharpenAmount: 0.6,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 40
      }
    }
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "For VINs with strong contrast against background",
    settings: {
      autoInvert: false,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: false,
      adaptiveContrast: false,
      deskewing: false,
      angleCorrection: false,
      grayscaleMethod: 'luminosity',
      blueEmphasis: 'zero',
      thresholdMethod: 'global',
      thresholdValue: 140,
      adaptiveBlockSize: 11,
      adaptiveConstant: 2,
      contrastAdjustment: 40,
      brightnessAdjustment: 0,
      sharpenAmount: 0.4,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 70
      }
    }
  },
  {
    id: "metal-plate",
    name: "Metal Plate",
    description: "Optimized for stamped metal VIN plates",
    settings: {
      autoInvert: false,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: true,
      angleCorrection: true,
      grayscaleMethod: 'blue-channel',
      blueEmphasis: 'high',
      thresholdMethod: 'adaptive',
      thresholdValue: 127,
      adaptiveBlockSize: 13,
      adaptiveConstant: 4,
      contrastAdjustment: 25,
      brightnessAdjustment: 5,
      sharpenAmount: 0.8,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 55
      }
    }
  },
  {
    id: "sticker",
    name: "Sticker VIN",
    description: "For printed sticker VINs (door jamb, etc.)",
    settings: {
      autoInvert: false,
      autoInvertDark: false,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: true,
      angleCorrection: false,
      grayscaleMethod: 'luminosity',
      blueEmphasis: 'normal',
      thresholdMethod: 'otsu',
      thresholdValue: 127,
      adaptiveBlockSize: 11,
      adaptiveConstant: 2,
      contrastAdjustment: 10,
      brightnessAdjustment: 0,
      sharpenAmount: 0.5,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 65
      }
    }
  },
  {
    id: "faded",
    name: "Faded Text",
    description: "For worn or faded VIN characters",
    settings: {
      autoInvert: true,
      autoInvertDark: true,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: false,
      angleCorrection: false,
      grayscaleMethod: 'blue-channel',
      blueEmphasis: 'very-high',
      thresholdMethod: 'adaptive',
      thresholdValue: 110,
      adaptiveBlockSize: 21,
      adaptiveConstant: 5,
      contrastAdjustment: 35,
      brightnessAdjustment: 15,
      sharpenAmount: 0.9,
      tesseractConfig: {
        psm: 7,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 45
      }
    }
  },
  {
    id: "high-precision",
    name: "High Precision",
    description: "Slower but more accurate scanning",
    settings: {
      autoInvert: true,
      autoInvertDark: true,
      edgeEnhancement: true,
      noiseReduction: true,
      adaptiveContrast: true,
      deskewing: true,
      angleCorrection: true,
      grayscaleMethod: 'luminosity',
      blueEmphasis: 'normal',
      thresholdMethod: 'adaptive',
      thresholdValue: 127,
      adaptiveBlockSize: 17,
      adaptiveConstant: 3,
      contrastAdjustment: 15,
      brightnessAdjustment: 5,
      sharpenAmount: 0.6,
      tesseractConfig: {
        psm: 6,
        oem: 1,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 75
      }
    }
  },
  {
    id: "fast-scan",
    name: "Fast Scan",
    description: "Quicker but less accurate scanning",
    settings: {
      autoInvert: false,
      autoInvertDark: false,
      edgeEnhancement: false,
      noiseReduction: false,
      adaptiveContrast: false,
      deskewing: false,
      angleCorrection: false,
      grayscaleMethod: 'average',
      blueEmphasis: 'zero',
      thresholdMethod: 'global',
      thresholdValue: 127,
      adaptiveBlockSize: 11,
      adaptiveConstant: 2,
      contrastAdjustment: 0,
      brightnessAdjustment: 0,
      sharpenAmount: 0,
      tesseractConfig: {
        psm: 7,
        oem: 0,
        whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
        blacklist: "IOQ",
        minConfidence: 50
      }
    }
  }
];

export default function DeveloperSettings() {
  const [settings, setSettings] = useState<ProcessingSettings>({
    autoInvert: true,
    autoInvertDark: false,
    edgeEnhancement: true,
    noiseReduction: true,
    adaptiveContrast: true,
    deskewing: false,
    angleCorrection: false,
    grayscaleMethod: 'luminosity',
    blueEmphasis: 'normal',
    thresholdMethod: 'adaptive',
    thresholdValue: 127,
    adaptiveBlockSize: 11,
    adaptiveConstant: 2,
    contrastAdjustment: 0,
    brightnessAdjustment: 0,
    sharpenAmount: 0.5,
    tesseractConfig: {
      psm: 7,
      oem: 1,
      whitelist: "0123456789ABCDEFGHJKLMNPRSTUVWXYZ",
      blacklist: "IOQ",
      minConfidence: 60
    }
  });

  const [presets, setPresets] = useState<Preset[]>(defaultPresets);
  const [activePresetId, setActivePresetId] = useState<string>("default");
  const [newPresetName, setNewPresetName] = useState<string>("");

  useEffect(() => {
    // Load presets from localStorage
    const savedPresets = localStorage.getItem('vin-scanner-presets');
    if (savedPresets) {
      try {
        const parsedPresets = JSON.parse(savedPresets);
        setPresets(parsedPresets);
      } catch (e) {
        console.error("Failed to parse saved presets", e);
        setPresets(defaultPresets);
      }
    }

    // Load active preset
    const savedActivePresetId = localStorage.getItem('vin-scanner-active-preset');
    if (savedActivePresetId) {
      setActivePresetId(savedActivePresetId);
    }

    // Load settings
    const savedSettings = localStorage.getItem('vin-scanner-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('vin-scanner-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Save active preset ID
    localStorage.setItem('vin-scanner-active-preset', activePresetId);
  }, [activePresetId]);

  useEffect(() => {
    // Save presets to localStorage
    localStorage.setItem('vin-scanner-presets', JSON.stringify(presets));
  }, [presets]);

  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSettings({ ...preset.settings });
      setActivePresetId(presetId);
      toast.success(`Loaded preset: ${preset.name}`);
    }
  };

  const savePreset = () => {
    if (newPresetName.trim() === "") {
      toast.error("Please enter a preset name");
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      settings: { ...settings }
    };

    setPresets([...presets, newPreset]);
    setActivePresetId(newPreset.id);
    setNewPresetName("");
    toast.success(`Saved new preset: ${newPresetName}`);
  };

  const deletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    if (preset.isDefault) {
      toast.error("Cannot delete default presets");
      return;
    }

    const newPresets = presets.filter(p => p.id !== presetId);
    setPresets(newPresets);

    if (activePresetId === presetId) {
      // If we deleted the active preset, switch to default
      const defaultPreset = newPresets.find(p => p.isDefault) || newPresets[0];
      if (defaultPreset) {
        setActivePresetId(defaultPreset.id);
        setSettings({ ...defaultPreset.settings });
      }
    }

    toast.success(`Deleted preset: ${preset.name}`);
  };

  const resetToDefaults = () => {
    setPresets(defaultPresets);
    const defaultPreset = defaultPresets.find(p => p.isDefault);
    if (defaultPreset) {
      setActivePresetId(defaultPreset.id);
      setSettings({ ...defaultPreset.settings });
    }
    localStorage.removeItem('vin-scanner-presets');
    localStorage.removeItem('vin-scanner-settings');
    localStorage.removeItem('vin-scanner-active-preset');
    toast.success("Reset all settings to defaults");
  };

  const getActivePresetName = () => {
    const preset = presets.find(p => p.id === activePresetId);
    return preset ? preset.name : "Custom";
  };

  const getActivePresetDescription = () => {
    const preset = presets.find(p => p.id === activePresetId);
    return preset?.description || "";
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="Developer Settings" description="Advanced configuration for VIN scanning" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">VIN Scanner Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure image processing and OCR parameters for optimal VIN detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Preset Selection</Label>
        <ScrollArea className="h-[400px] border rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <Card 
                key={preset.id} 
                className={`cursor-pointer transition-all hover:bg-primary/10 hover:border-primary ${
                  activePresetId === preset.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => loadPreset(preset.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="pt-0.5">
                      {activePresetId === preset.id ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{preset.name}</div>
                      {preset.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{preset.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {preset.isDefault && "(Default) "}
                        PSM: {preset.settings.tesseractConfig.psm}, 
                        OEM: {preset.settings.tesseractConfig.oem}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <div className="text-xs">
          <p className="text-muted-foreground">
            Current: {getActivePresetName()}
          </p>
          {getActivePresetDescription() && (
            <p className="text-muted-foreground mt-1">
              {getActivePresetDescription()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <Label className="text-base font-medium">Image Processing Features</Label>
            <div className="space-y-4">
              {[
                {
                  id: "auto-invert",
                  label: "Auto Invert Light Text",
                  description: "Automatically invert light text on dark background",
                  checked: settings.autoInvert,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, autoInvert: checked }))
                },
                {
                  id: "auto-invert-dark",
                  label: "Auto Invert Dark Text",
                  description: "Automatically invert dark text on light background",
                  checked: settings.autoInvertDark,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, autoInvertDark: checked }))
                },
                {
                  id: "edge-enhancement",
                  label: "Edge Enhancement",
                  description: "Apply unsharp masking for better edge definition",
                  checked: settings.edgeEnhancement,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, edgeEnhancement: checked }))
                },
                {
                  id: "noise-reduction",
                  label: "Noise Reduction",
                  description: "Apply median filter to remove noise",
                  checked: settings.noiseReduction,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, noiseReduction: checked }))
                },
                {
                  id: "adaptive-contrast",
                  label: "Adaptive Contrast",
                  description: "Dynamically adjust contrast based on local area",
                  checked: settings.adaptiveContrast,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, adaptiveContrast: checked }))
                },
                {
                  id: "deskewing",
                  label: "Deskewing",
                  description: "Automatically correct skewed text",
                  checked: settings.deskewing,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, deskewing: checked }))
                },
                {
                  id: "angle-correction",
                  label: "Angle Correction",
                  description: "Use Hough transform to correct rotation",
                  checked: settings.angleCorrection,
                  onChange: (checked: boolean) => setSettings(prev => ({ ...prev, angleCorrection: checked }))
                }
              ].map((feature) => (
                <div key={feature.id} className="flex items-center justify-between">
                  <Label htmlFor={feature.id} className="flex-1">
                    {feature.label}
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </Label>
                  <Switch
                    id={feature.id}
                    checked={feature.checked}
                    onCheckedChange={feature.onChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Replace RadioGroup with Toggle buttons for Grayscale Method */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Grayscale Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'luminosity', label: 'Luminosity (Default)' },
                { value: 'average', label: 'Average' },
                { value: 'blue-channel', label: 'Blue Channel Only' },
                { value: 'green-channel', label: 'Green Channel' },
                { value: 'red-channel', label: 'Red Channel' }
              ].map((method) => (
                <Toggle
                  key={method.value}
                  pressed={settings.grayscaleMethod === method.value}
                  onPressedChange={() => 
                    setSettings(prev => ({ 
                      ...prev, 
                      grayscaleMethod: method.value as typeof settings.grayscaleMethod 
                    }))
                  }
                  className={`${
                    settings.grayscaleMethod === method.value 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : ''
                  }`}
                >
                  {method.label}
                </Toggle>
              ))}
            </div>
          </div>

          {/* Replace RadioGroup with Toggle buttons for Blue Emphasis */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Blue Channel Emphasis</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'zero', label: 'Zero (0.33)' },
                { value: 'normal', label: 'Normal (0.5)' },
                { value: 'high', label: 'High (0.7)' },
                { value: 'very-high', label: 'Very High (0.8)' }
              ].map((emphasis) => (
                <Toggle
                  key={emphasis.value}
                  pressed={settings.blueEmphasis === emphasis.value}
                  onPressedChange={() => 
                    setSettings(prev => ({ 
                      ...prev, 
                      blueEmphasis: emphasis.value as typeof settings.blueEmphasis 
                    }))
                  }
                  className={`${
                    settings.blueEmphasis === emphasis.value 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                      : ''
                  }`}
                >
                  {emphasis.label}
                </Toggle>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <Label className="text-base font-medium">Thresholding</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Threshold Method</Label>
                <RadioGroup
                  value={settings.thresholdMethod}
                  onValueChange={(value) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      thresholdMethod: value as typeof settings.thresholdMethod 
                    }))
                  }
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="global" id="global" />
                    <Label htmlFor="global">Global</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adaptive" id="adaptive" />
                    <Label htmlFor="adaptive">Adaptive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="otsu" id="otsu" />
                    <Label htmlFor="otsu">Otsu</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="threshold-value">Threshold Value</Label>
                  <span className="text-sm">{settings.thresholdValue}</span>
                </div>
                <Slider
                  id="threshold-value"
                  min={0}
                  max={255}
                  step={1}
                  value={[settings.thresholdValue]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, thresholdValue: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="adaptive-block-size">Adaptive Block Size</Label>
                  <span className="text-sm">{settings.adaptiveBlockSize}</span>
                </div>
                <Slider
                  id="adaptive-block-size"
                  min={3}
                  max={51}
                  step={2}
                  value={[settings.adaptiveBlockSize]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, adaptiveBlockSize: value }))
                  }
                  disabled={settings.thresholdMethod !== 'adaptive'}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="adaptive-constant">Adaptive Constant</Label>
                  <span className="text-sm">{settings.adaptiveConstant}</span>
                </div>
                <Slider
                  id="adaptive-constant"
                  min={0}
                  max={20}
                  step={1}
                  value={[settings.adaptiveConstant]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, adaptiveConstant: value }))
                  }
                  disabled={settings.thresholdMethod !== 'adaptive'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Image Adjustments</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="contrast-adjustment">Contrast Adjustment</Label>
                  <span className="text-sm">{settings.contrastAdjustment}%</span>
                </div>
                <Slider
                  id="contrast-adjustment"
                  min={-50}
                  max={50}
                  step={1}
                  value={[settings.contrastAdjustment]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, contrastAdjustment: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="brightness-adjustment">Brightness Adjustment</Label>
                  <span className="text-sm">{settings.brightnessAdjustment}%</span>
                </div>
                <Slider
                  id="brightness-adjustment"
                  min={-50}
                  max={50}
                  step={1}
                  value={[settings.brightnessAdjustment]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, brightnessAdjustment: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sharpen-amount">Sharpen Amount</Label>
                  <span className="text-sm">{settings.sharpenAmount.toFixed(1)}</span>
                </div>
                <Slider
                  id="sharpen-amount"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[settings.sharpenAmount]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ ...prev, sharpenAmount: value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 border-b pb-4">
            <Label className="text-base font-medium">Tesseract OCR Configuration</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="psm">Page Segmentation Mode (PSM)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="psm"
                    type="number"
                    min={0}
                    max={13}
                    value={settings.tesseractConfig.psm}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        tesseractConfig: {
                          ...prev.tesseractConfig,
                          psm: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    (0-13, 7=single line, 6=single block)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oem">OCR Engine Mode (OEM)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="oem"
                    type="number"
                    min={0}
                    max={3}
                    value={settings.tesseractConfig.oem}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        tesseractConfig: {
                          ...prev.tesseractConfig,
                          oem: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    (0=legacy, 1=LSTM, 2=both)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whitelist">Character Whitelist</Label>
                <Input
                  id="whitelist"
                  value={settings.tesseractConfig.whitelist}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      tesseractConfig: {
                        ...prev.tesseractConfig,
                        whitelist: e.target.value
                      }
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Characters to recognize (VINs use 0-9, A-Z except I,O,Q)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blacklist">Character Blacklist</Label>
                <Input
                  id="blacklist"
                  value={settings.tesseractConfig.blacklist}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      tesseractConfig: {
                        ...prev.tesseractConfig,
                        blacklist: e.target.value
                      }
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Characters to exclude (typically I,O,Q for VINs)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="min-confidence">Minimum Confidence (%)</Label>
                  <span className="text-sm">{settings.tesseractConfig.minConfidence}%</span>
                </div>
                <Slider
                  id="min-confidence"
                  min={0}
                  max={100}
                  step={1}
                  value={[settings.tesseractConfig.minConfidence]}
                  onValueChange={([value]) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      tesseractConfig: {
                        ...prev.tesseractConfig,
                        minConfidence: value
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Save Custom Preset</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Preset name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <Button onClick={savePreset} disabled={!newPresetName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Manage Presets</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>
        <TabsContent value="presets" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((preset) => (
                <Card key={preset.id}>
                  <CardContent className="pt-6 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{preset.name}</h4>
                      {preset.description && (
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                      )}
                      {preset.isDefault && (
                        <p className="text-xs text-muted-foreground mt-1">Default preset</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => loadPreset(preset.id)}
                      >
                        Load
                      </Button>
                      {!preset.isDefault && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deletePreset(preset.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="debug" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Settings</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
