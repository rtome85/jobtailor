export interface Skill {
  id: string // crypto.randomUUID()
  name: string
  yearsOfExperience: number
  category?: string
}

export interface WorkExperience {
  id: string // crypto.randomUUID()
  jobTitle: string
  company: string
  startDate: string // ISO date string: "2023-04-01"
  endDate: string | null // null for current role
  achievements: string[] // Array of achievement strings
}

export interface PersonalProject {
  id: string // crypto.randomUUID()
  title: string
  description: string
  liveDemoUrl?: string
  githubRepoUrl?: string
}

export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  github?: string
  summary: string
}

export interface Education {
  id: string // crypto.randomUUID()
  degree: string
  institution: string
  fieldOfStudy?: string
  startDate: string // ISO date string: "2020-09-01"
  endDate: string | null // null for current studies
  description?: string
}

export interface UserProfile {
  personalInfo: PersonalInfo
  education: Education[]
  skills: Skill[]
  workExperience: WorkExperience[]
  personalProjects: PersonalProject[]
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: ""
  },
  education: [],
  skills: [],
  workExperience: [],
  personalProjects: []
}
