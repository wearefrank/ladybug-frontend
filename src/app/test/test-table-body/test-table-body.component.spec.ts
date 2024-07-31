import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTableBodyComponent } from './test-table-body.component';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../shared/services/http.service';

describe('TestTableBodyComponent', () => {
  let component: TestTableBodyComponent;
  let fixture: ComponentFixture<TestTableBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTableBodyComponent, HttpService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTableBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
