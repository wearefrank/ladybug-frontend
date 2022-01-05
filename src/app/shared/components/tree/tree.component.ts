import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { LoaderService } from '../../services/loader.service';
import { TreeNode } from '../../interfaces/tree-node';
import { Report } from '../../interfaces/report';
import { Checkpoint } from '../../interfaces/checkpoint';
import { TreeSettings } from '../../interfaces/tree-settings';
declare var $: any;

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
})
export class TreeComponent implements AfterViewInit, OnDestroy {
  @Output() selectReportEvent = new EventEmitter<any>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();
  treeSettings: TreeSettings = {
    selectedReports: [],
    tree: [],
    treeId: '',
    treeLoaded: false,
    selectedNode: -1,
  };
  parentMap: any[] = []; // {id: number, parent: TreeNode}
  treeNodeId: number = 0;
  @Input() // Needed to make a distinction between the two halves in compare component
  get id() {
    return this._id;
  }
  set id(id: string) {
    this._id = id;
  }
  public _id: string = 'debug';

  constructor(private helperService: HelperService, private loaderService: LoaderService) {}

  ngAfterViewInit(): void {
    const treeSettings = this.loaderService.getTreeSettings(this._id);
    if (treeSettings.treeLoaded) {
      this.treeSettings = treeSettings;
      this.updateTreeView();
      if (this.treeSettings.selectedNode != -1) {
        $('#' + this._id).treeview('toggleNodeSelected', [this.treeSettings.selectedNode, { silent: false }]);
      }
    }
  }

  ngOnDestroy(): void {
    let selectedNode: number = -1;
    if (this.treeSettings.tree.length > 0) {
      selectedNode = $('#' + this._id).treeview('getSelected')[0].id;
    }
      this.loaderService.saveTreeSettings(
        this._id,
        true,
        this.treeSettings.tree,
        this.treeSettings.selectedReports,
        selectedNode
      );
  }

  collapseAll(): void {
    $('#' + this._id).treeview('collapseAll', { silent: true });
  }

  expandAll(): void {
    $('#' + this._id).treeview('expandAll', { levels: 2, silent: true });
  }

  closeAll(): void {
    $('#' + this._id).treeview('remove');
    this.closeEntireTreeEvent.emit();
    this.treeSettings = {
      selectedReports: [],
      tree: [],
      treeId: '',
      treeLoaded: false,
      selectedNode: -1,
    };
  }

  removeNode(node: TreeNode): void {
    if (node.root) {
      const indexToBeRemoved = this.getNodeIndexToBeRemoved(node);
      this.treeSettings.selectedReports.splice(indexToBeRemoved, 1);
      this.treeSettings.tree.splice(indexToBeRemoved, 1);
      this.selectNextReport(indexToBeRemoved);
    } else {
      this.removeNode($('#' + this._id).treeview('getParent', node));
    }
  }

  selectNextReport(previousIndex: number): void {
    if (this.treeSettings.selectedReports.length > 0) {
      const nextIndex = this.treeSettings.tree.length > 1 ? previousIndex - 1 : 0;
      const nextNode = this.treeSettings.tree[nextIndex];
      this.updateTreeView();
      $('#' + this._id).treeview('toggleNodeSelected', [nextNode.nodes![0].id, { silent: false }]);
    } else {
      this.updateTreeView();
    }
  }

  getNodeIndexToBeRemoved(node: TreeNode): number {
    return this.treeSettings.tree.findIndex((report) => report.id == node.id);
  }

  handleChange(report: Report): void {
    this.treeSettings.tree = [];
    this.treeNodeId = 0;
    const reportsToShow = this.getReportsToShow(report);

    for (const reportRoot of reportsToShow) {
      this.parentMap = [];
      const rootNode: TreeNode = this.createRootNode(reportRoot);
      this.treeSettings.tree.push(rootNode);
    }

    this.updateTreeView();
    this.selectFirstChildNode();
  }

  // TODO: Return and use it as type where it is called
  getReportsToShow(report: Report) {
    this.treeSettings.selectedReports.push(report);
    return this.treeSettings.selectedReports;
  }

  createRootNode(report: Report): TreeNode {
    const rootNode: TreeNode = {
      text: report.name,
      ladybug: report,
      root: true,
      id: this.treeNodeId++,
      nodes: [],
      level: -1,
    };

    let previousNode: TreeNode = rootNode;
    for (const checkpoint of report.checkpoints) {
      const currentNode: TreeNode = this.createChildNode(checkpoint);
      this.createHierarchy(previousNode, currentNode);
      previousNode = currentNode;
    }

    return rootNode;
  }

  createChildNode(checkpoint: Checkpoint): TreeNode {
    const img: string = this.helperService.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level % 2 == 0);
    return {
      text: '<img src="assets/tree-icons/' + img + '" alt="">' + checkpoint.name,
      ladybug: checkpoint,
      root: false,
      id: this.treeNodeId++,
      level: checkpoint.level,
    };
  }

  createHierarchy(previousNode: TreeNode, node: TreeNode): void {
    // If it is the first one, the root is the parent
    if (node.level == 0) {
      this.addChild(previousNode, node);

      // If the level is higher, then the previous node was its parent
    } else if (node.level > previousNode.level) {
      this.addChild(previousNode, node);

      // If the level is lower, then the previous node is a (grand)child of this node's sibling
    } else if (node.level < previousNode.level) {
      this.findParent(node, previousNode);

      // Else the level is equal, meaning the previous node is its sibling
    } else {
      const newParent: TreeNode = this.parentMap.find((x) => x.id == previousNode.id).parent;
      this.addChild(newParent, node);
    }
  }

  findParent(currentNode: TreeNode, potentialParent: TreeNode): TreeNode {
    // If the level difference is only 1, then the potential parent is the actual parent
    if (currentNode.level - 1 == potentialParent.level) {
      this.addChild(potentialParent, currentNode);
      return currentNode;
    }

    const newPotentialParent: TreeNode = this.parentMap.find((node) => node.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent);
  }

  addChild(parent: TreeNode, node: TreeNode): void {
    this.parentMap.push({ id: node.id, parent: parent });
    parent.nodes = parent.nodes ?? [];
    parent.nodes.push(node);
  }

  updateTreeView(): void {
    $('#' + this._id).treeview({
      data: this.treeSettings.tree,
      levels: 5,
      expandIcon: 'fa fa-plus',
      collapseIcon: 'fa fa-minus',
      selectedBackColor: '#1ab394',
    });

    $('#' + this._id).on('nodeSelected', (event: any, data: TreeNode) => {
      this.selectReportEvent.next(data);
    });
  }

  selectFirstChildNode(): void {
    if (this.treeSettings.tree.length > 0 && this.treeSettings.tree[this.treeSettings.tree.length - 1].nodes) {
      $('#' + this._id).treeview('toggleNodeSelected', [
        this.treeSettings.tree[this.treeSettings.tree.length - 1].nodes![0].id,
        { silent: false },
      ]);
    }
  }
}
