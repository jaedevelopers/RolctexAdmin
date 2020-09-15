import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  authError: any;  // used as a meessage in case of error
  constructor(private auth: AuthService) { }

  ngOnInit() {
    // assign error to variable
    this.auth.eventAuthError$.subscribe( data => {
      this.authError = data;
    });
  }
//login function
  login(frm) {
    this.auth.login(frm.value.email, frm.value.password);
  }

}
