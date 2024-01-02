import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerComponent } from './player/player.component';
import { CourtComponent } from './court/court.component';
import { PlayerControllerComponent } from './player-controller/player-controller.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [AppComponent, PlayerComponent, CourtComponent, PlayerControllerComponent, HomeComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
