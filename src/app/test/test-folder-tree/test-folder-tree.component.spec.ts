import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestFolderTreeComponent } from './test-folder-tree.component';

describe('TestFolderTreeComponent', () => {
  let component: TestFolderTreeComponent;
  let fixture: ComponentFixture<TestFolderTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestFolderTreeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFolderTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
