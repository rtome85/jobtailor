import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { AVAILABLE_MODELS } from "~types/config"
import { DEFAULT_USER_PROFILE, type UserProfile } from "~types/userProfile"
import { downloadMarkdownFile } from "~utils/documentFormatter"

import "../style.css"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" }
]

interface GenerationResult {
  resumeContent: string
  resumeFilename: string
  coverLetterContent: string
  coverLetterFilename: string
  match: { percentage: number; summary: string }
}

function IndexDialog() {
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-oss:20b-cloud")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length)
  )
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const quoteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    chrome.storage.local.get(
      ["lastSelectedModel", "userProfile", "pendingJobData"],
      (res) => {
        if (res.lastSelectedModel) setSelectedModel(res.lastSelectedModel)
        if (res.userProfile) setUserProfile(res.userProfile)
        if (res.pendingJobData?.companyName)
          setCompanyName(res.pendingJobData.companyName)
        if (res.pendingJobData?.jobTitle)
          setJobTitle(res.pendingJobData.jobTitle)
      }
    )
  }, [])

  useEffect(() => {
    if (loading) {
      setProgress(0)

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev
          const increment = Math.max(0.3, (85 - prev) * 0.04)
          return Math.min(85, prev + increment)
        })
      }, 300)

      quoteIntervalRef.current = setInterval(() => {
        setQuoteVisible(false)
        setTimeout(() => {
          setQuoteIndex((i) => (i + 1) % QUOTES.length)
          setQuoteVisible(true)
        }, 400)
      }, 4000)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current)
        quoteIntervalRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current)
    }
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim() || !jobTitle.trim()) {
      setStatus("Please fill in company name and job title")
      return
    }

    setLoading(true)
    setStatus("")

    chrome.storage.local.set({ lastSelectedModel: selectedModel })

    try {
      const response = await sendToBackground({
        name: "generateDocuments",
        body: { companyName, jobTitle, model: selectedModel, userProfile }
      })

      if (response?.success) {
        setProgress(100)
        setTimeout(() => {
          setLoading(false)
          setResult(response.data)
        }, 400)
      } else {
        setLoading(false)
        setStatus(response?.message || "Generation failed. Please try again.")
      }
    } catch (error) {
      setLoading(false)
      setStatus(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    }
  }

  const matchColor = (pct: number) => {
    if (pct >= 70) return "bg-green-500"
    if (pct >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Loading screen
  if (loading) {
    const quote = QUOTES[quoteIndex]
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Crafting your documents…</h2>
          <p className="text-sm text-gray-500 mb-6">This may take a minute</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Quote */}
          <div
            className="transition-opacity duration-400"
            style={{ opacity: quoteVisible ? 1 : 0 }}>
            <p className="text-gray-600 italic text-sm leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-gray-400 text-xs mt-2">— {quote.author}</p>
          </div>
        </div>
      </div>
    )
  }

  // Success screen
  if (result) {
    const pct = result.match.percentage
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">Documents Ready!</h2>
          </div>

          {/* Match score card */}
          <div className="bg-gray-50 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Match Score</span>
              <span className={`text-2xl font-bold ${
                pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"
              }`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${matchColor(pct)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {result.match.summary && (
              <p className="text-xs text-gray-600 leading-relaxed">{result.match.summary}</p>
            )}
          </div>

          {/* Download buttons */}
          <div className="space-y-3">
            <button
              onClick={() =>
                downloadMarkdownFile(result.resumeFilename, result.resumeContent)
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3
                         bg-gradient-to-r from-purple-500 to-purple-600
                         text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
              <span>↓</span>
              <span>Download Resume</span>
            </button>

            <button
              onClick={() =>
                downloadMarkdownFile(result.coverLetterFilename, result.coverLetterContent)
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3
                         bg-gradient-to-r from-indigo-500 to-indigo-600
                         text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
              <span>↓</span>
              <span>Download Cover Letter</span>
            </button>
          </div>

          <button
            onClick={() => window.close()}
            className="w-full mt-4 px-4 py-2 text-sm text-gray-500
                       border border-gray-200 rounded-lg hover:bg-gray-50
                       transition-colors">
            Close
          </button>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Generate Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Confirm job details and select model
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google, Microsoft"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}{model.recommended ? " (Recommended)" : ""} — {model.description}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Profile: {userProfile.skills.length} skills,{" "}
              {userProfile.workExperience.length} experiences,{" "}
              {userProfile.personalProjects.length} projects
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600
                     text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
            Generate CV + Cover Letter
          </button>
        </form>

        {status && (
          <p
            className={`mt-3 text-sm ${
              status.includes("failed") ||
              status.includes("error") ||
              status.includes("Error")
                ? "text-red-600"
                : "text-purple-600"
            }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

export default IndexDialog
