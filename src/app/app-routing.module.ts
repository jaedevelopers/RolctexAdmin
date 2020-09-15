import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {HomeComponent} from './home/home.component';
import {LoggedGuardGuard} from './auth/logged-guard.guard';

const routes: Routes = [
  { path: 'admin',
    component: HomeComponent , canActivate: [LoggedGuardGuard]},
  { path: 'login',
  component: LoginComponent },
  { path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
