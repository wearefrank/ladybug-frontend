import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { debounceTime, fromEventPattern, Subject, Subscription } from 'rxjs';
import { DebugTreeComponent } from 'src/app/debug/debug-tree/debug-tree.component';
import { DebugComponent } from 'src/app/debug/debug.component';
import { ReportData } from 'src/app/shared/interfaces/report-data';
import { Report } from '../../shared/interfaces/report';
import { View } from 'src/app/shared/interfaces/view';
import { TabService } from 'src/app/shared/services/tab.service';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';

const MIN_HEIGHT = 20;
const MARGIN_IF_NOT_NEW_TAB = 30;

@Component({
  selector: 'app-report2',
  imports: [AngularSplitModule, DebugTreeComponent],
  templateUrl: './report2.component.html',
  styleUrl: './report2.component.css',
})
export class Report2Component {
  static readonly ROUTER_PATH: string = 'report';
  @Input() newTab = true;
  @Input({ required: true }) currentView!: View;
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  calculatedHeight!: number;
  treeWidth: Subject<void> = new Subject<void>();
  reportData?: ReportData;

  private host = inject(ElementRef);
  private tabService = inject(TabService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.reportData = this.tabService.activeReportTabs.get(this.getIdFromPath());
    if (!this.reportData) {
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
      if (this.reportData) {
        this.currentView = this.reportData.currentView;
        // TODO: Show report in value region
        this.addReportToTree(this.reportData.report);
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
    if (this.newTab && this.reportData) {
      this.tabService.closeTab(this.reportData);
    }
    // TODO: Close report in value region.
  }

  // eslint-disable-next-line no-unused-vars
  selectReport(currentReport: Report): void {
    // TODO: Implement.
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
    this.calculatedHeight = clientHeight;
    if (!this.newTab) {
      this.calculatedHeight = this.calculatedHeight - MARGIN_IF_NOT_NEW_TAB;
    }
    if (this.calculatedHeight < MIN_HEIGHT) {
      this.calculatedHeight = MIN_HEIGHT;
    }
    this.cdr.detectChanges();
  }
}
