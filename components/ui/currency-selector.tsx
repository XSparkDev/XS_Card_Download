"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Currency, currencies } from "@/lib/currency"

interface CurrencySelectorProps {
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
  className?: string
}

export function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  className 
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedCurrencyInfo = currencies.find(c => c.code === selectedCurrency)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900">{selectedCurrency}</span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-gray-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-gray-100 border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency.code)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-200 transition-colors duration-150",
                  selectedCurrency === currency.code && "bg-gray-200"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{currency.code}</span>
                  <span className="text-sm text-gray-600">{currency.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
