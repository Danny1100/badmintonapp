import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddPlayerComponent } from './add-player/add-player.component';
import { LinkedPlayersComponent } from './linked-players/linked-players.component';
import { WaitDurationComponent } from './wait-duration/wait-duration.component';
import { PlayerListComponent } from './player-list/player-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'add-players', component: AddPlayerComponent },
  { path: 'player-list', component: PlayerListComponent },
  { path: 'linked-players', component: LinkedPlayersComponent },
  { path: 'wait-duration', component: WaitDurationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
