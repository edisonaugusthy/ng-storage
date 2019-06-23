# ng-storage

A better way to store data in browser without cookies,

NB:we relies on session and data wont get cleared on refresh but tab close will clear all data


## Usage
 - Run `npm i ng-storage --save` to add module to project
 - And Import via `import { StorageModule } from 'drag-me';` in App Module
 - Add to imports
     imports: [
      BrowserModule,
      StorageModule
    ],

- Then import service `import { NgStorageService } from "ng-storage";`
- Then Initialize in constructor
    constructor(private http: HttpClient, private NgStorageService: StorageService) {

    }

##### Setting Data

Please note that we have to pass key value pairs to service , and key should be string and do not pass value as json string

 `this.StorageService.setData({ key: 'keyofdata', value: res })`

 NB: data format that accepted by `setData` method is
    export interface dataFormat {
     key: string
     value?: any
    }

#### Getting Data

Use `getData` method to retrive data, and it intake key as argument

eg:`this.StorageService.getData('key_of_data')`

#### Remove Data

 - `removeData` method is used remove single item based on key
 - `removeAll` method remove all data stored

 Examples :

 removeData:`this.StorageService.removeData('key_of_data')`

 removeAll`this.StorageService.removeAll()`

 ## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Vivaldi |
| --------- | --------- | --------- | --------- |
| IE11, Edge| last 8 versions| last 8 versions| last 2 versions