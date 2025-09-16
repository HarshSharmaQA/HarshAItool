'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface GeneratedImage {
  id: string
  prompt: string
  imageData: string
  settings: ImageSettings
  timestamp: Date
  size: string
  style: string
}

interface ImageSettings {
  size: string
  quality: 'standard' | 'high' | 'ultra'
  style: string
  steps: number
  seed?: string
}

interface GenerationJob {
  id: string
  prompt: string
  settings: ImageSettings
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  timestamp: Date
  result?: GeneratedImage
}

const templatePrompts = [
  {
    category: 'Hero Banner',
    prompt: "Create a high-resolution hero banner for a corporate website. Style: modern and clean. Color palette: blue, white, and gray. Include a diverse team working in a bright office, laptops, and digital charts. Balanced composition, professional look, visually appealing, web-optimized."
  },
  {
    category: 'Product Image',
    prompt: "Generate a sleek product image for a tech website. Style: minimalist and futuristic. Color palette: dark blue, neon green, and white. Include a laptop and smartphone with abstract holographic screens. Focused composition, clear details, web-ready."
  },
  {
    category: 'Team Illustration',
    prompt: "Create a modern, high-resolution illustration of a team collaborating. Style: professional and creative. Colors: brand colors teal, white, and gray. Include diverse team members, laptops, charts, and sticky notes. Balanced, engaging, optimized for web use."
  },
  {
    category: 'Abstract Background',
    prompt: "Generate a clean, abstract background for a website section. Style: minimalistic and modern. Colors: pastel gradients with accent colors. Include subtle shapes, light patterns, and depth for visual interest. Web-optimized and professional."
  },
  {
    category: 'Product Development Roadmap',
    prompt: "Create a modern, high-resolution roadmap illustration for a product website. Horizontal layout showing phases: Research → Design → Development → Testing → Launch. Use clean, professional style with brand colors [blue, white, orange]. Include icons for each milestone (magnifying glass, pencil, gear, checklist, rocket). Clear arrows connecting steps, readable text placeholders, visually balanced, web-optimized."
  }
]

const styleOptions = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'illustration', label: 'Illustration' },
  { value: '3d-render', label: '3D Render' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'futuristic', label: 'Futuristic' }
]

