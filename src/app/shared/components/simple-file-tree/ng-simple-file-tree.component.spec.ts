import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSimpleFileTree } from './ng-simple-file-tree.component';

describe('TreeComponent', () => {
  let component: NgSimpleFileTree;
  let fixture: ComponentFixture<NgSimpleFileTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSimpleFileTree],
    }).compileComponents();

    fixture = TestBed.createComponent(NgSimpleFileTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
