// Mediating logic between the Monaco editor and checkpoints of reports.
// Handles the following:
//  * Checkpoint values are a string or null. the Monaco editor always shows a string.
//  * We should be able to show a prettified checkpoint value for JSON or XML values.
//  * When prettified text is shown it should not be possible to edit it.
//  * We keep track of whether there are unsaved changes.

// 'editable': Editor reflects the checkpoint value, can be edited.
// 'pretty': Editor shows a prettified value that cannot be edited.
type StatusType = 'no-checkpoint' | 'editable' | 'pretty';
type FormatType = 'xml' | 'json' | 'none';
export type ValueEditableType = 'monaco-editable' | 'not-monaco-editable' | 'not-editable';

const INDENT_TWO_SPACES = '  ';

export class MonacoAdapter {
  private isEditorReadOnly: boolean = true;
  private valueEditable: ValueEditableType = 'not-editable';
  // Only when status is "no-checkpoint", then originalCheckpointValue and editedCheckpointValue can be undefined.
  private status: StatusType = 'no-checkpoint';
  private originalCheckpointValue?: string | null;
  private editedCheckpointValue?: string | null;
  // False when not applicable.
  private editedToNull = false;
  // False when not applicable.
  private _hasUnsavedChanges = false;
  private timeOfLastEditorChange: number | undefined;
  private detectedFormat: FormatType = 'none';
  // Editor text when we show a checkpoint value prettified, differs from actual checkpoint value.
  private prettyEditorContents?: string;

  constructor(initialIsEditorReadOnly: boolean) {
    this.isEditorReadOnly = initialIsEditorReadOnly;
  }

  getMonacoEditingMakesSense(): boolean {
    return this.valueEditable === 'monaco-editable';
  }

  getEditingMakesSense(): boolean {
    return this.valueEditable === 'monaco-editable' || this.valueEditable === 'not-monaco-editable';
  }

  getEditorReadOnly(): boolean {
    return this.isEditorReadOnly;
  }

  setEditorReadOnly(isReadOnly: boolean): void {
    this.isEditorReadOnly = isReadOnly;
    this.checkIntegrity('MonacoAdapter.setEditorReadOnly');
  }

  hasCheckpoint(): boolean {
    return this.status !== 'no-checkpoint';
  }

  hasUnsavedChanges(): boolean {
    return this._hasUnsavedChanges;
  }

  getOriginalCheckpointValue(): string | null {
    this.checkIntegrity('MonacoAdapter.getOriginalCheckpointValue()');
    if (this.status === 'no-checkpoint') {
      throw new Error('Cannot get original checkpoint value because there is no checkpoint');
    }
    return this.originalCheckpointValue!;
  }

  getEditedCheckpointValue(): string | null {
    if (this.editedCheckpointValue === undefined) {
      throw new Error('MonacoAdapter.getEditedCheckpointValue() is not applicable because there is no checkpoint');
    } else {
      return this.editedCheckpointValue;
    }
  }

  getEditedToNull(): boolean {
    return this.editedToNull;
  }

  getValueIsShownPretty() {
    return this.status === 'pretty';
  }

  // Returns editor contents to request
  setOriginalCheckpointValue(value: string | null, valueEditable: ValueEditableType): string {
    this.valueEditable = valueEditable;
    this.status = 'editable';
    this.originalCheckpointValue = value;
    this.editedToNull = value === null;
    this.updateEditedCheckpointValue(value);
    this.detectFormat();
    this.prettyEditorContents = undefined;
    this.checkIntegrity('MonacoAdapter.setOriginalCheckpointValue()');
    return this.getRequestedEditorContents(this.originalCheckpointValue);
  }

  discardChanges(): string {
    this.checkIntegrity('MonacoAdapter.discardChanges()');
    if (this.status === 'no-checkpoint') {
      throw new Error(`Cannot discard changes because there is no checkpoint`);
    }
    return this.setOriginalCheckpointValue(this.originalCheckpointValue!, this.valueEditable);
  }

  // Returns editor contents to request or undefined if the editor does not need updating
  setEditedToNull(value: boolean): string | undefined {
    this.checkIntegrity('MonacoAdapter.setEditedToNull');
    const existingEditorContent = this.getRequestedEditorContents(this.editedCheckpointValue!);
    this.editedToNull = value;
    if (value === false && this.editedCheckpointValue === null) {
      this.updateEditedCheckpointValue('');
    }
    if (value === true && this.editedCheckpointValue !== null) {
      this.updateEditedCheckpointValue(null);
    }
    const newEditorContents = this.getRequestedEditorContents(this.editedCheckpointValue!);
    if (newEditorContents === existingEditorContent) {
      return undefined;
    } else {
      this.detectFormat();
      return newEditorContents;
    }
  }

  clear(): void {
    this.status = 'no-checkpoint';
    this.originalCheckpointValue = undefined;
    this.editedToNull = false;
    this.editedCheckpointValue = undefined;
    this._hasUnsavedChanges = false;
    this.timeOfLastEditorChange = undefined;
    this.detectedFormat = 'none';
  }

