import React from "react"

import type { Skill } from "~types/userProfile"

interface SkillEditorProps {
  skills: Skill[]
  onChange: (skills: Skill[]) => void
}

const validateSkill = (skill: Skill): string[] => {
  const errors = []
  if (!skill.name.trim()) errors.push("Skill name is required")
  if (skill.yearsOfExperience <= 0)
    errors.push("Years of experience must be greater than 0")
  if (skill.yearsOfExperience > 50)
    errors.push("Years of experience seems unrealistic")
  return errors
}

export function SkillEditor({ skills, onChange }: SkillEditorProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    const newSkills = skills.map((skill) =>
      skill.id === id ? { ...skill, ...updates } : skill
    )
    onChange(newSkills)
  }

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id))
  }

  const addSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "",
      yearsOfExperience: 1
    }
    onChange([...skills, newSkill])
    setEditingId(newSkill.id)
  }

  return (
    <div className="space-y-3">
      {skills.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4 text-sm">
            No skills added yet. Add your skills to showcase your expertise!
          </p>
          <button
            onClick={addSkill}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg
                     hover:bg-purple-700 transition-all hover:shadow-md
                     font-medium">
            Add Your First Skill
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {skills.map((skill) => {
              const errors = validateSkill(skill)
              const hasErrors = errors.length > 0
              const isEditing = editingId === skill.id

              return (
                <div
                  key={skill.id}
                  className={`bg-white rounded-lg border transition-all
                           hover:shadow-md ${
                             isEditing
                               ? "border-purple-400 shadow-md"
                               : "border-gray-200"
                           }`}>
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Skill Name
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(skill.id, { name: e.target.value })
                            }
                            placeholder="e.g., React, TypeScript"
                            autoFocus
                            className={`w-full px-3 py-2 border rounded-lg
                                     focus:ring-2 focus:ring-purple-500
                                     focus:border-transparent text-sm ${
                                       hasErrors && !skill.name
                                         ? "border-red-400"
                                         : "border-gray-300"
                                     }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Years of Experience
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={skill.yearsOfExperience}
                              onChange={(e) =>
                                updateSkill(skill.id, {
                                  yearsOfExperience:
                                    parseInt(e.target.value) || 1
                                })
                              }
                              min="1"
                              max="50"
                              className={`flex-1 px-3 py-2 border rounded-lg
                                       focus:ring-2 focus:ring-purple-500
                                       focus:border-transparent text-sm ${
                                         hasErrors
                                           ? "border-red-400"
                                           : "border-gray-300"
                                       }`}
                            />
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-4 py-2 bg-green-100 text-green-700
                                       rounded-lg hover:bg-green-200
                                       transition-colors font-medium text-sm">
                              Done
                            </button>
                          </div>
                        </div>

                        {hasErrors && (
                          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                            {errors.join(" • ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {skill.name || (
                              <span className="text-gray-400 italic">
                                Untitled skill
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {skill.yearsOfExperience} year
                            {skill.yearsOfExperience !== 1 ? "s" : ""} of
                            experience
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingId(skill.id)}
                            className="p-2 text-gray-400 hover:text-purple-600
                                     hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit skill">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="p-2 text-gray-400 hover:text-red-600
                                     hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove skill">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={addSkill}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg
                     hover:bg-gray-200 transition-colors font-medium">
            + Add Skill
          </button>
        </>
      )}
    </div>
  )
}
