import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Checkpoint } from '../interfaces/checkpoint';
import { Report } from '../interfaces/report';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  THROWABLE_ENCODER = 'printStackTrace()';
  constructor() {}

  getImage(type: number, encoding: string, even: boolean): string {
    let img = 'assets/tree-icons/';
    switch (type) {
      case 1:
        img += 'startpoint';
        break;
      case 2:
        img += 'endpoint';
        break;
      case 3:
        img += 'abortpoint';
        break;
      case 4:
        img += 'inputpoint';
        break;
      case 5:
        img += 'outputpoint';
        break;
      case 6:
        img += 'infopoint';
        break;
      case 7:
        img += 'threadStartpoint-error'; // Doesn't exist?
        break;
      case 8:
        img += 'threadStartpoint';
        break;
      case 9:
        img += 'threadEndpoint';
        break;
      default:
        return '';
    }

    if (encoding === this.THROWABLE_ENCODER) {
      img += '-error';
    }

    if (even) {
      return img + '-even.gif';
    }
    return img + '-odd.gif';
  }

  sortData(sort: Sort, data: any[]): any {
    if (!sort.active || sort.direction === '') {
      return;
    }
    data.sort((a, b) => {
      const isAsc: boolean = sort.direction === 'asc';
      switch (sort.active) {
        case '0':
          return this.compare(Number(a.duration), Number(b.duration), isAsc); // Duration
        case '1':
          return this.compare(Number(a.storageSize), Number(b.storageSize), isAsc); // StorageSize
        case '2':
          return this.compare(a.name, b.name, isAsc); // Name
        case '3':
          return this.compare(a.correlationId, b.correlationId, isAsc); // CorrelationId
        case '4':
          return this.compare(a.endTime, b.endTime, isAsc); // EndTime
        case '5':
          return this.compare(Number(a.storageId), Number(b.storageId), isAsc); // StorageId
        case '6':
          return this.compare(a.status, b.status, isAsc); // Status
        case '7':
          return this.compare(Number(a.numberOfCheckpoints), Number(b.numberOfCheckpoints), isAsc); // NumberOfCheckpoints
        case '8':
          return this.compare(Number(a.estimatedMemoryUsage), Number(b.estimatedMemoryUsage), isAsc); // EstimatedMemoryUsage
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  twoReportsAreEqual(a: Report, b: Report): boolean {
    return (
      a.checkpoints.length === b.checkpoints.length &&
      this.compareAllCheckpoints(a.checkpoints, b.checkpoints) &&
      a.description === b.description &&
      a.estimatedMemoryUsage === b.estimatedMemoryUsage &&
      a.fullPath === b.fullPath &&
      this.twoCheckpointsAreEqual(a.inputCheckpoint, b.inputCheckpoint) &&
      a.name === b.name &&
      a.numberOfCheckpoints === b.numberOfCheckpoints &&
      a.originalEndpointOrAbortpointForCurrentLevel === b.originalEndpointOrAbortpointForCurrentLevel &&
      a.path === b.path &&
      a.reportFilterMatching === b.reportFilterMatching &&
      a.stubStrategy === b.stubStrategy &&
      a.transformation === b.transformation &&
      a.variableCsv === b.variableCsv &&
      a.variablesAsMap === b.variablesAsMap
    );
  }

  compareAllCheckpoints(a: Checkpoint[], b: Checkpoint[]) {
    for (const [i, element] of a.entries()) {
      if (!this.twoCheckpointsAreEqual(element, b[i])) {
        return false;
      }
    }
    return true;
  }

  twoCheckpointsAreEqual(a: Checkpoint, b: Checkpoint): boolean {
    return (
      a.encoding === b.encoding &&
      a.estimatedMemoryUsage === b.estimatedMemoryUsage &&
      a.index === b.index &&
      a.level === b.level &&
      a.message === b.message &&
      a.messageClassName === b.messageClassName &&
      a.name === b.name &&
      a.preTruncatedMessageLength === b.preTruncatedMessageLength &&
      a.sourceClassName === b.sourceClassName &&
      a.streaming === b.streaming &&
      a.stub === b.stub &&
      a.stubNotFound === b.stubNotFound &&
      a.stubbed === b.stubbed &&
      a.type === b.type &&
      a.typeAsString === b.typeAsString &&
      a.waitingForStream === b.waitingForStream
    );
  }

  convertReportToJqxTree(report: Report) {
    let index: number = 0;
    let parentMap: any[] = [];

    let rootNode = this.createNode(report, '', index++, -1);
    this.createChildNodes(rootNode, index, parentMap);
    return rootNode;
  }

  createNode(report: Report, icon: string, index: number, level: number) {
    return {
      label: report.name,
      icon: icon,
      value: report,
      expanded: true,
      id: index,
      items: [],
      level: level,
    };
  }

  createChildNodes(previousNode: any, index: number, parentMap: any[]) {
    for (let checkpoint of previousNode.value.checkpoints) {
      const img: string = this.getImage(checkpoint.type, checkpoint.encoding, checkpoint.level % 2 == 0);
      const currentNode: any = this.createNode(checkpoint, img, index++, checkpoint.level);
      this.createHierarchy(previousNode, currentNode, parentMap);
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
      const newParent: any = parentMap.find((x) => x.id == previousNode.id).parent;
      this.addChild(newParent, node, parentMap);
    }
  }

  findParent(currentNode: any, potentialParent: any, parentMap: any[]): any {
    // If the level difference is only 1, then the potential parent is the actual parent
    if (currentNode.level - 1 == potentialParent.level) {
      this.addChild(potentialParent, currentNode, parentMap);
      return currentNode;
    }

    const newPotentialParent: any = parentMap.find((node) => node.id == potentialParent.id).parent;
    return this.findParent(currentNode, newPotentialParent, parentMap);
  }

  addChild(parent: any, node: any, parentMap: any[]): void {
    parentMap.push({ order: node.id, parent: parent });
    parent.items.push(node);
  }
}
