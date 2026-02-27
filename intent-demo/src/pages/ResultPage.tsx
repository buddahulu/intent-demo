import { useEffect, useState } from 'react'
import { RotateCcw, MapPin, Hotel, Utensils, BookOpen, Star, Clock, Tag, ExternalLink } from 'lucide-react'
import type { IntentAnalysis, UserAnswers } from '../App'

interface ResultPageProps {
  analysis: IntentAnalysis | null
  answers: UserAnswers
  userInput: string
  onRestart: () => void
}

interface Attraction {
  id: string
  name: string
  description: string
  rating: number
  reviews: number
  tags: string[]
  image: string
  location: string
  openTime: string
  price: string
}

interface Hotel {
  id: string
  name: string
  description: string
  price: string
  priceLevel: string
  rating: number
  reviews: number
  location: string
  distance: string
  tags: string[]
  image: string
  facilities: string[]
}

interface Food {
  id: string
  name: string
  description: string
  category: string
  price: string
  priceLevel: string
  rating: number
  reviews: number
  location: string
  tags: string[]
  image: string
  signature: string
}

interface Guide {
  id: string
  title: string
  summary: string
  source: string
  readTime: string
  tags: string[]
  image: string
  url: string
}

interface SearchResults {
  query: string
  summary: string
  attractions: Attraction[]
  hotels: Hotel[]
  foods: Food[]
  guides: Guide[]
}

export default function ResultPage({ analysis, answers, userInput, onRestart }: ResultPageProps) {
  const [isSearching, setIsSearching] = useState(true)
  const [results, setResults] = useState<SearchResults | null>(null)

  useEffect(() => {
    performSearch()
  }, [analysis, answers])

  const performSearch = async () => {
    setIsSearching(true)
    try {
      const searchQuery = buildSearchQuery()
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          intent: analysis?.intent.type,
          answers: answers,
          userInput: userInput,
          extractedInfo: analysis?.extractedInfo
        }),
      })
      if (!response.ok) throw new Error('搜索失败')
      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('搜索错误:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const buildSearchQuery = (): string => {
    const parts: string[] = []
    
    // 添加意图标签
    if (analysis?.intent.label) {
      parts.push(analysis.intent.label)
    }
    
    // 添加提取的关键信息
    if (analysis?.extractedInfo) {
      const { destination, purpose, budget, time } = analysis.extractedInfo
      if (destination) parts.push(destination)
      if (purpose) parts.push(purpose)
      if (budget) parts.push(`预算${budget}`)
      if (time) parts.push(time)
    }
    
    // 添加用户回答
    Object.values(answers).forEach(answer => {
      if (!parts.includes(answer)) {
        parts.push(answer)
      }
    })
    
    // 添加原始输入的关键词
    if (parts.length === 0) {
      parts.push(userInput)
    }
    
    return parts.join(' ')
  }

  // 渲染景点卡片
  const renderAttractionCard = (item: Attraction) => (
    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex gap-1">
          {item.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">{tag}</span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-sm">{item.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.openTime}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{item.price}</span>
          <span className="text-xs text-gray-400">{item.reviews.toLocaleString()}条评价</span>
        </div>
      </div>
    </div>
  )

  // 渲染酒店卡片
  const renderHotelCard = (item: Hotel) => (
    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">{item.priceLevel}</div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-sm">{item.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-3">{item.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.distance}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.facilities.slice(0, 3).map((f, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{f}</span>
          ))}
        </div>
        
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">{item.price}</span>
          <span className="text-xs text-gray-400">/晚 · {item.reviews.toLocaleString()}条评价</span>
        </div>
      </div>
    </div>
  )

  // 渲染美食卡片
  const renderFoodCard = (item: Food) => (
    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">{item.category}</div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-sm">{item.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-3">{item.description}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-600">招牌: {item.signature}</span>
        </div>
        
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">人均 {item.price}</span>
          <span className="text-xs text-gray-400">{item.reviews.toLocaleString()}条评价</span>
        </div>
      </div>
    </div>
  )

  // 渲染攻略卡片
  const renderGuideCard = (item: Guide) => (
    <a
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 group"
    >
      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.summary}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{item.source}</span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.readTime}</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
        </div>
      </div>
    </a>
  )

  // 加载状态
  if (isSearching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-6" />
        <p className="text-gray-900 font-medium mb-2">正在搜索...</p>
        <p className="text-gray-400 text-sm">{buildSearchQuery()}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">搜索结果</h1>
            <p className="text-gray-500">{results?.summary}</p>
          </div>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新开始</span>
          </button>
        </div>

        {/* 需求标签 */}
        <div className="flex flex-wrap gap-2 mb-12">
          {analysis && (
            <span className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-full">
              {analysis.intent.label}
            </span>
          )}
          {Object.entries(answers).map(([key, value]) => (
            <span
              key={key}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-full"
            >
              {value}
            </span>
          ))}
        </div>

        {/* 景点 */}
        {results && results.attractions && results.attractions.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">热门景点</h2>
                <p className="text-sm text-gray-400">精选必游景点，评分与口碑俱佳</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {results.attractions.map(renderAttractionCard)}
            </div>
          </section>
        )}

        {/* 酒店 */}
        {results && results.hotels && results.hotels.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Hotel className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">住宿推荐</h2>
                <p className="text-sm text-gray-400">根据你的预算和偏好精选</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {results.hotels.map(renderHotelCard)}
            </div>
          </section>
        )}

        {/* 美食 */}
        {results && results.foods && results.foods.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">特色美食</h2>
                <p className="text-sm text-gray-400">当地必尝，口碑推荐</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {results.foods.map(renderFoodCard)}
            </div>
          </section>
        )}

        {/* 攻略 */}
        {results && results.guides && results.guides.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">旅游攻略</h2>
                <p className="text-sm text-gray-400">实用指南，出行必备</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {results.guides.map(renderGuideCard)}
            </div>
          </section>
        )}

        {/* 底部 */}
        <div className="mt-20 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">搜索结果基于你的个性化需求生成 · {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
