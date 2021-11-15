import {Component, EventEmitter, Input, Output} from '@angular/core';
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


  constructor() {}

  /**
   * Collapse the entire tree
   */
  collapseAll() {
    $('#' + this.treeId).treeview('collapseAll', { silent: true})
  }

  /**
   * Expand the entire tree (up to 2 levels)
   */
  expandAll() {
    $('#' + this.treeId).treeview('expandAll', { levels: 2, silent: true})
  }

  /**
   * Close all nodes in the tree
   */
  closeAll() {
    this.reports.length = 0;
    $('#' + this.treeId).treeview( 'remove');
  }

  /**
   * Removes the entire node from the tree. If it is not the parent it recursively tries to find the parent
   * and eventually removes the parent when found
   * @param node - the node to be removed
   */
  removeNode(node: any) {
    console.log("tree")
    console.log(this.tree)
    if (node.root) {
      let result = this.tree.filter(report => {
        return report.id === node.nodeId;
      })
      let index = this.tree.indexOf(result[0]);
      this.tree.splice(index, 1);
      this.updateTreeView();
    } else {
      this.removeNode($('#' + this.treeId).treeview('getParent', node))
    }
  }

  findParent(currentNode: any, potentialParent: any): any {
    // If the level difference is only 1, then the potential parent is the actual parent
    if (currentNode.level - 1 == potentialParent.level) {
      this.parentMap.push({id: currentNode.id, parent: potentialParent})
      potentialParent.nodes.push(currentNode)
      return currentNode;
    }

    let newPotentialParent = this.parentMap.find(x => x.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent)
  }

  /**
   * Handle change in the tree for the tree view
   * @param reports - the reports to be displayed
   */
  handleChange(reports: any[]) {
    this.reports = reports;

    // Reset the items in the tree
    this.tree = [];
    let id = 0;


    // For each item that has been selected show the node and its children
    for (let report of this.reports) {
      this.parentMap = []
      console.log(report)
      let rootNode = {
        text: report.name,
        ladybug: report,
        root: true,
        id: id++,
        nodes: []
      }

      let previousNode: any = rootNode;
      for (let checkpoint of report.checkpoints) {
        let node = {
          text: checkpoint.name,
          ladybug: checkpoint,
          root: false,
          id: id++,
          level: checkpoint.level,
          backColor: checkpoint.level % 2 == 0 ? 'lightgrey' : 'white',
          nodes: []
        }

        // If it is the first one, the parent is the root
        if (node.level == 0) {
          this.parentMap.push({id: node.id, parent: rootNode})
          // @ts-ignore
          rootNode.nodes.push(node)

          // If the level is higher, then the previous node was its parent
        } else if (node.level > previousNode.level) {
          this.parentMap.push({id: node.id, parent: previousNode})
          previousNode.nodes.push(node)

          // If the level is lower, then the previous node is a (grand)child of this node's sibling
        } else if (node.level < previousNode.level) {
          node = this.findParent(node, previousNode)

          // Else the level is equal, meaning the previous node is its sibling
        } else {
          let newParent = this.parentMap.find(x => x.id == previousNode.id).parent;
          this.parentMap.push({id: node.id, parent: newParent})
          newParent.nodes.push(node)
        }

        previousNode = node
      }

      this.tree.push(rootNode)
    }

    this.updateTreeView();
    $('#' + this.treeId).treeview('toggleNodeSelected', [ this.tree[this.tree.length - 1].nodes[0].id, { silent: false } ]);
  }

  /**
   * Update the tree view with the new data
   */
  updateTreeView() {
    // Update the tree view
    $('#' + this.treeId).treeview({
      data: this.tree,
      levels: 5,
      expandIcon: "fa fa-plus",
      collapseIcon: "fa fa-minus",
      emptyIcon: "fa fa-arrow-left",
      selectedBackColor: "#1ab394",
    });

    // When a node is selected, we send forward the data to the display
    $('#' + this.treeId).on('nodeSelected', (event: any, data: any) => {
      this.selectReportEvent.next(data)
    });
  }

}
