import { Report } from './report';
import { CompareData } from '../../compare/compare-data';

export interface Tab {
  key: string;
  id: string;
  data?: Report | CompareData;
  path: string;
}
