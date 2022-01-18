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
  TREE_SELECTOR: string = '#testFolderTree';
  baseFolder: any = { text: 'Reports', filter: '', nodes: this.folders, state: { expanded: true, selected: true } };
  currentFolder: any;
  @Output() changeFolderEvent = new EventEmitter<any>();

  constructor(private loaderService: LoaderService) {}

  ngAfterViewInit(): void {
    if (this.loaderService.isTestTreeLoaded()) {
      this.folders = this.loaderService.getTestTreeFolders();
      this.currentFolder = this.loaderService.getTestCurrentFolder();
    } else {
      this.currentFolder = this.baseFolder;
    }
    this.updateTreeView();
  }

  ngOnDestroy(): void {
    this.loaderService.saveTestTreeSettings(this.folders, this.currentFolder);
  }

  addFolder(name: string) {
    let folders = name.startsWith('/') ? name.slice(1).split('/') : name.split('/');
    this.recursive(folders, this.folders, '');
    this.changeFolderEvent.next(this.currentFolder.filter);
    this.updateTreeView();
  }

  recursive(newNames: any[], currentFolders: any[], previousFilter: string) {
    if (newNames.length > 0) {
      let name = newNames.shift();
      let folder = currentFolders.find((folder) => folder.text === name);
      if (folder) {
        this.selectNewFolder(folder);
        this.recursive(newNames, folder.nodes, folder.filter);
      } else {
        let newFolder = this.createNewFolder(name, previousFilter);
        this.selectNewFolder(newFolder);
        currentFolders.push(newFolder);
        if (newNames.length > 0) {
          this.recursive(newNames, newFolder.nodes, newFolder.filter);
        }
      }
    }
  }

  createNewFolder(name: string, previousFilter: string) {
    return {
      text: name,
      filter: previousFilter + '/' + name,
      nodes: [],
      state: { expanded: true },
    };
  }

  selectNewFolder(folder: any) {
    this.currentFolder.state.selected = false;
    this.currentFolder = folder;
    this.currentFolder.state.selected = true;
  }

  updateTreeView(): void {
    $(() => {
      $(this.TREE_SELECTOR).treeview({
        data: [this.baseFolder],
        levels: 5,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      });

      $(this.TREE_SELECTOR).on('nodeSelected', (event: any, folder: any) => {
        this.changeFolderEvent.next(folder.filter);
      });
    });
  }

  removeFolder(): void {}
}
