import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverwriteTransformationComponent } from './overwrite-transformation-modal.component';

describe('OverwriteTransformationComponent', () => {
  let component: OverwriteTransformationComponent;
  let fixture: ComponentFixture<OverwriteTransformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverwriteTransformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverwriteTransformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
