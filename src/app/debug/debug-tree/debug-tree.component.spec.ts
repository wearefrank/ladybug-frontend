import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugTreeComponent } from './debug-tree.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';

describe('DebugTreeComponent', () => {
  let component: DebugTreeComponent;
  let fixture: ComponentFixture<DebugTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebugTreeComponent],
      imports: [HttpClientTestingModule, NgSimpleFileTreeModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
