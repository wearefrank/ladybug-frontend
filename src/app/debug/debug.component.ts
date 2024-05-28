import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';
import { Subject, Subscription } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { TabService } from '../shared/services/tab.service';
import { AngularSplitModule } from 'angular-split';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
  standalone: true,
  imports: [TableComponent, AngularSplitModule, DebugTreeComponent, DisplayComponent],
})
export class DebugComponent implements OnInit, AfterViewInit, OnDestroy {
  static readonly ROUTER_PATH: string = 'debug';
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild('splitter') splitter: any;
  @ViewChild('bottom') bottom!: ElementRef;
  currentView: any = {};

  treeWidth: Subject<void> = new Subject<void>();
  bottomHeight: number = 0;
  private viewSubscription!: Subscription;

  constructor(
    private debugReportService: DebugReportService,
    private tabService: TabService,
  ) {}

  ngOnInit() {
    this.subscribeToServices();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  ngAfterViewInit() {
    if (this.splitter.dragProgress$) {
      this.splitter.dragProgress$.subscribe(() => {
        this.treeWidth.next();
      });
    }
    this.listenToHeight();
  }

  subscribeToServices(): void {
    this.viewSubscription = this.debugReportService.changeViewObservable.subscribe((view) => (this.currentView = view));
  }

  unsubscribeAll(): void {
    if (this.viewSubscription) {
      this.viewSubscription.unsubscribe();
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
  }
}
