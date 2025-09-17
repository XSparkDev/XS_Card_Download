/**
 * Utility functions related to environmental impact calculations
 */

/**
 * Calculates the amount of paper saved (in kilograms) by using digital business cards
 * Based on the formula: (scans × cardWeight) / 1000
 * Where cardWeight is 1.5 grams per card
 * 
 * @param scans - Number of digital card scans/views
 * @returns Amount of paper saved in kilograms, rounded to 2 decimal places
 */
export const calculatePaperSaved = (scans: number): number => {
  const cardWeight = 1.5; // approximate grams per card
  const paperSavedKg = (scans * cardWeight) / 1000;
  return Number(paperSavedKg.toFixed(2)); // Round to 2 decimal places
};

/**
 * Calculates the amount of water saved (in litres) by avoiding paper business cards
 * Based on the fact that 1,000 kg (1 ton) of paper requires 324,000 litres of water
 * 
 * @param paperSavedKg - Amount of paper saved in kilograms
 * @returns Amount of water saved in litres, rounded to the nearest whole number
 */
export const calculateWaterSaved = (paperSavedKg: number): number => {
  const waterSavedLitres = (paperSavedKg / 1000) * 324000;
  return Math.round(waterSavedLitres); // Round to nearest whole number
};

/**
 * Calculates the amount of CO₂ emissions avoided (in kilograms) by not producing paper
 * Based on the fact that for every 1 kg of paper produced locally in South Africa, 
 * 1.1 kg of CO₂ would be emitted
 * 
 * @param paperSavedKg - Amount of paper saved in kilograms
 * @returns Amount of CO₂ emissions avoided in kilograms, rounded to 2 decimal places
 */
export const calculateCO2Saved = (paperSavedKg: number): number => {
  const co2SavedKg = paperSavedKg * 1.1;
  return Number(co2SavedKg.toFixed(2)); // Round to 2 decimal places
};

/**
 * Calculates the number of trees saved by not using paper
 * Based on:
 * - 1 tree produces 10,000 sheets of paper
 * - 1 kg of paper equals 200 sheets
 * 
 * @param paperSavedKg - Amount of paper saved in kilograms
 * @returns Number of trees saved, rounded to 4 decimal places
 */
export const calculateTreesSaved = (paperSavedKg: number): number => {
  const sheetsPerKg = 200;
  const sheetsPerTree = 10000;
  
  const sheetsSaved = paperSavedKg * sheetsPerKg;
  const treesSaved = sheetsSaved / sheetsPerTree;
  
  return Number(treesSaved.toFixed(4)); // Round to 4 decimal places
};

/**
 * Calculates the growth rate (percentage) between current and previous values
 * 
 * @param currentValue - The current metric value
 * @param previousValue - The previous metric value
 * @returns Growth rate as percentage, rounded to 1 decimal place
 */
export const calculateGrowthRate = (currentValue: number, previousValue: number): number => {
  if (previousValue === 0) return 0; // Avoid division by zero
  
  const growthRate = ((currentValue - previousValue) / previousValue) * 100;
  return Number(growthRate.toFixed(1)); // Round to 1 decimal place
};

/**
 * Calculates month-over-month growth percentage based on new additions (not cumulative totals)
 * This is more accurate for measuring actual growth rates
 * 
 * @param currentMonthNew - Number of new items added in current month
 * @param previousMonthNew - Number of new items added in previous month
 * @returns Growth rate as percentage, rounded to 1 decimal place
 */
export const calculateMonthOverMonthGrowth = (currentMonthNew: number, previousMonthNew: number): number => {
  if (previousMonthNew === 0) {
    // If previous month had no new additions but current month does, show 100% growth
    return currentMonthNew > 0 ? 100 : 0;
  }
  
  const growthRate = ((currentMonthNew - previousMonthNew) / previousMonthNew) * 100;
  return Number(growthRate.toFixed(1)); // Round to 1 decimal place
};

/**
 * Sorts month-year strings chronologically (e.g., "Jan 2023", "Feb 2023")
 * 
 * @param a - First month string
 * @param b - Second month string
 * @returns Comparison result for sorting
 */
export const sortMonthsChronologically = (a: string, b: string): number => {
  try {
    // Parse month strings like "Jan 2023" to Date objects
    const dateA = new Date(a);
    const dateB = new Date(b);
    
    // Fallback: if Date parsing fails, try manual parsing
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);
      
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      
      return monthIndexA - monthIndexB;
    }
    
    return dateA.getTime() - dateB.getTime();
  } catch (e) {
    console.warn('Error sorting months:', a, b, e);
    return 0;
  }
};

/**
 * Calculates the cost savings (in Rand) by using digital business cards instead of physical ones
 * Based on the average cost of R450 per 500 printed business cards (R0.90 per card)
 * 
 * @param scans - Number of digital card scans/views (representing avoided physical cards)
 * @returns Cost savings in Rand, rounded to 2 decimal places
 */
export const calculateCostSaved = (scans: number): number => {
  const costPerCard = 0.90; // R0.90 per card (derived from R450 per 500 cards)
  const totalSavings = scans * costPerCard;
  return Number(totalSavings.toFixed(2)); // Round to 2 decimal places
};

/**
 * Future environmental calculations can be added here
 */