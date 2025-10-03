import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent } from './checkpoint-value.component';
import { ReplaySubject } from 'rxjs';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: ReplaySubject<string | null> | undefined;
  let makeNullSubject: ReplaySubject<void> | undefined;
  let savedChangesSpy: jasmine.Spy | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new ReplaySubject<string | null>();
    makeNullSubject = new ReplaySubject<void>();
    savedChangesSpy = spyOn(component.savedChanges, 'emit');
    component.originalValue$ = originalValueSubject;
    component.editToNull$ = makeNullSubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When a new checkpoint is selected then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
  }));

  it('When checkpoint value is edited then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.onActualEditorContentsChanged('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  }));

  it('When null checkpoint value is edited and cleared then it becomes the empty string', fakeAsync(() => {
    originalValueSubject!.next(null);
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.onActualEditorContentsChanged('');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(component.getEditedRealCheckpointValue()).toEqual('');
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
  }));

  it('When make null button is clicked while editor is empty then checkpoint value becomes null', fakeAsync(() => {
    originalValueSubject!.next('');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    makeNullSubject!.next();
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
  }));

  it('When make null button is clicked while editor is not empty then checkpoint value becomes null', fakeAsync(() => {
    console.log('The test');
    originalValueSubject!.next('Some value');
    flush();
    console.log('Done setting Some value');
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    makeNullSubject!.next();
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    console.log('Done');
  }));
});
