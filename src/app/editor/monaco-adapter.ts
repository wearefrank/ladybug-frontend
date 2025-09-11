// Mediating logic between the Monaco editor and checkpoints of reports.
// Handles the following:
//  * Checkpoint values are a string or null. the Monaco editor always shows a string.
//  * We should be able to show a prettified checkpoint value for JSON or XML values.
//  * When prettified text is shown it should not be possible to edit it.
//  * We keep track of whether there are unsaved changes.

import { Observer } from "rxjs";

export class MonacoAdapter {
  setOriginalCheckpointValue(value: string | null): void {

  }

  setEditedCheckpointValueObserver(obs: Observer<string | null>) {

  }
  
  clear() {

  }

  /*
  setPrettify(value: boolean): void {

  }

  allowPrettifying(value: boolean): void {

  }
  */

  onEditorContentsChanged(value: string) {

  }

  hasCheckpoint(): boolean {

  }

  hasUnsavedChanges(): boolean {

  }
}