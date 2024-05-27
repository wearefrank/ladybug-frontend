import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDisplayComponent } from './edit-display.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('EditDisplayComponent', () => {
  let component: EditDisplayComponent;
  let fixture: ComponentFixture<EditDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDisplayComponent],
      providers: [HttpClient, HttpHandler],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
