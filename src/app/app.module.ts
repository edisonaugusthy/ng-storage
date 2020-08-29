import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StorageModule } from 'storage';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StorageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
