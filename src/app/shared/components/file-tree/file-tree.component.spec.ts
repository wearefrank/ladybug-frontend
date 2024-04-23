import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileTreeComponent } from './file-tree.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FileTreeComponent', () => {
  let component: FileTreeComponent;
  let fixture: ComponentFixture<FileTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileTreeComponent],
      imports: [HttpClientTestingModule, NgSimpleFileTreeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
