import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../../shared/services/helper.service';
import { Observable, Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { SettingsService } from '../../shared/services/settings.service';
import { DebugTreeProperties } from 'src/app/shared/interfaces/debug-tree-properties';

@Component({
  selector: 'app-debug-tree',
  templateUrl: './debug-tree.component.html',
  styleUrls: ['./debug-tree.component.css'],
})
export class DebugTreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  @Output() selectReportEvent = new EventEmitter<any>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();
  loaded: boolean = false;
  showMultipleAtATime!: boolean;
  showMultipleAtATimeSubscription!: Subscription;
  private _currentView: any;

  private lastReport?: Report;

  @Input() set currentView(value: any) {
    if (this.loaded && this._currentView !== value) {
      // TODO: Check if the current reports are part of the view
      this.hideOrShowCheckpointsBasedOnView(value);
    }
    this._currentView = value;
  }

  get currentView(): any {
    return this._currentView;
  }

  @Input() adjustWidth: Observable<void> = {} as Observable<void>;

  constructor(
    private helperService: HelperService,
    private httpService: HttpService,
    private settingsService: SettingsService,
  ) {
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy() {
    this.showMultipleAtATimeSubscription.unsubscribe();
  }

  subscribeToSettingsServiceObservables(): void {
    this.showMultipleAtATimeSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean) => {
        this.showMultipleAtATime = value;
        if (!this.showMultipleAtATime) {
          this.removeAllReportsButOne();
        }
      },
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.treeReference.createComponent({
        source: [],
        height: '90%',
        width: '100%',
        allowDrag: false,
      });
      this.loaded = true;
      this.adjustWidth.subscribe(() => {
        this.adjustTreeWidth();
      });
    });
  }

  hideOrShowCheckpointsBasedOnView(currentView: any): void {
    this.getTreeReports().forEach((report: any) => {
      if (report.value.storageName === currentView.storageName) {
        this.httpService
          .getUnmatchedCheckpoints(report.value.storageName, String(report.value.storageId), currentView.name)
          .subscribe((unmatched: any) => {
            const selectedReport: any = this.treeReference.getSelectedItem();
            this.prepareNextSelect(unmatched, selectedReport);

            let children = report.element.querySelectorAll('li');
            children.forEach((node: any) => (node.style.display = ''));
            this.hideCheckpoints(unmatched, children);
          });
      }
    });
  }

  prepareNextSelect(unmatched: string[], selectedReport: any): void {
    if (unmatched.includes(selectedReport.value.uid)) {
      this.recursivelyFindParentThatWontBeDeleted(selectedReport, unmatched);
    }
  }

  hideCheckpoints(unmatched: string[], children: any[]): void {
    if (unmatched.length > 0) {
      children.forEach((node: any) => {
        let oki: any = this.treeReference.getItem(node);
        if (unmatched.includes(oki.value.uid)) {
          node.style.display = 'none';
        }
      });
    }
  }

  recursivelyFindParentThatWontBeDeleted(selectedReport: any, unmatched: any[]) {
    const parent: any = this.treeReference.getItems().find((item: any) => item.id === selectedReport.parentId);
    if (parent && !unmatched.includes(parent.value.uid)) {
      this.treeReference.selectItem(parent);
    } else {
      this.recursivelyFindParentThatWontBeDeleted(parent, unmatched);
    }
  }

  adjustTreeWidth(): void {
    this.treeReference.width('100%');
  }

  removeAllReportsButOne(): void {
    if (this.lastReport) {
      this.addReportToTree(this.lastReport);
    }
  }

  addReportToTree(report: Report): void {
    this.lastReport = report;
    let tree = this.helperService.convertReportToJqxTree(report);
    if (!this.showMultipleAtATime) {
      this.treeReference.clear();
    }

    this.treeReference.addTo(tree, null);
    this.treeReference.selectItem(
      // @ts-ignore
      this.treeReference.getItems()[
        this.treeReference.getItems().findIndex((item: any) => item.id == tree.items[0].id)
      ],
    );
    this.hideOrShowCheckpointsBasedOnView(this.currentView);
  }

  selectReport(event: any): void {
    this.selectReportEvent.emit(event);
  }

  removeReport(report: any): void {
    let parentItem: any = this.findParentNode(this.treeReference.getItems().find((item: any) => item.value == report));
    let root = parentItem.element.parentNode;
    this.treeReference.removeItem(parentItem);
    parentItem.element.remove();

    let latestAddedReport = root.lastChild;
    if (latestAddedReport) {
      this.treeReference.selectItem(latestAddedReport.querySelectorAll('li')[0]);
    }
  }

  findParentNode(item: any): any {
    if (item.prevItem != undefined && item.parentElement) {
      return this.findParentNode(item.prevItem);
    }

    return item;
  }

  closeEntireTree(): void {
    this.closeEntireTreeEvent.emit();
    this.treeReference.clear();
  }

  expandAll(): void {
    this.treeReference.expandAll();
  }

  collapseAll(): void {
    this.treeReference.collapseAll();
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    let queryString = '';
    this.getTreeReports().forEach((report) => {
      queryString += 'id=' + report.value.storageId + '&';
    });
    this.helperService.download(queryString, this.currentView.storageName, exportBinary, exportXML);
  }

  changeSearchTerm(event: KeyboardEvent): void {
    const term: string = (event.target as HTMLInputElement).value.toLowerCase();
    this.treeReference.getItems().forEach((item: jqwidgets.TreeItem) => {
      const report = item.value as unknown as Report & {
        message?: string | null;
      };
      if (term !== '' && report) {
        const matching =
          item.label?.toLowerCase() === term ||
          report.xml?.toLowerCase().includes(term) ||
          report.message?.toLowerCase().includes(term);
        item.element.style.color = matching ? 'blue' : 'black';
        item.element.style.fontWeight = matching ? 'bold' : 'normal';
      } else {
        item.element.style.color = 'black';
        item.element.style.fontWeight = 'normal';
      }
    });
  }

  getTreeReports(): any[] {
    let reports: any[] = [];
    this.treeReference.getItems().forEach((item: any) => {
      if (item.value?.storageId != undefined) {
        reports.push(item);
      }
    });

    return reports;
  }
}
