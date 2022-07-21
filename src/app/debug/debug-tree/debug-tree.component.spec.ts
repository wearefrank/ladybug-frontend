import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugTreeComponent } from './debug-tree.component';

describe('DebugTreeComponent', () => {
  let component: DebugTreeComponent;
  let fixture: ComponentFixture<DebugTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebugTreeComponent],
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
