import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent } from './checkpoint-value.component';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
