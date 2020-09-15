import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Router} from '@angular/router';
import {ManageService} from '../service/manage.service';
import { AngularFireStorage} from '@angular/fire/storage';
import {finalize} from 'rxjs/operators';
import {Observable, observable} from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {
  // Vaiables Used
  user: firebase.User;     // User Object
  products: any;           // Product Array
  product: string;         // Product Name
  imgLink: string;         // Product Img/Vid Link
  eimgLink: string;        // Product Img/Vid Link after edit
  fileExt: string;         // Product Img/Vid Link ext
  dLink: string;           // Product Img/Vid Link to delete
  visible: boolean;        // Product Visible Field
  description: string;     // Product Description Field
  estado: string;          // Product New/Used Field
  attributes: string;      // Product Attribute Field
  show: boolean = true;    // Trigger For ProgressBar
  wasUpdated: boolean = false;  // Trigger To get Updated data

  constructor(private auth: AuthService,
              public manageservice: ManageService,
              private router: Router,
              private storage: AngularFireStorage) {
  }

  // Obsevables used for File Upload to Firebase
  uploadPercent: Observable<number>;
  uploadTask: any;
  urlImage: Observable<string>;

  // Obsevables used for Edit File Upload to Firebase
  editUploadPercent: Observable<number>;
  editUploadTask: any;
  editUrlImage: Observable<string>;

  // Obsevables used for File Upload to Firebase
  @ViewChild('imageProduct') inputImageProduct: ElementRef;
  @ViewChild('imageProduct') editInputImageProduct: ElementRef;

  ngOnInit() {
    // Get User info
    this.auth.getUserState()
      .subscribe( user => {
        this.user = user;
      });

    // Get Product List From FireBase
    this.manageservice.get_allProducts().subscribe(data => {
      this.products = data.map(e => {
        return {
          id: e.payload.doc.id,
          isedit: false,
          product: e.payload.doc.data()['product'],
          description: e.payload.doc.data()['description'],
          imgLink: e.payload.doc.data()['imgLink'],
          visible: e.payload.doc.data()['visible'],
          attributes: e.payload.doc.data()['attributes'],
          dLink: e.payload.doc.data()['dLink'],
          estado: e.payload.doc.data()['estado'],
          fileExt: e.payload.doc.data()['fileExt']
        };
      });
      // console.log(this.products);
    });
  }

  // Add Product to FireBase Function
  CreateRecord()
  {
    // Splits attribute array from attribute field
    let attrib = this.attributes.split('/');
    // Get img link from observable
    this.imgLink = this.inputImageProduct.nativeElement.value;
    // Set New/Used fied to false default
    if (this.visible === undefined){
      this.visible = false;
    }
    // Array to set values from HTML
    const Record = {};
    Record['product'] = this.product;
    Record['description'] = this.description;
    Record['imgLink'] = this.imgLink;
    Record['visible'] = this.visible;
    Record['dLink'] = this.dLink;
    Record['attributes'] = attrib;
    Record['estado'] = this.estado;
    Record['fileExt'] = this.fileExt;
    this.show = false;
    // calling upload function
    this.manageservice.create_newProduct(Record).then(res => {
      // Reseting Values on fields
      this.product = '';
      this.attributes = '';
      this.description = '';
      // Success message after upload
      Swal.fire({
        icon: 'success',
        text: 'Producto añadido exitosamente',
      });
    });
  }

  // Edit Product
  EditRecord(Record)
  {
    let a = Record.attributes.toString();   //converting attributes data to string
    let re = /,/gi;                         //selecting comma  as value to remove
    let newstr = a.replace(re, '/');  //replacing the comma in attributes value
    //assigning values to appear in field when edit is clicked
    Record.isedit = true;
    Record.editname = Record.product;
    Record.editdescription = Record.description;
    Record.editvisible = Record.visible;
    Record.editimgLink = Record.imglink;
    Record.editattributes = newstr;
    Record.editestado = Record.estado;
  }

  // Update Product
  Updatarecord(recorddata)
  {
    // Update Product
    let attrib = recorddata.editattributes.split('/'); // spliting attributes sting into an array where / is found
    const record = {};                                         // array to be sent to firebase to update
    // adding values to array from edit form
    record['product'] = recorddata.editname;
    record['description'] =  recorddata.editdescription;
    record['visible'] = recorddata.editvisible;
    record['attributes'] = attrib;
    record['estado'] = recorddata.editestado;
    // Only if image was updated execute next
    if (this.wasUpdated === true ){
      this.eimgLink = this.editInputImageProduct.nativeElement.value;   // get new file link
      record['imgLink'] = this.eimgLink;  // Update file link field
      record['dLink'] = this.dLink; // Update delete file link field
      record['fileExt'] = this.fileExt; // Update file ext field
    }
    this.manageservice.update_Product(recorddata.id, record); // sending array to firebase
    // Success mesage after data sent to firebase
    Swal.fire({
      icon: 'success',
      text: 'Producto actualizado exitosamente',
    });
    recorddata.isedit = false; // resteing cards to non edit view
    this.wasUpdated = false;   // resteing updated trigger
  }

  // Delete product
  DeleteProduct(item)
  {
    // Delete warning
    Swal.fire({
      title: 'Se va a eliminar el producto',
      text: '¿Estás seguro de eliminarlo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, eliminar'
    }).then((result) => {
      if (result.value) {
        Swal.fire(
          '¡Eliminado!',
          'Ha sido eliminado',
          'success'
        );
        this.manageservice.delete_Product(item.id); //function to delete product from firebase
        this.storage.ref(item.dLink).delete(); // function to delete image from firebase storage
      }
    });
  }

  // Login funcion
  login() {
    this.router.navigate(['/login']);
  }

  // logout funcion
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }


  // file Upload funcion
  onUpload(e){
  this.show = true;   // Show Progress bar
  const id = Math.random().toString(36).substring(2);// Used to create random name
  const file = e.target.files[0]; //get upload file
  this.fileExt = file.name.split('.').pop(); //Get file ext
  const filePath = `Products/${id}`; // select firebase storage path
  this.dLink = filePath;  //assign delete path for later use
  const ref = this.storage.ref(filePath); // create reference to file
  this.uploadTask = this.storage.upload(filePath, file); // upload funcion
  this.uploadPercent = this.uploadTask.percentageChanges(); // observable to upload progress
  this.uploadTask.snapshotChanges().pipe( finalize(() => this.urlImage = ref.getDownloadURL())).subscribe(); // subscribe to download url
  }

  // file edit Upload funcion
  editOnUpload(e){
    this.show = true;// Show Progress bar
    this.wasUpdated = true;
    const id = Math.random().toString(36).substring(2); // Used to create random name
    const file = e.target.files[0]; //get upload file
    this.fileExt = file.name.split('.').pop(); //Get file ext
    const filePath = `Products/${id}`; // select firebase storage path
    this.dLink = filePath; //assign delete path for later use
    const ref = this.storage.ref(filePath); // create reference to file
    this.editUploadTask = this.storage.upload(filePath, file); // upload funcion
    this.editUploadPercent = this.editUploadTask.percentageChanges(); // observable to upload progress
    this.editUploadTask.snapshotChanges().pipe( finalize(() => this.editUrlImage = ref.getDownloadURL())).subscribe();// subscribe to download url
  }

}
