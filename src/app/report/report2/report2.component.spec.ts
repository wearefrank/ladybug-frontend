import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Report2Component } from './report2.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('Report2Component', () => {
  let component: Report2Component;
  let fixture: ComponentFixture<Report2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report2Component, RouterTestingModule.withRoutes(routes)],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Report2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
