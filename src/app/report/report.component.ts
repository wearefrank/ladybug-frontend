/* eslint-disable no-unused-vars */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { DebugTreeComponent } from '../debug/debug-tree/debug-tree.component';
import { debounceTime, fromEventPattern, Subject, Subscription } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { EditDisplayComponent } from './edit-display/edit-display.component';
import { DebugComponent } from '../debug/debug.component';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportData } from '../shared/interfaces/report-data';
import { View } from '../shared/interfaces/view';
import { NodeEventHandler } from 'rxjs/internal/observable/fromEvent';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [AngularSplitModule, DebugTreeComponent, EditDisplayComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements AfterViewInit, OnInit, OnDestroy {
  static readonly ROUTER_PATH: string = 'report';
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild(EditDisplayComponent) displayComponent!: EditDisplayComponent;
  @Input({ required: true }) currentView!: View;
  @Input() newTab: boolean = true;
  calculatedHeight!: number;
  treeWidth: Subject<void> = new Subject<void>();
  reportData?: ReportData;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private host: ElementRef,
    private tabService: TabService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.reportData = this.tabService.activeReportTabs.get(
      this.getIdFromPath(),
    );
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
        this.displayComponent.showReport(this.reportData.report);
        this.addReportToTree(this.reportData.report);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  listenToHeight(): void {
    const resizeObserver$ = fromEventPattern<ResizeObserverEntry[]>(
      (handler: NodeEventHandler) => {
        const resizeObserver = new ResizeObserver(handler);
        resizeObserver.observe(this.host.nativeElement);
        return (): void => resizeObserver.disconnect();
      },
    );

    const resizeSubscription = resizeObserver$
      .pipe(debounceTime(50))
      .subscribe((entries: ResizeObserverEntry[]) => {
        const entry = (entries[0] as unknown as ResizeObserverEntry[])[0];
        this.calculatedHeight = entry.target.clientHeight;
        this.cdr.detectChanges();
      });
    this.subscriptions.add(resizeSubscription);
  }

  addReportToTree(report: Report): void {
    this.debugTreeComponent.addReportToTree(report);
  }

  selectReport(currentReport: Report): void {
    this.displayComponent.showReport(currentReport);
  }

  closeEntireTree(): void {
    if (this.newTab && this.reportData) {
      this.tabService.closeTab(this.reportData);
    }
    this.displayComponent.closeReport();
  }

  getIdFromPath(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }
}