  onEditorContentsChanged(value: string): void {
    this.timeOfLastEditorChange = Date.now();
    this.checkIntegrity('MonacoAdapter.onEditorContentsChanged()');
    if (this.status === 'no-checkpoint') {
      return;
    }
    if (this.status === 'pretty') {
      throw new Error(`MonacoAdapter.onEditorContentsChange: did not expect status to be ${this.status}`);
    }
    if (this.isEditorReadOnly) {
      throw new Error('MonacoAdapter.onEditorContentsChange: expected that editor would be read-only');
    }
    if (value === '') {
      this.updateEditedCheckpointValue(this.editedToNull ? null : '');
    } else {
      this.editedToNull = false;
      this.updateEditedCheckpointValue(value);
    }
  }

  isEditorStableForMs(interval: number): boolean {
    if (!this.timeOfLastEditorChange) {
      return true;
    }
    return Date.now() - this.timeOfLastEditorChange >= interval;
  }

  // Call when editor is hopefully not busy - check with isEditorStableForMs.
  detectFormat(): FormatType {
    this.checkIntegrity('MonacoAdapter.detectFormat()');
    if (this.status === 'pretty') {
      return this.detectedFormat;
    }
    if (this.status !== 'editable' || this.editedCheckpointValue === null) {
      this.detectedFormat = 'none';
    } else if (this.checkIfXml(this.editedCheckpointValue!)) {
      this.detectedFormat = 'xml';
    } else {
      try {
        if (JSON.parse(this.editedCheckpointValue!)) {
          this.detectedFormat = 'json';
        }
      } catch {
        this.detectedFormat = 'none';
      }
    }
    return this.detectedFormat;
  }

  // Returns editor contents to request
  toPretty(): string | undefined {
    this.checkIntegrity('MonacoAdapter.toPretty()');
    if (this.status === 'pretty') {
      // Nothing to do
      return undefined;
    } else if (this.status !== 'editable') {
      throw new Error("MonacoAdapter.toPretty(): Expected status to be 'editable'");
    } else if (!this.isEditorReadOnly) {
      throw new Error('MonacoAdapter.toPretty(): Expected editor to be read-only');
    } else if (this.detectedFormat === 'none') {
      throw new Error(`MonacoAdapter.toPretty(): cannot pretify value: ${this.editedCheckpointValue?.slice(0, 10)}...`);
    } else {
      this.prettyEditorContents = this.prettify(this.editedCheckpointValue!);
      this.status = 'pretty';
      return this.prettyEditorContents;
    }
  }

  // Returns editor contents to request
  toEditable(): string {
    this.checkIntegrity('MonacoAdapter.toEditable()');
    this.prettyEditorContents = undefined;
    this.status = 'editable';
    return this.getRequestedEditorContents(this.editedCheckpointValue!);
  }

  private checkIntegrity(caller: string): void {
    if (!this.isEditorReadOnly && !this.getMonacoEditingMakesSense()) {
      throw new Error(
        `MonacoAdapter.checkIntegrity() on behalf of ${caller}: The Monaco editor is not read-only while editing does not make sense`,
      );
    }
    if (this.status === 'no-checkpoint') {
      if (this.originalCheckpointValue !== undefined) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should not be an original checkpoint value`,
        );
      }
      if (this.editedCheckpointValue !== undefined) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should not be an edited checkpoint value`,
        );
      }
    } else {
      if (this.originalCheckpointValue === undefined) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should be an original checkpoint value`,
        );
      }
      if (this.editedCheckpointValue === undefined) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should be an edited checkpoint value`,
        );
      }
    }
    if (this.status === 'pretty') {
      if (!this.isEditorReadOnly) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status}: editor should be read-only`,
        );
      }
      if (this.detectedFormat === 'none') {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status}: did not expect detectedFormat ${this.detectedFormat}`,
        );
      }
      if (!this.prettyEditorContents) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should be prettyEditorContents`,
        );
      }
    } else {
      if (this.prettyEditorContents) {
        throw new Error(
          `MonacoAdapter.checkIntegrity() on behalf of ${caller}: status ${this.status} so there should not be prettyEditorContents - saw ${this.prettyEditorContents.slice(0, 10)}`,
        );
      }
    }
  }

  private updateEditedCheckpointValue(value: string | null): void {
    this.editedCheckpointValue = value;
    this._hasUnsavedChanges = this.editedCheckpointValue !== this.originalCheckpointValue;
    this.detectedFormat = 'none';
  }

  private getRequestedEditorContents(forValue: string | null): string {
    return forValue === null ? '' : forValue;
  }

  // This check is understood to produce false positives.
  private checkIfXml(value: string): boolean {
    if (value) {
      for (let index = 0; index < value.length; index++) {
        if (value.charAt(index) === ' ' || value.charAt(index) === '\t') {
          continue;
        }
        return value.charAt(index) === '<';
      }
    }
    return false;
  }

  private prettify(text: string): string {
    if (this.detectedFormat === 'xml') {
      return this.prettifyXml(text);
    } else if (this.detectedFormat === 'json') {
      return JSON.stringify(JSON.parse(text), null, INDENT_TWO_SPACES);
    } else {
      throw new Error('MonacoAdapter.prettify(): No format to prettify to');
    }
  }

  private prettifyXml(text: string): string {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xsltDoc = parser.parseFromString(
      [
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
      ].join('\n'),
      'application/xml',
    );
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const xmlDocument = parser.parseFromString(text, 'application/xml');
    const resultDoc = xsltProcessor.transformToDocument(xmlDocument);
    const resultXml = serializer.serializeToString(resultDoc);
    return resultXml;
  }
}
