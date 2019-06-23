import { Injectable } from '@angular/core';

// tslint:disable-next-line:class-name
export interface cookieData {
  key?: string;
  value?: any;
}
@Injectable({
  providedIn: 'root'
})
export class NgStorageService {

  constructor() {
    // tslint:disable-next-line:triple-equals
    if ((typeof window.sessionStorage == 'undefined')) {
      console.error('your browser dont support ng-storage, Please update your browser');
    }
  }


  setData(data: cookieData) {
    // tslint:disable-next-line:no-unused-expression
    data.key && sessionStorage.setItem(data.key.toString().toLowerCase(), JSON.stringify(data.value));
  }

  getData(key) {
    return JSON.parse(sessionStorage.getItem(key.toString().toLowerCase()));
  }

  removeData(key) {
    sessionStorage.removeItem(key.toString().toLowerCase());
  }

  removeAll() {
    sessionStorage.clear();
  }
}
