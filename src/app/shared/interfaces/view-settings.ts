import { View } from './view';

export interface ViewSettings {
  defaultView: string;
  views: Record<string, View>;
  currentView: any;
  currentViewName: string;
}
