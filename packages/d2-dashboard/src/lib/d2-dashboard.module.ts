import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import {
  d2DashboardComponents,
  d2DashboardEntryComponents,
} from './components';
import { d2DashboardContainers } from './containers';
import { D2DashboardRoutingModule } from './d2-dashboard-routing.module';
import { D2DashboardComponent } from './d2-dashboard.component';
import { DashboardConfig } from './models';
import { d2DashboardModules } from './modules';
import { d2DashboardPipes } from './pipes';
import { d2DashboardServices } from './services';
import { DASHBARD_CONFIG } from './services/dashboard-config.service';
import { d2DashboardMaterialModules } from './shared';

@NgModule({
  imports: [
    CommonModule,
    D2DashboardRoutingModule,
    NgxDhis2HttpClientModule,
    KtdGridModule,
    ...d2DashboardMaterialModules,
    ...d2DashboardModules,
  ],
  declarations: [
    D2DashboardComponent,
    ...d2DashboardContainers,
    ...d2DashboardComponents,
    ...d2DashboardEntryComponents,
    ...d2DashboardPipes,
  ],
  providers: [
    ...d2DashboardServices,
    {
      provide: MatSnackBarRef,
      useValue: {},
    },
  ],
  entryComponents: [...d2DashboardEntryComponents],
  exports: [D2DashboardComponent],
})
export class D2DashboardModule {
  static forRoot(
    config: DashboardConfig
  ): ModuleWithProviders<D2DashboardModule> {
    return {
      ngModule: D2DashboardModule,
      providers: [
        {
          provide: DASHBARD_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
