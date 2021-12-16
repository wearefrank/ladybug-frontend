import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HelperService} from "../../services/helper.service";
import {LoaderService} from "../../services/loader.service";
import {TreeNode} from "../../interfaces/tree-node";
import {Report} from "../../interfaces/report";
import {Checkpoint} from "../../interfaces/checkpoint";
declare var $: any;

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})

export class TreeComponent implements AfterViewInit, OnDestroy {
  @Output() selectReportEvent = new EventEmitter<any>();
  @Input() reports: Report[] = [];
  tree: TreeNode[] = []
  treeId: string = Math.random().toString(36).substring(7);
  parentMap: any[] = [] // {id: number, parent: TreeNode}
  treeNodeId: number = 0;

  constructor(private helperService: HelperService, private loaderService: LoaderService) {}

  collapseAll(): void {
    $('#' + this.treeId).treeview('collapseAll', { silent: true})
  }

  expandAll(): void {
    $('#' + this.treeId).treeview('expandAll', { levels: 2, silent: true})
  }

  closeAll(): void {
    this.reports.length = 0;
    $('#' + this.treeId).treeview( 'remove');
  }

  removeNode(node: TreeNode): void {
    if (node.root) {
      this.tree.splice(this.getNodeIndexToBeRemoved(node), 1);
      this.updateTreeView();
    } else {
      this.removeNode($('#' + this.treeId).treeview('getParent', node))
    }
  }

  getNodeIndexToBeRemoved(node: TreeNode): number {
    const result = this.tree.filter(report => {
      return report.id == node.nodeId;
    })
    return this.tree.indexOf(result[0]);
  }

  handleChange(reports: Report[]): void {
    this.tree = [];
    this.reports = reports;
    this.treeNodeId = 0;

    for (const reportRoot of this.reports) {
      this.parentMap = []
      const rootNode = this.createRootNode(reportRoot)
      this.tree.push(rootNode)
    }

    this.updateTreeView();
    this.selectFirstChildNode();
  }

  createRootNode(report: Report): TreeNode {
    const rootNode: TreeNode = {
      text: report.name,
      ladybug: report,
      root: true,
      id: this.treeNodeId++,
      nodes: [],
      level: -1
    }

    let previousNode: TreeNode = rootNode;
    for (const checkpoint of report.checkpoints) {
      const currentNode: TreeNode = this.createChildNode(checkpoint);
      this.createHierarchy(previousNode, currentNode)
      previousNode = currentNode
    }

    return rootNode;
  }

  createChildNode(checkpoint: Checkpoint): TreeNode {
    const img = this.helperService.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level % 2 == 0)
    return {
      text: '<img src="' + img + '" alt="">' + checkpoint.name,
      ladybug: checkpoint,
      root: false,
      id: this.treeNodeId++,
      level: checkpoint.level
    }
  }

  createHierarchy(previousNode: TreeNode, node: TreeNode): void {
    // If it is the first one, the root is the parent
    if (node.level == 0) {
      this.addChild(previousNode, node)

      // If the level is higher, then the previous node was its parent
    } else if (node.level > previousNode.level) {
      this.addChild(previousNode, node)

      // If the level is lower, then the previous node is a (grand)child of this node's sibling
    } else if (node.level < previousNode.level) {
      this.findParent(node, previousNode)

      // Else the level is equal, meaning the previous node is its sibling
    } else {
      const newParent = this.parentMap.find(x => x.id == previousNode.id).parent;
      this.addChild(newParent, node)
    }
  }

  findParent(currentNode: TreeNode, potentialParent: TreeNode): TreeNode {
    // If the level difference is only 1, then the potential parent is the actual parent
    if (currentNode.level - 1 == potentialParent.level) {
      this.addChild(potentialParent, currentNode)
      return currentNode;
    }

    const newPotentialParent = this.parentMap.find(node => node.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent)
  }

  addChild(parent: TreeNode, node: TreeNode): void {
    this.parentMap.push({id: node.id, parent: parent})
    parent.nodes = parent.nodes?? [];
    parent.nodes.push(node)
  }

  updateTreeView(): void {
    $('#' + this.treeId).treeview({
      data: this.tree,
      levels: 5,
      expandIcon: "fa fa-plus",
      collapseIcon: "fa fa-minus",
      selectedBackColor: "#1ab394",
    });

    $('#' + this.treeId).on('nodeSelected', (event: any, data: TreeNode) => {
      this.selectReportEvent.next(data)
    });
  }

  selectFirstChildNode(): void {
    if (this.tree.length > 0 && this.tree[this.tree.length - 1].nodes) {
      $('#' + this.treeId).treeview('toggleNodeSelected', [this.tree[this.tree.length - 1].nodes![0].id, { silent: false } ]);
    }
  }

  ngAfterViewInit(): void {
    if (this.loaderService.isTreeLoaded()) {
      this.tree = this.loaderService.getTreeData();
      this.updateTreeView();
      const selectedNode = this.loaderService.getSelectedNode()
      if (selectedNode != -1) {
        $('#' + this.treeId).treeview('toggleNodeSelected', [ selectedNode, { silent: false } ]);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.tree.length > 0) {
      const selectedNode = $('#' + this.treeId).treeview('getSelected')[0].id;
      this.loaderService.saveTreeSettings(this.tree, selectedNode)
    }
  }
}
