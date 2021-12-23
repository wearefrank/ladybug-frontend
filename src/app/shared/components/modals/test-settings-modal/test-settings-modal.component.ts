import {Component, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-test-settings-modal',
  templateUrl: './test-settings-modal.component.html',
  styleUrls: ['./test-settings-modal.component.css']
})
export class TestSettingsModalComponent {
  @ViewChild('modal') modal!: any;


  constructor(private modalService: NgbModal) {}

  open() {
    this.modalService.open(this.modal);
  }
}
