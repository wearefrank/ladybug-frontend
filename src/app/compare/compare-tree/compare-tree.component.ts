import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

import { ReportHierarchyTransformer } from '../../shared/classes/report-hierarchy-transformer';
import { ReportUtil } from '../../shared/util/report-util';
import { CompareData } from '../compare-data';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { NodeLinkStrategy } from '../../shared/enums/node-link-strategy';
import {
  CreateTreeItem,
  FileTreeItem,
  FileTreeOptions,
  NgSimpleFileTree,
  NgSimpleFileTreeModule,
  OptionalParameters,
} from 'ng-simple-file-tree';
import { HelperService } from '../../shared/services/helper.service';
import { SimpleFileTreeUtil } from '../../shared/util/simple-file-tree-util';

export const treeSideConst = ['left', 'right'] as const;
export type TreeSide = (typeof treeSideConst)[number];

@Component({
  selector: 'app-compare-tree',
  templateUrl: './compare-tree.component.html',
  styleUrls: ['./compare-tree.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe, FormsModule, NgSimpleFileTreeModule],
})
export class CompareTreeComponent {
  @Output() compareEvent: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('leftTree') leftTree!: NgSimpleFileTree;
  @ViewChild('rightTree') rightTree!: NgSimpleFileTree;
  @Input({ required: true }) nodeLinkStrategy!: NodeLinkStrategy;
  @Input({ required: true }) compareData!: CompareData;
  leftReport?: Report;
  rightReport?: Report;
  left?: Report;
  leftTreeOptions: FileTreeOptions = {
    highlightOpenFolders: false,
    folderBehaviourOnClick: 'select',
    expandAllFolders: true,
    determineIconClass: SimpleFileTreeUtil.conditionalCssClass,
  };

  rightTreeOptions: FileTreeOptions = {
    highlightOpenFolders: false,
    folderBehaviourOnClick: 'select',
    expandAllFolders: true,
    determineFontColor: (item: CreateTreeItem) => this.setRedLabels(item),
    determineIconClass: SimpleFileTreeUtil.conditionalCssClass,
  };

  createTrees(leftReport: Report, rightReport: Report): void {
    this.leftReport = new ReportHierarchyTransformer().transform(leftReport);
    this.rightReport = new ReportHierarchyTransformer().transform(rightReport);
    const optional: OptionalParameters = { childrenKey: 'checkpoints' };
    this.leftTree.addItem(this.leftReport, optional);
    this.rightTree.addItem(this.rightReport, optional);
    this.selectFirstItem();
  }

  setRedLabels(item: CreateTreeItem): string {
    if (ReportUtil.isReport(item)) {
      return this.namesMatch(item.name, this.leftReport?.name);
    }
    if (ReportUtil.isCheckPoint(item)) {
      const checkpoint: Checkpoint | null = this.findCorrespondingCheckpoint(item, this.leftReport);
      return this.namesMatch(item.name, checkpoint?.name);
    }
    return '';
  }

  selectFirstItem(): void {
    if (ReportUtil.isReport(this.leftReport!)) {
      this.leftTree.selectItem(this.leftReport.path);
    }
    if (ReportUtil.isReport(this.rightReport)) {
      this.rightTree.selectItem(this.rightReport.path);
    }
    this.compareEvent.emit();
  }

  syncTrees(treeSide: TreeSide): void {
    if (treeSide === 'left') {
      this.selectItem(this.rightTree, this.leftTree.getSelected());
    } else if (treeSide === 'right') {
      this.selectItem(this.leftTree, this.rightTree.getSelected());
    }
  }

  selectItem(otherSide: NgSimpleFileTree, treeItem: FileTreeItem): void {
    switch (this.nodeLinkStrategy) {
      case 'PATH': {
        otherSide.selectItem(treeItem.path);
        break;
      }
      case 'CHECKPOINT_NUMBER': {
        this.selectByCheckPointNumber(otherSide, treeItem.originalValue as Report | Checkpoint);
      }
    }
    this.compareEvent.emit();
  }

  selectByCheckPointNumber(tree: NgSimpleFileTree, treeItem: Report | Checkpoint): void {
    if (ReportUtil.isReport(treeItem)) {
      tree.selectItem(tree.getItems()[0].path);
    } else if (ReportUtil.isCheckPoint(treeItem)) {
      this.selectCheckpoint(tree, tree.getItems()[0], treeItem);
    }
  }

  selectCheckpoint(tree: NgSimpleFileTree, item: FileTreeItem, checkpointToMatch: Checkpoint): void {
    if (item.children) {
      for (const child of item.children) {
        const checkpoint = child.originalValue as Checkpoint;
        if (this.getCheckpointId(checkpoint.uid) === this.getCheckpointId(checkpointToMatch.uid)) {
          tree.selectItem(child.path);
          return;
        } else {
          this.selectCheckpoint(tree, child, checkpointToMatch);
        }
      }
    }
  }

  namesMatch(name1: string | undefined, name2?: string | undefined): string {
    if (name1 && name2 && name1 === name2) {
      return '';
    }
    return 'red';
  }

  findCorrespondingCheckpoint(
    itemToMatch: Checkpoint | Report,
    report: Report | Checkpoint | undefined,
  ): Checkpoint | null {
    if (report) {
      const checkpoints: Checkpoint[] = report.checkpoints ?? [];
      for (let checkpoint of checkpoints) {
        if (
          ReportUtil.isCheckPoint(itemToMatch) &&
          this.getCheckpointId(checkpoint.uid) === this.getCheckpointId(itemToMatch.uid)
        ) {
          return checkpoint;
        }
        if (checkpoint.checkpoints) {
          return this.findCorrespondingCheckpoint(itemToMatch, checkpoint);
        }
      }
    }
    return null;
  }

  getCheckpointId(uid: string): string {
    return uid.split('#')[1];
  }
}
