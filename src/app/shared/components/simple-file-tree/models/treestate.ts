import { Observable, ReplaySubject } from 'rxjs';
import { FileTreeItem } from './file-tree-item';

export class Treestate {
  private itemSelectedSubject: ReplaySubject<FileTreeItem> = new ReplaySubject<FileTreeItem>(1);
  public itemSelectedObservable: Observable<FileTreeItem> = this.itemSelectedSubject.asObservable();
  private lastValue!: FileTreeItem;

  public nextItem(value: FileTreeItem): void {
    this.lastValue = value;
    this.itemSelectedSubject.next(value);
  }

  public getLastSelected(): FileTreeItem {
    return this.lastValue;
  }
}
