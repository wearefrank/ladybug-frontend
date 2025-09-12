// Mediating logic between the Monaco editor and checkpoints of reports.
// Handles the following:
//  * Checkpoint values are a string or null. the Monaco editor always shows a string.
//  * We should be able to show a prettified checkpoint value for JSON or XML values.
//  * When prettified text is shown it should not be possible to edit it.
//  * We keep track of whether there are unsaved changes.

export class MonacoAdapter {
  private originalCheckpointValue?: string | null;
  private editedToNull = false;
  private editedCheckpointValue?: string | null;
  private _hasUnsavedChanges = false;

  hasCheckpoint(): boolean {
    return this.originalCheckpointValue !== undefined;
  }

  hasUnsavedChanges(): boolean {
    return this._hasUnsavedChanges;
  }

  getEditedToNull(): boolean {
    return this.editedToNull;
  }

  // Returns editor contents to request
  setOriginalCheckpointValue(value: string | null): string {
    this.originalCheckpointValue = value;
    this.editedToNull = value === null;
    this.updateEditedCheckpointValue(value);
    return this.getRequestedEditorContents(this.originalCheckpointValue);
  }

  // Returns editor contents to request or undefined if the editor does not need updating
  setEditedToNull(value: boolean): string | undefined {
    if (this.originalCheckpointValue === undefined) {
      throw new Error('MonacoAdapter.setEditedToNull(): Expected that there would be a checkpoint, doing nothing');
    }
    const existingEditorContent = this.getRequestedEditorContents(this.editedCheckpointValue!);
    this.editedToNull = value;
    if (value === false && this.editedCheckpointValue === null) {
      this.updateEditedCheckpointValue('');
    }
    if (value === true && this.editedCheckpointValue !== null) {
      this.updateEditedCheckpointValue(null);
    }
    const newEditorContents = this.getRequestedEditorContents(this.editedCheckpointValue!);
    return newEditorContents === existingEditorContent ? undefined : newEditorContents;
  }

  getEditedCheckpointValue(): string | null {
    if (this.editedCheckpointValue === undefined) {
      throw new Error('MonacoAdapter.getEditedCheckpointValue() is not applicable because there is no checkpoint');
    } else {
      return this.editedCheckpointValue;
    }
  }

  clear(): void {
    this.originalCheckpointValue = undefined;
    this.editedToNull = false;
    this.editedCheckpointValue = undefined;
    this._hasUnsavedChanges = false;
  }

  onEditorContentsChanged(value: string): void {
    if (this.originalCheckpointValue === undefined) {
      return;
    }
    if (value === '') {
      this.updateEditedCheckpointValue(this.editedToNull ? null : '');
    } else {
      this.editedToNull = false;
      this.updateEditedCheckpointValue(value);
    }
  }

  private updateEditedCheckpointValue(value: string | null): void {
    if (this.originalCheckpointValue === undefined) {
      throw new Error('MonacoAdapter.updateEditedCheckpointValue(): Expected that there is a checkpoint');
    }
    this.editedCheckpointValue = value;
    this._hasUnsavedChanges = this.editedCheckpointValue !== this.originalCheckpointValue;
  }

  private getRequestedEditorContents(forValue: string | null): string {
    return forValue === null ? '' : forValue;
  }

  /*
  setPrettify(value: boolean): void {

  }

  allowPrettifying(value: boolean): void {

  }
  */
}
