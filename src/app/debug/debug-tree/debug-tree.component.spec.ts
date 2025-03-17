import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugTreeComponent } from './debug-tree.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('DebugTreeComponent', () => {
  let component: DebugTreeComponent;
  let fixture: ComponentFixture<DebugTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSimpleFileTreeModule, DebugTreeComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
