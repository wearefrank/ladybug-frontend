import { MonacoAdapter } from './monaco-adapter';

describe('Monaco adapter', () => {
  it('When no checkpoint provided then in cleared state', () => {
    const instance = new MonacoAdapter();
    expect(instance.hasCheckpoint()).toEqual(false);
    expect(instance.hasUnsavedChanges()).toEqual(false);
  });

  it('When a non-null checkpoint value is set then we have a checkpoint and it is returned as the edited checkpint value', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue('something')).toEqual('something');

    expect(instance.hasCheckpoint()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(false);
    expect(instance.getEditedCheckpointValue()).toEqual('something');
    expect(instance.getEditedToNull()).toEqual(false);

    instance.onEditorContentsChanged('something');

    expect(instance.hasCheckpoint()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(false);
    expect(instance.getEditedCheckpointValue()).toEqual('something');
    expect(instance.getEditedToNull()).toEqual(false);
  });

  it('When a null checkpoint value is set then we have a checkpoint and it is returned as the edited checkpoint', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue(null)).toEqual('');
    expect(instance.hasCheckpoint()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(false);
    expect(instance.getEditedCheckpointValue()).toEqual(null);
    expect(instance.getEditedToNull()).toEqual(true);
    // Check that this change remains as-is when the Monaco editor confirms
    instance.onEditorContentsChanged('');
    expect(instance.hasCheckpoint()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(false);
    expect(instance.getEditedCheckpointValue()).toEqual(null);
    expect(instance.getEditedToNull()).toEqual(true);
  });

  it('When we have a non-null checkpoint then we can edit it to null', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue('something')).toEqual('something');
    expect(instance.getEditedToNull()).toEqual(false);
    // We do not depend on affirmation by the Monaco editor.
    expect(instance.setEditedToNull(true)).toEqual('');
    expect(instance.getEditedCheckpointValue()).toEqual(null);
    expect(instance.getEditedToNull()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(true);
    // Check that this change remains as-is when the Monaco editor confirms
    instance.onEditorContentsChanged('');
    expect(instance.getEditedCheckpointValue()).toEqual(null);
    expect(instance.getEditedToNull()).toEqual(true);
    expect(instance.hasUnsavedChanges()).toEqual(true);
  });

  it('When we have a null checkpoint and edit it to not-empty then it is no longer edited to null', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue(null)).toEqual('');
    expect(instance.getEditedToNull()).toEqual(true);
    instance.onEditorContentsChanged('something');
    expect(instance.getEditedCheckpointValue()).toEqual('something');
    expect(instance.getEditedToNull()).toEqual(false);
    expect(instance.hasUnsavedChanges()).toEqual(true);
  });

  it('When we have a null checkpoint and request non-null then it becomes the empty string', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue(null)).toEqual('');
    expect(instance.getEditedToNull()).toEqual(true);
    // Editor contents does not change, so setEditedToNull() returns undefined
    expect(instance.setEditedToNull(false)).toEqual(undefined);
    expect(instance.getEditedCheckpointValue()).toEqual('');
    expect(instance.getEditedToNull()).toEqual(false);
    expect(instance.hasUnsavedChanges()).toEqual(true);
  });

  it('When we have a null checkpoint and request null then no effect', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue(null)).toEqual('');
    expect(instance.getEditedToNull()).toEqual(true);
    expect(instance.setEditedToNull(true)).toEqual(undefined);
  });

  it('When we have a non-null checkpoint and request non-null then no effect', () => {
    const instance = new MonacoAdapter();
    expect(instance.setOriginalCheckpointValue('something')).toEqual('something');
    expect(instance.getEditedToNull()).toEqual(false);
    expect(instance.setEditedToNull(false)).toEqual(undefined);
  });
});
