'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface ImageEnhancerProps {
  image: string
  onEnhanced: (enhancedImage: string) => void
}

interface EnhancementSettings {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  sharpen: number
  vintage: number
  warmth: number
  filter: string
}

export default function ImageEnhancer({ image, onEnhanced }: ImageEnhancerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [settings, setSettings] = useState<EnhancementSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: 0,
    vintage: 0,
    warmth: 0,
    filter: 'none'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>(image)

  const filterOptions = [
    { value: 'none', label: 'No Filter' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'invert', label: 'Invert' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'cold', label: 'Cold Tone' },
    { value: 'warm', label: 'Warm Tone' }
  ]

  useEffect(() => {
    if (image) {
      setPreviewImage(image)
      applyEnhancements()
    }
  }, [image, settings])

  const applyEnhancements = async () => {
    if (!canvasRef.current || !image) return

    setIsProcessing(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        // Apply base image
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        // Apply filters
        applyFilters(ctx, canvas.width, canvas.height)
        
        // Convert to data URL for preview
        setPreviewImage(canvas.toDataURL('image/png'))
        setIsProcessing(false)
      }
      
      img.src = image
    } catch (error) {
      console.error('Enhancement error:', error)
      setIsProcessing(false)
    }
  }

  const applyFilters = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Apply brightness, contrast, and saturation
    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = Math.min(255, data[i] * (settings.brightness / 100))
      data[i + 1] = Math.min(255, data[i + 1] * (settings.brightness / 100))
      data[i + 2] = Math.min(255, data[i + 2] * (settings.brightness / 100))

      // Contrast
      const contrastFactor = (settings.contrast - 100) * 2.55
      data[i] = Math.min(255, Math.max(0, data[i] + contrastFactor))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + contrastFactor))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + contrastFactor))

      // Saturation
      const saturationFactor = settings.saturation / 100
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2]
      data[i] = Math.min(255, gray + saturationFactor * (data[i] - gray))
      data[i + 1] = Math.min(255, gray + saturationFactor * (data[i + 1] - gray))
      data[i + 2] = Math.min(255, gray + saturationFactor * (data[i + 2] - gray))

      // Warmth
      if (settings.warmth > 0) {
        data[i] = Math.min(255, data[i] + settings.warmth * 0.5) // Red
        data[i + 2] = Math.max(0, data[i + 2] - settings.warmth * 0.3) // Blue
      }

      // Vintage effect
      if (settings.vintage > 0) {
        const vintageFactor = settings.vintage / 100
        data[i] = Math.min(255, data[i] * (1 + vintageFactor * 0.3)) // More red
        data[i + 1] = Math.min(255, data[i + 1] * (1 + vintageFactor * 0.2)) // Some green
        data[i + 2] = Math.max(0, data[i + 2] * (1 - vintageFactor * 0.2)) // Less blue
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Apply CSS filters
    let filterString = ''
    
    if (settings.blur > 0) {
      filterString += `blur(${settings.blur}px) `
    }
    
    if (settings.sharpen > 0) {
      // Sharpen is simulated by contrast
      filterString += `contrast(${100 + settings.sharpen}%) `
    }

    switch (settings.filter) {
      case 'sepia':
        filterString += 'sepia(100%) '
        break
      case 'grayscale':
        filterString += 'grayscale(100%) '
        break
      case 'invert':
        filterString += 'invert(100%) '
        break
      case 'vintage':
        filterString += 'sepia(50%) contrast(120%) brightness(110%) '
        break
      case 'cold':
        filterString += 'hue-rotate(180deg) saturate(120%) '
        break
      case 'warm':
        filterString += 'hue-rotate(30deg) saturate(110%) brightness(105%) '
        break
    }

    if (filterString) {
      ctx.filter = filterString
      ctx.drawImage(ctx.canvas, 0, 0)
      ctx.filter = 'none'
    }
  }

  const resetSettings = () => {
    setSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sharpen: 0,
      vintage: 0,
      warmth: 0,
      filter: 'none'
    })
  }

  const applyEnhancement = () => {
    onEnhanced(previewImage)
  }

  const updateSetting = (key: keyof EnhancementSettings, value: number | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const presetFilters = [
    {
      name: 'Professional',
      settings: {
        brightness: 105,
        contrast: 110,
        saturation: 95,
        blur: 0,
        sharpen: 10,
        vintage: 0,
        warmth: 5,
        filter: 'none'
      }
    },
    {
      name: 'Vintage',
      settings: {
        brightness: 110,
        contrast: 105,
        saturation: 85,
        blur: 0,
        sharpen: 5,
        vintage: 30,
        warmth: 20,
        filter: 'vintage'
      }
    },
    {
      name: 'High Contrast',
      settings: {
        brightness: 95,
        contrast: 130,
        saturation: 110,
        blur: 0,
        sharpen: 15,
        vintage: 0,
        warmth: 0,
        filter: 'none'
      }
    },
    {
      name: 'Soft & Warm',
      settings: {
        brightness: 110,
        contrast: 95,
        saturation: 105,
        blur: 1,
        sharpen: 0,
        vintage: 10,
        warmth: 25,
        filter: 'warm'
      }
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎨</span> Image Enhancement Studio
        </CardTitle>
        <CardDescription>
          Professional image editing and enhancement tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div>
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden mt-2">
                <img
                  src={previewImage}
                  alt="Enhanced preview"
                  className="w-full h-64 object-contain bg-gray-50"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyEnhancement} className="flex-1">
                Apply Enhancement
              </Button>
              <Button variant="outline" onClick={resetSettings}>
                Reset
              </Button>
            </div>

            {/* Preset Filters */}
            <div>
              <Label>Preset Filters</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {presetFilters.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings(preset.settings as EnhancementSettings)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <Label>Brightness: {settings.brightness}%</Label>
              <Slider
                value={[settings.brightness]}
                onValueChange={(value) => updateSetting('brightness', value[0])}
                max={150}
                min={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Contrast: {settings.contrast}%</Label>
              <Slider
                value={[settings.contrast]}
                onValueChange={(value) => updateSetting('contrast', value[0])}
                max={200}
                min={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Saturation: {settings.saturation}%</Label>
              <Slider
                value={[settings.saturation]}
                onValueChange={(value) => updateSetting('saturation', value[0])}
                max={200}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Blur: {settings.blur}px</Label>
              <Slider
                value={[settings.blur]}
                onValueChange={(value) => updateSetting('blur', value[0])}
                max={10}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Sharpen: {settings.sharpen}%</Label>
              <Slider
                value={[settings.sharpen]}
                onValueChange={(value) => updateSetting('sharpen', value[0])}
                max={50}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Vintage: {settings.vintage}%</Label>
              <Slider
                value={[settings.vintage]}
                onValueChange={(value) => updateSetting('vintage', value[0])}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Warmth: {settings.warmth}%</Label>
              <Slider
                value={[settings.warmth]}
                onValueChange={(value) => updateSetting('warmth', value[0])}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Filter</Label>
              <Select 
                value={settings.filter} 
                onValueChange={(value) => updateSetting('filter', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}