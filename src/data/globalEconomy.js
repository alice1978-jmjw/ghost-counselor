export const globalEconomyData = {
  "San Francisco": { currency: "USD", monthlyRent: 3500, monthlyGroceries: 600, entryTechSalary: 85000, vibe: "Brutally expensive tech hub." },
  "London": { currency: "GBP", monthlyRent: 2000, monthlyGroceries: 350, entryTechSalary: 40000, vibe: "High taxes, expensive transit." },
  "Tokyo": { currency: "JPY", monthlyRent: 150000, monthlyGroceries: 60000, entryTechSalary: 4000000, vibe: "Extreme work culture, rigid hierarchy." },
  "New York": { currency: "USD", monthlyRent: 4000, monthlyGroceries: 500, entryTechSalary: 75000, vibe: "Need 3 roommates to survive." },
  "Digital Nomad": { currency: "USD", monthlyRent: 900, monthlyGroceries: 300, entryTechSalary: 50000, vibe: "Timezone hell, lonely, tax nightmares." }
};

export function getCityData(city) {
  return globalEconomyData[city] || globalEconomyData["New York"]; // Defaults to NY if not found
}
