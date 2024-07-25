import { IconData } from '../interfaces/icon-data';

export const enum CheckpointType {
  Startpoint = 1,
  Endpoint,
  Abortpoint,
  Inputpoint,
  Outputpoint,
  Infopoint,
  ThreadStartpointError,
  ThreadStartpoint,
  ThreadEndpoint,
}

export const CHECKPOINT_TYPE_STRINGS: { [key in CheckpointType]: IconData } = {
  //For the css classes, the tree-checkpoint should be at the end so that 'even' or 'odd' can be added to the class name; 'tree-checkpoint-even'.
  [CheckpointType.Startpoint]: { path: 'assets/tree-icons/startpoint.svg', cssClasses: 'tree-checkpoint' },
  [CheckpointType.Endpoint]: { path: 'assets/tree-icons/startpoint.svg', cssClasses: 'endpoint tree-checkpoint' },
  [CheckpointType.Abortpoint]: { path: 'assets/tree-icons/abortpoint.svg', cssClasses: 'tree-checkpoint' },
  [CheckpointType.Inputpoint]: { path: 'assets/tree-icons/inputpoint.svg', cssClasses: 'tree-checkpoint' },
  [CheckpointType.Outputpoint]: { path: 'assets/tree-icons/inputpoint.svg', cssClasses: 'endpoint tree-checkpoint' },
  [CheckpointType.Infopoint]: { path: 'assets/tree-icons/infopoint.svg', cssClasses: 'tree-checkpoint' },
  [CheckpointType.ThreadStartpointError]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: 'tree-checkpoint-error',
  },
  [CheckpointType.ThreadStartpoint]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: 'endpoint tree-checkpoint',
  },
  [CheckpointType.ThreadEndpoint]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: 'endpoint tree-checkpoint',
  },
};
