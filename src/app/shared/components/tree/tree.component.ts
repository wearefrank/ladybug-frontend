import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HelperService} from "../../services/helper.service";
declare var $: any;

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})

export class TreeComponent {
  @Output() selectReportEvent = new EventEmitter<any>();
  @Input() reports: any[] = [];
  tree: any[] = []
  treeId: string = Math.random().toString(36).substring(7);
  parentMap: any[] = []

  constructor(private helperService: HelperService) {}

  /**
   * Collapse the entire tree
   */
  collapseAll(): void {
    $('#' + this.treeId).treeview('collapseAll', { silent: true})
  }

  /**
   * Expand the entire tree (up to 2 levels)
   */
  expandAll(): void {
    $('#' + this.treeId).treeview('expandAll', { levels: 2, silent: true})
  }

  /**
   * Close all nodes in the tree
   */
  closeAll(): void {
    this.reports.length = 0;
    $('#' + this.treeId).treeview( 'remove');
  }

  /**
   * Removes the entire node from the tree. If it is not the parent it recursively tries to find the parent
   * and eventually removes the parent when found
   * @param node - the node to be removed
   */
  removeNode(node: any): void {
    if (node.root) {
      const result = this.tree.filter(report => {
        return report.id === node.nodeId;
      })
      const index = this.tree.indexOf(result[0]);
      this.tree.splice(index, 1);
      this.updateTreeView();
    } else {
      this.removeNode($('#' + this.treeId).treeview('getParent', node))
    }
  }

  /**
   * Find the direct parent of a node
   * @param currentNode - the current node
   * @param potentialParent - a node that could be its parent
   */
  findParent(currentNode: any, potentialParent: any): any {
    // If the level difference is only 1, then the potential parent is the actual parent
    if (currentNode.level - 1 == potentialParent.level) {
      potentialParent = this.addChild(potentialParent, currentNode)
      return currentNode;
    }

    const newPotentialParent = this.parentMap.find(x => x.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent)
  }

  addChild(parent: any, node: any): any {
    this.parentMap.push({id: node.id, parent: parent})
    if (parent.nodes === undefined) {
      parent.nodes = []
    }
    parent.nodes.push(node)
    return parent
  }

  createHierarchy(previousNode: any, node: any): void {
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
  /**
   * Handle change in the tree for the tree view
   * @param reports - the reports to be displayed
   */
  handleChange(reports: any[]): void {
    this.reports = reports;

    // Reset the items in the tree
    this.tree = [];
    let id = 0;

    // For each item that has been selected show the node and its children
    for (const report of this.reports) {
      this.parentMap = []
      const rootNode: {text: string, ladybug: any, root: boolean, id: number, nodes: any[]} = {
        text: report.name,
        ladybug: report,
        root: true,
        id: id++,
        nodes: []
      }

      let previousNode: any = rootNode;
      for (const checkpoint of report.checkpoints) {
        const img = this.helperService.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level % 2 == 0)
        const node = {
          text: '<img src="' + img + '" alt="">' + checkpoint.name,
          ladybug: checkpoint,
          root: false,
          id: id++,
          level: checkpoint.level
        }
        this.createHierarchy(previousNode, node)

        // Keep track of previous node
        previousNode = node
      }

      // Push the root node to the tree to be displayed
      this.tree.push(rootNode)
    }

    this.updateTreeView();

    // Select the first child from the tree
    $('#' + this.treeId).treeview('toggleNodeSelected', [ this.tree[this.tree.length - 1].nodes[0].id, { silent: false } ]);
  }

  /**
   * Update the tree view with the new data
   */
  updateTreeView(): void {
    // Update the tree view
    $('#' + this.treeId).treeview({
      data: this.tree,
      levels: 5,
      expandIcon: "fa fa-plus",
      collapseIcon: "fa fa-minus",
      selectedBackColor: "#1ab394",
    });

    // When a node is selected, we send forward the data to the display
    $('#' + this.treeId).on('nodeSelected', (event: any, data: any) => {
      this.selectReportEvent.next(data)
    });
  }

}
