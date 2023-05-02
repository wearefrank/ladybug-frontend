import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../../shared/services/helper.service';
import { Observable } from 'rxjs';

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
  showOneAtATime: boolean = false;
  @Input() currentView: any = {};
  @Input() adjustWidth: Observable<void> = {} as Observable<void>;

  constructor(private helperService: HelperService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.treeReference.createComponent({ source: [], height: '90%', width: '100%' });
      this.loaded = true;
      this.adjustWidth.subscribe(() => {
        this.adjustTreeWidth();
      });
    });
  }

  adjustTreeWidth() {
    this.treeReference.width('100%');
  }

  toggleShowAmount(): void {
    this.showOneAtATime = !this.showOneAtATime;
  }

  addReportToTree(report: Report): void {
    let tree = this.helperService.convertReportToJqxTree(report);
    if (this.showOneAtATime) {
      this.treeReference.clear();
    }

    this.treeReference.addTo(tree, null);
    this.treeReference.selectItem(
      // @ts-ignore
      this.treeReference.getItems()[this.treeReference.getItems().findIndex((item: any) => item.id == tree.items[0].id)]
    );
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
    for (let item of this.treeReference.getItems()) {
      let report: any = item.value;
      if (report?.storageId != undefined) {
        queryString += 'id=' + report.storageId + '&';
      }
    }
    this.helperService.download(queryString, this.currentView.storageName, exportBinary, exportXML);
  }

  changeSearchTerm(event: any) {
    const term: string = event.target.value;
    this.treeReference.getItems().forEach((item: any) => {
      if (term !== '') {
        const matching = item.label === term || item.value.xml?.includes(term) || item.value.message?.includes(term);
        item.element.style.color = matching ? 'blue' : 'black';
        item.element.style.fontWeight = matching ? 'bold' : 'normal';
      } else {
        item.element.style.color = 'black';
        item.element.style.fontWeight = 'normal';
      }
    });
  }
}
