# ng-storage

Share Data among multiple components in angular using browser session storage

[Stackblitz Demo](https://stackblitz.com/edit/ng-storage-sample)

## Usage steps
 - Run `npm i ng-storage --save` in command prompt from root of your project folder
 - Add import to App Module like this `import { StorageModule } from 'ng7-storage';`
 - Add to imports array in app module
 ```
     imports: [
      BrowserModule,
      StorageModule
    ],
 ```

- Then import NgStorageService service `import { NgStorageService } from 'ng7-storage';` in the components that you would like to use
- Then Initialize StorageService in the component constructor
    ```
    constructor(private StorageService: NgStorageService) {

    }
   ```

follow below methods to set and retrieve data to storage
##### Setting Data

 `this.StorageService.setData({ key: 'key_of_data', value: res ,encrypt:optional|boolean})`

  Pass key value pairs to store data , and key should be  valid string


 NB: data format that accepted by `setData` method is

    export interface dataFormat {
     key: string;
     value?: any;
     encrypt?: Boolean;
     decrypt?: Boolean;
    }

NB:`encrypt` is a development onprogress feature and may have issues when setting data that has special characters

#### Getting Data

eg:`this.StorageService.getData({key: 'key_of_data',decrypt:optional|boolean})`

Use `getData` method to retrieve data, pass `key` of the item


#### Remove Data

 For removing data, we can either remove by a single key or we can remove all data at once

 - `removeData` method is used remove single item based on key
 - `removeAll` method remove all data stored

 Examples :

 removeData : `this.StorageService.removeData('key_of_data')`

 removeAll : `this.StorageService.removeAll()`

#### All Available methods
 - `setData()`
 - `getData()`
 - `removeData()`
 - `removeAll()`

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Vivaldi |
| --------- | --------- | --------- | --------- |
| IE11, Edge| last 8 versions| last 8 versions| last 5 versions


## Built with 🔧

* Angular

## Developing 👷

1. [Clone this repo](https://github.com/edisonaugusthy/ng-storage.git) with git.
1. Install dependencies by running `npm install` within the directory that you cloned (probably `ng-storage`).
1. Start the development server with `ng serve --o`.
1. Open development site by going to [http://localhost:4200](http://localhost:4200) in your browser.

## Author 🔮

<table>
  <tr>
    <td align="center"><a href="https://github.com/edisonaugusthy"><img src="https://github.com/edisonaugusthy.png?size=100" width="100px;" alt="Edison"/><br /><sub><b>Edison Augusthy</b></sub></a><br /><a href="https://github.com/edisonaugusthy/ng-storage/commits?author=edisonaugusthy" title="Edison">💻</a></td>

  </tr>

</table>
