import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareTreeComponent } from './compare-tree.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('CompareTreeComponent', () => {
  let component: CompareTreeComponent;
  let fixture: ComponentFixture<CompareTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompareTreeComponent],
      providers: [HttpClient, HttpHandler],
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
