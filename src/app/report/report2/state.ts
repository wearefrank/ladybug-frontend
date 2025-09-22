import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { ReportUtil } from '../../shared/util/report-util';

export class ReportState {
  readonly initialMonacoEditorText: string;

  constructor(private report: Report) {
    this.initialMonacoEditorText = report.xml;
  }
}

export class CheckpointState {
  readonly initialMonacoEditorText: string;

  constructor(checkpoint: Checkpoint) {
    const m: string | null = checkpoint.message;
    this.initialMonacoEditorText = m === null ? '' : m;
  }
}

export class State {
  reportState?: ReportState;
  checkpointState?: CheckpointState;

  newNode(node: Report | Checkpoint): void {
    if (ReportUtil.isReport(node)) {
      this.reportState = new ReportState(node as Report);
      this.checkpointState = undefined;
    } else if (ReportUtil.isCheckPoint(node)) {
      this.reportState = undefined;
      this.checkpointState = new CheckpointState(node as Checkpoint);
    } else {
      throw new Error('State.newNode(): Node is neither a Report nor a Checkpoint');
    }
  }

  closeNode(): void {
    this.reportState = undefined;
    this.checkpointState = undefined;
  }
}
