import { useEffect, useState } from 'react'
import { ArrowLeft, Sparkles, Brain, Lightbulb, Target } from 'lucide-react'
import type { IntentAnalysis } from '../App'

interface AnalyzingPageProps {
  userInput: string
  onComplete: (analysis: IntentAnalysis) => void
  onBack: () => void
}

export default function AnalyzingPage({ userInput, onComplete, onBack }: AnalyzingPageProps) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('正在分析你的需求...')
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])

  useEffect(() => {
    analyzeIntent()
  }, [])

  const analyzeIntent = async () => {
    // 模拟分析进度
    const steps = [
      { progress: 20, text: '正在理解需求...', step: '识别意图类型' },
      { progress: 40, text: '提取关键信息...', step: '分析预算范围' },
      { progress: 60, text: '分析偏好特征...', step: '识别时间要求' },
      { progress: 80, text: '生成问题链...', step: '构建个性化问题' },
      { progress: 100, text: '分析完成！', step: '准备就绪' },
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setProgress(step.progress)
      setStatusText(step.text)
      setAnalysisSteps(prev => [...prev, step.step])
    }

    // 调用后端 API 进行 Kimi K2.5 分析
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      })

      if (!response.ok) throw new Error('分析失败')

      const data = await response.json()
      onComplete(data)
    } catch (err) {
      console.error('分析错误:', err)
      // 使用默认分析结果
      const defaultAnalysis: IntentAnalysis = generateDefaultAnalysis(userInput)
      onComplete(defaultAnalysis)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fadeIn">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-lg
                   hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-500" />
      </button>

      {/* 分析动画 */}
      <div className="text-center">
        {/* AI 分析图标 */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                          flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          {/* 环绕的小图标 */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg 
                          flex items-center justify-center animate-bounce"
               style={{ animationDelay: '0s', animationDuration: '2s' }}>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="absolute -bottom-1 -left-3 w-7 h-7 bg-white rounded-full shadow-lg 
                          flex items-center justify-center animate-bounce"
               style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
          </div>
          <div className="absolute top-1/2 -right-4 w-6 h-6 bg-white rounded-full shadow-lg 
                          flex items-center justify-center animate-bounce"
               style={{ animationDelay: '1s', animationDuration: '2s' }}>
            <Target className="w-3 h-3 text-blue-500" />
          </div>
        </div>

        {/* 状态文字 */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          AI 正在深度分析
        </h2>
        <p className="text-gray-500 mb-8">{statusText}</p>

        {/* 进度条 */}
        <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full 
                       transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 分析步骤 */}
        <div className="space-y-2">
          {analysisSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-500 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* 原始需求展示 */}
        <div className="mt-10 max-w-md mx-auto">
          <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">你的需求</p>
            <p className="text-sm text-gray-700 line-clamp-2">{userInput}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 生成默认分析结果
function generateDefaultAnalysis(userInput: string): IntentAnalysis {
  const lowerInput = userInput.toLowerCase()
  
  // 意图识别
  let intentType = 'general'
  let intentLabel = '通用咨询'
  
  if (/买|购|电脑|手机|相机|商品|产品|价格|多少钱/.test(lowerInput)) {
    intentType = 'shopping'
    intentLabel = '商品采购'
  } else if (/旅|游|玩|去|行程|酒店|机票|景点|度假|攻略/.test(lowerInput)) {
    intentType = 'travel'
    intentLabel = '旅行规划'
  } else if (/学|课|教程|培训|技能|考试|证书/.test(lowerInput)) {
    intentType = 'learning'
    intentLabel = '学习培训'
  }

  // 提取关键信息
  const extractedInfo: IntentAnalysis['extractedInfo'] = {}
  
  // 目的地提取
  const destMatch = userInput.match(/(日本|京都|东京|大阪|北海道|冲绳|三亚|云南|泰国|新加坡)/)
  if (destMatch) extractedInfo.destination = destMatch[1]
  
  // 预算提取
  const budgetMatch = userInput.match(/(\d+)元|(\d+)块|预算[\s]*(\d+)/)
  if (budgetMatch) extractedInfo.budget = budgetMatch[1] || budgetMatch[2] || budgetMatch[3]
  
  // 时间提取
  const timeMatch = userInput.match(/(\d+)[天|日|周|月]|周末|假期/)
  if (timeMatch) extractedInfo.time = timeMatch[0]
  
  // 人数提取
  const peopleMatch = userInput.match(/(\d+)[人|个]|家人|朋友|情侣|独自/)
  if (peopleMatch) extractedInfo.people = peopleMatch[0]

  return {
    intent: {
      type: intentType,
      label: intentLabel,
      description: '基于你的需求生成的分析'
    },
    extractedInfo,
    suggestedQuestions: []
  }
}
