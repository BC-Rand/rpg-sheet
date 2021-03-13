import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SheetComponent } from './sheet/sheet.component';

import { APIService } from './api.service';
import { ClassComponent } from './class/class.component';
import { RaceComponent } from './race/race.component';
import { BackgroundComponent } from './background/background.component';
import { AbilitiesComponent } from './abilities/abilities.component';

@NgModule({
  declarations: [
    AppComponent,
    SheetComponent,
    ClassComponent,
    RaceComponent,
    BackgroundComponent,
    AbilitiesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [APIService],
  bootstrap: [AppComponent]
})
export class AppModule { }
