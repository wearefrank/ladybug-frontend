import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
})
export class TableSettingsModalComponent implements OnInit {
  @ViewChild('modal') modal!: any;
  settingsForm = new FormGroup({
    generatorEnabled: new FormControl(''),
    regexFilter: new FormControl(''), // Report filter
    transformationEnabled: new FormControl(false),
    transformation: new FormControl(''),
  });

  @Output() openReportsEvent = new EventEmitter<any>();

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open() {
    this.modalService.open(this.modal);
  }

  ngOnInit(): void {
    this.httpService.getTransformation().subscribe((response) => {
      // Also load in the default transformation
      this.settingsForm.get('transformation')?.setValue(response.transformation);
    });
  }

  /**
   * Save the settings of the table
   */
  saveSettings(): void {
    const form: any = this.settingsForm.value;
    this.httpService.setTransformationEnabled(form.transformationEnabled);
    let map: { generatorEnabled: string; regexFilter: string } = {
      generatorEnabled: form.generatorEnabled,
      regexFilter: form.regexFilter,
    };
    this.httpService.postSettings(map).subscribe();

    if (form.transformationEnabled) {
      let transformation = { transformation: form.transformation };
      this.httpService.postTransformation(transformation).subscribe();
    }
  }

  openReports(amount: number) {
    this.openReportsEvent.next(amount);
  }
}
