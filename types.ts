
export interface BudgetSettings {
  mdfSheetPrice: number;
  edgeTapePricePerMeter: number;
  laborPercentage: number;
  profitMargin: number;
}

export interface FurnitureItem {
  id: string;
  description: string;
  quantity: number;
  mdfSheetsNeeded: number;
  hardwareCost: number;
  edgeTapeMeters: number;
  extraCosts: number;
}

export interface BudgetTotal {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  suggestedPrice: number;
  profit: number;
}
