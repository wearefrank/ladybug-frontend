import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebugComponent } from './debug/debug.component';
import { TestComponent } from './test/test.component';
import { CompareComponent } from './compare/compare.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  {
    component: DebugComponent,
    path: DebugComponent.ROUTER_PATH,
    pathMatch: 'full',
  },
  {
    component: TestComponent,
    path: TestComponent.ROUTER_PATH,
  },
  {
    component: ReportComponent,
    path: `${ReportComponent.ROUTER_PATH}/:id`,
  },
  {
    component: CompareComponent,
    path: `${CompareComponent.ROUTER_PATH}/:id`,
  },
  {
    path: '',
    redirectTo: 'debug',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
