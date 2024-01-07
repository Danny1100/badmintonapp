import { Component } from '@angular/core';
import { CourtControllerService } from '../court-controller/court-controller.service';

@Component({
  selector: 'app-add-court',
  templateUrl: './add-court.component.html',
  styleUrls: ['./add-court.component.css'],
})
export class AddCourtComponent {
  courtNumber: number = 1;

  constructor(private courtControllerService: CourtControllerService) {}

  addCourt() {
    this.courtControllerService.addCourt(this.courtNumber);
  }
}
