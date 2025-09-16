import { NextResponse } from "next/server";
import ZAI from 'z-ai-web-dev-sdk';

interface ImageSettings {
  size: string;
  quality: 'standard' | 'high' | 'ultra';
  style: string;
  steps: number;
  seed?: string;
}

// Simple in-memory cache for performance
const imageCache = new Map<string, string>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getCacheKey(prompt: string, settings: ImageSettings): string {
  return `${prompt}-${JSON.stringify(settings)}`;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export async function POST(request: Request) {
  try {
    const { prompt, settings }: { prompt: string; settings: ImageSettings } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(prompt, settings);
    const cachedResult = imageCache.get(cacheKey);
    
    if (cachedResult) {
      console.log('Cache hit for:', cacheKey);
      return NextResponse.json({ 
        image: cachedResult,
        success: true,
        cached: true
      });
    }

    console.log('Cache miss, generating new image for:', cacheKey);

    const zai = await ZAI.create();

    // Enhanced prompt based on quality settings
    let enhancedPrompt = prompt;
    
    if (settings.quality === 'ultra') {
      enhancedPrompt = `${prompt}. Ultra high quality, 8K resolution, professional photography, highly detailed, sharp focus, perfect lighting, masterpiece.`;
    } else if (settings.quality === 'high') {
      enhancedPrompt = `${prompt}. High quality, detailed, professional, sharp focus, good lighting.`;
    }

    // Add style modifiers
    const styleModifiers: Record<string, string> = {
      'photorealistic': 'photorealistic, realistic, photography',
      'digital-art': 'digital art, illustration, modern',
      'illustration': 'illustration, artistic, detailed',
      '3d-render': '3d render, cgi, digital',
      'minimalist': 'minimalist, clean, simple',
      'abstract': 'abstract, artistic, creative',
      'vintage': 'vintage, retro, classic',
      'futuristic': 'futuristic, sci-fi, modern'
    };

    if (settings.style && styleModifiers[settings.style]) {
      enhancedPrompt = `${enhancedPrompt}, ${styleModifiers[settings.style]}`;
    }

    // Parse size for the API
    let apiSize = '1024x1024';
    if (settings.size) {
      const [width, height] = settings.size.split('x');
      if (width && height) {
        // Validate and use the requested size
        const validSizes = ['512x512', '1024x1024', '1024x1792', '1792x1024', '1536x1536'];
        if (validSizes.includes(settings.size)) {
          apiSize = settings.size;
        }
      }
    }

    console.log('Generating image with prompt:', enhancedPrompt);
    console.log('Settings:', { size: apiSize, quality: settings.quality, style: settings.style });

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: apiSize as any
    });

    if (!response.data || !response.data[0] || !response.data[0].base64) {
      throw new Error('No image data received from AI service');
    }

    const imageBase64 = response.data[0].base64;
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    // Cache the result
    imageCache.set(cacheKey, imageDataUrl);

    // Clean up old cache entries periodically
    if (imageCache.size > 100) {
      const oldestKey = imageCache.keys().next().value;
      imageCache.delete(oldestKey);
    }

    return NextResponse.json({ 
      image: imageDataUrl,
      success: true,
      cached: false,
      settings: {
        size: apiSize,
        quality: settings.quality,
        style: settings.style
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}