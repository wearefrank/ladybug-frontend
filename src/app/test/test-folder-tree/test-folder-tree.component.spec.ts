import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFolderTreeComponent } from './test-folder-tree.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';

describe('TestFileTreeComponent', () => {
  let component: TestFolderTreeComponent;
  let fixture: ComponentFixture<TestFolderTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestFolderTreeComponent, NgSimpleFileTreeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFolderTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
