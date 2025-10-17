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
  NgZone,
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
import { ButtonCommand, DownloadOptions } from './report-buttons/report-buttons';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { TestReportsService } from '../../test/test-reports.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TestResult } from '../../shared/interfaces/test-result';
import { DebugTabService } from '../../debug/debug-tab.service';
import { UpdateReport } from '../../shared/interfaces/update-report';
import { UpdateCheckpoint } from '../../shared/interfaces/update-checkpoint';
import { HelperService } from '../../shared/services/helper.service';

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

export interface UpdateNode {
  checkpointUidToRestore?: string;
  updateReport?: UpdateReport;
  updateCheckpoint?: UpdateCheckpoint;
}

@Component({
  selector: 'app-report2',
  imports: [AngularSplitModule, DebugTreeComponent, ReportValueComponent, CheckpointValueComponent],
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
  protected saveDoneSubject = new Subject<void>();
  protected rerunResultSubject = new BehaviorSubject<TestResult | undefined>(undefined);
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
  private helperService = inject(HelperService);
  private debugTab = inject(DebugTabService);
  private ngZone = inject(NgZone);
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
    // eslint-disable-next-line unicorn/no-useless-undefined
    this.rerunResultSubject.next(undefined);
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
    switch (command) {
      case 'close': {
        this.changeReportValueState('none');
        break;
      }
      case 'copyReport': {
        this.copyReport();
        break;
      }
      case 'rerun': {
        this.rerunReport();
        break;
      }
      case 'customReportAction': {
        this.processCustomReportAction();
        break;
      }
      default: {
        throw new Error(`Command should have been handled by child component: ${command}`);
      }
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

  protected save(update: UpdateNode): void {
    const requests: Promise<void>[] = [];
    if (update.updateCheckpoint !== undefined) {
      requests.push(
        this.handleUpdateNodeRequest(
          update.updateCheckpoint,
          'Successfully saved changes of checkpoint',
          'Failed to update checkpoint node',
        ),
      );
    }
    if (update.updateReport !== undefined) {
      this.handleUpdateNodeRequest(
        update.updateReport,
        'Successfully saved changes of the whole report',
        'Failed to update report node',
      );
    }
    Promise.all(requests)
      .then(() => {
        this.ngZone.run(() => {
          this.saveDoneSubject.next();
        });
        // Two updates may have been done and we do not know which was processed last.
        // We want the report from the server that resulted from both updates.
        this.getReportFromServer().then((updatedReport) => {
          this.ngZone.run(() => {
            if (this.newTab) {
              this.addReportToTree(updatedReport);
              this.selectUpdatedReportOrCheckpoint(updatedReport, update.checkpointUidToRestore);
            } else {
              this.debugTab.refreshAll({
                reportIds: [this.storageId!],
                displayToast: false,
              });
            }
          });
        });
      })
      .catch(() => {
        console.log(
          'Report2Component.save(): Promises of HTTP update requests to update report were expected to resolve, even with errors',
        );
        this.toastService.showDanger(
          'Programming error detected. Please view console log (F12), contact the maintainers of Ladybug and refresh your browser',
        );
      });
  }

  protected onDownload(downloadOptions: DownloadOptions): void {
    if (this.storageId === undefined) {
      throw new Error('Report2Component.onDownload(): Expected that storageId was filled');
    }
    const queryString = `id=${this.storageId}`;
    this.helperService.download(
      `${queryString}&`,
      this.currentView.storageName,
      downloadOptions.downloadReport,
      downloadOptions.downloadXmlSummary,
    );
    // TODO: Update the helper service to return a promise.
    // Do not show success toast if an error occurred.
    this.toastService.showSuccess('Report Downloaded!');
  }

  private copyReport(): void {
    if (this.storageId === undefined) {
      throw new Error('Cannot copy report because Report2Component does not have the storageId');
    }
    const data: Record<string, number[]> = {
      [this.currentView.storageName]: [this.storageId],
    };
    this.httpService
      .copyReport(data, 'Test')
      .pipe(catchError(this.handleErrorWithRethrowMessage('Copying report failed')))
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

  private rerunReport(): void {
    if (this.storageId === undefined) {
      throw new Error('Cannot rerun report because Report2Component does not have the storageId');
    }
    this.httpService
      .runReport(this.currentView.storageName, this.storageId)
      .pipe(catchError(this.handleErrorWithRethrowMessage('Rerunning report failed')))
      .subscribe({
        next: (response: TestResult): void => {
          this.toastService.showSuccess('Report rerun successful');
          this.rerunResultSubject.next(response);
          this.debugTab.refreshTable({ displayToast: false });
        },
      });
  }

  private processCustomReportAction(): void {
    if (this.storageId === undefined) {
      this.toastService.showDanger('Could not find report to apply custom action');
    } else {
      this.httpService
        .processCustomReportAction(this.currentView.storageName, [this.storageId])
        .pipe(catchError(this.handleErrorWithRethrowMessage('Could not start custom report action')))
        .subscribe({
          next: (data: Record<string, string>) => {
            if (data.success) {
              this.toastService.showSuccess(data.success);
            }
            if (data.error) {
              this.toastService.showDanger(data.error);
            }
          },
          error: () => {
            this.toastService.showDanger('Failed to process custom report action');
          },
        });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleErrorWithRethrowMessage(message: string): (error: HttpErrorResponse) => Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error: HttpErrorResponse): Observable<any> => {
      this.errorHandler.handleError()(error);
      throw new Error(message);
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

  private handleUpdateNodeRequest(
    request: UpdateReport | UpdateCheckpoint,
    successText: string,
    failText: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      this.httpService
        .updateReport(`${this.storageId!}`, request, this.currentView.storageName)
        .pipe(catchError(this.handleErrorWithRethrowMessage(failText)))
        .subscribe({
          next: () => {
            this.toastService.showSuccess(successText);
            console.log(`Raised success toast with text: ${successText}`);
            resolve();
          },
          error: () => resolve(),
        });
    });
  }

  private getReportFromServer(): Promise<Report> {
    return new Promise((resolve, reject) => {
      if (this.storageId === undefined) {
        console.log('Report2Component.getReportFromServer(): Expected that there was a storageId');
        this.toastService.showDanger(
          'Programming error detected, please view console log (F12) and refresh your browser',
        );
        reject();
      }
      this.httpService
        .getReport(this.storageId!, this.currentView.storageName)
        .pipe(catchError(this.handleErrorWithRethrowMessage('Failed to fetch report from the server')))
        .subscribe({
          next: (report: Report): void => resolve(report),
          error: () => {
            this.toastService.showDanger(
              'Failed to get updated report from the server, please see browser console (F12) and refresh your browser',
            );
            reject();
          },
        });
    });
  }

  private selectUpdatedReportOrCheckpoint(updatedReport: Report, checkpointUid: string | undefined): void {
    if (checkpointUid === undefined) {
      this.selectReport(updatedReport);
    } else {
      const checkpoint: Checkpoint | undefined = ReportUtility.getCheckpointFromReport(updatedReport, checkpointUid);
      if (checkpoint === undefined) {
        console.log(
          `Report2Component.save(): Failed to retrieve selected checkpoint from updated report: ${checkpointUid}`,
        );
        this.toastService.showDanger(
          `Failed to retrieve selected checkpoint from updated report: ${checkpointUid}. Please contact the maintainers of Ladybug and refresh your browser`,
        );
      } else {
        this.selectReport(checkpoint);
      }
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
