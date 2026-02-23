import React from "react"

interface DatePickerProps {
  label: string
  value: string | null
  onChange: (date: string | null) => void
  required?: boolean
  showCurrentPosition?: boolean
  currentPosition?: boolean
  onCurrentPositionChange?: (checked: boolean) => void
}

export function DatePicker({
  label,
  value,
  onChange,
  required = false,
  showCurrentPosition = false,
  currentPosition = false,
  onCurrentPositionChange
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    onChange(date || null)
  }

  const handleCurrentPositionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked
    onCurrentPositionChange?.(isChecked)
    if (isChecked) {
      onChange(null)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type="date"
        value={value || ""}
        onChange={handleDateChange}
        disabled={currentPosition}
        required={required && !currentPosition}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-purple-500 focus:border-transparent
                 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />

      {showCurrentPosition && (
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={currentPosition}
            onChange={handleCurrentPositionChange}
            className="mr-2 rounded border-gray-300 text-purple-600
                     focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Current Position</span>
        </label>
      )}
    </div>
  )
}
