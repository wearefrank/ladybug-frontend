import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { debounceTime, fromEventPattern, Subject, Subscription } from 'rxjs';
import { DebugTreeComponent } from '../../debug/debug-tree/debug-tree.component';
import { DebugComponent } from '../../debug/debug.component';
import { ReportData } from '../../shared/interfaces/report-data';
import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { View } from '../../shared/interfaces/view';
import { TabService } from '../../shared/services/tab.service';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';
import { ReportValueComponent } from './report-value/report-value.component';
import { CheckpointValueComponent } from './checkpoint-value/checkpoint-value.component';
import { ReportUtil } from '../../shared/util/report-util';

const MIN_HEIGHT = 20;
const MARGIN_IF_NOT_NEW_TAB = 30;

@Component({
  selector: 'app-report2',
  imports: [AngularSplitModule, DebugTreeComponent, ReportValueComponent, CheckpointValueComponent],
  templateUrl: './report2.component.html',
  styleUrl: './report2.component.css',
})
export class Report2Component {
  static readonly ROUTER_PATH: string = 'report';
  @Input() newTab = true;
  @Input({ required: true }) currentView!: View;
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;

  protected treeWidth: Subject<void> = new Subject<void>();
  protected monacoEditorHeight!: number;
  protected reportNode?: Report;
  protected checkpointNode?: Checkpoint;

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
    this.reportNode = undefined;
    this.checkpointNode = undefined;
  }

  selectReport(node: Report | Checkpoint): void {
    if (ReportUtil.isReport(node)) {
      this.reportNode = node as Report;
      this.checkpointNode = undefined;
    } else if (ReportUtil.isCheckPoint(node)) {
      this.reportNode = undefined;
      this.checkpointNode = node as Checkpoint;
    } else {
      throw new Error('State.newNode(): Node is neither a Report nor a Checkpoint');
    }
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
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
}
