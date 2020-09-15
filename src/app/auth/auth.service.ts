import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {BehaviorSubject, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private eventAuthError = new BehaviorSubject<string>('');
  eventAuthError$ = this.eventAuthError.asObservable();
  newUser: any;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router) { }
    isLoggedIn = false;

  getUserState() {
    return this.afAuth.authState;
  }

  checkLoginSatus(): Observable<boolean> {
    return of(JSON.parse(localStorage.getItem('isLoggedIn')));
  }


  login( email: string, password: string)
  {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .catch(error => {
        this.eventAuthError.next(error);
      })
      .then(userCredential => {
        if (userCredential) {
          localStorage.setItem('isLoggedIn', JSON.stringify(true));
          this.isLoggedIn = true;
          this.router.navigate(['/admin']);
        }
      });
  }

  // CREATE USER CODE

  // createUser(user) {
  //   this.afAuth.createUserWithEmailAndPassword( user.email, user.password)
  //     .then( userCredential => {
  //       this.newUser = user;
  //       userCredential.user.updateProfile( {
  //         displayName: user.firstName + ' ' + user.lastName
  //       });
  //
  //       this.insertUserData(userCredential)
  //         .then(() => {
  //           this.router.navigate(['/admin']);
  //         });
  //     })
  //     .catch( error => {
  //       this.eventAuthError.next(error);
  //     });
  // }
  //
  // insertUserData(userCredential: firebase.auth.UserCredential) {
  //   return this.db.doc(`Users/${userCredential.user.uid}`).set({
  //     email: this.newUser.email,
  //     firstname: this.newUser.firstName,
  //     lastname: this.newUser.lastName,
  //   });
  // }

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn = false;
    return this.afAuth.signOut();
  }
}
