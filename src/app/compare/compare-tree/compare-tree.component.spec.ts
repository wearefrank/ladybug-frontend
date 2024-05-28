import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareTreeComponent } from './compare-tree.component';
import { jqxTreeModule } from 'jqwidgets-ng/jqxtree';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CompareTreeComponent', () => {
  let component: CompareTreeComponent;
  let fixture: ComponentFixture<CompareTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [jqxTreeModule, CompareTreeComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
