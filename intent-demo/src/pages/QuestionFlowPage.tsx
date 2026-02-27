import { useState, useEffect, useCallback } from 'react'
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [questionHistory, setQuestionHistory] = useState<Question[]>([])

  // 生成问题（跳过目的地问题，因为AI已提取）
  const generateQuestion = useCallback((): Question | null => {
    const answeredKeys = Object.keys(answers)
    const intent = analysis?.intent?.type || 'general'
    const extractedInfo = analysis?.extractedInfo || {}
    const destination = extractedInfo?.destination || answers?.destination
    
    // 旅游问题 - 直接从第2个问题开始（天数）
    if (intent === 'travel') {
      // 第1题：天数（跳过目的地，因为AI已提取）
      if (!answeredKeys.includes('duration')) {
        return {
          id: 'duration',
          question: `计划在${destination || '目的地'}玩几天？`,
          subtitle: '行程天数影响推荐内容',
          options: [
            { label: '2-3天 精华游', value: '2-3天', letter: 'A' },
            { label: '4-5天 深度游', value: '4-5天', letter: 'B' },
            { label: '一周 慢旅行', value: '一周', letter: 'C' },
            { label: '十天以上 探索游', value: '十天以上', letter: 'D' },
          ]
        }
      }
      
      // 第2题：预算
      if (!answeredKeys.includes('budget')) {
        return {
          id: 'budget',
          question: '你的旅行预算是多少？',
          subtitle: '包含机票、住宿、餐饮、交通',
          options: [
            { label: '经济型 - 5000元以下', value: '预算5000以下', letter: 'A' },
            { label: '舒适型 - 5000-10000元', value: '预算5000-10000', letter: 'B' },
            { label: '品质型 - 10000-20000元', value: '预算10000-20000', letter: 'C' },
            { label: '豪华型 - 20000元以上', value: '预算20000以上', letter: 'D' },
          ]
        }
      }
      
      // 第3题：风格
      if (!answeredKeys.includes('style')) {
        const dest = destination || '目的地'
        const styleOptions: Record<string, any[]> = {
          '京都': [
            { label: '文化体验 - 寺庙、茶道、和服', value: '文化体验', letter: 'A' },
            { label: '美食之旅 - 怀石料理、抹茶甜品', value: '美食之旅', letter: 'B' },
            { label: '摄影打卡 - 樱花、红叶、古建筑', value: '摄影打卡', letter: 'C' },
            { label: '休闲放松 - 温泉、庭院、慢生活', value: '休闲度假', letter: 'D' },
          ],
          '东京': [
            { label: '购物血拼 - 潮牌、药妆、电子产品', value: '购物', letter: 'A' },
            { label: '美食探索 - 寿司、拉面、居酒屋', value: '美食之旅', letter: 'B' },
            { label: '城市观光 - 塔、神社、博物馆', value: '城市观光', letter: 'C' },
            { label: '主题乐园 - 迪士尼、海贼王', value: '主题乐园', letter: 'D' },
          ],
          '大阪': [
            { label: '吃货之旅 - 章鱼烧、大阪烧、串炸', value: '美食之旅', letter: 'A' },
            { label: '城市漫步 - 道顿堀、心斋桥', value: '城市观光', letter: 'B' },
            { label: '环球影城 - 哈利波特、任天堂', value: '主题乐园', letter: 'C' },
            { label: '周边一日游 - 京都、奈良', value: '周边游', letter: 'D' },
          ],
        }
        return {
          id: 'style',
          question: `你想怎么玩${dest}？`,
          subtitle: '选择最吸引你的旅行方式',
          options: styleOptions[dest] || styleOptions['京都'] || [
            { label: '文化体验', value: '文化体验', letter: 'A' },
            { label: '美食之旅', value: '美食之旅', letter: 'B' },
            { label: '休闲度假', value: '休闲度假', letter: 'C' },
            { label: '户外冒险', value: '户外冒险', letter: 'D' },
          ]
        }
      }
      
      // 第4题：同伴
      if (!answeredKeys.includes('companion')) {
        return {
          id: 'companion',
          question: '和谁一起出行？',
          subtitle: '不同的同伴有不同的推荐重点',
          options: [
            { label: '独自一人', value: '独自', letter: 'A' },
            { label: '情侣/夫妻', value: '情侣', letter: 'B' },
            { label: '朋友结伴', value: '朋友', letter: 'C' },
            { label: '家庭亲子', value: '亲子', letter: 'D' },
          ]
        }
      }
    }
    
    // 购物问题
    if (intent === 'shopping') {
      if (!answeredKeys.includes('category')) {
        if (/macbook|电脑|笔记本/i.test(userInput)) {
          return {
            id: 'category',
            question: '你主要用电脑做什么？',
            subtitle: '不同用途需要不同的配置',
            options: [
              { label: '办公文档、上网浏览', value: '办公', letter: 'A' },
              { label: '视频剪辑、设计创作', value: '创作', letter: 'B' },
              { label: '游戏娱乐', value: '游戏', letter: 'C' },
              { label: '编程开发', value: '开发', letter: 'D' },
            ]
          }
        }
        return {
          id: 'category',
          question: '你想购买什么类型的商品？',
          options: [
            { label: '数码电子', value: '数码电子', letter: 'A' },
            { label: '服装配饰', value: '服装配饰', letter: 'B' },
            { label: '家居用品', value: '家居用品', letter: 'C' },
            { label: '美妆护肤', value: '美妆护肤', letter: 'D' },
          ]
        }
      }
      
      if (!answeredKeys.includes('budget')) {
        return {
          id: 'budget',
          question: '你的预算是多少？',
          options: [
            { label: '3000元以下', value: '预算3000以下', letter: 'A' },
            { label: '3000-6000元', value: '预算3000-6000', letter: 'B' },
            { label: '6000-10000元', value: '预算6000-10000', letter: 'C' },
            { label: '10000元以上', value: '预算10000以上', letter: 'D' },
          ]
        }
      }
      
      if (!answeredKeys.includes('priority')) {
        return {
          id: 'priority',
          question: '你最看重什么？',
          options: [
            { label: '性价比', value: '性价比', letter: 'A' },
            { label: '品牌口碑', value: '品牌', letter: 'B' },
            { label: '功能性能', value: '性能', letter: 'C' },
            { label: '外观设计', value: '外观', letter: 'D' },
          ]
        }
      }
    }
    
    // 学习问题
    if (intent === 'learning') {
      if (!answeredKeys.includes('field')) {
        return {
          id: 'field',
          question: '你想学习什么领域？',
          options: [
            { label: '编程技术', value: '编程技术', letter: 'A' },
            { label: '语言学习', value: '语言学习', letter: 'B' },
            { label: '职业技能', value: '职业技能', letter: 'C' },
            { label: '兴趣爱好', value: '兴趣爱好', letter: 'D' },
          ]
        }
      }
      
      if (!answeredKeys.includes('level')) {
        return {
          id: 'level',
          question: '你目前的水平是？',
          options: [
            { label: '零基础', value: '零基础', letter: 'A' },
            { label: '入门水平', value: '入门', letter: 'B' },
            { label: '有一定基础', value: '中级', letter: 'C' },
            { label: '想进阶提升', value: '进阶', letter: 'D' },
          ]
        }
      }
      
      if (!answeredKeys.includes('goal')) {
        return {
          id: 'goal',
          question: '学习的主要目的是？',
          options: [
            { label: '工作需要', value: '工作需要', letter: 'A' },
            { label: '考证提升', value: '考证提升', letter: 'B' },
            { label: '转行就业', value: '转行就业', letter: 'C' },
            { label: '个人兴趣', value: '个人兴趣', letter: 'D' },
          ]
        }
      }
    }
    
    // 通用问题
    if (answeredKeys.length === 0) {
      return {
        id: 'detail',
        question: '能再具体描述一下你的需求吗？',
        subtitle: '这有助于我们更准确地帮助你',
        options: [
          { label: '需要专业建议', value: '专业建议', letter: 'A' },
          { label: '想对比选项', value: '对比选项', letter: 'B' },
          { label: '了解最新信息', value: '最新信息', letter: 'C' },
          { label: '解决具体问题', value: '具体问题', letter: 'D' },
        ]
      }
    }
    
    if (answeredKeys.length === 1) {
      return {
        id: 'timeline',
        question: '你希望在多久内得到结果？',
        options: [
          { label: '马上需要', value: '立即', letter: 'A' },
          { label: '今天内', value: '今天', letter: 'B' },
          { label: '这几天', value: '近期', letter: 'C' },
          { label: '不着急', value: '不着急', letter: 'D' },
        ]
      }
    }
    
    return null
  }, [analysis, answers, userInput])

  // 加载问题
  useEffect(() => {
    if (analysis) {
      setIsLoading(true)
      const question = generateQuestion()
      if (question) {
        setCurrentQuestion(question)
        setQuestionHistory(prev => [...prev, question])
      } else {
        onComplete()
      }
      setIsLoading(false)
    }
  }, [analysis, generateQuestion, onComplete])

  const handleOptionSelect = (optionValue: string) => {
    if (!currentQuestion || isLoading || selectedOption) return
    
    setSelectedOption(optionValue)
    
    // 300ms 延迟后自动跳转
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: optionValue }
      setAnswers(newAnswers)
      setSelectedOption(null)
      
      // 检查是否还有下一个问题
      const nextQuestion = generateQuestion()
      if (nextQuestion && nextQuestion.id !== currentQuestion.id) {
        setCurrentQuestion(nextQuestion)
        setQuestionHistory(prev => [...prev, nextQuestion])
      } else {
        onComplete()
      }
    }, 300)
  }

  const handleBack = () => {
    const answerKeys = Object.keys(answers)
    if (answerKeys.length > 0) {
      // 删除最后一个答案
      const newAnswers = { ...answers }
      delete newAnswers[answerKeys[answerKeys.length - 1]]
      setAnswers(newAnswers)
      setSelectedOption(null)
      
      // 恢复到上一个问题
      if (questionHistory.length > 1) {
        const prevQuestion = questionHistory[questionHistory.length - 2]
        setQuestionHistory(prev => prev.slice(0, -1))
        setCurrentQuestion(prevQuestion)
      }
    } else {
      // 返回到 AI 分析页面
      onBack()
    }
  }

  // 计算进度（从第2/5开始，因为跳过了第1题目的地）
  const answeredCount = Object.keys(answers).length
  const totalQuestions = analysis?.intent?.type === 'travel' ? 4 : 3
  const progress = Math.min(((answeredCount + 1) / (totalQuestions + 1)) * 100, 95)

  // 加载状态
  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-fadeIn">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">AI 正在生成个性化问题...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 animate-fadeIn">
      {/* 头部 - 添加返回按钮 */}
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 rounded-lg
                       hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
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
            {analysis.extractedInfo?.destination && (
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                目的地: {analysis.extractedInfo.destination}
              </span>
            )}
            {Object.keys(analysis.extractedInfo || {}).length > 0 && (
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
              disabled={isLoading || selectedOption !== null}
              className={`w-full p-5 bg-white rounded-xl border-2 text-left
                         transition-all duration-200 group
                         ${selectedOption === option.value 
                           ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10' 
                           : 'border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
                         }
                         active:scale-[0.99]
                         disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center
                                 text-base font-bold transition-colors
                                 ${selectedOption === option.value
                                   ? 'bg-blue-500 text-white'
                                   : 'bg-gray-100 text-gray-600 group-hover:bg-blue-500 group-hover:text-white'
                                 }`}
                >
                  {option.letter}
                </span>
                <span className="text-gray-900 font-medium text-base">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 加载提示 */}
        {selectedOption && (
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
