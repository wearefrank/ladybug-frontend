import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent } from './checkpoint-value.component';
import { Subject } from 'rxjs';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: Subject<string | null> | undefined;
  let makeNullSubject: Subject<void> | undefined;
  let savedChangesSpy: jasmine.Spy | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new Subject<string | null>();
    makeNullSubject = new Subject<void>();
    savedChangesSpy = spyOn(component.savedChanges, 'emit');
    component.originalValue$ = originalValueSubject;
    component.editToNull$ = makeNullSubject;
    component.save$ = new Subject<void>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When a new checkpoint is selected then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expectNoUnsavedChanges();
  }));

  it('When checkpoint value is edited then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expectNoUnsavedChanges();
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expectUnsavedChanges();
    component.onActualEditorContentsChanged('My value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expectNoUnsavedChanges();
  }));

  it('When null checkpoint value is edited and cleared then it becomes the empty string', fakeAsync(() => {
    originalValueSubject!.next(null);
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expectNoUnsavedChanges();
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expectUnsavedChanges();
    component.onActualEditorContentsChanged('');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(component.getEditedRealCheckpointValue()).toEqual('');
    expectUnsavedChanges();
  }));

  it('When make null button is clicked while editor is empty then checkpoint value becomes null', fakeAsync(() => {
    originalValueSubject!.next('');
    flush();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expectNoUnsavedChanges();
    makeNullSubject!.next();
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expectUnsavedChanges();
  }));

  it('When make null button is clicked while editor is not empty then checkpoint value becomes null', fakeAsync(() => {
    console.log('The test 84');
    originalValueSubject!.next('Some value');
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual('Some value');
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expectNoUnsavedChanges();
    makeNullSubject!.next();
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expectUnsavedChanges();
    console.log('Done');
  }));

  function expectNoUnsavedChanges(): void {
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(true);
    expect(component.getDifferences().data.length).toEqual(0);
  }

  function expectUnsavedChanges(): void {
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    expect(component.getDifferences().data.length).not.toEqual(0);
  }
});
