import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent } from './checkpoint-value.component';
import { BehaviorSubject } from 'rxjs';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: BehaviorSubject<string | null> | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new BehaviorSubject<string | null>('My value');
    spyOn(component.savedChanges, 'emit');
    component.originalValue$ = originalValueSubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When checkpoint value is edited then saved changes is emitted', () => {
    component.onActualEditorContentsChanged('My other value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(false);
    component.onActualEditorContentsChanged('My value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
  });
});
