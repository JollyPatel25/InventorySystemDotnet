export interface DailyForecast {
  date: string;
  predictedQuantity: number;
}

export interface PredictionResponseDto {
  predictedQuantity: number;
  confidence: number;
  trend: 'rising' | 'falling' | 'stable';
  trendPercent: number;
  forecast7Days: DailyForecast[];
  stockoutRiskDays: number | null;
  recommendedReorderQty: number | null;
  anomalyDetected: boolean;
  anomalyDescription: string | null;
  insightMessage: string;
  modelUsed: string;
}