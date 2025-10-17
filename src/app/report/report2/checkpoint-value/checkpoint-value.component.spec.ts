import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { CheckpointValueComponent, PartialCheckpoint } from './checkpoint-value.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { PartialReport } from '../report2.component';
import { StubStrategy } from '../../../shared/enums/stub-strategy';
import { ReportButtonsState } from '../report-buttons/report-buttons';
import { TestResult } from '../../../shared/interfaces/test-result';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CheckpointValue', () => {
  let component: CheckpointValueComponent;
  let fixture: ComponentFixture<CheckpointValueComponent>;
  let originalValueSubject: Subject<PartialCheckpoint> | undefined;
  let saveDoneSubject: Subject<void> | undefined;
  let nodeValueStateSpy: jasmine.Spy | undefined;
  let buttonState: ReportButtonsState | undefined;
  let buttonStateSubscription: Subscription | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
      imports: [CheckpointValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckpointValueComponent);
    component = fixture.componentInstance;
    originalValueSubject = new Subject<PartialCheckpoint>();
    saveDoneSubject = new Subject<void>();
    nodeValueStateSpy = spyOn(component.nodeValueState, 'emit');
    component.originalCheckpoint$ = originalValueSubject;
    component.saveDone$ = saveDoneSubject;
    component.rerunResult$ = new Subject<TestResult | undefined>() as Observable<TestResult | undefined>;
    buttonStateSubscription = component.buttonStateSubject.subscribe((newButtonState) => {
      buttonState = newButtonState;
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    buttonStateSubscription?.unsubscribe();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When a new checkpoint is selected then consistently show not edited', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('My value'));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
  }));

  it('When checkpoint value is edited then consistently show this change', fakeAsync(() => {
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

  it('When checkpoint level stub strategy is edited then consistently show this change', fakeAsync(() => {
    originalValueSubject!.next(getPartialCheckpoint('My value'));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.onCheckpointStubStrategyChange(StubStrategy.checkpointIndex2Stub(1));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectIsEdited();
    component.onCheckpointStubStrategyChange(StubStrategy.checkpointIndex2Stub(0));
    flush();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  }));

  it('When report level stub strategy is edited then consistently show this change', fakeAsync(() => {
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
    expect(buttonState?.isReadOnly).toEqual(false);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(false);
    expect(buttonState?.isReadOnly).toEqual(false);
  }));

  it('When the checkpoint-s report is not in a CRUD storage then the emitted events indicate read-only', fakeAsync(() => {
    let checkpoint = getPartialCheckpoint('Some value');
    checkpoint.parentReport.crudStorage = false;
    originalValueSubject!.next(checkpoint);
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
    expect(buttonState?.isReadOnly).toEqual(true);
    component.onActualEditorContentsChanged('My other value');
    flush();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
    expect(buttonState?.isReadOnly).toEqual(true);
  }));

  function expectNotEdited(): void {
    expect(component.labels?.isEdited).toEqual(false);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(false);
    expect(component.getDifferences().data.length).toEqual(0);
    expect(buttonState?.isEdited).toEqual(false);
    expect(buttonState?.saveAllowed).toEqual(false);
  }

  function expectIsEdited(): void {
    expect(component.labels?.isEdited).toEqual(true);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(true);
    expect(component.getDifferences().data.length).not.toEqual(0);
    expect(buttonState?.isEdited).toEqual(true);
    expect(buttonState?.saveAllowed).toEqual(true);
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
    index: 0,
    message,
    stubbed: false,
    preTruncatedMessageLength: message === null ? 0 : message.length,
    // Use report level stub strategy
    stub: StubStrategy.checkpointIndex2Stub(0),
    parentReport: parent,
  };
  return { ...result };
}
