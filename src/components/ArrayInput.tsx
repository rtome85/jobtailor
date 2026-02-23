import React, { useState } from "react"

interface ArrayInputProps<T> {
  items: T[]
  onAdd: () => void
  onUpdate: (index: number, item: T) => void
  onRemove: (index: number) => void
  renderItem: (
    item: T,
    index: number,
    onUpdate: (item: T) => void
  ) => React.ReactNode
  emptyMessage: string
  addButtonText: string
}

export function ArrayInput<T>({
  items,
  onAdd,
  onUpdate,
  onRemove,
  renderItem,
  emptyMessage,
  addButtonText
}: ArrayInputProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          <button
            onClick={onAdd}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg
                     hover:bg-purple-200 transition-colors font-medium">
            + {addButtonText}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4
                         hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="flex items-center text-gray-700 hover:text-gray-900">
                    <svg
                      className={`w-4 h-4 mr-2 transition-transform ${
                        expandedItems.has(index) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    {expandedItems.has(index) ? "Collapse" : "Expand"}
                  </button>

                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete item">
                    <svg
                      className="w-5 h-5"
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

                {expandedItems.has(index) && (
                  <div className="mt-4">
                    {renderItem(item, index, (updatedItem) =>
                      onUpdate(index, updatedItem)
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onAdd}
            className="w-full py-3 border-2 border-dashed border-gray-300
                     rounded-lg text-gray-600 hover:border-purple-400
                     hover:text-purple-600 transition-colors font-medium">
            + Add {addButtonText}
          </button>
        </>
      )}
    </div>
  )
}
