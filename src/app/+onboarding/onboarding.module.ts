import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from "@ngx-translate/core";

import { NewUserComponent } from './new-user/new-user.component';
import { OnboardingComponent } from './onboarding.component';
import { PrivateBetaComponent } from './private-beta/private-beta.component';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      TranslateModule
    ],
    declarations: [
        OnboardingComponent,
        NewUserComponent,
        PrivateBetaComponent
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OnboardingModule {
}
