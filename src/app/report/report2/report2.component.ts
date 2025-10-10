import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { BehaviorSubject, catchError, debounceTime, fromEventPattern, Observable, Subject, Subscription } from 'rxjs';
import { DebugTreeComponent } from '../../debug/debug-tree/debug-tree.component';
import { DebugComponent } from '../../debug/debug.component';
import { ReportData } from '../../shared/interfaces/report-data';
import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { View } from '../../shared/interfaces/view';
import { TabService } from '../../shared/services/tab.service';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';
import { ReportValueComponent } from './report-value/report-value.component';
import { CheckpointValueComponent, PartialCheckpoint } from './checkpoint-value/checkpoint-value.component';
import { ReportUtil as ReportUtility } from '../../shared/util/report-util';
import { ButtonCommand, ReportButtons } from './report-buttons/report-buttons';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { TestReportsService } from 'src/app/test/test-reports.service';
import { HttpErrorResponse } from '@angular/common/http';

type ReportValueState = 'report' | 'checkpoint' | 'none';

const MIN_HEIGHT = 20;
const MARGIN_IF_NOT_NEW_TAB = 50;

export interface PartialReport {
  name: string;
  description: string | null;
  path: string | null;
  // TODO: class Report defines it erroneously as a plain string.
  // Fix this error in the type system.
  transformation: string | null;
  // TODO: This is not the correct type. Fix.
  variables: string;
  xml: string;
  crudStorage: boolean;
  // undefined is allowed to support testing
  storageId?: number;
  stubStrategy: string;
}

export interface NodeValueState {
  isEdited: boolean;
  isReadOnly: boolean;
  storageId?: number;
}

@Component({
  selector: 'app-report2',
  imports: [AngularSplitModule, DebugTreeComponent, ReportValueComponent, CheckpointValueComponent, ReportButtons],
  templateUrl: './report2.component.html',
  styleUrl: './report2.component.css',
})
export class Report2Component implements OnInit, AfterViewInit, OnDestroy {
  static readonly ROUTER_PATH: string = 'report';
  @Input() newTab = true;
  @Input({ required: true }) currentView!: View;
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;

