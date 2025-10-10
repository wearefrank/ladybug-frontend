import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent, PartialCheckpoint } from './checkpoint-value.component';
import { Subject } from 'rxjs';
import { PartialReport } from '../report2.component';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: Subject<PartialCheckpoint> | undefined;
  let nodeValueStateSpy: jasmine.Spy | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new Subject<PartialCheckpoint>();
    nodeValueStateSpy = spyOn(component.nodeValueState, 'emit');
    component.originalCheckpoint$ = originalValueSubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When a new checkpoint is selected then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('My value'));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
  }));

  it('When checkpoint value is edited then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('My value'));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
    component.onActualEditorContentsChanged('My value');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  }));

  it('When null checkpoint value is edited and cleared then it becomes the empty string', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint(null));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
    component.onActualEditorContentsChanged('');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expect(component.getEditedRealCheckpointValue()).toEqual('');
    expectIsEdited();
  }));

  it('When make null button is clicked while editor is empty then checkpoint value becomes null', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint(''));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onButton('makeNull');
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
  }));

  it('When make null button is clicked while editor is not empty then checkpoint value becomes null', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('Some value'));
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual('Some value');
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onButton('makeNull');
    flush();
    expect(component.getEditedRealCheckpointValue()).toEqual(null);
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
  }));

  it('When report level stub strategy is edited then saved changes is emitted', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('My value'));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onReportStubStrategyChange('Other stub strategy');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
    component.onReportStubStrategyChange('Some stub strategy');
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  }));

  it('When the checkpoint-s report is in a CRUD storage then the emitted events indicate not read-only', fakeAsync(() => {
    let checkpoint = getPartialCheckpoint('Some value');
    checkpoint.parentReport.crudStorage = true;
    originalValueSubject!.next(checkpoint);
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(false);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(false);
  }));

  it('When the checkpoint-s report is not in a CRUD storage then the emitted events indicate read-only', fakeAsync(() => {
    let checkpoint = getPartialCheckpoint('Some value');
    checkpoint.parentReport.crudStorage = false;
    originalValueSubject!.next(checkpoint);
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
  }));

  function expectNotEdited(): void {
    expect(component.labels?.isEdited).toEqual(false);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(false);
    expect(component.getDifferences().data.length).toEqual(0);
  }

  function expectIsEdited(): void {
    expect(component.labels?.isEdited).toEqual(true);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(true);
    expect(component.getDifferences().data.length).not.toEqual(0);
  }
});

function getPartialCheckpoint(message: string | null): PartialCheckpoint {
  const parentSeed = {
    name: 'My name',
    description: null,
    path: null,
    transformation: null,
    variables: 'not applicable, have to fix type mismatch',
    xml: 'dummy xml',
    crudStorage: true,
    // Does not have to be a stub strategy known by the FF!.
    stubStrategy: 'Some stub strategy',
  };
  const parent: PartialReport = { ...parentSeed };
  const result = {
    message,
    stubbed: false,
    preTruncatedMessageLength: message === null ? 0 : message.length,
    // Use report level stub strategy
    stub: 0,
    parentReport: parent,
  };
  return { ...result };
}
