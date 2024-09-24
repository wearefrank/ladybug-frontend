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

const checkPointClass = 'tree-checkpoint';

export const CHECKPOINT_TYPE_STRINGS: { [key in CheckpointType]: IconData } = {
  //For the css classes, the tree-checkpoint should be at the end so that 'even' or 'odd' can be added to the class name; 'tree-checkpoint-even'.
  [CheckpointType.Startpoint]: {
    path: 'assets/tree-icons/startpoint.svg',
    cssClasses: checkPointClass,
  },
  [CheckpointType.Endpoint]: {
    path: 'assets/tree-icons/startpoint.svg',
    cssClasses: `endpoint ${checkPointClass}`,
  },
  [CheckpointType.Abortpoint]: {
    path: 'assets/tree-icons/abortpoint.svg',
    cssClasses: checkPointClass,
  },
  [CheckpointType.Inputpoint]: {
    path: 'assets/tree-icons/inputpoint.svg',
    cssClasses: checkPointClass,
  },
  [CheckpointType.Outputpoint]: {
    path: 'assets/tree-icons/inputpoint.svg',
    cssClasses: `endpoint ${checkPointClass}`,
  },
  [CheckpointType.Infopoint]: {
    path: 'assets/tree-icons/infopoint.svg',
    cssClasses: checkPointClass,
  },
  [CheckpointType.ThreadStartpointError]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: `${checkPointClass}-error`,
  },
  [CheckpointType.ThreadStartpoint]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: checkPointClass,
  },
  [CheckpointType.ThreadEndpoint]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: `endpoint ${checkPointClass}`,
  },
};
