import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';
import { Subject } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { HttpService } from '../shared/services/http.service';
import { ToastService } from '../shared/services/toast.service';

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

  constructor(
    private debugReportService: DebugReportService,
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
    this.retrieveErrorsAndWarnings();
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

  retrieveErrorsAndWarnings(): void {
    if (this.currentView.currentViewName) {
      this.httpService
        .getWarningsAndErrors(this.currentView.storageName)
        .subscribe((value: string | undefined): void => {
          if (value) {
            this.showErrorsAndWarnings(value);
          }
        });
    }
  }

  showErrorsAndWarnings(value: string): void {
    if (value.length > this.toastService.TOASTER_LINE_LENGTH) {
      const errorSnippet: string = value.slice(0, Math.max(0, this.toastService.TOASTER_LINE_LENGTH)).trim() + '...';
      this.toastService.showDanger(errorSnippet, value);
    } else {
      this.toastService.showDanger(value, value);
    }
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
    this.retrieveErrorsAndWarnings();
  }
}
