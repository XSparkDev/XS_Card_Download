# Currency Converter Implementation Prompt

## Overview
Implement a currency converter for a pricing section that supports ZAR and USD with real-time conversion and dynamic pricing.

## Core Files to Create

### 1. `lib/currency.ts` - Currency Logic
```typescript
export type Currency = "ZAR" | "USD"

interface CurrencyOption {
  code: Currency
  name: string
  symbol: string
  flag: string
}

export const currencies: CurrencyOption[] = [
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    flag: ""
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: ""
  }
]

// Exchange rates (you can update these or fetch from an API)
const EXCHANGE_RATES = {
  ZAR: 1,
  USD: 0.067 // 1 ZAR = 0.067 USD (approximately)
}

export function convertPrice(price: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return price
  
  // Convert to USD first, then to target currency
  const usdAmount = fromCurrency === "USD" ? price : price * EXCHANGE_RATES.USD
  return toCurrency === "USD" ? usdAmount : usdAmount / EXCHANGE_RATES.USD
}

export function formatPrice(price: number, currency: Currency): string {
  const currencyInfo = currencies.find(c => c.code === currency)
  if (!currencyInfo) return `${price.toFixed(2)}`
  
  if (currency === "ZAR") {
    return `${currencyInfo.symbol}${price.toFixed(2)}`
  } else {
    return `${currencyInfo.symbol}${price.toFixed(2)}`
  }
}
```

### 2. `components/ui/currency-selector.tsx` - Dropdown Component
```typescript
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
```

## Implementation in Main Page

### 3. State Management
```typescript
// Add to your main page component
import { CurrencySelector } from "@/components/ui/currency-selector"
import { type Currency, convertPrice, formatPrice } from "@/lib/currency"

// Currency state
const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD")
```

### 4. Pricing Section Structure
```typescript
{/* Pricing Section */}
<section id="pricing" className="px-6 py-20 relative bg-gradient-to-br from-gray-50 to-white">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Pricing Plans</h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        Choose the perfect plan for your business needs. All prices are exclusive of VAT.
      </p>
      <div className="flex justify-center">
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Free Plan */}
      <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {formatPrice(convertPrice(0, "ZAR", selectedCurrency), selectedCurrency)}
            </div>
            <div className="text-gray-600">/month</div>
          </div>
          {/* Features list */}
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className="bg-white border-2 border-purple-500 hover:border-purple-600 transition-all duration-300 relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-custom-btn-gradient text-white px-4 py-1">
            Most Popular
          </Badge>
        </div>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {selectedCurrency === "USD" ? "$12.00" : "R159.99"}
            </div>
            <div className="text-gray-600">/user/month</div>
            <div className="text-sm text-purple-600 mt-1">
              {selectedCurrency === "USD" ? "$120.00" : "R1,800"}/year (Save {selectedCurrency === "USD" ? "$24.00" : "R120"} with annual billing)
            </div>
          </div>
          {/* Features list */}
        </CardContent>
      </Card>

      {/* Enterprise Plan */}
      <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Plan</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
            <div className="text-gray-600">Pricing</div>
            <div className="text-sm text-gray-500 mt-1">Contact our sales team</div>
          </div>
          {/* Features list */}
        </CardContent>
      </Card>
    </div>

    <div className="mt-12 text-center">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-2">
            <p>• All prices are exclusive of VAT</p>
            <p>• Secure payment through {selectedCurrency === "ZAR" ? "SA banks" : "international payment gateways"}</p>
            <p>• Monthly plans can be cancelled anytime</p>
            <p>• Annual plans offer significant savings</p>
          </div>
          <div className="space-y-2">
            <p>• All paid plans include 7-day free trial</p>
            <p>• Billing in {selectedCurrency}</p>
            <p>• POPIA compliant</p>
            <p>• Full mobile app access included</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Key Features

### 1. Currency Selector
- **Globe icon** with currency code display
- **Dropdown menu** with currency name
- **Click outside to close** functionality
- **Hover and focus states** with purple accent
- **Smooth animations** for dropdown and chevron rotation

### 2. Pricing Logic
- **Free plan**: Uses `convertPrice(0, "ZAR", selectedCurrency)` for dynamic conversion
- **Premium plan**: Hardcoded values for each currency (USD: $12.00, ZAR: R159.99)
- **Enterprise plan**: Shows "Custom" pricing
- **Annual savings**: Displays different amounts based on currency

### 3. Dynamic Content
- **Payment methods**: Changes based on currency (SA banks vs international gateways)
- **Billing currency**: Text updates dynamically
- **All prices**: Update in real-time when currency changes

### 4. Styling
- **White background** with gray border
- **Purple focus ring** matching brand colors
- **Smooth transitions** for all interactions
- **Responsive design** for mobile and desktop
- **Shadow effects** for depth

## Dependencies
- `lucide-react` for icons (Globe, ChevronDown)
- `@/lib/utils` for `cn` function
- Tailwind CSS for styling

## Usage
1. Import the currency selector and utilities
2. Add currency state to your component
3. Place the selector in the pricing section
4. Use `convertPrice()` and `formatPrice()` for dynamic pricing
5. Update text based on `selectedCurrency`

This implementation provides a complete currency converter that updates pricing and related text in real-time when users switch between ZAR and USD.
