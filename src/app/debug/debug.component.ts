import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';
import { Subject } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { TabService } from '../shared/services/tab.service';
import { CurrentTestView } from '../shared/interfaces/current-test-view';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent implements OnInit, AfterViewInit {
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild('splitter') splitter: any;
  @ViewChild('bottom') bottom!: ElementRef;
  currentView: CurrentTestView = {} as CurrentTestView;

  treeWidth: Subject<void> = new Subject<void>();
  bottomHeight: number = 0;

  constructor(
    private debugReportService: DebugReportService,
    private tabService: TabService,
  ) {}

  ngOnInit() {
    this.subscribeToServices();
  }

  ngAfterViewInit() {
    if (this.splitter.dragProgress$) {
      this.splitter.dragProgress$.subscribe(() => {
        this.treeWidth.next();
      });
    }
    this.listenToHeight();
  }

  subscribeToServices() {
    this.debugReportService.changeViewObservable.subscribe((view) => (this.currentView = view));
  }

  listenToHeight(): void {
    const resizeObserver = new ResizeObserver((entries) => {
      this.bottomHeight = entries[0].target.clientHeight;
    });
    resizeObserver.observe(this.bottom.nativeElement);
  }

  addReportToTree(report: Report): void {
    this.debugTreeComponent.addReportToTree(report);
  }

  selectReport(currentReport: any): void {
    let report = currentReport.owner.selectedItem.value;
    this.displayComponent.showReport(report);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false);
  }

  closeReport(currentReport: any): void {
    this.debugTreeComponent.removeReport(currentReport);
  }
}
