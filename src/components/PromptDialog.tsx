import React from "react"

interface PromptDialogProps {
  isOpen: boolean
  title: string
  prompt: string
  onClose: () => void
  onSave: (prompt: string) => void
}

export function PromptDialog({
  isOpen,
  title,
  prompt,
  onClose,
  onSave
}: PromptDialogProps) {
  const [editedPrompt, setEditedPrompt] = React.useState(prompt)

  React.useEffect(() => {
    setEditedPrompt(prompt)
  }, [prompt])

  const handleSave = () => {
    onSave(editedPrompt)
    onClose()
  }

  const handleCancel = () => {
    setEditedPrompt(prompt)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="w-full h-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     font-mono text-sm resize-none"
            placeholder="Enter your prompt here..."
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
