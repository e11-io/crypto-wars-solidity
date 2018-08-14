import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { BlockTimePipe } from './block-time.pipe';
import { PastBlockTimePipe } from './past-block-time.pipe';
import { LargeNumberPipe } from './large-number.pipe';
import { RoundPipe } from './round.pipe';

@NgModule({
    imports: [
    ],
    declarations: [
        BlockTimePipe,
        PastBlockTimePipe,
        LargeNumberPipe,
        RoundPipe
    ],
    exports: [
      BlockTimePipe,
      PastBlockTimePipe,
      LargeNumberPipe,
      RoundPipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PipesModule {
}
