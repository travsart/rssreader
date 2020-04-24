import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider'
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RssService } from './services/rss.service';
import { UserService } from './services/user.service';
import { ApplicationStateService } from'./services/application-state.service';
import { PreferenceService } from './services/preference.service';
import { LoginComponent } from './login/login.component';
import { RssTableComponent } from './rsstable/desktop/rsstable.component';
import { RssCardComponent } from './rsstable/mobile/rsscard.component';
import { RssDialogComponent } from './rssdialog/rssdialog.component';
import { ConfirmDialogComponent } from './confirmdialog/confirmdialog.component';
import {PreferenceComponent} from './preference/preference.component'

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RssTableComponent,
        RssDialogComponent,
        ConfirmDialogComponent,
        RssCardComponent,
        PreferenceComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatSidenavModule,
        MatToolbarModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        AppRoutingModule,
        MatSelectModule,
        FormsModule,
        MatCheckboxModule,
        MatListModule,
        ReactiveFormsModule,
        MatCardModule,
        MatPaginatorModule,
        MatSnackBarModule,
        MatDividerModule,
        MatSlideToggleModule
    ],
    providers: [RssService, UserService, ApplicationStateService,PreferenceService],
    bootstrap: [AppComponent],
    entryComponents: [RssDialogComponent, ConfirmDialogComponent]
})
export class AppModule { }
