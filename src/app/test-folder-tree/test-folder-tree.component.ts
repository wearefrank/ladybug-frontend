import { AfterViewInit, Component } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrls: ['./test-folder-tree.component.css'],
})
export class TestFolderTreeComponent implements AfterViewInit {
  folders: any[] = [];
  constructor() {}

  ngAfterViewInit(): void {
    this.updateTreeView();
  }

  addFolder(name: string) {
    this.folders.push({
      text: name,
      filter: '/' + name + '/.*',
      nodes: [],
      state: {
        expanded: true,
      },
    });
    this.updateTreeView();
  }

  updateTreeView() {
    $(() => {
      $('#testFolder').treeview({
        data: [{ text: 'Reports', filter: '/.*', nodes: this.folders, state: { expanded: true, selected: true } }],
        levels: 1,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      });
    });
  }

  removeFolder() {}
}
