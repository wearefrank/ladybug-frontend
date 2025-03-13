/* eslint sonarjs/no-gratuitous-expressions: 0 */
/* eslint sonarjs/no-extra-arguments: 0 */

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location, NgOptimizedImage } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CompareComponent } from './compare/compare.component';
import { TestComponent } from './test/test.component';
import { CompareData } from './compare/compare-data';
import { SettingsService } from './shared/services/settings.service';
import { TabService } from './shared/services/tab.service';
import { AppVariablesService } from './shared/services/app.variables.service';
import { catchError, Subscription } from 'rxjs';
import { DebugComponent } from './debug/debug.component';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Tab } from './shared/interfaces/tab';
import { ReportData } from './shared/interfaces/report-data';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ReportComponent } from './report/report.component';
import { CloseTab } from './shared/interfaces/close-tab';
import { HttpService } from './shared/services/http.service';
import { StubStrategy } from './shared/enums/stub-strategy';
import { ErrorHandling } from './shared/classes/error-handling.service';
import { VersionService } from './shared/services/version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterLinkActive, RouterLink, RouterOutlet, ToastComponent, NgOptimizedImage],
})
export class AppComponent implements OnInit, OnDestroy {
  frontendVersion?: string;
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
    //make sure settings are retrieved from localstorage on startup by initializing the service on startup
    private settingsService: SettingsService,
    private tabService: TabService,
    private router: Router,
    private location: Location,
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
    private versionService: VersionService,
    private appVariablesService: AppVariablesService,
  ) {}

  ngOnInit(): void {
    this.fetchAndSetFrontendVersion();
    this.subscribeToServices();
    this.getStubStrategies();
    this.appVariablesService.fetchCustomReportActionButtonText();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  async fetchAndSetFrontendVersion() {
    this.frontendVersion = await this.versionService.getFrontendVersion();
    this.titleService.setTitle(`Ladybug - v${this.frontendVersion}`);
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
        data: data,
        path: `report/${data.report.storageId}`,
      } as Tab);
    }

    this.router.navigate([ReportComponent.ROUTER_PATH, data.report.storageId]);
  }

  openNewCompareTab(data: CompareData): void {
    const tabId = this.tabService.createCompareTabId(data.originalReport, data.runResultReport);
    const tabIndex: number = this.tabs.findIndex((tab: Tab): boolean => tab.id == tabId);
    if (tabIndex == -1) {
      data.id = tabId;
      this.tabs.push({
        key: 'Compare',
        id: tabId,
        data: data,
        path: `compare/${tabId}`,
      } as Tab);
    }
    this.router.navigate([CompareComponent.ROUTER_PATH, tabId]);
  }

  closeTab(tab: Tab): void {
    const index: number = this.tabs.indexOf(tab);
    this.tabs.splice(index, 1);
    if (this.router.url.includes(tab.path)) {
      this.location.back();
    }
    if (tab.data) {
      this.tabService.closeTab(tab.data);
    }
  }

  closeTabEvent(tab: Tab, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.closeTab(tab);
  }

  getStubStrategies(): void {
    this.httpService
      .getStubStrategies()
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe((response: string[]) => (StubStrategy.report = response));
  }
}
