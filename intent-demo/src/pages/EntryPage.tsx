import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface EntryPageProps {
  onStart: (input: string) => void
}

const examples = [
  '计划带家人去日本京都玩一周',
  '想买一台适合视频剪辑的MacBook',
  '零基础学习Python编程',
]

export default function EntryPage({ onStart }: EntryPageProps) {
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleExampleClick = (example: string) => {
    setUserInput(example)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && userInput.trim()) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return
    setIsLoading(true)
    onStart(userInput)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fadeIn">
      {/* Logo */}
      <div className="mb-10">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* 标题 */}
      <h1 className="text-4xl font-semibold text-gray-900 mb-3 text-center tracking-tight">
        智能助手
      </h1>
      <p className="text-gray-500 text-center mb-12 text-lg">
        告诉我你想做什么，AI 帮你找到最佳方案
      </p>

      {/* 输入框 */}
      <div className="w-full max-w-2xl">
        <div className="relative group">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的需求..."
            disabled={isLoading}
            className="w-full h-28 p-5 pr-14 bg-white rounded-2xl border border-gray-200 
                       text-gray-900 placeholder-gray-400 resize-none text-base
                       focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                       disabled:opacity-60 disabled:cursor-not-allowed
                       shadow-sm transition-all duration-200"
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || isLoading}
            className="absolute bottom-4 right-4 w-9 h-9 bg-gray-900 rounded-lg
                       flex items-center justify-center
                       hover:bg-gray-800 active:scale-95
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-900
                       transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* 示例 */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-gray-400">试试：</span>
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full
                         text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="absolute bottom-8 text-sm text-gray-400">
        按 Enter 快速开始
      </div>
    </div>
  )
}
