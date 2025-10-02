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
