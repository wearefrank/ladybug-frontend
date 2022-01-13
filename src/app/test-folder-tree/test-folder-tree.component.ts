import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { LoaderService } from '../shared/services/loader.service';
declare var $: any;

@Component({
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrls: ['./test-folder-tree.component.css'],
})
export class TestFolderTreeComponent implements AfterViewInit, OnDestroy {
  folders: any[] = [];
  currentSelectedFolder: number = 0;
  TREE_SELECTOR: string = '#testFolderTree';
  @Output() changeFolderEvent = new EventEmitter<any>();

  constructor(private loaderService: LoaderService) {}

  ngAfterViewInit(): void {
    if (this.loaderService.isTestTreeLoaded()) {
      this.folders = this.loaderService.getTestTreeFolders();
      this.currentSelectedFolder = this.loaderService.getTestTreeSelectedFolder();
    }
    this.updateTreeView();
  }

  ngOnDestroy(): void {
    this.loaderService.saveTestTreeSettings(this.folders, this.currentSelectedFolder);
  }

  addFolder(name: string): void {
    if (!this.folders.some((folder) => folder.text === name) && name != '') {
      this.currentSelectedFolder = this.folders.push({
        text: name,
        filter: name,
        nodes: [],
        state: {
          expanded: true,
        },
      });
    }
    this.updateTreeView();
  }

  updateTreeView(): void {
    $(() => {
      $(this.TREE_SELECTOR).treeview({
        data: [{ text: 'Reports', filter: '', nodes: this.folders, state: { expanded: true, selected: true } }],
        levels: 5,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      });
      $(this.TREE_SELECTOR).treeview('selectNode', [this.currentSelectedFolder, { silent: true }]);

      $(this.TREE_SELECTOR).on('nodeSelected', (event: any, folder: any) => {
        this.currentSelectedFolder = folder.nodeId;
        this.changeFolderEvent.next(folder.filter);
      });
    });
  }

  removeFolder(): void {}
}
