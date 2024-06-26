import { View } from './view';

export interface ViewSettings {
  currentView?: View;
  views?: Record<string, View>;
}
