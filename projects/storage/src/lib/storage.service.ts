import { Injectable } from '@angular/core';


export interface dataFormat {
  key?: string;
  value?: any;
  encrypt?: Boolean;
  decrypt?: Boolean;
}
@Injectable({
  providedIn: 'root'
})
export class NgStorageService {

  constructor() {
    if ((typeof window.sessionStorage == 'undefined')) {
      console.error('your browser dont support ng-storage, Please update your browser');
    }
  }


  setData(data: dataFormat) {
    if (data.key) {
      if (data.encrypt) {
        sessionStorage.setItem(data.key.toString().toLowerCase(), window.btoa(JSON.stringify(data.value)));
      }
      else {
        sessionStorage.setItem(data.key.toString().toLowerCase(), JSON.stringify(data.value));
      }
      return true;
    }
    else {
      return false
    }

  }

  getData(data: dataFormat) {
    if (data.decrypt) {
      return window.atob(JSON.parse(sessionStorage.getItem(data.key.toString().toLowerCase())));

    } else {
      return JSON.parse(sessionStorage.getItem(data.key.toString().toLowerCase()));
    }
  }

  removeData(key) {
    sessionStorage.removeItem(key.toString().toLowerCase());
  }

  removeAll() {
    sessionStorage.clear();
  }
}
