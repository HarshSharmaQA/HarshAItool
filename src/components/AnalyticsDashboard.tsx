'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AnalyticsData {
  totalImages: number
  totalPrompts: number
  averageGenerationTime: number
  successRate: number
  favoriteStyles: Array<{ style: string; count: number }>
  favoriteSizes: Array<{ size: string; count: number }>
  dailyUsage: Array<{ date: string; count: number }>
  qualityDistribution: Array<{ quality: string; count: number }>
  cacheHitRate: number
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalImages: 0,
    totalPrompts: 0,
    averageGenerationTime: 0,
    successRate: 100,
    favoriteStyles: [],
    favoriteSizes: [],
    dailyUsage: [],
    qualityDistribution: [],
    cacheHitRate: 0
  })

  useEffect(() => {
    // Load analytics from localStorage or generate sample data
    const savedAnalytics = localStorage.getItem('analytics')
    
    if (savedAnalytics) {
      try {
        const parsed = JSON.parse(savedAnalytics)
        setAnalytics(parsed)
      } catch (e) {
        console.error('Failed to load analytics:', e)
        generateSampleAnalytics()
      }
    } else {
      generateSampleAnalytics()
    }
  }, [])

  const generateSampleAnalytics = () => {
    const sampleData: AnalyticsData = {
      totalImages: 47,
      totalPrompts: 52,
      averageGenerationTime: 8.2,
      successRate: 94.2,
      favoriteStyles: [
        { style: 'photorealistic', count: 18 },
        { style: 'digital-art', count: 12 },
        { style: 'minimalist', count: 8 },
        { style: '3d-render', count: 6 },
        { style: 'abstract', count: 3 }
      ],
      favoriteSizes: [
        { size: '1024x1024', count: 22 },
        { size: '1024x1792', count: 15 },
        { size: '1792x1024', count: 10 }
      ],
      dailyUsage: [
        { date: '2024-01-01', count: 5 },
        { date: '2024-01-02', count: 8 },
        { date: '2024-01-03', count: 12 },
        { date: '2024-01-04', count: 7 },
        { date: '2024-01-05', count: 15 },
        { date: '2024-01-06', count: 0 },
        { date: '2024-01-07', count: 0 }
      ],
      qualityDistribution: [
        { quality: 'high', count: 28 },
        { quality: 'ultra', count: 15 },
        { quality: 'standard', count: 4 }
      ],
      cacheHitRate: 23.5
    }
    
    setAnalytics(sampleData)
    localStorage.setItem('analytics', JSON.stringify(sampleData))
  }

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span> Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Track your image generation performance and usage patterns
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Images</p>
                    <p className="text-2xl font-bold">{analytics.totalImages}</p>
                  </div>
                  <div className="text-3xl">🖼️</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Prompts</p>
                    <p className="text-2xl font-bold">{analytics.totalPrompts}</p>
                  </div>
                  <div className="text-3xl">✍️</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Time</p>
                    <p className="text-2xl font-bold">{formatTime(analytics.averageGenerationTime)}</p>
                  </div>
                  <div className="text-3xl">⏱️</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{analytics.successRate}%</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.qualityDistribution.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{item.quality}</span>
                        <span>{item.count} images</span>
                      </div>
                      <Progress 
                        value={(item.count / analytics.totalImages) * 100} 
                        className="mt-1 h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Cache Hit Rate</span>
                      <span>{analytics.cacheHitRate}%</span>
                    </div>
                    <Progress value={analytics.cacheHitRate} className="mt-1 h-2" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>💡 Higher cache hit rate means faster generation and lower costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Average Generation Time</span>
                      <span>{formatTime(analytics.averageGenerationTime)}</span>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        🚀 Your generation time is {analytics.averageGenerationTime < 10 ? 'excellent' : 'good'} 
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{analytics.successRate}%</span>
                    </div>
                    <Progress value={analytics.successRate} className="mt-1 h-2" />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>📈 Performance metrics help optimize your workflow</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Images per Prompt</span>
                    <Badge variant="outline">
                      {(analytics.totalImages / analytics.totalPrompts).toFixed(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cache Efficiency</span>
                    <Badge variant={analytics.cacheHitRate > 20 ? "default" : "secondary"}>
                      {analytics.cacheHitRate > 20 ? "Good" : "Average"}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>⚡ Efficient usage saves time and resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Favorite Styles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.favoriteStyles.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{item.style.replace('-', ' ')}</span>
                        <span>{item.count} times</span>
                      </div>
                      <Progress 
                        value={(item.count / analytics.totalImages) * 100} 
                        className="mt-1 h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferred Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.favoriteSizes.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm">
                        <span>{item.size}</span>
                        <span>{item.count} times</span>
                      </div>
                      <Progress 
                        value={(item.count / analytics.totalImages) * 100} 
                        className="mt-1 h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.dailyUsage.map((day, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm">
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                      <span>{day.count} images</span>
                    </div>
                    <Progress 
                      value={day.count > 0 ? (day.count / Math.max(...analytics.dailyUsage.map(d => d.count))) * 100 : 0} 
                      className="mt-1 h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800">📊 Most productive day: {analytics.dailyUsage.reduce((max, day) => day.count > max.count ? day : max).date}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">🎯 Preferred style: {analytics.favoriteStyles[0]?.style}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-purple-800">📏 Most used size: {analytics.favoriteSizes[0]?.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}