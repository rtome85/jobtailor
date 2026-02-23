import type { CustomPrompts, GenerateRequest, OllamaConfig } from "~types/config"
import type { UserProfile } from "~types/userProfile"

export type { GenerateRequest }

export class OllamaClient {
  private config: OllamaConfig

  constructor(config: OllamaConfig) {
    this.config = config
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json"
        }
      })
      return response.ok
    } catch (error) {
      console.error("Connection test failed:", error)
      return false
    }
  }

  private formatUserProfile(profile: UserProfile): string {
    if (!profile) return ""

    const skills =
      (profile.skills?.length ?? 0) > 0
        ? profile.skills
            .map((s) => `- ${s.name} (${s.yearsOfExperience} years)`)
            .join("\n")
        : "No skills specified"

    const experience =
      (profile.workExperience?.length ?? 0) > 0
        ? profile.workExperience
            .map((exp) => {
              const dateRange = exp.endDate
                ? `${exp.startDate} - ${exp.endDate}`
                : `${exp.startDate} - Present`
              const achievements =
                (exp.achievements?.length ?? 0) > 0
                  ? exp.achievements.map((a) => `  - ${a}`).join("\n")
                  : "  - No achievements specified"
              return `**${exp.jobTitle}** at ${exp.company} (${dateRange})\n${achievements}`
            })
            .join("\n\n")
        : "No work experience specified"

    const projects =
      (profile.personalProjects?.length ?? 0) > 0
        ? profile.personalProjects
            .map((project) => {
              const links = []
              if (project.liveDemoUrl)
                links.push(`Demo: ${project.liveDemoUrl}`)
              if (project.githubRepoUrl)
                links.push(`GitHub: ${project.githubRepoUrl}`)
              const linkStr =
                links.length > 0 ? `\n  ${links.join("\n  ")}` : ""
              return `**${project.title}**\n  ${project.description}${linkStr}`
            })
            .join("\n\n")
        : "No personal projects specified"

    return `**Skills:**\n${skills}\n\n**Work Experience:**\n${experience}\n\n**Personal Projects:**\n${projects}`
  }

  private interpolatePrompt(
    template: string,
    companyName: string,
    jobTitle: string,
    jobDescription: string,
    userProfile?: UserProfile
  ): string {
    let result = template
      .replace(/\{\{companyName\}\}/g, companyName)
      .replace(/\{\{jobTitle\}\}/g, jobTitle)
      .replace(/\{\{jobDescription\}\}/g, jobDescription)

    if (userProfile) {
      const profileMarkdown = this.formatUserProfile(userProfile)
      result = result.replace(/\{\{userProfile\}\}/g, profileMarkdown)
    }

    return result
  }

  async generate(request: GenerateRequest): Promise<string> {
    const {
      jobDescription,
      companyName,
      jobTitle,
      model,
      prompts,
      userProfile
    } = request

    const interpolatedUserPrompt = this.interpolatePrompt(
      prompts.resumeUserPromptTemplate,
      companyName,
      jobTitle,
      jobDescription,
      userProfile
    )

    const response = await fetch(`${this.config.baseUrl}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: prompts.resumeSystemPrompt },
          { role: "user", content: interpolatedUserPrompt }
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.message?.content || "No content generated"
  }

  async generateCoverLetter(request: GenerateRequest): Promise<string> {
    const {
      jobDescription,
      companyName,
      jobTitle,
      model,
      prompts,
      userProfile
    } = request

    const interpolatedUserPrompt = this.interpolatePrompt(
      prompts.coverLetterUserPromptTemplate,
      companyName,
      jobTitle,
      jobDescription,
      userProfile
    )

    const response = await fetch(`${this.config.baseUrl}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: prompts.coverLetterSystemPrompt },
          { role: "user", content: interpolatedUserPrompt }
        ],
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.message?.content || "No content generated"
  }

  async generateResumeAndCoverLetter(
    request: GenerateRequest
  ): Promise<{ resume: string; coverLetter: string }> {
    const [resume, coverLetter] = await Promise.all([
      this.generate(request),
      this.generateCoverLetter(request)
    ])
    return { resume, coverLetter }
  }
}
