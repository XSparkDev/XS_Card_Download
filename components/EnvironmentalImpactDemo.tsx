"use client"

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  calculatePaperSaved, 
  calculateWaterSaved, 
  calculateCO2Saved, 
  calculateTreesSaved,
  calculateCostSaved
} from '@/utils/environmentalImpact'

const REPEAT_INITIAL_DELAY_MS = 300
const REPEAT_INTERVAL_MS = 120

type HoldActionConfig = {
  initialAction: () => void
  repeatAction: () => void
  disabled: boolean
}

const useHoldAction = ({
  initialAction,
  repeatAction,
  disabled,
}: HoldActionConfig) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handlePressStart = (event?: ReactMouseEvent<HTMLButtonElement> | ReactTouchEvent<HTMLButtonElement>) => {
    if (disabled) {
      return
    }

    if (event?.type === "touchstart") {
      event.preventDefault()
    }

    clearTimers()
    initialAction()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(repeatAction, REPEAT_INTERVAL_MS)
    }, REPEAT_INITIAL_DELAY_MS)
  }

  const handlePressEnd = () => {
    clearTimers()
  }

  useEffect(() => {
    if (disabled) {
      clearTimers()
    }
  }, [disabled])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [])

  return {
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressEnd,
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressEnd,
  }
}

