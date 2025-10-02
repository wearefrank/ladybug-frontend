import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent } from './checkpoint-value.component';
import { ReplaySubject } from 'rxjs';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: ReplaySubject<string | null> | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new ReplaySubject<string | null>();
    spyOn(component.savedChanges, 'emit');
    component.originalValue$ = originalValueSubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When a new checkpoint is selected then saved changes is emitted', () => {
    originalValueSubject!.next('My value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
  });

  it('When checkpoint value is edited then saved changes is emitted', () => {
    originalValueSubject!.next('My value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.onActualEditorContentsChanged('My other value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(false);
    component.onActualEditorContentsChanged('My value');
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
  });
});
