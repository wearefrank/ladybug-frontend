import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { DebugTreeComponent } from '../debug/debug-tree/debug-tree.component';
import { Subject } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { EditDisplayComponent } from './edit-display/edit-display.component';
import { DebugComponent } from '../debug/debug.component';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportData } from '../shared/interfaces/report-data';
import { View } from '../shared/interfaces/view';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [AngularSplitModule, DebugTreeComponent, EditDisplayComponent],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements AfterViewInit, OnInit {
  static readonly ROUTER_PATH: string = 'report';
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild(EditDisplayComponent) displayComponent!: EditDisplayComponent;
  @Input({ required: true }) currentView!: View;
  @Input() newTab: boolean = true;
  calculatedHeight!: number;
  treeWidth: Subject<void> = new Subject<void>();
  reportData?: ReportData;

  constructor(
    private host: ElementRef,
    private tabService: TabService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.reportData = this.tabService.activeReportTabs.get(this.getIdFromPath());
    if (!this.reportData) {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
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
        this.debugTreeComponent.addReportToTree(this.reportData.report);
      }
    });
    this.listenToHeight();
  }

  listenToHeight() {
    const resizeObserver: ResizeObserver = new ResizeObserver(
      (entries) => (this.calculatedHeight = entries[0].target.clientHeight),
    );
    resizeObserver.observe(this.host.nativeElement);
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
    this.displayComponent.closeReport(false);
  }

  closeReport(): void {
    this.debugTreeComponent.removeReport(this.reportData?.report);
  }

  getIdFromPath(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }
}
