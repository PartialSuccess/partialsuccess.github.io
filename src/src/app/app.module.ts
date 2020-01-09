import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { PlayerComponent } from './main/player/player.component';

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        PlayerComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule,
        RouterModule.forRoot([
            { path: '', component: MainComponent },
            { path: '**', redirectTo: '' }
        ]),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
