import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Difference2ModalComponent } from './difference2-modal.component';

describe('Difference2ModalComponent', () => {
  let component: Difference2ModalComponent;
  let fixture: ComponentFixture<Difference2ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Difference2ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Difference2ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


