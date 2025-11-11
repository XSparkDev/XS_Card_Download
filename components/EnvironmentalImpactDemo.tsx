"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  calculatePaperSaved, 
  calculateWaterSaved, 
  calculateCO2Saved, 
  calculateTreesSaved,
  calculateCostSaved
} from '@/utils/environmentalImpact'

export default function EnvironmentalImpactDemo() {
  const maxEmployees = 100000
  const maxCardsPerEmployee = 100

  const updateEmployees = (value: number) => {
    const clamped = Math.max(1, Math.min(maxEmployees, value))
    setEmployees(clamped)
  }

  const updateCardsPerEmployee = (value: number) => {
    const clamped = Math.max(1, Math.min(maxCardsPerEmployee, value))
    setCardsPerEmployee(clamped)
  }

  const [employees, setEmployees] = useState<number>(100)
  const [cardsPerEmployee, setCardsPerEmployee] = useState<number>(50)
  
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
                {employees >= maxEmployees ? `${maxEmployees.toLocaleString()}+` : employees.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => updateEmployees(employees - 1)}
                disabled={employees <= 1}
              >
                −
              </Button>
              <input
                type="range"
                min={1}
                max={maxEmployees}
                step={1}
                value={employees}
                onChange={(e) => updateEmployees(parseInt(e.target.value, 10))}
                className="flex-1 accent-green-400"
              />
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => updateEmployees(employees + 1)}
                disabled={employees >= maxEmployees}
              >
                +
              </Button>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{'1'}</span>
              <span>{`${maxEmployees.toLocaleString()}+`}</span>
            </div>
            </div>

            <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white/80">
                Cards per Employee/Year
              </label>
              <span className="text-sm font-semibold text-white">
                {cardsPerEmployee >= maxCardsPerEmployee ? `${maxCardsPerEmployee}+` : cardsPerEmployee}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => updateCardsPerEmployee(cardsPerEmployee - 1)}
                disabled={cardsPerEmployee <= 1}
              >
                −
              </Button>
              <input
                type="range"
                min={1}
                max={maxCardsPerEmployee}
                step={1}
                value={cardsPerEmployee}
                onChange={(e) => updateCardsPerEmployee(parseInt(e.target.value, 10))}
                className="flex-1 accent-purple-400"
              />
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => updateCardsPerEmployee(cardsPerEmployee + 1)}
                disabled={cardsPerEmployee >= maxCardsPerEmployee}
              >
                +
              </Button>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>{'1'}</span>
              <span>{`${maxCardsPerEmployee}+`}</span>
            </div>
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
