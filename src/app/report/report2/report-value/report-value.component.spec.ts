import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialReport, ReportValueComponent, Variable } from './report-value.component';
import { HttpService } from '../../../shared/services/http.service';
import { ErrorHandling } from '../../../shared/classes/error-handling.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Subject } from 'rxjs';

describe('ReportValue', () => {
  let component: ReportValueComponent;
  let fixture: ComponentFixture<ReportValueComponent>;
  let reportSubject: Subject<PartialReport> | undefined;
  let savedChangesSpy: jasmine.Spy | undefined;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), HttpService, ErrorHandling],
      imports: [ReportValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportValueComponent);
    component = fixture.componentInstance;
    savedChangesSpy = spyOn(component.savedChanges, 'emit');
    reportSubject = new Subject<PartialReport>();
    component.report$ = reportSubject;
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

  it('When a report has duplicate variables then they are detected', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
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
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([
      { name: 'duplicate', value: 'one' },
      { name: 'not-duplicate', value: 'two' },
    ]);
    component.onInputChange();
    expect(component.duplicateVariables.size).toEqual(0);
  });

  it('When removing a variable is requested, the right variable goes away', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
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
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
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
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedName = 'Changed name';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    component.editedName = 'My name';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When description is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedDescription = 'Changed description';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    component.editedDescription = 'My description';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When original description is null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedDescription = 'Changed description';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    component.editedDescription = '';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When path is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedPath = 'my/other/path';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    component.editedPath = 'my/path';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When original path null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedPath = 'my/other/path';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.editedPath = '';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When transformation is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedTransformation = 'other dummy transformation';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.editedTransformation = 'dummy transformation';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When original transformation is null then the user can clear it after editing', () => {
    reportSubject!.next(getEmptyPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([]);
    component.editedTransformation = 'other dummy transformation';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy?.calls.mostRecent().args[0]).toEqual(false);
    component.editedTransformation = '';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When variable name is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables[0].name = 'otherName';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.editedVariables[0].name = 'variable';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When variable value is changed then saved changes event emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables[0].value = 'otherValue';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.editedVariables[0].value = 'value';
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When variable is added then saved changes event is emitted', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables.push({ name: 'second', value: 'secondValue' });
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(2);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(false);
    component.editedVariables.pop();
    component.onInputChange();
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(3);
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });

  it('When a new edit row for variables appears, there is no change when the variable name is blank', () => {
    reportSubject!.next(getAPartialReport());
    expect(component.savedChanges.emit).toHaveBeenCalledTimes(1);
    expect(component.savedChanges.emit).toHaveBeenCalledWith(true);
    component.setVariables([{ name: 'variable', value: 'value' }]);
    component.editedVariables.push({ name: '  ', value: 'secondValue' });
    component.onInputChange();
    expect(savedChangesSpy!.calls.mostRecent().args[0]).toEqual(true);
  });
});

function getAPartialReport(): PartialReport {
  return {
    name: 'My name',
    description: 'My description',
    path: 'my/path',
    transformation: 'dummy transformation',
    variables: 'not applicable, have to fix type mismatch',
    xml: 'dummy xml',
  };
}

function getEmptyPartialReport(): PartialReport {
  return {
    name: 'My name',
    description: null,
    path: null,
    transformation: null,
    variables: 'not applicable, have to fix type mismatch',
    xml: 'dummy xml',
  };
}
