import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { View } from '../../shared/interfaces/view';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.currentView = {
      storageName: 'mockStorage',
      metadataNames: ['mockMetadata'],
      metadataTypes: new Map(),
    } as View;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
