import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';

@NgModule({
    imports: [
    ],
    declarations: [
        AdminComponent
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminModule {
}
