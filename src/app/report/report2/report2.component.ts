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
import { BehaviorSubject, debounceTime, fromEventPattern, ReplaySubject, Subject, Subscription } from 'rxjs';
import { DebugTreeComponent } from '../../debug/debug-tree/debug-tree.component';
import { DebugComponent } from '../../debug/debug.component';
import { ReportData } from '../../shared/interfaces/report-data';
import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { View } from '../../shared/interfaces/view';
import { TabService } from '../../shared/services/tab.service';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';
import { PartialReport, ReportValueComponent } from './report-value/report-value.component';
import { CheckpointValueComponent } from './checkpoint-value/checkpoint-value.component';
import { ReportUtil as ReportUtility } from '../../shared/util/report-util';
import { ButtonCommand, ReportButtons, ReportButtonStatus } from './report-buttons/report-buttons';

type ReportValueState = 'report' | 'checkpoint' | 'none';

const MIN_HEIGHT = 20;
const MARGIN_IF_NOT_NEW_TAB = 50;

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
  protected buttonStatusSubject = new BehaviorSubject<ReportButtonStatus>(
    Report2Component.getButtonState(true, 'none'),
  );
  protected reportSubject = new ReplaySubject<PartialReport>();
  protected checkpointValueSubject = new ReplaySubject<string | null>();
  protected editCheckpointToNullSubject = new ReplaySubject<void>();

  private host = inject(ElementRef);
  private tabService = inject(TabService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
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
      this.checkpointValueSubject.next(checkpointNode.message);
    } else {
      throw new Error('State.newNode(): Node is neither a Report nor a Checkpoint');
    }
  }

  onButton(command: ButtonCommand): void {
    console.log(`Button pressed: ${command}`);
    if (command === 'makeNull') {
      if (this.reportValueState === 'checkpoint') {
        this.editCheckpointToNullSubject.next();
      } else {
        throw new Error('Button makeNull should not be accessible when no checkpoint is shown');
      }
    }
  }

  onSavedChanges(savedChanges: boolean): void {
    this.buttonStatusSubject.next(Report2Component.getButtonState(savedChanges, this.reportValueState));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onMonacoEditorContentChange(_editorText: string): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected initEditor(): void {}

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
    this.buttonStatusSubject.next(Report2Component.getButtonState(true, this.reportValueState));
  }

  private static getButtonState(savedChanges: boolean, state: ReportValueState): ReportButtonStatus {
    switch (state) {
      case 'none': {
        return {
          closeAllowed: false,
          makeNullAllowed: false,
          saveAllowed: false,
        };
      }
      case 'report': {
        return {
          closeAllowed: true,
          makeNullAllowed: false,
          saveAllowed: !savedChanges,
        };
      }
      case 'checkpoint': {
        return {
          closeAllowed: true,
          makeNullAllowed: true,
          saveAllowed: !savedChanges,
        };
      }
    }
  }
}
