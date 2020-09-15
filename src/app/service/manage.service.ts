import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  constructor(public fireservices: AngularFirestore) { }

  create_newProduct(Record)
  {
    return this.fireservices.collection('product').add(Record);
  }

  get_allProducts()
  {
    return this.fireservices.collection('product').snapshotChanges();
  }

  update_Product(recordid, record)
  {
    this.fireservices.doc('product/' + recordid).update(record);
  }

  delete_Product(record_id)
  {
    this.fireservices.doc('product/' + record_id).delete();
  }


}
