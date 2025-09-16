'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface ExportOptionsProps {
  image: string
  prompt: string
  settings: any
}

interface ExportSettings {
  format: 'png' | 'jpg' | 'webp' | 'svg'
  quality: number
  width: number
  height: number
  resolution: number
  compression: number
  metadata: boolean
  watermark: boolean
  watermarkText: string
}

export default function ExportOptions({ image, prompt, settings }: ExportOptionsProps) {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 90,
    width: 1024,
    height: 1024,
    resolution: 300,
    compression: 85,
    metadata: true,
    watermark: false,
    watermarkText: 'AI Generated'
  })

  const [isExporting, setIsExporting] = useState(false)

  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Lossless, transparent background support' },
    { value: 'jpg', label: 'JPG', description: 'Compressed, smaller file size' },
    { value: 'webp', label: 'WebP', description: 'Modern format, best compression' },
    { value: 'svg', label: 'SVG', description: 'Vector format, scalable' }
  ]

  const presetSizes = [
    { name: 'Social Media', width: 1080, height: 1080 },
    { name: 'Blog Post', width: 1200, height: 630 },
    { name: 'Website Banner', width: 1920, height: 1080 },
    { name: 'Mobile App', width: 750, height: 1334 },
    { name: 'Print Ready', width: 3000, height: 3000 },
    { name: 'Thumbnail', width: 320, height: 320 }
  ]

  const updateSetting = (key: keyof ExportSettings, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyPresetSize = (width: number, height: number) => {
    setExportSettings(prev => ({
      ...prev,
      width,
      height
    }))
  }

  const exportImage = async () => {
    setIsExporting(true)
    
    try {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Failed to create canvas context')
      }

      const img = new Image()
      img.onload = () => {
        // Set canvas size
        canvas.width = exportSettings.width
        canvas.height = exportSettings.height

        // Draw and scale image
        ctx.drawImage(img, 0, 0, exportSettings.width, exportSettings.height)

        // Apply watermark if enabled
        if (exportSettings.watermark && exportSettings.watermarkText) {
          ctx.font = `${Math.max(12, exportSettings.width / 50)}px Arial`
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.lineWidth = 1
          
          const text = exportSettings.watermarkText
          const textMetrics = ctx.measureText(text)
          const x = exportSettings.width - textMetrics.width - 20
          const y = exportSettings.height - 20
          
          ctx.strokeText(text, x, y)
          ctx.fillText(text, x, y)
        }

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const filename = `ai-generated-${timestamp}.${exportSettings.format}`

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
          setIsExporting(false)
        }, `image/${exportSettings.format}`, exportSettings.quality / 100)
      }

      img.onerror = () => {
        setIsExporting(false)
        throw new Error('Failed to load image')
      }

      img.src = image

    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
    }
  }

  const batchExport = () => {
    const formats = ['png', 'jpg', 'webp']
    const sizes = [
      { width: 1024, height: 1024, name: 'square' },
      { width: 1024, height: 1792, name: 'portrait' },
      { width: 1792, height: 1024, name: 'landscape' }
    ]

    formats.forEach(format => {
      sizes.forEach(size => {
        setExportSettings(prev => ({
          ...prev,
          format: format as any,
          width: size.width,
          height: size.height
        }))
        
        // Small delay to prevent browser blocking
        setTimeout(() => {
          exportImage()
        }, 100)
      })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📤</span> Export Options
        </CardTitle>
        <CardDescription>
          Advanced export settings and format options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Format Settings */}
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select 
                value={exportSettings.format} 
                onValueChange={(value) => updateSetting('format', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quality: {exportSettings.quality}%</Label>
              <Slider
                value={[exportSettings.quality]}
                onValueChange={(value) => updateSetting('quality', value[0])}
                max={100}
                min={10}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Resolution: {exportSettings.resolution} DPI</Label>
              <Slider
                value={[exportSettings.resolution]}
                onValueChange={(value) => updateSetting('resolution', value[0])}
                max={600}
                min={72}
                step={72}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Compression: {exportSettings.compression}%</Label>
              <Slider
                value={[exportSettings.compression]}
                onValueChange={(value) => updateSetting('compression', value[0])}
                max={100}
                min={10}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          {/* Size Settings */}
          <div className="space-y-4">
            <div>
              <Label>Dimensions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-sm">Width: {exportSettings.width}px</Label>
                  <Slider
                    value={[exportSettings.width]}
                    onValueChange={(value) => updateSetting('width', value[0])}
                    max={4000}
                    min={100}
                    step={50}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Height: {exportSettings.height}px</Label>
                  <Slider
                    value={[exportSettings.height]}
                    onValueChange={(value) => updateSetting('height', value[0])}
                    max={4000}
                    min={100}
                    step={50}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Preset Sizes</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {presetSizes.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetSize(preset.width, preset.height)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Watermark</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={exportSettings.watermark}
                    onChange={(e) => updateSetting('watermark', e.target.checked)}
                  />
                  <Label htmlFor="watermark" className="text-sm">Add watermark</Label>
                </div>
                {exportSettings.watermark && (
                  <input
                    type="text"
                    value={exportSettings.watermarkText}
                    onChange={(e) => updateSetting('watermarkText', e.target.value)}
                    placeholder="Watermark text"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="metadata"
                checked={exportSettings.metadata}
                onChange={(e) => updateSetting('metadata', e.target.checked)}
              />
              <Label htmlFor="metadata" className="text-sm">Include metadata</Label>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={exportImage} 
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? 'Exporting...' : `Export as ${exportSettings.format.toUpperCase()}`}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Batch Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Export</DialogTitle>
                <DialogDescription>
                  Export multiple formats and sizes at once
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>This will create:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>3 formats: PNG, JPG, WebP</li>
                  <li>3 sizes: Square, Portrait, Landscape</li>
                  <li>9 files total</li>
                </ul>
                <Button onClick={batchExport} className="w-full">
                  Start Batch Export
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Export Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium">Export Summary</Label>
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div>Format: {exportSettings.format.toUpperCase()}</div>
            <div>Size: {exportSettings.width} × {exportSettings.height}px</div>
            <div>Quality: {exportSettings.quality}%</div>
            <div>Resolution: {exportSettings.resolution} DPI</div>
            {exportSettings.watermark && (
              <div>Watermark: {exportSettings.watermarkText}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}