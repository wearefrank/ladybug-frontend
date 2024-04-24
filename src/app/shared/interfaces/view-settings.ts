import { View } from './view';

export interface ViewSettings {
  currentView: View;
  currentViewName: string;
  defaultView: string;
  views: Record<string, View>;
}
