import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../environments/environment';

import { routes } from './app.routes';

import { AppComponent } from './app.component';
import { AssetsModule } from './+assets/assets.module';
import { BlockiesModule } from 'angular-blockies';
import { DashboardModule } from './+dashboard/dashboard.module';
import { TradesModule } from './+trades/trades.module';
import { AdminModule } from './+admin/admin.module';
import { OnboardingModule } from './+onboarding/onboarding.module';

import { ErrorsComponent } from './shared/components/errors/errors.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { MobileScreenComponent } from './shared/components/mobile-screen/mobile-screen.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ServicesModule } from './shared/services/services.module';


import { AppReducers, metaReducers } from './app.reducer';
import { AppEffects } from './app.effects';

import { Web3Effects } from '../core/web3/web3.effects';
import { UserResourcesEffects } from '../core/user-resources/user-resources.effects';
import { UserEffects } from '../core/user/user.effects';
import { BuildingsQueueEffects } from '../core/buildings-queue/buildings-queue.effects';
import { BuildingsDataEffects } from '../core/buildings-data/buildings-data.effects';
import { UserVillageEffects } from '../core/user-village/user-village.effects';
import { UserBuildingsEffects } from '../core/user-buildings/user-buildings.effects';
import { AssetsRequirementsEffects } from '../core/assets-requirements/assets-requirements.effects';
import { BuildingsEffects } from '../core/buildings/buildings.effects';
import { BootstrapGuard } from './shared/guards/bootstrap.guard';
import { UserGuard } from './shared/guards/user.guard';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ErrorsComponent,
    LoadingComponent,
    MobileScreenComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {initialNavigation: true}),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ServicesModule,
    BlockiesModule,
    AssetsModule,
    DashboardModule,
    TradesModule,
    AdminModule,
    OnboardingModule,
    StoreModule.forRoot(AppReducers, {metaReducers}),
    EffectsModule.forRoot([
      AppEffects,
      BuildingsDataEffects,
      UserBuildingsEffects,
      BuildingsQueueEffects,
      UserEffects,
      UserResourcesEffects,
      UserVillageEffects,
      Web3Effects,
      AssetsRequirementsEffects,
      BuildingsEffects,
    ]),
    // Note that you must instrument after importing StoreModule
    !environment.production ? StoreDevtoolsModule.instrument({maxAge: 25}) : [],
  ],
  providers: [
    BootstrapGuard,
    UserGuard,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
