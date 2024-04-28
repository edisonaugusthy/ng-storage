import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NgStorageService {
  #message = `Your browser doesn't support ng-storage, Please update your browser`;
  constructor() {
    if (typeof window.sessionStorage == 'undefined') {
      console.error(this.#message);
      throw new Error(this.#message);
    }
  }

  setData(key: string, value: any, encrypt: boolean): boolean {
    if (key) {
      if (encrypt) {
        sessionStorage.setItem(
          key.toLowerCase(),
          window.btoa(JSON.stringify(value))
        );
      } else {
        sessionStorage.setItem(key.toLowerCase(), JSON.stringify(value));
      }
      return true;
    } else {
      throw new Error('key not found');
    }
  }

  getData(key: string, decrypt: boolean) {
    const details = sessionStorage.getItem(key.toLowerCase()) as string;
    if (decrypt) {
      return window.atob(JSON.parse(details));
    } else {
      return JSON.parse(details);
    }
  }

  removeData(key: string) {
    sessionStorage.removeItem(key.toLowerCase());
  }

  removeAll() {
    sessionStorage.clear();
  }
}
