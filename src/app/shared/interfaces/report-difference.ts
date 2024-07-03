export interface ReportDifference {
  name: string;
  originalValue: string;
  difference: (number | string)[][];
}
