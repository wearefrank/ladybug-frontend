import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { ReportComponent, ReportData } from './report/report.component';
import { Title } from '@angular/platform-browser';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HttpService } from './shared/services/http.service';
import { CompareComponent, CompareData } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  injector!: Injector;
  reportInjector!: Injector;
  compareInjector!: Injector;
  appVersion: string;
  FIXED_TAB_AMOUNT = 2;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;

  constructor(private inj: Injector, private titleService: Title, private httpService: HttpService) {
    this.appVersion = appVersion;
    this.titleService.setTitle('Ladybug - v' + this.appVersion);
  }

  ngAfterViewInit() {
    this.httpService.initializeToastComponent(this.toastComponent);
  }

  title = 'ladybug';
  active = 1;
  previousActive = 1;
  tabs: { key: string; value: any; id: string; data: any }[] = [];

  /**
   * Open an extra tab for the test report
   * @param data - the data in the report
   */
  openTestReport(data: any): void {
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id === data.data.storageId);
    if (tabIndex != -1) {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
    } else {
      this.changingTabs(data.data, 'Report');
      this.tabs.push({
        key: data.name,
        value: ReportComponent,
        id: data.data.storageId,
        data: data.data,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length; // Active the tab immediately
    }
  }

  openNewCompareTab(data: any) {
    const tabId = data.originalReport.storageId + '-' + data.runResultReport.storageId;
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id == tabId);

    if (tabIndex != -1) {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
    } else {
      data.id = tabId;
      this.changingTabs(data, 'Compare');
      this.tabs.push({
        key: 'Compare',
        value: CompareComponent,
        id: tabId,
        data: data,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length;
    }
  }

  closeTab(event: MouseEvent, toRemove: number): void {
    this.tabs.splice(toRemove, 1);
    this.active = this.previousActive;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  detectTabChange(event: any) {
    let tab = this.tabs[event.nextId - this.FIXED_TAB_AMOUNT - 1];
    if (event.nextId > this.FIXED_TAB_AMOUNT) {
      this.changingTabs(tab.data, tab.key);
    }
  }

  changingTabs(data: any, type: any) {
    if (type == 'Compare') {
      this.compareInjector = Injector.create({
        providers: [{ provide: CompareData, useValue: data }],
        parent: this.inj,
      });
    } else {
      this.reportInjector = Injector.create({
        providers: [{ provide: ReportData, useValue: data }],
        parent: this.inj,
      });
    }
  }
}
