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
  [CheckpointType.Startpoint]: { path: 'assets/tree-icons/startpoint.svg', cssClasses: 'startpoint' },
  [CheckpointType.Endpoint]: { path: 'assets/tree-icons/startpoint.svg', cssClasses: 'endpoint' },
  [CheckpointType.Abortpoint]: { path: 'assets/tree-icons/abortpoint.svg', cssClasses: 'abortpoint' },
  [CheckpointType.Inputpoint]: { path: 'assets/tree-icons/inputpoint.svg', cssClasses: 'inputpoint' },
  [CheckpointType.Outputpoint]: { path: 'assets/tree-icons/inputpoint.svg', cssClasses: 'outputpoint' },
  [CheckpointType.Infopoint]: { path: 'assets/tree-icons/infopoint.svg', cssClasses: 'infopoint' },
  [CheckpointType.ThreadStartpointError]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: 'thread-startpoint-error',
  },
  [CheckpointType.ThreadStartpoint]: {
    path: 'assets/tree-icons/threadStartPoint.svg',
    cssClasses: 'thread-startpoint',
  },
  [CheckpointType.ThreadEndpoint]: { path: 'assets/tree-icons/threadStartPoint.svg', cssClasses: 'thread-endpoint' },
};
