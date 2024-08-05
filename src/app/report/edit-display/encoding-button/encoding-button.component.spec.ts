import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncodingButtonComponent } from './encoding-button.component';

describe('EncodingButtonComponent', () => {
  let component: EncodingButtonComponent;
  let fixture: ComponentFixture<EncodingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncodingButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EncodingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
