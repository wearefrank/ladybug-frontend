import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugComponent } from './debug.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DebugComponent', () => {
  let component: DebugComponent;
  let fixture: ComponentFixture<DebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DebugComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
