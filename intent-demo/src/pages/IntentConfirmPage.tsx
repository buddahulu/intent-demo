import { useEffect, useState } from 'react'
import { ArrowLeft, Brain, Check, RefreshCw } from 'lucide-react'
import type { IntentInfo } from '../App'
import { detectIntent } from '../data/intents'

interface IntentConfirmPageProps {
  userInput: string
  detectedIntent: IntentInfo | null
  setDetectedIntent: (intent: IntentInfo) => void
  onConfirm: () => void
  onBack: () => void
}

export default function IntentConfirmPage({
  userInput,
  detectedIntent,
  setDetectedIntent,
  onConfirm,
  onBack,
}: IntentConfirmPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    // 模拟 AI 分析
    const timer = setTimeout(() => {
      const intent = detectIntent(userInput)
      setDetectedIntent(intent)
      setIsAnalyzing(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [userInput, setDetectedIntent])

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 animate-fadeIn">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl
                     hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="text-slate-500">分析需求</span>
      </div>

      {/* 用户输入展示 */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 mb-2">你的需求</p>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-700">{userInput}</p>
        </div>
      </div>

      {/* 分析状态 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {isAnalyzing ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Brain className="w-8 h-8 text-blue-600 animate-pulse-slow" />
            </div>
            <p className="text-slate-600">AI 正在分析你的需求...</p>
          </div>
        ) : detectedIntent ? (
          <div className="w-full max-w-md animate-slideIn">
            <p className="text-sm text-slate-400 mb-3 text-center">识别到的意图</p>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">{detectedIntent.label[0]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{detectedIntent.label}</h3>
                  <p className="text-sm text-slate-500">{detectedIntent.type}</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">{detectedIntent.description}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl
                             font-medium hover:bg-blue-700 active:scale-[0.98]
                             transition-all duration-200 flex items-center justify-center gap-2
                             shadow-lg shadow-blue-600/25"
                >
                  <Check className="w-4 h-4" />
                  确认，开始提问
                </button>
                <button
                  onClick={() => {
                    setIsAnalyzing(true)
                    setTimeout(() => {
                      const intent = detectIntent(userInput + ' ')
                      setDetectedIntent(intent)
                      setIsAnalyzing(false)
                    }, 800)
                  }}
                  className="px-4 py-3 border border-slate-200 rounded-xl
                             text-slate-600 hover:bg-slate-50
                             transition-all duration-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新分析
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
