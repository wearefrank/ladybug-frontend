import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Report } from '../../interfaces/report';
import { TreeNode } from '../../interfaces/tree-node';
import { HelperService } from '../../services/helper.service';
import { Checkpoint } from '../../interfaces/checkpoint';
import { LoaderService } from '../../services/loader.service';

declare var $: any;

@Component({
  selector: 'app-compare-tree',
  templateUrl: './compare-tree.component.html',
  styleUrls: ['./compare-tree.component.css'],
})
export class CompareTreeComponent {
  constructor(private helperService: HelperService, private loaderService: LoaderService) {}
  @Output() selectReportEvent = new EventEmitter<any>();
  @Input() leftId: string = '';
  @Input() rightId: string = '';
  leftTree: TreeNode[] = {} as TreeNode[];
  rightTree: TreeNode[] = {} as TreeNode[];
  currentNodeId: number = 0;
  parentMap: any[] = [];

  showTreeView() {
    $('#' + this.leftId)
      .treeview({
        data: this.leftTree,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      })
      .on('nodeSelected', (event: any, data: TreeNode) => {
        this.selectReportEvent.next({ data: data, left: true });
      });

    $('#' + this.rightId)
      .treeview({
        data: this.rightTree,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      })
      .on('nodeSelected', (event: any, data: TreeNode) => {
        this.selectReportEvent.next({ data: data, left: false });
      });

    this.selectSpecificNode(0, true);
  }

  createTrees(leftReport: Report, rightReport: Report) {
    this.currentNodeId = 0;
    this.parentMap = [];
    this.leftTree = [this.createTree(leftReport)];
    this.rightTree = [this.createTree(rightReport)];
    this.showTreeView();
  }

  createTree(report: Report): TreeNode {
    let rootNode: TreeNode = this.createRootNode(report);
    this.createChildNodes(rootNode);
    return rootNode;
  }

  createRootNode(report: Report): TreeNode {
    return {
      text: report.name,
      ladybug: report,
      root: true,
      id: this.currentNodeId++,
      nodes: [],
      level: -1,
    };
  }

  createChildNodes(previousNode: TreeNode) {
    for (let checkpoint of previousNode.ladybug.checkpoints) {
      const currentNode: TreeNode = this.createChildNode(checkpoint);
      this.createHierarchy(previousNode, currentNode);
    }
  }

  createChildNode(checkpoint: Checkpoint): TreeNode {
    const img: string = this.helperService.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level % 2 == 0);
    return {
      text: '<img src="' + img + '" alt="">' + checkpoint.name,
      ladybug: checkpoint,
      root: false,
      id: this.currentNodeId++,
      level: checkpoint.level,
    };
  }

  createHierarchy(previousNode: TreeNode, node: TreeNode): void {
    // If the level is higher, then the previous node was its parent
    if (node.level > previousNode.level) {
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

  selectSpecificNode(nodeId: number, left: boolean) {
    let treeId = left ? this.leftId : this.rightId;
    $('#' + treeId).treeview('selectNode', [nodeId, { silent: false }]);
  }
}
