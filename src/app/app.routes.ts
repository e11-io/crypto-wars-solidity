import { Route, Routes } from '@angular/router';

import { AssetsComponent } from './+assets/assets.component';
// Sub assets route components
import { BuildingsComponent } from './+assets/+buildings/buildings.component';
import { UnitsComponent } from './+assets/+units/units.component';
import { DefenseComponent } from './+assets/+defense/defense.component';
import { ResearchComponent } from './+assets/+research/research.component';

import { DashboardComponent } from './+dashboard/dashboard.component';
import { TradesComponent } from './+trades/trades.component';
import { AdminComponent } from './+admin/admin.component';
import { OnboardingComponent } from './+onboarding/onboarding.component';
import { BootstrapGuard } from './shared/guards/bootstrap.guard';
import { UserGuard } from './shared/guards/user.guard';

export const HomeRoutes: Route[] = [
    //{path: '', component: LoadingComponent},
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
        //component: OnBoardingComponent}
    },
    {
        path: 'dashboard',
        canActivate: [UserGuard],
        component: DashboardComponent,
        data: { navbar: true }
    },
    {
        path: 'assets',
        canActivate: [UserGuard],
        component: AssetsComponent,
        data: { navbar: true} ,
        children: [
          { path: '', pathMatch: 'full', redirectTo: '/assets/buildings', },
          { path: 'buildings', canActivate: [], component: BuildingsComponent },
          { path: 'units', canActivate: [], component: UnitsComponent },
          { path: 'defense', canActivate: [], component: DefenseComponent },
          { path: 'research', canActivate: [], component: ResearchComponent }
        ]
    },
    {
        path: 'trades',
        canActivate: [UserGuard],
        component: TradesComponent,
        data: { navbar: true }
    },
    {
        path: 'admin',
        canActivate: [BootstrapGuard],
        component: AdminComponent
    },
    {
        path: 'onboarding',
        canActivate: [UserGuard],
        component: OnboardingComponent,
        data: { navbar: false, childNavigationDisabled: true }
    },
    { path: '**', redirectTo: 'dashboard' }
];

export const routes: Routes = [
    ...HomeRoutes
];
