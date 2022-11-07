import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { HelperService } from '../../shared/services/helper.service';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';

@Component({
  selector: 'app-compare-tree',
  templateUrl: './compare-tree.component.html',
  styleUrls: ['./compare-tree.component.css'],
})
export class CompareTreeComponent {
  constructor(private helperService: HelperService) {}
  @Output() compareEvent = new EventEmitter<any>();
  @ViewChild('leftTreeReference') leftTreeReference!: jqxTreeComponent;
  @ViewChild('rightTreeReference') rightTreeReference!: jqxTreeComponent;
  syncTrees: boolean = true;
  leftReport: any;
  rightReport: any;

  nodeSelected(data: any, left: boolean) {
    if (this.syncTrees) {
      if (left) {
        this.leftReport = data.owner.selectedItem;
        const index = this.leftTreeReference.getItems().findIndex((item: any) => item.id == this.leftReport.id);
        this.rightReport = this.rightTreeReference.getItems()[index];
        this.rightTreeReference.selectItem(this.rightReport);
      } else {
        this.rightReport = data.owner.selectedItem;
        const index = this.rightTreeReference.getItems().findIndex((item: any) => item.id == this.rightReport.id);
        this.leftReport = this.leftTreeReference.getItems()[index];
        this.leftTreeReference.selectItem(this.leftReport);
      }
    } else {
      left ? (this.leftReport = data.owner.selectedItem) : (this.rightReport = data.owner.selectedItem);
    }

    this.compareEvent.emit({ leftReport: this.leftReport, rightReport: this.rightReport });
  }

  createTrees(leftReport: Report, rightReport: Report) {
    const leftTree = this.helperService.convertReportToJqxTree(leftReport);
    const rightTree = this.helperService.convertReportToJqxTree(rightReport);
    const both = this.iterateToMakeLabelsRed(leftTree, rightTree);

    this.leftTreeReference.createComponent({ height: '100%', source: [both.left] });
    this.rightTreeReference.createComponent({ height: '100%', source: [both.right] });

    this.selectFirstItem();
  }

  selectFirstItem() {
    this.leftReport = this.leftTreeReference.getItems()[0];
    this.rightReport = this.rightTreeReference.getItems()[0];
    this.leftTreeReference.selectItem(this.leftReport);
    this.rightTreeReference.selectItem(this.rightReport);
    this.compareEvent.emit({
      leftReport: this.leftReport,
      rightReport: this.rightReport,
    });
  }

  makeLabelsRed(left: any, right: any) {
    this.redLabel(left);
    this.redLabel(right);
  }

  redLabel(item: any) {
    item.label = "<span style='color: red;'>" + item.label + '</span>';
  }

  iterateToMakeLabelsRed(leftItem: any, rightItem: any) {
    let result = this.checkIfLabelsDifferent(leftItem, rightItem);
    const shortestTreeLength = Math.min(leftItem.items.length, rightItem.items.length);
    this.makeRestOfTreesRed(shortestTreeLength, rightItem.items, leftItem.items);

    for (let i = 0; i < shortestTreeLength; i++) {
      let both = this.iterateToMakeLabelsRed(leftItem.items[i], rightItem.items[i]);
      leftItem.items[i] = both.left;
      rightItem.items[i] = both.right;
    }

    return result;
  }

  makeRestOfTreesRed(startPoint: number, leftItems: any[], rightItems: any[]) {
    let items = leftItems;
    if (rightItems.length > leftItems.length) items = rightItems;
    for (let i = startPoint; i < items.length; i++) {
      this.redLabel(items[i]);
    }
  }

  checkIfLabelsDifferent(left: any, right: any): { left: any; right: any } {
    if (left.level > -1) {
      if (left.value.message !== right.value.message) this.makeLabelsRed(left, right);
    } else {
      if (left.value.xml !== right.value.xml) this.makeLabelsRed(left, right);
    }

    return { left: left, right: right };
  }
}
