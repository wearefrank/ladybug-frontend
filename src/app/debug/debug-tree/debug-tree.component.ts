import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../../shared/services/helper.service';

@Component({
  selector: 'app-debug-tree',
  templateUrl: './debug-tree.component.html',
  styleUrls: ['./debug-tree.component.css'],
})
export class DebugTreeComponent implements AfterViewInit {
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  @Output() selectReportEvent = new EventEmitter<any>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();
  loaded: boolean = false;
  @Input() currentView: any = {};

  constructor(private helperService: HelperService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.treeReference.createComponent({ source: [], height: '100%', width: '100%' });
      this.loaded = true;
    });
  }

  addReportToTree(report: Report) {
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.addTo(tree, null);

    this.treeReference.selectItem(
      // @ts-ignore
      this.treeReference.getItems()[this.treeReference.getItems().findIndex((item: any) => item.id == tree.items[0].id)]
    );
  }

  selectReport(event: any) {
    this.selectReportEvent.emit(event);
  }

  removeReport(report: any) {
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

  closeEntireTree() {
    this.closeEntireTreeEvent.emit();
    this.treeReference.clear();
  }

  expandAll() {
    this.treeReference.expandAll();
  }

  collapseAll() {
    this.treeReference.collapseAll();
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    let queryString = '';
    for (let item of this.treeReference.getItems()) {
      let report: any = item.value;
      if (report?.storageId != undefined) {
        queryString += 'id=' + report.storageId + '&';
      }
    }
    this.helperService.download(queryString, this.currentView.storageName, exportBinary, exportXML);
  }
}
