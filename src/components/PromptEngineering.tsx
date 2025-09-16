'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface PromptEngineeringProps {
  onPromptGenerated: (prompt: string) => void
}

const promptComponents = {
  subjects: [
    { value: 'person', label: 'Person', examples: ['business professional', 'doctor', 'artist', 'athlete'] },
    { value: 'object', label: 'Object', examples: ['laptop', 'car', 'building', 'product'] },
    { value: 'scene', label: 'Scene', examples: ['office', 'landscape', 'city', 'room'] },
    { value: 'abstract', label: 'Abstract', examples: ['geometric shapes', 'light patterns', 'colors', 'textures'] }
  ],
  styles: [
    { value: 'photorealistic', label: 'Photorealistic', modifiers: ['realistic', 'photography', 'lifelike'] },
    { value: 'digital-art', label: 'Digital Art', modifiers: ['illustration', 'digital', 'modern'] },
    { value: 'painting', label: 'Painting', modifiers: ['oil painting', 'watercolor', 'artistic'] },
    { value: '3d', label: '3D Render', modifiers: ['3d render', 'cgi', 'computer generated'] },
    { value: 'minimalist', label: 'Minimalist', modifiers: ['clean', 'simple', 'minimal'] },
    { value: 'vintage', label: 'Vintage', modifiers: ['retro', 'old-fashioned', 'classic'] }
  ],
  lighting: [
    { value: 'natural', label: 'Natural Light', modifiers: ['sunlight', 'daylight', 'outdoor'] },
    { value: 'studio', label: 'Studio Light', modifiers: ['professional lighting', 'softbox', 'studio'] },
    { value: 'dramatic', label: 'Dramatic Light', modifiers: ['dramatic lighting', 'contrast', 'shadows'] },
    { value: 'ambient', label: 'Ambient Light', modifiers: ['soft light', 'gentle', 'atmospheric'] },
    { value: 'neon', label: 'Neon Light', modifiers: ['neon', 'glowing', 'vibrant'] }
  ],
  composition: [
    { value: 'centered', label: 'Centered', modifiers: ['centered', 'symmetrical', 'balanced'] },
    { value: 'rule-of-thirds', label: 'Rule of Thirds', modifiers: ['rule of thirds', 'off-center', 'dynamic'] },
    { value: 'close-up', label: 'Close-up', modifiers: ['close-up', 'detailed', 'macro'] },
    { value: 'wide-angle', label: 'Wide Angle', modifiers: ['wide angle', 'expansive', 'broad'] },
    { value: 'aerial', label: 'Aerial View', modifiers: ['aerial view', 'bird\'s eye', 'overhead'] }
  ],
  mood: [
    { value: 'professional', label: 'Professional', modifiers: ['professional', 'corporate', 'business'] },
    { value: 'creative', label: 'Creative', modifiers: ['creative', 'artistic', 'imaginative'] },
    { value: 'energetic', label: 'Energetic', modifiers: ['energetic', 'dynamic', 'vibrant'] },
    { value: 'calm', label: 'Calm', modifiers: ['calm', 'peaceful', 'serene'] },
    { value: 'luxury', label: 'Luxury', modifiers: ['luxury', 'elegant', 'premium'] }
  ],
  quality: [
    { value: 'standard', label: 'Standard', modifiers: ['clear', 'good quality'] },
    { value: 'high', label: 'High Quality', modifiers: ['high quality', 'detailed', 'sharp'] },
    { value: 'ultra', label: 'Ultra HD', modifiers: ['ultra hd', '8k', 'masterpiece', 'photorealistic'] }
  ]
}

export default function PromptEngineering({ onPromptGenerated }: PromptEngineeringProps) {
  const [selectedComponents, setSelectedComponents] = useState({
    subject: '',
    style: '',
    lighting: '',
    composition: '',
    mood: '',
    quality: 'high'
  })

  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')

  const handleComponentChange = (category: string, value: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const generatePrompt = () => {
    const components = []
    
    if (selectedComponents.subject) {
      const subject = promptComponents.subjects.find(s => s.value === selectedComponents.subject)
      if (subject) {
        components.push(subject.examples[0])
      }
    }

    if (selectedComponents.style) {
      const style = promptComponents.styles.find(s => s.value === selectedComponents.style)
      if (style) {
        components.push(style.modifiers.join(', '))
      }
    }

    if (selectedComponents.lighting) {
      const lighting = promptComponents.lighting.find(l => l.value === selectedComponents.lighting)
      if (lighting) {
        components.push(lighting.modifiers.join(', '))
      }
    }

    if (selectedComponents.composition) {
      const composition = promptComponents.composition.find(c => c.value === selectedComponents.composition)
      if (composition) {
        components.push(composition.modifiers.join(', '))
      }
    }

    if (selectedComponents.mood) {
      const mood = promptComponents.mood.find(m => m.value === selectedComponents.mood)
      if (mood) {
        components.push(mood.modifiers.join(', '))
      }
    }

    if (selectedComponents.quality) {
      const quality = promptComponents.quality.find(q => q.value === selectedComponents.quality)
      if (quality) {
        components.push(quality.modifiers.join(', '))
      }
    }

    const prompt = components.join(', ')
    setGeneratedPrompt(prompt)
  }

  const applyPrompt = () => {
    const finalPrompt = generatedPrompt || customPrompt
    if (finalPrompt) {
      onPromptGenerated(finalPrompt)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔧</span> Advanced Prompt Engineering
        </CardTitle>
        <CardDescription>
          Build professional prompts with AI-enhanced components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Prompt Builder</TabsTrigger>
            <TabsTrigger value="templates">Smart Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(promptComponents).map(([category, options]) => (
                <div key={category}>
                  <Label className="capitalize">{category}</Label>
                  <Select 
                    value={selectedComponents[category as keyof typeof selectedComponents]} 
                    onValueChange={(value) => handleComponentChange(category, value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={`Select ${category}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button onClick={generatePrompt} className="w-full">
                Generate Prompt
              </Button>
            </div>

            {generatedPrompt && (
              <div className="space-y-2">
                <Label>Generated Prompt</Label>
                <Textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={applyPrompt} className="w-full">
                  Apply to Generator
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Corporate Professional</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Professional business setting with team collaboration
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const prompt = "Professional business team in modern office, collaboration, corporate environment, high quality, photorealistic, professional lighting, centered composition"
                    onPromptGenerated(prompt)
                  }}
                >
                  Use Template
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Tech Product Showcase</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Modern technology product presentation
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const prompt = "Modern tech product on clean background, minimalist design, professional photography, studio lighting, sharp focus, high quality, centered composition"
                    onPromptGenerated(prompt)
                  }}
                >
                  Use Template
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Creative Abstract</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Artistic abstract design for creative projects
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const prompt = "Abstract geometric shapes, modern art, creative composition, vibrant colors, digital art, high quality, dramatic lighting"
                    onPromptGenerated(prompt)
                  }}
                >
                  Use Template
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Lifestyle Scene</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Natural lifestyle photography
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const prompt = "Natural lifestyle scene, people enjoying daily activities, warm natural lighting, photorealistic, high quality, rule of thirds composition"
                    onPromptGenerated(prompt)
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}