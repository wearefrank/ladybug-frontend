import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialReport, ReportValueComponent, Variable } from './report-value.component';

describe('ReportValue', () => {
  let component: ReportValueComponent;
  let fixture: ComponentFixture<ReportValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportValueComponent);
    component = fixture.componentInstance;
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
    const instance = new ReportValueComponent();
    instance.report = getAPartialReport();
    instance.setVariables([
      { name: 'duplicate', value: 'one' },
      { name: 'not-duplicate', value: 'two' },
      { name: 'duplicate', value: 'three' },
    ]);
    instance.onInputChange();
    expect(instance.duplicateVariables.size).toEqual(1);
    expect(instance.duplicateVariables.has(2)).toEqual(true);
  });

  it('When a report has no duplicate variables then they are not detected', () => {
    const instance = new ReportValueComponent();
    instance.report = getAPartialReport();
    instance.setVariables([
      { name: 'duplicate', value: 'one' },
      { name: 'not-duplicate', value: 'two' },
    ]);
    instance.onInputChange();
    expect(instance.duplicateVariables.size).toEqual(0);
  });

  it('When removing a variable is requested, the right variable goes away', () => {
    const instance = new ReportValueComponent();
    instance.report = getAPartialReport();
    instance.setVariables([
      { name: 'first variable', value: 'one' },
      { name: 'second variable', value: 'two' },
      { name: 'third variable', value: 'two' },
    ]);
    expect(instance.editedVariables.length).toEqual(4);
    expect(instance.editedVariables[0].name).toEqual('first variable');
    expect(instance.editedVariables[1].name).toEqual('second variable');
    expect(instance.editedVariables[2].name).toEqual('third variable');
    // Allows the user to add a new variable
    expect(instance.editedVariables[3].name).toEqual('');
    instance.removeVariable(1);
    expect(instance.editedVariables.length).toEqual(3);
    expect(instance.editedVariables[0].name).toEqual('first variable');
    expect(instance.editedVariables[1].name).toEqual('third variable');
    expect(instance.editedVariables[2].name).toEqual('');
  });

  it('When the new variable edit field has gotten a name then a new empty variable row is added', () => {
    const instance = new ReportValueComponent();
    instance.report = getAPartialReport();
    instance.setVariables([]);
    expect(instance.editedVariables.length).toEqual(1);
    expect(instance.editedVariables[0].name).toEqual('');
    instance.editedVariables[0].name = 'some name';
    instance.addEmptyVariableWhenNeeded();
    expect(instance.editedVariables.length).toEqual(2);
    expect(instance.editedVariables[0].name).toEqual('some name');
    expect(instance.editedVariables[1].name).toEqual('');
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