  protected treeWidth: Subject<void> = new Subject<void>();
  protected monacoEditorHeight!: number;
  protected reportValueState: ReportValueState = 'none';
  // Not ordinary subjects, because the report or checkpoint value may
  // be posted before the receiving component is ready.
  // Also not ReplaySubject, because we do not want old report or checkpont
  // values to be reposted.
  protected reportSubject = new BehaviorSubject<PartialReport | undefined>(undefined);
  protected checkpointValueSubject = new BehaviorSubject<PartialCheckpoint | undefined>(undefined);
  private storageId?: number;
  private originalNodeValueState?: NodeValueState;
  private host = inject(ElementRef);
  private tabService = inject(TabService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private httpService = inject(HttpService);
  private errorHandler = inject(ErrorHandling);
  private toastService = inject(ToastService);
  private testReportsService = inject(TestReportsService);
  private subscriptions: Subscription = new Subscription();
  private newTabReportData?: ReportData;

  ngOnInit(): void {
    this.newTabReportData = this.tabService.activeReportTabs.get(this.getIdFromPath());
    if (!this.newTabReportData) {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
    this.listenToHeight();
  }

  ngAfterViewInit(): void {
    if (this.splitter.dragProgress$) {
      this.splitter.dragProgress$.subscribe(() => {
        this.treeWidth.next();
      });
    }
    setTimeout(() => {
      if (this.newTabReportData) {
        this.currentView = this.newTabReportData.currentView;
        // TODO: Show report in value region
        this.addReportToTree(this.newTabReportData.report);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addReportToTree(report: Report): void {
    this.debugTreeComponent.addReportToTree(report);
  }

  closeEntireTree(): void {
    if (this.newTab && this.newTabReportData) {
      this.tabService.closeTab(this.newTabReportData);
    }
    this.changeReportValueState('none');
  }

  selectReport(node: Report | Checkpoint): void {
    if (ReportUtility.isReport(node)) {
      this.changeReportValueState('report');
      this.reportSubject.next(node as Report);
    } else if (ReportUtility.isCheckPoint(node)) {
      this.changeReportValueState('checkpoint');
      const checkpointNode = node as Checkpoint;
      this.checkpointValueSubject.next(checkpointNode);
    } else {
      throw new Error('State.newNode(): Node is neither a Report nor a Checkpoint');
    }
  }

  onButton(command: ButtonCommand): void {
    if (command === 'close') {
      this.changeReportValueState('none');
    } else if (command === 'copyReport') {
      this.copyReport();
    } else {
      throw new Error(`Command should have been handled by child component: ${command}`);
    }
  }

  onNodeValueState(nodeValueState: NodeValueState): void {
    this.storageId = nodeValueState.storageId;
    this.showToastForCopyToTestTabIfApplicable(nodeValueState);
    // Suppress errors ExpressionChangedAfterItHasBeenCheckedError about button existence changes.
    this.cdr.detectChanges();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected initEditor(): void {}

  private copyReport(): void {
    if (this.storageId === undefined) {
      throw new Error('Cannot copy report because Report2Component does not have the storageId');
    }
    const data: Record<string, number[]> = {
      [this.currentView.storageName]: [this.storageId],
    };
    this.httpService
      .copyReport(data, 'Test')
      .pipe(catchError(this.handleCopyError()))
      .subscribe({
        next: () => {
          this.testReportsService.getReports();
          this.toastService.showSuccess('Copied report to testtab', {
            buttonText: 'Go to test tab',
            callback: () => this.router.navigate(['/test']),
          });
        },
      }); // TODO: storage is hardcoded, fix issue #196 for this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleCopyError(): (error: HttpErrorResponse) => Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error: HttpErrorResponse): Observable<any> => {
      this.errorHandler.handleError()(error);
      throw new Error('Copying report failed');
    };
  }

  private showToastForCopyToTestTabIfApplicable(newNodeValueState: NodeValueState): void {
    const isEditingStarted: boolean =
      this.originalNodeValueState !== undefined && !this.originalNodeValueState.isEdited && newNodeValueState.isEdited;
    this.originalNodeValueState = newNodeValueState;
    if (isEditingStarted && newNodeValueState.isReadOnly) {
      this.toastService.showWarning('This storage is readonly, copy to the test tab to edit this report.', {
        buttonText: 'Copy to testtab',
        callback: () => {
          this.copyReport();
        },
      });
    }
  }

  private getIdFromPath(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }

  private listenToHeight(): void {
    const resizeObserver$ = fromEventPattern<ResizeObserverEntry[]>((handler: NodeEventHandler) => {
      const resizeObserver = new ResizeObserver(handler);
      resizeObserver.observe(this.host.nativeElement);
      return (): void => resizeObserver.disconnect();
    });

    const resizeSubscription = resizeObserver$.pipe(debounceTime(50)).subscribe((entries: ResizeObserverEntry[]) => {
      const entry = (entries[0] as unknown as ResizeObserverEntry[])[0];
      this.handleHeightChanges(entry.target.clientHeight);
    });
    this.subscriptions.add(resizeSubscription);
  }

  private handleHeightChanges(clientHeight: number): void {
    this.monacoEditorHeight = clientHeight;
    if (!this.newTab) {
      this.monacoEditorHeight = this.monacoEditorHeight - MARGIN_IF_NOT_NEW_TAB;
    }
    if (this.monacoEditorHeight < MIN_HEIGHT) {
      this.monacoEditorHeight = MIN_HEIGHT;
    }
    this.cdr.detectChanges();
  }

  private changeReportValueState(state: ReportValueState): void {
    this.reportValueState = state;
    // Make sure no old report or old checkpoint is processed when related components are recreated.
    /* eslint-disable-next-line unicorn/no-useless-undefined */
    this.reportSubject.next(undefined);
    /* eslint-disable-next-line unicorn/no-useless-undefined */
    this.checkpointValueSubject.next(undefined);
  }
}
