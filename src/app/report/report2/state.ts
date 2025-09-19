import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';

export interface State {
  readonly name: string;
  readonly showValue: boolean;
  readonly initialMonacoEditorText: string;
}

export class EmptyState implements State {
  readonly name = 'empty';
  readonly showValue = false;
  readonly initialMonacoEditorText = '';
}

export class ReportState implements State {
  readonly name = 'report';
  readonly showValue = true;
  readonly initialMonacoEditorText: string;

  constructor(report: Report) {
    this.initialMonacoEditorText = report.xml;
  }
}

export class CheckpointState implements State {
  readonly name = 'checkpoint';
  readonly showValue = true;
  readonly initialMonacoEditorText: string;

  constructor(checkpoint: Checkpoint) {
    const m: string | null = checkpoint.message;
    this.initialMonacoEditorText = m === null ? '' : m;
  }
}
