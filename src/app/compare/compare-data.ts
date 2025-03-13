/* eslint sonarjs/no-gratuitous-expressions: 0 */

import { Report } from '../shared/interfaces/report';

export interface CompareData {
  id: string;
  originalReport: Report;
  runResultReport: Report;
  viewName?: string;
}
