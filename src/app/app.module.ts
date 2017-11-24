import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ServicesModule } from './services/services.module';

import { AppComponent } from './app.component';
import { VillageModule } from './village/village.module';
import { ResourcesModule } from './resources/resources.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ResourcesModule,
    ServicesModule,
    VillageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
