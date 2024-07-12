import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Report } from '../interfaces/report';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  THROWABLE_ENCODER: string = 'printStackTrace()';

  constructor() {}

  getImage(type: number, encoding: string, level: number): string {
    const even = this.determineEvenCheckpoint(level);
    let img = `assets/tree-icons/${this.getCheckpointType(type)}`;
    if (encoding === this.THROWABLE_ENCODER) {
      img += '-error';
    }
    if (even) {
      return `${img}-even.gif`;
    }
    return `${img}-odd.gif`;
  }

  private determineEvenCheckpoint(level: number) {
    return level % 2 == 0;
  }

  getCheckpointType(type: number): string {
    switch (type) {
      case 1: {
        return 'startpoint';
      }
      case 2: {
        return 'endpoint';
      }
      case 3: {
        return 'abortpoint';
      }
      case 4: {
        return 'inputpoint';
      }
      case 5: {
        return 'outputpoint';
      }
      case 6: {
        return 'infopoint';
      }
      case 7: {
        return 'threadStartpoint-error';
      } // Doesn't exist?
      case 8: {
        return 'threadStartpoint';
      }
      case 9: {
        return 'threadEndpoint';
      }
      default: {
        return '';
      }
    }
  }

  download(queryString: string, storage: string, exportBinary: boolean, exportXML: boolean): void {
    window.open(
      'api/report/download/' + storage + '/' + exportBinary + '/' + exportXML + '?' + queryString.slice(0, -1),
    );
  }

  convertMessage(report: any): string {
    let message: string = report.message === null ? '' : report.message;
    if (report.encoding == 'Base64') {
      report.showConverted = true;
      message = btoa(message);
    }

    return message;
  }

  changeEncoding(report: any, button: any): string {
    let message: string;
    if (button.target.innerHTML.includes('Base64')) {
      message = report.message;
      this.setButtonHtml(report, button, 'utf8', false);
    } else {
      message = btoa(report.message);
      this.setButtonHtml(report, button, 'Base64', true);
    }

    return message;
  }

  setButtonHtml(report: any, button: any, type: string, showConverted: boolean): void {
    report.showConverted = showConverted;
    button.target.title = `Convert to ${type}`;
    button.target.innerHTML = type;
  }

  convertReportToJqxTree(report: Report) {
    let index: number = 0;
    let parentMap: any[] = [];

    const showingId: string = this.getCheckpointOrStorageId(report, true);
    let rootNode = this.createNode(report, showingId, '', index++, -1);
    this.createChildNodes(rootNode, index, parentMap);
    return rootNode;
  }

  createNode(report: Report, showingId: string, icon: string, index: number, level: number) {
    const expanded: boolean = level <= 0;
    return {
      label: showingId + report.name,
      icon: icon,
      value: report,
      expanded: expanded,
      id: Math.random(),
      index: index,
      items: [] as any[],
      level: level,
    };
  }

  getCheckpointOrStorageId(checkpoint: any, root: boolean): string {
    if (root && localStorage.getItem('showReportStorageIds')) {
      return localStorage.getItem('showReportStorageIds') === 'true' ? `${[checkpoint.storageId]}` : '';
    } else if (localStorage.getItem('showCheckpointIds')) {
      return localStorage.getItem('showCheckpointIds') === 'true' ? `${checkpoint.index}. ` : '';
    } else {
      return '';
    }
  }

  createChildNodes(rootNode: any, index: number, parentMap: any[]): void {
    let previousNode = rootNode;
    let checkpoints: any[] = previousNode.value.checkpoints;

    if (checkpoints && checkpoints.length > 0) {
      for (let checkpoint of checkpoints) {
        const img: string = this.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level);
        const showingId: string = this.getCheckpointOrStorageId(checkpoint, false);
        const currentNode: any = this.createNode(checkpoint, showingId, img, index++, checkpoint.level);
        this.createHierarchy(previousNode, currentNode, parentMap);
        previousNode = currentNode;
      }
    }
  }

  createHierarchy(previousNode: any, node: any, parentMap: any[]): void {
    // If the level is higher, then the previous node was its parent
    if (node.level > previousNode.level) {
      this.addChild(previousNode, node, parentMap);

      // If the level is lower, then the previous node is a (grand)child of this node's sibling
    } else if (node.level < previousNode.level) {
      this.findParent(node, previousNode, parentMap);

      // Else the level is equal, meaning the previous node is its sibling
    } else {
      const newParent: any = parentMap.find((x): boolean => x.id == previousNode.id).parent;
      this.addChild(newParent, node, parentMap);
    }
  }

  findParent(currentNode: any, potentialParent: any, parentMap: any[]): any {
    if (currentNode.level < 0) {
      currentNode.value.path = `[INVALID LEVEL ${currentNode.value.level}] ${currentNode.value.name}`;
      currentNode.level = 0;
    } else if (currentNode.level - 1 == potentialParent.level) {
      // If the level difference is only 1, then the potential parent is the actual parent
      this.addChild(potentialParent, currentNode, parentMap);
      return currentNode;
    }

    const newPotentialParent: any = parentMap.find((node): boolean => node.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent, parentMap);
  }

  addChild(parent: any, node: any, parentMap: any[]): void {
    parentMap.push({ id: node.id, parent: parent });
    parent.items.push(node);
  }

  getSelectedIds(reports: any[]): number[] {
    let copiedIds: number[] = [];
    for (const report of this.getSelectedReports(reports)) {
      copiedIds.push(report.storageId);
    }
    return copiedIds;
  }

  getSelectedReports(reports: Report[]): Report[] {
    return reports.filter((report: Report) => report.checked);
  }

  createCompareTabId(originalReport: Report, runResultReport: Report): string {
    return `${originalReport.storageId}-${runResultReport.storageId}`;
  }
}
