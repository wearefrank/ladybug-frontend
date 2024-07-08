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

export const CHECKPOINT_TYPE_STRINGS: { [key in CheckpointType]: string } = {
  [CheckpointType.Startpoint]: 'startpoint',
  [CheckpointType.Endpoint]: 'endpoint',
  [CheckpointType.Abortpoint]: 'abortpoint',
  [CheckpointType.Inputpoint]: 'inputpoint',
  [CheckpointType.Outputpoint]: 'outputpoint',
  [CheckpointType.Infopoint]: 'infopoint',
  [CheckpointType.ThreadStartpointError]: 'threadStartpoint-error',
  [CheckpointType.ThreadStartpoint]: 'threadStartpoint',
  [CheckpointType.ThreadEndpoint]: 'threadEndpoint',
};
