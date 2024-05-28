import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDisplayComponent } from './edit-display.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EditDisplayComponent', () => {
  let component: EditDisplayComponent;
  let fixture: ComponentFixture<EditDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDisplayComponent, HttpClientTestingModule],
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