const sizeOptions = [
  { value: '1024x1024', label: 'Square (1024×1024)' },
  { value: '1024x1792', label: 'Portrait (1024×1792)' },
  { value: '1792x1024', label: 'Landscape (1792×1024)' },
  { value: '512x512', label: 'Small (512×512)' },
  { value: '1536x1536', label: 'Large (1536×1536)' }
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generationQueue, setGenerationQueue] = useState<GenerationJob[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  
  // Advanced settings
  const [settings, setSettings] = useState<ImageSettings>({
    size: '1024x1024',
    quality: 'high',
    style: 'photorealistic',
    steps: 20
  })

  const [batchMode, setBatchMode] = useState(false)
  const [batchCount, setBatchCount] = useState(3)
  const [enhancePrompt, setEnhancePrompt] = useState(true)

  // Load images from localStorage on mount
  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages')
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages)
        setGeneratedImages(parsed.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        })))
      } catch (e) {
        console.error('Failed to load saved images:', e)
      }
    }
  }, [])

  // Save images to localStorage when they change
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('generatedImages', JSON.stringify(generatedImages))
    }
  }, [generatedImages])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const jobs: GenerationJob[] = []
      const count = batchMode ? batchCount : 1

      for (let i = 0; i < count; i++) {
        const jobId = Date.now().toString() + i
        const job: GenerationJob = {
          id: jobId,
          prompt: enhancePrompt ? `${prompt}. Style: ${settings.style}, ${settings.quality} quality, detailed, professional.` : prompt,
          settings,
          status: 'pending',
          progress: 0,
          timestamp: new Date()
        }
        jobs.push(job)
      }

      setGenerationQueue(prev => [...prev, ...jobs])

      // Process jobs sequentially
      for (const job of jobs) {
        setCurrentJobId(job.id)
        await processJob(job)
      }

    } catch (err) {
      setError('Failed to generate image. Please try again.')
      console.error('Generation error:', err)
    } finally {
      setIsGenerating(false)
      setCurrentJobId(null)
    }
  }

  const processJob = async (job: GenerationJob) => {
    setGenerationQueue(prev => 
      prev.map(j => j.id === job.id ? { ...j, status: 'processing', progress: 10 } : j)
    )

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationQueue(prev => 
          prev.map(j => j.id === job.id ? { 
            ...j, 
            progress: Math.min(j.progress + Math.random() * 20, 90) 
          } : j)
        )
      }, 300)

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: job.prompt,
          settings: job.settings
        }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      
      const newImage: GeneratedImage = {
        id: job.id,
        prompt: job.prompt,
        imageData: data.image,
        settings: job.settings,
        timestamp: new Date(),
        size: job.settings.size,
        style: job.settings.style
      }

      setGeneratedImages(prev => [newImage, ...prev])
      setGenerationQueue(prev => 
        prev.map(j => j.id === job.id ? { 
          ...j, 
          status: 'completed', 
          progress: 100,
          result: newImage 
        } : j)
      )

    } catch (err) {
      setGenerationQueue(prev => 
        prev.map(j => j.id === job.id ? { ...j, status: 'failed', progress: 0 } : j)
      )
      throw err
    }
  }

  const applyTemplatePrompt = (templatePrompt: string) => {
    setPrompt(templatePrompt)
  }

  const downloadImage = (image: GeneratedImage, format: 'png' | 'jpg' = 'png') => {
    const link = document.createElement('a')
    link.href = image.imageData
    link.download = `generated-image-${image.id}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteImage = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const clearQueue = () => {
    setGenerationQueue([])
  }

  const currentJob = generationQueue.find(job => job.id === currentJobId)
  const overallProgress = generationQueue.length > 0 
    ? generationQueue.reduce((sum, job) => sum + job.progress, 0) / generationQueue.length 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">AI Image Generator Pro</h1>
          <p className="text-xl text-gray-600">Create stunning, high-quality images with advanced AI technology</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* Main Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎨</span> Image Generation
                </CardTitle>
                <CardDescription>
                  Create professional images with advanced settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to generate in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] mt-2"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Advanced Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Advanced Settings</Label>
                    <Switch 
                      checked={batchMode} 
                      onCheckedChange={setBatchMode}
                    />
                  </div>

                  {batchMode && (
                    <div className="space-y-2">
                      <Label>Batch Size: {batchCount}</Label>
                      <Slider
                        value={[batchCount]}
                        onValueChange={(value) => setBatchCount(value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Enhance Prompt</Label>
                    <Switch 
                      checked={enhancePrompt} 
                      onCheckedChange={setEnhancePrompt}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Size</Label>
                      <Select value={settings.size} onValueChange={(value) => setSettings(prev => ({ ...prev, size: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Style</Label>
                      <Select value={settings.style} onValueChange={(value) => setSettings(prev => ({ ...prev, style: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styleOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Quality</Label>
                    <Select value={settings.quality} onValueChange={(value: any) => setSettings(prev => ({ ...prev, quality: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Detail Level: {settings.steps}</Label>
                    <Slider
                      value={[settings.steps]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, steps: value[0] }))}
                      max={50}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <Label>Generating... {Math.round(overallProgress)}%</Label>
                    <Progress value={overallProgress} className="w-full" />
                    {currentJob && (
                      <p className="text-sm text-gray-600">
                        Processing: {currentJob.prompt.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? 'Generating...' : `Generate ${batchMode ? `${batchCount} Images` : 'Image'}`}
                </Button>
              </CardContent>
            </Card>

            {/* Template Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📋</span> Template Prompts
                </CardTitle>
                <CardDescription>
                  Click to use professional templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {templatePrompts.map((template, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => applyTemplatePrompt(template.prompt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Generation Queue */}
            {generationQueue.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span>⚡</span> Generation Queue
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={clearQueue}>
                      Clear Queue
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generationQueue.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{job.prompt.substring(0, 60)}...</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                              {job.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {job.size} • {job.style}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={job.progress} className="w-20" />
                          <span className="text-xs text-gray-500">{Math.round(job.progress)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Images Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🖼️</span> Generated Images
                  <Badge variant="outline">{generatedImages.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Your AI-generated images gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden">
                        <div className="relative">
                          <img
                            src={image.imageData}
                            alt="Generated"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" onClick={() => setSelectedImage(image)}>
                                  🔍
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Image Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <img
                                    src={image.imageData}
                                    alt="Generated"
                                    className="w-full max-h-96 object-contain"
                                  />
                                  <div className="space-y-2">
                                    <div>
                                      <Label>Prompt</Label>
                                      <p className="text-sm text-gray-600">{image.prompt}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <Label>Size</Label>
                                        <p className="text-gray-600">{image.size}</p>
                                      </div>
                                      <div>
                                        <Label>Style</Label>
                                        <p className="text-gray-600">{image.style}</p>
                                      </div>
                                      <div>
                                        <Label>Quality</Label>
                                        <p className="text-gray-600">{image.settings.quality}</p>
                                      </div>
                                      <div>
                                        <Label>Created</Label>
                                        <p className="text-gray-600">{image.timestamp.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={() => downloadImage(image, 'png')}>
                                      Download PNG
                                    </Button>
                                    <Button variant="outline" onClick={() => downloadImage(image, 'jpg')}>
                                      Download JPG
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => deleteImage(image.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">{image.size}</Badge>
                              <Badge variant="outline" className="text-xs">{image.style}</Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => downloadImage(image)}>
                                ⬇️
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteImage(image.id)}>
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No images generated yet</p>
                      <p className="text-sm text-gray-400">Enter a prompt and click "Generate Image"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Master Prompt Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📖</span> Master Prompt Guide
                </CardTitle>
                <CardDescription>
                  Professional template for creating better prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-gray-700 leading-relaxed">
                    "Create a high-resolution, professional, and visually appealing image for a website. Style: [modern / minimalist / creative / professional / futuristic]. Color palette: [brand colors or desired colors]. Composition: [balanced / centered / spacious / dynamic]. Include relevant elements based on context: [e.g., office environment, technology devices, abstract shapes, people, nature, product items]. Ensure clarity, focus, and attention to detail. The image should convey [trust / innovation / creativity / professionalism / energy], be optimized for web display, and visually consistent with the website theme."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}