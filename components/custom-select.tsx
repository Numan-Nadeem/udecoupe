'use client'

import { useState, useRef, useEffect } from 'react'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-card-foreground shadow-sm outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/25 flex items-center justify-between"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M10 4L6 8L2 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full rounded-2xl border border-border bg-card shadow-[0_12px_32px_-12px_color-mix(in_oklch,var(--primary)_25%,transparent)] z-50 overflow-hidden animate-rise">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  value === option.value
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-card-foreground hover:bg-secondary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
