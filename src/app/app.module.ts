import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomTreeComponent } from './custom-tree/custom-tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    CustomTreeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTreeModule,
    MatIconModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
