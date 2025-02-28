
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsSelectorProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export function SettingsSelector({ settings, onSettingsChange }: SettingsSelectorProps) {
  const [currentSettings, setCurrentSettings] = useState(settings);

  useEffect(() => {
    onSettingsChange(currentSettings);
  }, [currentSettings, onSettingsChange]);

  const updateSetting = (key: string, value: any) => {
    setCurrentSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="morphological">Morphological</TabsTrigger>
        <TabsTrigger value="ocr">OCR</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-invert">Auto Invert Light Text</Label>
                <Switch
                  id="auto-invert"
                  checked={currentSettings.autoInvert}
                  onCheckedChange={(value) => updateSetting('autoInvert', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="edge-enhancement">Edge Enhancement</Label>
                <Switch
                  id="edge-enhancement"
                  checked={currentSettings.edgeEnhancement}
                  onCheckedChange={(value) => updateSetting('edgeEnhancement', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="noise-reduction">Noise Reduction</Label>
                <Switch
                  id="noise-reduction"
                  checked={currentSettings.noiseReduction}
                  onCheckedChange={(value) => updateSetting('noiseReduction', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptive-contrast">Adaptive Contrast</Label>
                <Switch
                  id="adaptive-contrast"
                  checked={currentSettings.adaptiveContrast}
                  onCheckedChange={(value) => updateSetting('adaptiveContrast', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Grayscale Method</Label>
                <RadioGroup
                  value={currentSettings.grayscaleMethod}
                  onValueChange={(value) => updateSetting('grayscaleMethod', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="luminosity" id="luminosity" />
                    <Label htmlFor="luminosity">Luminosity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average" id="average" />
                    <Label htmlFor="average">Average</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blue-channel" id="blue-channel" />
                    <Label htmlFor="blue-channel">Blue Channel</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Blue Emphasis</Label>
                <RadioGroup
                  value={currentSettings.blueEmphasis}
                  onValueChange={(value) => updateSetting('blueEmphasis', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zero" id="zero" />
                    <Label htmlFor="zero">Zero (0.33)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal (0.5)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High (0.7)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very-high" id="very-high" />
                    <Label htmlFor="very-high">Very High (0.8)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="morphological" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="morph-kernel-size">Kernel Size</Label>
                <Select
                  value={currentSettings.morphKernelSize}
                  onValueChange={(value) => updateSetting('morphKernelSize', value)}
                >
                  <SelectTrigger id="morph-kernel-size">
                    <SelectValue placeholder="Select kernel size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x1 (No effect)</SelectItem>
                    <SelectItem value="3">3x3 (Light)</SelectItem>
                    <SelectItem value="5">5x5 (Medium)</SelectItem>
                    <SelectItem value="7">7x7 (Strong)</SelectItem>
                    <SelectItem value="9">9x9 (Very Strong)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Controls the size of morphological operations like dilation and erosion.
                  Larger values can help make the VIN text thicker or thinner.
                </p>
              </div>
              
              {/* Additional morphological settings can be added here in the future */}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-invert-dark">Auto Invert Dark Text</Label>
                <Switch
                  id="auto-invert-dark"
                  checked={currentSettings.autoInvertDark}
                  onCheckedChange={(value) => updateSetting('autoInvertDark', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contrast Level</Label>
                <RadioGroup
                  value={currentSettings.contrast || 'normal'}
                  onValueChange={(value) => updateSetting('contrast', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="contrast-normal" />
                    <Label htmlFor="contrast-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="contrast-high" />
                    <Label htmlFor="contrast-high">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very-high" id="contrast-very-high" />
                    <Label htmlFor="contrast-very-high">Very High</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Additional advanced settings */}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="ocr" className="space-y-4 mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">OCR settings control how text is recognized from the image.</p>
              
              {/* Tesseract OCR settings will be added here */}
              <div className="text-sm text-muted-foreground">
                OCR settings can be configured in Developer Settings.
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
