import { useState } from 'react'
import EntryPage from './pages/EntryPage'
import AnalyzingPage from './pages/AnalyzingPage'
import QuestionFlowPage from './pages/QuestionFlowPage'
import ResultPage from './pages/ResultPage'

export type PageType = 'entry' | 'analyzing' | 'question' | 'result'

export interface UserAnswers {
  [key: string]: string
}

export interface IntentInfo {
  type: string
  label: string
  description: string
}

export interface IntentAnalysis {
  intent: IntentInfo
  extractedInfo: {
    purpose?: string
    budget?: string
    time?: string
    people?: string
    preference?: string
    destination?: string
    duration?: string
    style?: string
    [key: string]: string | undefined
  }
  suggestedQuestions: Question[]
}

export interface Question {
  id: string
  question: string
  subtitle?: string
  options: { label: string; value: string; letter: string }[]
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('entry')
  const [userInput, setUserInput] = useState('')
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null)
  const [answers, setAnswers] = useState<UserAnswers>({})

  const handleStart = async (input: string) => {
    setUserInput(input)
    setCurrentPage('analyzing')
  }

  const handleAnalysisComplete = (result: IntentAnalysis) => {
    setAnalysis(result)
    setCurrentPage('question')
  }

  const handleRestart = () => {
    setUserInput('')
    setAnalysis(null)
    setAnswers({})
    setCurrentPage('entry')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'entry':
        return (
          <EntryPage
            onStart={handleStart}
          />
        )
      case 'analyzing':
        return (
          <AnalyzingPage
            userInput={userInput}
            onComplete={handleAnalysisComplete}
            onBack={() => setCurrentPage('entry')}
          />
        )
      case 'question':
        return (
          <QuestionFlowPage
            analysis={analysis}
            userInput={userInput}
            answers={answers}
            setAnswers={setAnswers}
            onComplete={() => setCurrentPage('result')}
            onBack={handleRestart}
          />
        )
      case 'result':
        return (
          <ResultPage
            analysis={analysis}
            answers={answers}
            userInput={userInput}
            onRestart={handleRestart}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {renderPage()}
    </div>
  )
}

export default App
