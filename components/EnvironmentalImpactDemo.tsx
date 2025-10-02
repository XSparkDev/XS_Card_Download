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
        <div className="max-w-md mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Employees
              </label>
               <input
                 type="text"
                 value={employees}
                 onChange={(e) => {
                   const value = e.target.value.replace(/[^0-9]/g, '');
                   setEmployees(parseInt(value) || 0);
                 }}
                 className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 placeholder="100"
               />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cards per Employee/Year
              </label>
               <input
                 type="text"
                 value={cardsPerEmployee}
                 onChange={(e) => {
                   const value = e.target.value.replace(/[^0-9]/g, '');
                   setCardsPerEmployee(parseInt(value) || 0);
                 }}
                 className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                 placeholder="50"
               />
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
