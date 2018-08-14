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
import { BattleModule } from './+battle/battle.module';
import { BlockiesModule } from 'angular-blockies';
import { DashboardModule } from './+dashboard/dashboard.module';
import { TradesModule } from './+trades/trades.module';
import { AdminModule } from './+admin/admin.module';
import { OnboardingModule } from './+onboarding/onboarding.module';

import { ErrorsComponent } from './shared/components/errors/errors.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { MobileScreenComponent } from './shared/components/mobile-screen/mobile-screen.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

import { appReducer } from './app.reducer';
import { metaReducers } from './app.state';
import { AppEffects } from './app.effects';

import { BootstrapGuard } from './shared/guards/bootstrap.guard';
import { UserGuard } from './shared/guards/user.guard';

import { AssetsCoreModule } from '../core/assets/assets.module';
import { PlayerCoreModule } from '../core/player/player.module';
import { Web3CoreModule } from '../core/web3/web3.module';
import { ContractsService } from '../core/shared/contracts.service';

import { RoundPipe } from './shared/pipes/round.pipe';
import { PipesModule } from './shared/pipes/pipes.module';

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
    // Ngrx
    StoreModule.forRoot({}),
    StoreModule.forFeature('app', appReducer),
    EffectsModule.forRoot([
      AppEffects
    ]),
    !environment.production ? StoreDevtoolsModule.instrument({maxAge: 75}) : [],

    BlockiesModule,
    AssetsModule,
    BattleModule,
    DashboardModule,
    TradesModule,
    AdminModule,
    OnboardingModule,
    AssetsCoreModule,
    PlayerCoreModule,
    Web3CoreModule,
    PipesModule
    // Note that you must instrument after importing StoreModule
  ],
  providers: [
    BootstrapGuard,
    ContractsService,
    UserGuard,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
