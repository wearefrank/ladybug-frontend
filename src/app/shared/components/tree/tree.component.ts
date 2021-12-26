import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { LoaderService } from '../../services/loader.service';
import { TreeNode } from '../../interfaces/tree-node';
import { Report } from '../../interfaces/report';
import { Checkpoint } from '../../interfaces/checkpoint';
declare var $: any;

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
})
export class TreeComponent implements AfterViewInit, OnDestroy {
  @Output() selectReportEvent = new EventEmitter<any>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();
  @Input() selectedReports: Report[] = [];
  tree: TreeNode[] = [];
  treeId: string = Math.random().toString(36).slice(7); //
  parentMap: any[] = []; // {id: number, parent: TreeNode}
  treeNodeId: number = 0;

  constructor(private helperService: HelperService, private loaderService: LoaderService) {}

  collapseAll(): void {
    $('#' + this.treeId).treeview('collapseAll', { silent: true });
  }

  expandAll(): void {
    $('#' + this.treeId).treeview('expandAll', { levels: 2, silent: true });
  }

  closeAll(): void {
    this.selectedReports.length = 0;
    $('#' + this.treeId).treeview('remove');
    this.closeEntireTreeEvent.emit();
  }

  removeNode(node: TreeNode): void {
    if (node.root) {
      this.tree.splice(this.getNodeIndexToBeRemoved(node), 1);
      this.updateTreeView();
    } else {
      this.removeNode($('#' + this.treeId).treeview('getParent', node));
    }
  }

  getNodeIndexToBeRemoved(node: TreeNode): number {
    const result: TreeNode | undefined = this.tree.find((report) => {
      return report.id == node.nodeId;
    });
    if (result) {
      return this.tree.indexOf(result);
    }
    return -1;
  }

  handleChange(report: Report, showTreeInCompare: boolean): void {
    this.tree = [];
    this.treeNodeId = 0;
    const reportsToShow = this.getReportsToShow(report, showTreeInCompare);

    for (const reportRoot of reportsToShow) {
      this.parentMap = [];
      const rootNode: TreeNode = this.createRootNode(reportRoot);
      this.tree.push(rootNode);
    }

    this.updateTreeView();
    this.selectFirstChildNode();
  }

  // TODO: Return and use it as type where it is called
  getReportsToShow(report: Report, showTreeInCompare: boolean) {
    let reportsToShow: Report[] = [report];
    if (!showTreeInCompare) {
      this.selectedReports.push(report);
      reportsToShow = this.selectedReports;
    }
    return reportsToShow;
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
      text: '<img src="' + img + '" alt="">' + checkpoint.name,
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
    $('#' + this.treeId).treeview({
      data: this.tree,
      levels: 5,
      expandIcon: 'fa fa-plus',
      collapseIcon: 'fa fa-minus',
      selectedBackColor: '#1ab394',
    });

    $('#' + this.treeId).on('nodeSelected', (event: any, data: TreeNode) => {
      this.selectReportEvent.next(data);
    });
  }

  selectFirstChildNode(): void {
    if (this.tree.length > 0 && this.tree[this.tree.length - 1].nodes) {
      $('#' + this.treeId).treeview('toggleNodeSelected', [
        this.tree[this.tree.length - 1].nodes![0].id,
        { silent: false },
      ]);
    }
  }

  ngAfterViewInit(): void {
    if (this.loaderService.isTreeLoaded()) {
      this.tree = this.loaderService.getTreeData();
      this.selectedReports = this.loaderService.getSelectedReports();
      this.updateTreeView();
      const selectedNode: number = this.loaderService.getSelectedNode();
      if (selectedNode != -1) {
        $('#' + this.treeId).treeview('toggleNodeSelected', [selectedNode, { silent: false }]);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.tree.length > 0) {
      const selectedNode: number = $('#' + this.treeId).treeview('getSelected')[0].id;
      this.loaderService.saveTreeSettings(this.tree, this.selectedReports, selectedNode);
    }
  }
}
