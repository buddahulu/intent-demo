import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { IntentAnalysis, UserAnswers } from '../App'

interface QuestionFlowPageProps {
  analysis: IntentAnalysis | null
  userInput: string
  answers: UserAnswers
  setAnswers: (answers: UserAnswers) => void
  onComplete: () => void
  onBack: () => void
}

interface Question {
  id: string
  question: string
  subtitle?: string
  options: { label: string; value: string; letter: string }[]
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionFlowPage({
  analysis,
  userInput,
  answers,
  setAnswers,
  onComplete,
  onBack,
}: QuestionFlowPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [questionHistory, setQuestionHistory] = useState<Question[]>([])

  // 加载问题
  useEffect(() => {
    if (analysis && !isComplete) {
      loadNextQuestion()
    }
  }, [analysis, answers])

  const loadNextQuestion = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: analysis?.intent.type,
          intentLabel: analysis?.intent.label,
          userInput: userInput,
          extractedInfo: analysis?.extractedInfo,
          answers: answers,
          questionCount: Object.keys(answers).length
        }),
      })

      if (!response.ok) throw new Error('获取问题失败')

      const data = await response.json()

      if (data.complete) {
        setIsComplete(true)
        onComplete()
        return
      }

      // 确保选项有字母标识
      const questionWithLetters = {
        ...data.question,
        options: data.question.options.map((opt: any, idx: number) => ({
          ...opt,
          letter: opt.letter || LETTERS[idx] || String.fromCharCode(65 + idx)
        }))
      }

      setCurrentQuestion(questionWithLetters)
      setQuestionHistory(prev => [...prev, questionWithLetters])
    } catch (err) {
      console.error('加载问题错误:', err)
      // 使用默认问题
      const defaultQuestion = generateDefaultQuestion(analysis?.intent.type || 'general', answers)
      setCurrentQuestion(defaultQuestion)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    if (!currentQuestion || isLoading) return
    
    const newAnswers = { ...answers, [currentQuestion.id]: optionValue }
    setAnswers(newAnswers)
  }

  const handleBack = () => {
    const answerKeys = Object.keys(answers)
    if (answerKeys.length > 0) {
      const newAnswers = { ...answers }
      delete newAnswers[answerKeys[answerKeys.length - 1]]
      setAnswers(newAnswers)
      // 恢复到上一个问题
      if (questionHistory.length > 1) {
        setQuestionHistory(prev => prev.slice(0, -1))
        setCurrentQuestion(questionHistory[questionHistory.length - 2])
      }
    } else {
      onBack()
    }
  }

  const progress = Math.min((Object.keys(answers).length) * 20, 80)

  // 加载状态
  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fadeIn">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">AI 正在生成个性化问题...</p>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 animate-fadeIn">
      {/* 头部 */}
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-400 w-12 text-right">{Math.round(progress)}%</span>
        </div>

        {/* 意图标签 */}
        {analysis && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {analysis.intent.label}
            </span>
            {Object.keys(analysis.extractedInfo).length > 0 && (
              <span className="text-xs text-gray-400">
                已提取 {Object.keys(analysis.extractedInfo).length} 个关键信息
              </span>
            )}
          </div>
        )}
      </div>

      {/* 问题卡片 */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 leading-tight">
            {currentQuestion.question}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-gray-500">{currentQuestion.subtitle}</p>
          )}
        </div>

        {/* 选项卡片 - A/B/C/D 选择题 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option.value)}
              disabled={isLoading}
              className="w-full p-5 bg-white rounded-xl border-2 border-gray-200
                         text-left hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10
                         active:scale-[0.99]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center
                                 text-base font-bold text-gray-600
                                 group-hover:bg-blue-500 group-hover:text-white
                                 transition-colors"
                >
                  {option.letter}
                </span>
                <span className="text-gray-900 font-medium text-base">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 加载提示 */}
        {isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">准备下一个问题...</span>
          </div>
        )}

        {/* 已回答问题摘要 */}
        {Object.keys(answers).length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">已回答</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-lg"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 生成默认问题
function generateDefaultQuestion(intentType: string, answers: Record<string, string>): Question {
  const answeredKeys = Object.keys(answers)
  
  if (intentType === 'travel') {
    if (!answeredKeys.includes('destination')) {
      return {
        id: 'destination',
        question: '你想去哪里旅游？',
        subtitle: '选择你的目的地类型',
        options: [
          { label: '国内热门城市', value: '国内热门', letter: 'A' },
          { label: '国内小众景点', value: '国内小众', letter: 'B' },
          { label: '日韩东南亚', value: '亚洲周边', letter: 'C' },
          { label: '欧洲美洲', value: '欧美长途', letter: 'D' },
        ]
      }
    }
    if (!answeredKeys.includes('duration')) {
      return {
        id: 'duration',
        question: '计划玩几天？',
        options: [
          { label: '周末2天', value: '2天', letter: 'A' },
          { label: '3-5天', value: '3-5天', letter: 'B' },
          { label: '一周左右', value: '7天左右', letter: 'C' },
          { label: '十天以上', value: '10天以上', letter: 'D' },
        ]
      }
    }
  }

  // 通用问题
  return {
    id: `question_${answeredKeys.length}`,
    question: '请选择一个选项：',
    options: [
      { label: '选项 A', value: 'A', letter: 'A' },
      { label: '选项 B', value: 'B', letter: 'B' },
      { label: '选项 C', value: 'C', letter: 'C' },
      { label: '选项 D', value: 'D', letter: 'D' },
    ]
  }
}
