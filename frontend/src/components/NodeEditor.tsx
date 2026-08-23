import { useEffect, useState } from "react"

type NodeEditorProps = {
  prompt: string
  onSave: (prompt: string) => void
  onClose: () => void
}

export default function NodeEditor({
  prompt,
  onSave,
  onClose,
}: NodeEditorProps) {
  const [value, setValue] = useState(prompt)

  useEffect(() => {
    setValue(prompt)
  }, [prompt])

  const handleSave = () => {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return
    }

    onSave(trimmedValue)
  }

  return (
    <div className="absolute right-4 top-4 z-20 w-[360px] rounded-xl border bg-white p-5 shadow-xl">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            AI Decision
          </p>

          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            Edit Prompt
          </h2>
        </div>

        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {/* Prompt */}
      <div>
        <label
          htmlFor="decision-prompt"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Decision question
        </label>

        <textarea
          id="decision-prompt"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter the question the AI should answer..."
          rows={6}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200"
        />

        <p className="mt-2 text-xs text-gray-500">
          The AI will eventually answer this question with only YES or NO.
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!value.trim()}
        className="mt-5 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save Prompt
      </button>
    </div>
  )
}