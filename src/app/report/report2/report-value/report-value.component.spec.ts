import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportValueComponent, Variable } from './report-value.component';
import { HttpService } from '../../../shared/services/http.service';
import { ErrorHandling } from '../../../shared/classes/error-handling.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Subject } from 'rxjs';
import { PartialReport } from '../report2.component';

describe('ReportValue', () => {
  let component: ReportValueComponent;
  let fixture: ComponentFixture<ReportValueComponent>;
  let reportSubject: Subject<PartialReport> | undefined;
  let nodeValueStateSpy: jasmine.Spy | undefined;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), HttpService, ErrorHandling],
      imports: [ReportValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportValueComponent);
    component = fixture.componentInstance;
    nodeValueStateSpy = spyOn(component.nodeValueState, 'emit');
    reportSubject = new Subject<PartialReport>();
    component.report$ = reportSubject;
    component.save$ = new Subject<void>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('When report.variables is filled then it can be parsed as the list of variables', () => {
    const input = '{"My variable":"aap","Other variable":"noot","Third":"mies"}';
    // TODO: Fix error with types. Report.variables is declared as a string but it is actually an object.
    const inputAsObject = JSON.parse(input);
    const parsedVariables: Variable[] = ReportValueComponent.initVariables(inputAsObject);
    expect(parsedVariables.length).toEqual(3);
    expect(parsedVariables[0].name).toEqual('My variable');
    expect(parsedVariables[0].value).toEqual('aap');
    expect(parsedVariables[1].name).toEqual('Other variable');
    expect(parsedVariables[1].value).toEqual('noot');
    expect(parsedVariables[2].name).toEqual('Third');
    expect(parsedVariables[2].value).toEqual('mies');
  });

  it('When report.variables is empty then it is parsed as the empty list', () => {
    const input: string | null = null;
    const parsedVariables: Variable[] = ReportValueComponent.initVariables(input);
    expect(parsedVariables.length).toEqual(0);
  });

  it('When original var names and edited var names are the same, they are common', () => {
    const commons = ReportValueComponent.getCommonVariableNames(['variable'], ['variable']);
    expect(commons.length).toEqual(1);
  });

  it('When there are no variables at all, there are no common variables', () => {
    const commons = ReportValueComponent.getCommonVariableNames([], []);
    expect(commons.length).toEqual(0);
  });

  it('When the variables are only reordered, all variables are commons', () => {
    let commons = ReportValueComponent.getCommonVariableNames(['var1', 'var2'], ['var2', 'var1']);
    expect(commons).toEqual(['var1', 'var2']);
    commons = ReportValueComponent.getCommonVariableNames(['var2', 'var1'], ['var1', 'var2']);
    expect(commons).toEqual(['var1', 'var2']);
  });

  it('When a report has duplicate variables then they are detected', () => {
    reportSubject!.next(getAPartialReport());
    expectNotEdited();
    component.setVariables([
      { name: 'duplicate', value: 'one' },
      { name: 'not-duplicate', value: 'two' },
      { name: 'duplicate', value: 'three' },
    ]);
    component.onInputChange();
    expect(component.duplicateVariables.size).toEqual(1);
    expect(component.duplicateVariables.has(2)).toEqual(true);
  });

  it('When a report has no duplicate variables then they are not detected', () => {
    reportSubject!.next(getAPartialReport());
    expectNotEdited();
    component.setVariables([
      { name: 'duplicate', value: 'one' },
      { name: 'not-duplicate', value: 'two' },
    ]);
    component.onInputChange();
    expect(component.duplicateVariables.size).toEqual(0);
  });

  it('When removing a variable is requested, the right variable goes away', () => {
    reportSubject!.next(getAPartialReport());
    expectNotEdited();
    component.setVariables([
      { name: 'first variable', value: 'one' },
      { name: 'second variable', value: 'two' },
      { name: 'third variable', value: 'two' },
    ]);
    expect(component.editedVariables.length).toEqual(4);
    expect(component.editedVariables[0].name).toEqual('first variable');
    expect(component.editedVariables[1].name).toEqual('second variable');
    expect(component.editedVariables[2].name).toEqual('third variable');
    // Allows the user to add a new variable
    expect(component.editedVariables[3].name).toEqual('');
    component.removeVariable(1);
    expect(component.editedVariables.length).toEqual(3);
    expect(component.editedVariables[0].name).toEqual('first variable');
    expect(component.editedVariables[1].name).toEqual('third variable');
    expect(component.editedVariables[2].name).toEqual('');
  });

  it('When the new variable edit field has gotten a name then a new empty variable row is added', () => {
    reportSubject!.next(getAPartialReport());
    expectNotEdited();
    component.setVariables([]);
    expect(component.editedVariables.length).toEqual(1);
    expect(component.editedVariables[0].name).toEqual('');
    component.editedVariables[0].name = 'some name';
    component.addEmptyVariableWhenNeeded();
    expect(component.editedVariables.length).toEqual(2);
    expect(component.editedVariables[0].name).toEqual('some name');
    expect(component.editedVariables[1].name).toEqual('');
  });

  it('When name is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedName = 'Changed name';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedName = 'My name';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When description is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedDescription = 'Changed description';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedDescription = 'My description';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When original description is null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expectNotEdited();
    component.setVariables([]);
    component.editedDescription = 'Changed description';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedDescription = '';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When path is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedPath = 'my/other/path';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedPath = 'my/path';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When original path null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedPath = 'my/other/path';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedPath = '';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When transformation is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedTransformation = 'other dummy transformation';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedTransformation = 'dummy transformation';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When original transformation is null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([]);
    component.editedTransformation = 'other dummy transformation';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedTransformation = '';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When variable name is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables[0].name = 'otherName';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedVariables[0].name = 'variable';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When variable value is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    component.setVariables([{ name: 'variable', value: 'value' }]);
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.editedVariables[0].value = 'otherValue';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedVariables[0].value = 'value';
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When variable is added then saved changes event is emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables.push({ name: 'second', value: 'secondValue' });
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(2);
    expectEdited();
    component.editedVariables.pop();
    component.onInputChange();
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(3);
    expectNotEdited();
  });

  it('When a new edit row for variables appears, there is no change when the variable name is blank', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.nodeValueState.emit).toHaveBeenCalledTimes(1);
    expectNotEdited();
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables.push({ name: '  ', value: 'secondValue' });
    component.onInputChange();
    expectNotEdited();
  });

  it('When a variable is renamed then the differences compare the variable names', () => {
    reportSubject!.next(getAPartialReport());
    component.setVariables([{ name: 'variableName', value: 'value' }]);
    expectNotEdited();
    component.editedVariables[0].name = 'otherVariableName';
    component.onInputChange();
    expectEdited();
    const differences = component.getDifferences().data;
    expect(differences.length).toEqual(1);
    expect(differences[0].originalValue).toEqual('variableName');
    expect(differences[0].editedValue).toEqual('otherVariableName');
  });

  it('When the values of variables changed, a difference is created for each', () => {
    reportSubject!.next(getAPartialReport());
    component.setVariables([
      { name: 'first', value: 'value 1' },
      { name: 'second', value: 'value 2' },
    ]);
    expectNotEdited();
    component.editedVariables[0].value = 'changed 1';
    component.editedVariables[1].value = 'changed 2';
    component.onInputChange();
    expectEdited();
    const differences = component.getDifferences().data;
    expect(differences.length).toEqual(2);
    expect(differences[0].name).toEqual('Variable first');
    expect(differences[1].name).toEqual('Variable second');
  });

  it('When the report is in a CRUD storage then emitted events indicate not read-only', () => {
    let report = getAPartialReport();
    report.crudStorage = true;
    reportSubject!.next(report);
    component.setVariables([]);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(false);
    component.editedName = 'Changed name';
    component.onInputChange();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(false);
  });

  it('When the report is not in a CRUD storage then emitted events indicate read-only', () => {
    let report = getAPartialReport();
    report.crudStorage = false;
    reportSubject!.next(report);
    component.setVariables([]);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
    component.editedName = 'Changed name';
    component.onInputChange();
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isReadOnly).toEqual(true);
  });

  function expectNotEdited(): void {
    expect(component.labels.isEdited).toEqual(false);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(false);
    expect(component.getDifferences().data.length).toEqual(0);
  }

  function expectEdited(): void {
    expect(component.labels.isEdited).toEqual(true);
    expect(nodeValueStateSpy?.calls.mostRecent().args[0].isEdited).toEqual(true);
    expect(component.getDifferences().data.length).not.toEqual(0);
  }
});

function getAPartialReport(): PartialReport {
  const result = {
    name: 'My name',
    description: 'My description',
    path: 'my/path',
    transformation: 'dummy transformation',
    variables: 'not applicable, have to fix type mismatch',
    xml: 'dummy xml',
    crudStorage: true,
  };
  return { ...result };
}

function getEmptyPartialReport(): PartialReport {
  const result = {
    name: 'My name',
    description: null,
    path: null,
    transformation: null,
    variables: 'not applicable, have to fix type mismatch',
    xml: 'dummy xml',
    crudStorage: true,
  };
  return { ...result };
}
