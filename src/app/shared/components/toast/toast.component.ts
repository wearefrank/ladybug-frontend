import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Alert } from '../../interfaces/alert';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit {
  TIMEOUT: number = 10_000;
  selectedAlert: Alert = { type: '', message: '' };
  @ViewChild('modal') modal!: any;
  alerts: Alert[] = [
    // {type: 'warning', message: 'There is some error wow!'},
    // {type: 'danger', message: 'There is a big error wow!'},
    // {type: 'success', message: 'There is no error wow!'}
  ];

  @ViewChild('staticAlert', { static: false }) staticAlert!: NgbAlert;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    // Show the alert for 5 seconds
    setTimeout(() => {
      if (this.staticAlert) {
        this.staticAlert.close();
        this.alerts = [];
      }
    }, this.TIMEOUT);
  }

  /**
   * Closes the alert
   * @param alert - alert that will be closed
   */
  close(alert: Alert): void {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
    this.ngOnInit();
  }

  /**
   * Adds an alert
   * @param alert - alert that will be added
   */
  addAlert(alert: Alert): void {
    this.alerts.push(alert);
    this.ngOnInit();
  }

  showDetailedErrorMessages(alert: Alert) {
    this.selectedAlert = alert;
    this.modalService.open(this.modal, { size: 'lg' });
  }

  copyToClipboard() {
    const text = document.querySelector('#detailedErrorMessage')!;
    navigator.clipboard.writeText(text.innerHTML).then(() => {
      const button = document.querySelector('#CopyToClipboard')!;
      button.innerHTML = 'Copied!';
      button.setAttribute('style', 'background-color: #23c6c8 !important');
    });
  }
}
