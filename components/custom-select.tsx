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
        className="group w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/25 hover:shadow-[0_4px_12px_-6px_color-mix(in_oklch,var(--primary)_20%,transparent)] flex items-center justify-between"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M11 5.5L7 10L3 5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2.5 rounded-2xl border border-border bg-card shadow-[0_16px_40px_-8px_color-mix(in_oklch,var(--primary)_30%,transparent)] z-50 overflow-hidden animate-rise">
          <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-5 py-3.5 text-sm text-left font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  value === option.value
                    ? 'bg-primary text-primary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]'
                    : 'text-card-foreground hover:bg-secondary/60 active:bg-secondary'
                } ${index !== 0 ? 'border-t border-border/50' : ''}`}
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
