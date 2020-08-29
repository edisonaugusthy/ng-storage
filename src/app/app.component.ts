import { Component } from '@angular/core';
import { NgStorageService } from 'storage';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-storage';

  constructor(private storge: NgStorageService) {

  }
}
