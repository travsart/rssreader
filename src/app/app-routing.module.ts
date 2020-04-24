import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RssTableComponent } from './rsstable/desktop/rsstable.component';
import { GuardService } from './services/guard.service';
import { ApplicationStateService } from './services/application-state.service';
import { LogoutComponent } from './logout/logout.component';
import { RssCardComponent } from './rsstable/mobile/rsscard.component';
import {PreferenceComponent} from './preference/preference.component'

const desktop_routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LogoutComponent
    },
    {
        path: 'rss',
        component: RssTableComponent,
        canActivate: [GuardService]
    },
    {
        path: 'preference',
        component: PreferenceComponent,
        canActivate: [GuardService]
    },
    {
        path: '**',
        redirectTo: '/'
    }
];

const mobile_routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LogoutComponent
    },
    {
        path: 'rss',
        component: RssCardComponent,
        canActivate: [GuardService]
    },
    {
        path: 'preference',
        component: PreferenceComponent,
        canActivate: [GuardService]
    },
    {
        path: '**',
        redirectTo: '/'
    }
  ];
  

@NgModule({
    imports: [RouterModule.forRoot(desktop_routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

    public constructor(private router: Router,
      private applicationStateService: ApplicationStateService) {
  
      if (applicationStateService.getIsMobileResolution()) {
        router.resetConfig(mobile_routes);
      }
    }
  }
  
