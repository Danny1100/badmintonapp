import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerComponent } from './player/player.component';
import { CourtComponent } from './court/court.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AddPlayerComponent } from './add-player/add-player.component';
import { AddCourtComponent } from './add-court/add-court.component';
import { LinkedPlayersComponent } from './linked-players/linked-players.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    CourtComponent,
    HomeComponent,
    HeaderComponent,
    AddPlayerComponent,
    AddCourtComponent,
    LinkedPlayersComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
