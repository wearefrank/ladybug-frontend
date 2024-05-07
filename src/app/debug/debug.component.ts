import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';
import { Subject } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { TabService } from '../shared/services/tab.service';
import { HttpService } from '../shared/services/http.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent implements OnInit, AfterViewInit {
  static readonly ROUTER_PATH: string = 'debug';
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild('splitter') splitter: any;
  @ViewChild('bottom') bottom!: ElementRef;
  currentView: any = {};

  treeWidth: Subject<void> = new Subject<void>();
  bottomHeight: number = 0;
  errors?: string;

  constructor(
    private debugReportService: DebugReportService,
    private tabService: TabService,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
    this.getErrorsAndWarnings();
  }

  ngAfterViewInit(): void {
    if (this.splitter.dragProgress$) {
      this.splitter.dragProgress$.subscribe(() => {
        this.treeWidth.next();
      });
    }
    this.listenToHeight();
  }

  subscribeToServices(): void {
    this.debugReportService.changeViewObservable.subscribe((view) => (this.currentView = view));
  }

  getErrorsAndWarnings(): void {
    this.httpService.getWarningsAndErrors(this.currentView.currentViewName).subscribe((value): void => {
      if (value) {
        this.errors = value;
      }
    });
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

  selectReport(currentReport: Report): void {
    this.displayComponent.showReport(currentReport);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false);
  }

  closeReport(currentReport: any): void {
    this.debugTreeComponent.removeReport(currentReport);
  }

  onViewChange(viewName: string) {
    this.currentView.currentViewName = viewName;
    this.getErrorsAndWarnings();
  }
}
