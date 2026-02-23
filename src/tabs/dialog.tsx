import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { AVAILABLE_MODELS } from "~types/config"
import { DEFAULT_USER_PROFILE, type UserProfile } from "~types/userProfile"

import "../style.css"

function IndexDialog() {
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-oss:20b-cloud")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(
      ["lastSelectedModel", "userProfile", "pendingJobData"],
      (result) => {
        if (result.lastSelectedModel) setSelectedModel(result.lastSelectedModel)
        if (result.userProfile) setUserProfile(result.userProfile)
        if (result.pendingJobData?.companyName)
          setCompanyName(result.pendingJobData.companyName)
        if (result.pendingJobData?.jobTitle)
          setJobTitle(result.pendingJobData.jobTitle)
      }
    )
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim() || !jobTitle.trim()) {
      setStatus("Please fill in company name and job title")
      return
    }

    setLoading(true)
    setStatus("Generating resume and cover letter...")

    // Save model selection
    chrome.storage.local.set({ lastSelectedModel: selectedModel })

    try {
      const response = await sendToBackground({
        name: "generateDocuments",
        body: {
          companyName,
          jobTitle,
          model: selectedModel,
          userProfile
        }
      })

      if (response?.success) {
        setDone(true)
        setStatus(response.message || "Files downloaded successfully!")
      } else {
        setStatus(response?.message || "Generation failed. Please try again.")
        setLoading(false)
      }
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Done!</h2>
          <p className="text-gray-600 mb-6">{status}</p>
          <p className="text-sm text-gray-500 mb-4">
            Your resume and cover letter have been downloaded to your default downloads folder.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg
                       hover:bg-purple-700 transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    )
  }

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
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600
                     text-white rounded-lg hover:opacity-90 transition-opacity font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Generating..." : "Generate CV + Cover Letter"}
          </button>
        </form>

        {status && !done && (
          <p
            className={`mt-3 text-sm ${
              status.includes("failed") || status.includes("error") || status.includes("Error")
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
