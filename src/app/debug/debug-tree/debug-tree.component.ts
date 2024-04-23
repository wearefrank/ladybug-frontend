import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { HelperService } from '../../shared/services/helper.service';
import { Observable } from 'rxjs';
import { CreateTreeItem, FileTreeOptions } from 'ng-simple-file-tree';
import { FileTreeComponent } from '../../shared/components/file-tree/file-tree.component';

@Component({
  selector: 'app-debug-tree',
  templateUrl: './debug-tree.component.html',
  styleUrls: ['./debug-tree.component.css'],
})
export class DebugTreeComponent {
  @ViewChild('tree') tree!: FileTreeComponent;
  @Input() adjustWidth: Observable<void> = {} as Observable<void>;
  @Output() selectReportEvent = new EventEmitter<Report>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();
  protected _currentView: any;

  treeOptions: FileTreeOptions = {
    highlightOpenFolders: false,
    folderBehaviourOnClick: 'select',
    autoOpenCondition: this.conditionalOpenFunction,
  };

  constructor(private helperService: HelperService) {}

  @Input() set currentView(value: any) {
    if (this.tree && this.tree.currentView && this.tree.currentView !== value) {
      // TODO: Check if the current reports are part of the view
      this.tree.hideOrShowCheckpointsBasedOnView(value);
    }
    this._currentView = value;
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    let queryString = '';
    for (let treeReport of this.tree.getTreeReports()) {
      queryString += `id=${treeReport.storageId}&`;
    }
    this.helperService.download(queryString, this.currentView.storageName, exportBinary, exportXML);
  }

  conditionalOpenFunction(item: CreateTreeItem): boolean {
    const type = item['type'];
    return type === undefined || type === 1 || type === 2;
  }
}
