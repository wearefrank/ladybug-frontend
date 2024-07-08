import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CompareComponent } from './compare/compare.component';
import { Report } from './shared/interfaces/report';
import { TestComponent } from './test/test.component';
import { DynamicService } from './shared/services/dynamic.service';
import { CompareData } from './compare/compare-data';
import { SettingsService } from './shared/services/settings.service';
import { DebugReportService } from './debug/debug-report.service';
import { TabService } from './shared/services/tab.service';
import { Subscription } from 'rxjs';
import { DebugComponent } from './debug/debug.component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Tab } from './shared/interfaces/tab';
import { ReportData } from './shared/interfaces/report-data';
import { HelperService } from './shared/services/helper.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ReportComponent } from './report/report.component';
import { CloseTab } from './shared/interfaces/close-tab';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet, ToastComponent],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  appVersion: string = '0.0.0';
  @ViewChild(CompareComponent) compareComponent!: CompareComponent;
  @ViewChild(TestComponent) testComponent!: TestComponent;

  title: string = 'ladybug';
  tabs: Tab[] = [];

  protected readonly debugComponentPath: string = `/${DebugComponent.ROUTER_PATH}`;
  protected readonly testComponentPath: string = `/${TestComponent.ROUTER_PATH}`;

  newTabSubscription!: Subscription;
  newCompareTabSubscription!: Subscription;
  closeTabSubscription!: Subscription;

  constructor(
    private titleService: Title,
    private dynamicService: DynamicService,
    //make sure settings are retrieved from localstorage on startup by initializing the service on startup
    private settingsService: SettingsService,
    private debugReportService: DebugReportService,
    private tabService: TabService,
    private router: Router,
    private helperService: HelperService,
  ) {
    this.titleService.setTitle(`Ladybug - v${this.appVersion}`);
  }

  ngOnInit(): void {
    this.fetchAndSetAppVersion();
    this.subscribeToServices();
  }

  ngAfterViewInit(): void {
    this.observeReportSave();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  fetchAndSetAppVersion() {
    fetch('../assets/package.json')
      .then((response: Response): void => {
        if (response.ok) {
          response.json().then((packageJson: { version: string }): void => {
            this.appVersion = packageJson.version;
          });
        } else {
          console.error('package.json could not be found in assets', response);
        }
      })
      .catch((error): void => {
        console.error('package.json could not be found in assets', error);
      });
  }

  subscribeToServices(): void {
    this.newTabSubscription = this.tabService.openReportInTab$.subscribe((value: ReportData) => {
      this.openReportInSeparateTab(value);
    });
    this.newCompareTabSubscription = this.tabService.openInCompare$.subscribe((value: CompareData) => {
      this.openNewCompareTab(value);
    });
    this.closeTabSubscription = this.tabService.closeTab$.subscribe((value: CloseTab) => {
      const tab: Tab | undefined = this.tabs.find((t: Tab) => t.id === value.id);
      if (tab) {
        this.closeTab(tab);
      }
    });
  }

  unsubscribeAll(): void {
    if (this.newTabSubscription) {
      this.newTabSubscription.unsubscribe();
    }
    if (this.newCompareTabSubscription) {
      this.newCompareTabSubscription.unsubscribe();
    }
    if (this.closeTabSubscription) {
      this.closeTabSubscription.unsubscribe();
    }
  }

  openReportInSeparateTab(data: ReportData): void {
    const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id === String(data.report.storageId));
    if (tabIndex == -1) {
      this.tabs.push({
        key: data.report.name,
        id: String(data.report.storageId),
        data: data.report,
        path: `report/${data.report.storageId}`,
      });
    }

    this.router.navigate([ReportComponent.ROUTER_PATH, data.report.storageId]);
  }

  observeReportSave(): void {
    this.dynamicService.getObservable().subscribe((report: Report) => {
      const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id == String(report.storageId));
      this.tabs[tabIndex].data = report;
    });
  }

  openNewCompareTab(data: CompareData): void {
    const tabId = this.helperService.createCompareTabId(data.originalReport, data.runResultReport);
    const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id == tabId);
    if (tabIndex == -1) {
      data.id = tabId;
      this.tabs.push({
        key: 'Compare',
        id: tabId,
        data: data,
        path: `compare/${tabId}`,
      });
    }
    this.router.navigate([CompareComponent.ROUTER_PATH, tabId]);
  }

  closeTab(tab: Tab): void {
    const index: number = this.tabs.indexOf(tab);
    this.tabs.splice(index, 1);
    if (this.router.url.includes(tab.path)) {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
  }
}
