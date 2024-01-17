import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ReportComponent, ReportData } from './report/report.component';
import { Title } from '@angular/platform-browser';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HttpService } from './shared/services/http.service';
import { CompareComponent } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
import { TestComponent } from './test/test.component';
import { DynamicService } from './shared/services/dynamic.service';
import { CompareData } from './compare/compare-data';
import { SettingsService } from './shared/services/settings.service';

declare var require: any;
const { version: appVersion } = require('../../package.json');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  injector!: Injector;
  reportInjector!: Injector;
  compareInjector!: Injector;
  appVersion: string;
  FIXED_TAB_AMOUNT = 2;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;
  @ViewChild(TestComponent) testComponent!: TestComponent;
  static baseUrl: string = '';

  constructor(
    private inj: Injector,
    private titleService: Title,
    private httpService: HttpService,
    private dynamicService: DynamicService,
    //make sure settings are retrieved from localstorage on startup by initializing the service on startup
    private settingsService: SettingsService
  ) {
    this.appVersion = appVersion;
    this.titleService.setTitle('Ladybug - v' + this.appVersion);
  }

  ngOnInit(): void {
    const url: string = window.location.href;
    const ladybugName: string = 'ladybug';
    if (url.includes(ladybugName)) {
      AppComponent.baseUrl = url.slice(Math.max(0, url.indexOf(ladybugName) + ladybugName.length));
    }
  }

  ngAfterViewInit(): void {
    this.httpService.initializeToastComponent(this.toastComponent);
    this.observeReportSave();
  }

  title = 'ladybug';
  active = 1;
  previousActive = 1;
  tabs: { key: string; value: any; id: string; data: any }[] = [];

  openReportInSeparateTab(defaultDisplay: boolean, data: any): void {
    data.data.defaultDisplay = defaultDisplay;
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id === data.data.storageId);
    if (tabIndex == -1) {
      this.changingTabs(data.data, 'Report');
      this.tabs.push({
        key: data.name,
        value: ReportComponent,
        id: data.data.storageId,
        data: data.data,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length; // Active the tab immediately
    } else {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
    }
  }

  observeReportSave() {
    this.dynamicService.getObservable().subscribe((report: Report) => {
      const tabIndex: number = this.tabs.findIndex((tab) => Number(tab.id) == report.storageId);
      this.tabs[tabIndex].data = report;
    });
  }

  openNewCompareTab(data: any) {
    const tabId = data.originalReport.storageId + '-' + data.runResultReport.storageId;
    const tabIndex: number = this.tabs.findIndex((tab) => tab.id == tabId);

    if (tabIndex == -1) {
      data.id = tabId;
      this.changingTabs(data, 'Compare');
      this.tabs.push({
        key: 'Compare',
        value: CompareComponent,
        id: tabId,
        data: data,
      });
      this.active = this.FIXED_TAB_AMOUNT + this.tabs.length;
    } else {
      this.active = this.FIXED_TAB_AMOUNT + tabIndex + 1;
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

    if (event.nextId == 2) {
      this.testComponent.getCopiedReports();
      this.testComponent.getGeneratorStatus();
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
