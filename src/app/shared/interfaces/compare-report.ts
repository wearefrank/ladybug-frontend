import {Report} from "./report";

export interface CompareReport {
  reports: Report[],
  id: string,
  current: any,
  selected: boolean
}
