import React from "react"

interface TabsProps {
  tabs: Array<{
    label: string
    value: string
    content: React.ReactNode
  }>
  activeTab: string
  onTabChange: (value: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="w-full">
      <div className="flex gap-2 p-1 bg-gray-50 rounded-lg mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
              activeTab === tab.value
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        {tabs.find((tab) => tab.value === activeTab)?.content}
      </div>
    </div>
  )
}
