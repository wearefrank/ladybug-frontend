import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonacoDiffEditor } from './monaco-diff-editor.component';

describe('MonacoDiffEditor', () => {
  let component: MonacoDiffEditor;
  let fixture: ComponentFixture<MonacoDiffEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonacoDiffEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(MonacoDiffEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