export default function EnvironmentalImpactDemo() {
  const sliderMaxEmployees = 100000
  const sliderMaxCardsPerEmployee = 100
  const absoluteMaxEmployees = 1_000_000
  const absoluteMaxCardsPerEmployee = 1_000

  const [employees, setEmployees] = useState<number>(100)
  const [cardsPerEmployee, setCardsPerEmployee] = useState<number>(50)

  const employeesSliderValue = Math.min(employees, sliderMaxEmployees)
  const cardsSliderValue = Math.min(cardsPerEmployee, sliderMaxCardsPerEmployee)

  const isEmployeesBeyondSlider = employees >= sliderMaxEmployees
  const isCardsBeyondSlider = cardsPerEmployee >= sliderMaxCardsPerEmployee
  
  const handleManualInput = (value: string, setter: (next: number) => void, minimum: number) => {
    if (value.trim() === "") {
      return
    }
    const parsed = parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      setter(Math.max(minimum, parsed))
    }
  }

  const adjustEmployees = (delta: number) => {
    setEmployees((prev) => {
      const next = Math.max(1, Math.min(absoluteMaxEmployees, prev + delta))
      return next
    })
  }

  const adjustCards = (delta: number) => {
    setCardsPerEmployee((prev) => {
      const next = Math.max(1, Math.min(absoluteMaxCardsPerEmployee, prev + delta))
      return next
    })
  }

  const decrementEmployeesHandlers = useHoldAction({
    initialAction: () => adjustEmployees(-1),
    repeatAction: () => adjustEmployees(-100),
    disabled: employees <= 1,
  })

  const incrementEmployeesHandlers = useHoldAction({
    initialAction: () => adjustEmployees(1),
    repeatAction: () => adjustEmployees(100),
    disabled: false,
  })

  const decrementCardsHandlers = useHoldAction({
    initialAction: () => adjustCards(-1),
    repeatAction: () => adjustCards(-1),
    disabled: cardsPerEmployee <= 1,
  })

  const incrementCardsHandlers = useHoldAction({
    initialAction: () => adjustCards(1),
    repeatAction: () => adjustCards(1),
    disabled: false,
  })
  
  // Calculate total "scans" (equivalent to physical cards that would be used)
  const totalCards = employees * cardsPerEmployee
  
  // Calculate environmental impact
  const paperSaved = calculatePaperSaved(totalCards)
  const waterSaved = calculateWaterSaved(paperSaved)
  const co2Saved = calculateCO2Saved(paperSaved)
  const treesSaved = calculateTreesSaved(paperSaved)
  const costSaved = calculateCostSaved(totalCards)

  return (
    <section id="environmental-impact" className="px-6 py-20 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Environmental Impact Calculator
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            See how much your company can impact the environment and save money by switching from physical to digital business cards
          </p>
        </div>
        
        {/* Input Fields */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/80">
                Employees
              </label>
              <span className="text-sm font-semibold text-white">
                {employees >= sliderMaxEmployees ? `${sliderMaxEmployees.toLocaleString()}+` : employees.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={employees <= 1}
                {...decrementEmployeesHandlers}
                onClick={(event) => {
                  if (event.detail === 0) {
                    adjustEmployees(-1)
                  }
                }}
              >
                −
              </Button>
              <input
                type="range"
                min={1}
                max={sliderMaxEmployees}
                step={1}
                value={employeesSliderValue}
                onChange={(e) => setEmployees(Math.min(parseInt(e.target.value, 10), absoluteMaxEmployees))}
                className="flex-1 accent-green-400"
              />
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                {...incrementEmployeesHandlers}
                onClick={(event) => {
                  if (event.detail === 0) {
                    adjustEmployees(1)
                  }
                }}
              >
                +
              </Button>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{'1'}</span>
              <span>{`${sliderMaxEmployees.toLocaleString()}+`}</span>
            </div>
            {isEmployeesBeyondSlider && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Need more than {sliderMaxEmployees.toLocaleString()} employees? Enter the total below.
                </label>
                <input
                  type="number"
                  min={sliderMaxEmployees}
                  max={absoluteMaxEmployees}
                  value={employees}
                  onChange={(e) => handleManualInput(e.target.value, setEmployees, 1)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
            </div>

            <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/80">
                Cards per Employee/Year
              </label>
              <span className="text-sm font-semibold text-white">
                {cardsPerEmployee >= sliderMaxCardsPerEmployee ? `${sliderMaxCardsPerEmployee}+` : cardsPerEmployee}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={cardsPerEmployee <= 1}
                {...decrementCardsHandlers}
                onClick={(event) => {
                  if (event.detail === 0) {
                    adjustCards(-1)
                  }
                }}
              >
                −
              </Button>
              <input
                type="range"
                min={1}
                max={sliderMaxCardsPerEmployee}
                step={1}
                value={cardsSliderValue}
                onChange={(e) => setCardsPerEmployee(Math.min(parseInt(e.target.value, 10), absoluteMaxCardsPerEmployee))}
                className="flex-1 accent-purple-400"
              />
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                {...incrementCardsHandlers}
                onClick={(event) => {
                  if (event.detail === 0) {
                    adjustCards(1)
                  }
                }}
              >
                +
              </Button>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{'1'}</span>
              <span>{`${sliderMaxCardsPerEmployee}+`}</span>
            </div>
            {isCardsBeyondSlider && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Need more than {sliderMaxCardsPerEmployee}+ cards per employee? Enter the total below.
                </label>
                <input
                  type="number"
                  min={sliderMaxCardsPerEmployee}
                  max={absoluteMaxCardsPerEmployee}
                  value={cardsPerEmployee}
                  onChange={(e) => handleManualInput(e.target.value, setCardsPerEmployee, 1)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Impact Display */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Your Company Impact
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                  {paperSaved}kg
                </div>
                <div className="text-sm sm:text-base font-semibold text-white/90">Paper Saved</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-2">
                  {waterSaved.toLocaleString()}L
                </div>
                <div className="text-sm sm:text-base font-semibold text-white/90">Water Saved</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-2">
                  {co2Saved}kg
                </div>
                <div className="text-sm sm:text-base font-semibold text-white/90">CO₂ Avoided</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-2">
                  {treesSaved}
                </div>
                <div className="text-sm sm:text-base font-semibold text-white/90">Trees Saved</div>
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">
                  R{costSaved.toLocaleString()}
                </div>
                <div className="text-sm sm:text-base font-semibold text-white/90">Cost Saved</div>
              </div>
            </div>

             <div className="mt-8 text-center">
               <p className="text-base sm:text-lg font-semibold text-white/80">
                 Total Cards Replaced: <span className="text-green-400">{totalCards.toLocaleString()}</span>
               </p>
               <p className="text-lg sm:text-xl font-bold text-white mt-2">
                 That's {totalCards.toLocaleString()} business cards you'd never need to print again!
               </p>
             </div>
          </CardContent>
        </Card>

      </div>
    </section>
  )
}
