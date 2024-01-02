import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerControllerComponent } from './player-controller/player-controller.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'edit-players', component: PlayerControllerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
