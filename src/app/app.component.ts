import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'badmintonapp';

  beforeUnloadHandler = () => {
    localStorage.clear();
  };

  ngOnInit() {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }
}
