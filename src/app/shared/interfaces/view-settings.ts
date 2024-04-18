import { View } from './view';

export interface ViewSettings {
  currentView: any;
  currentViewName: string;
  defaultView: string;
  views: Record<string, View>;
}
