import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSettingsModalComponent } from './table-settings-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TableSettingsModalComponent', () => {
  let component: TableSettingsModalComponent;
  let fixture: ComponentFixture<TableSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableSettingsModalComponent],
      imports: [HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
