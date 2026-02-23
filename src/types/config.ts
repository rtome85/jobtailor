import type { UserProfile } from "./userProfile"

export interface OllamaConfig {
  apiKey: string
  baseUrl: string
  enabled: boolean
}

export interface ModelConfig {
  id: string
  name: string
  description: string
  size: string
  recommended: boolean
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gpt-oss:20b-cloud",
    name: "GPT-OSS 20B",
    description: "Fast, cost-effective option",
    size: "20B",
    recommended: true
  },
  {
    id: "gpt-oss:120b-cloud",
    name: "GPT-OSS 120B",
    description: "Highest quality, slower",
    size: "120B",
    recommended: false
  },
  {
    id: "deepseek-v3.1:671b-cloud",
    name: "DeepSeek V3.1 671B",
    description: "Massive model, complex reasoning",
    size: "671B",
    recommended: false
  },
  {
    id: "qwen3-coder:480b-cloud",
    name: "Qwen3 Coder 480B",
    description: "Optimized for technical content",
    size: "480B",
    recommended: false
  }
]

export interface CustomPrompts {
  resumeSystemPrompt: string
  resumeUserPromptTemplate: string
  coverLetterSystemPrompt: string
  coverLetterUserPromptTemplate: string
}

export const DEFAULT_PROMPTS: CustomPrompts = {
  resumeSystemPrompt: `You are an expert resume writer and career coach. Your task is to create a professional, tailored resume based on a job description. The resume should highlight relevant skills and experience that match job requirements. Format the resume in clean Markdown with clear sections.`,
  resumeUserPromptTemplate: `Create a tailored resume for the following position:

  **Company:** {{companyName}}
  **Job Title:** {{jobTitle}}

  **Job Description:**
  {{jobDescription}}

  **Candidate's Profile:**
  {{userProfile}}

  Please generate a professional resume in Markdown format that addresses the key requirements of this position, incorporating the candidate's actual skills and work experience.`,
  coverLetterSystemPrompt: `You are an expert cover letter writer and career advisor. Your task is to create a compelling, personalized cover letter that demonstrates fit for a specific role. The letter should be professional, engaging, and address the company's needs.`,
  coverLetterUserPromptTemplate: `Write a compelling cover letter for the following position:

  **Company:** {{companyName}}
  **Job Title:** {{jobTitle}}

  **Job Description:**
  {{jobDescription}}

  **Candidate's Profile:**
  {{userProfile}}

  Please generate a professional cover letter in Markdown format that demonstrates strong fit for this role.`
}

export interface GenerateRequest {
  jobDescription: string
  companyName: string
  jobTitle: string
  model: string
  prompts: CustomPrompts
  userProfile?: UserProfile
}
