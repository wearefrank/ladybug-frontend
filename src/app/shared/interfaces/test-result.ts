import {Report} from "./report";

export interface TestResult {
  currentTime: number,
  previousTime: number,
  report: Report,
  stubbed: number,
  total: number
}
