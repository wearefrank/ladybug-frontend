import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneModalComponent } from './clone-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CloneModalComponent', () => {
  let component: CloneModalComponent;
  let fixture: ComponentFixture<CloneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CloneModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
