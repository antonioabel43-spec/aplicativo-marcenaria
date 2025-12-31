
export interface BudgetSettings {
  mdfWhitePrice: number;
  mdfColorPrice: number;
  edge22Price: number;
  edge35Price: number;
  back3Price: number;
  back6Price: number;
  hingePrice: number;
  slidePrice: number;
  slidingKitPrice: number;
  casterPrice: number;
  rodPrice: number;
  laborPercentage: number;
  profitMargin: number;
}

export interface FurnitureItem {
  id: string;
  description: string;
  quantity: number;
  mdfType: 'white' | 'color';
  mdfSheets: number;
  edgeType: '22mm' | '35mm';
  edgeMeters: number;
  backType: '3mm' | '6mm' | 'none';
  backSheets: number;
  hinges: number;
  slides: number;
}

export interface ExtraItem {
  id: string;
  description: string;
  price: number;
  quantity: number;
}

export interface ClientData {
  name: string;
  phone: string;
  address: string;
  date: string;
  projectTitle: string;
}
