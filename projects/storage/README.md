# ng-storage

A better way to store data in browser without cookies,

NB:we relies on session and data wont get cleared on refresh but tab close will clear all data


## Usage
 - Run `npm i ng-storage --save` to add module to project
 - Add  `import { StorageModule } from 'ng7-storage';` in App Module
 - Add to imports
 ```
     imports: [
      BrowserModule,
      StorageModule
    ],
 ```

- Then import service `import { NgStorageService } from 'ng7-storage';`
- Then Initialize in constructor
    ```
    constructor(private StorageService: NgStorageService) {
    }
   ```

##### Setting Data

Please note that we have to pass key value pairs to service , and key should be string and do not pass value as json string

 `this.StorageService.setData({ key: 'key_of_data', value: res ,encrypt:optional|boolean})`

 NB: data format that accepted by `setData` method is

    export interface dataFormat {
     key: string;
     value?: any;
     encrypt?: Boolean;
     decrypt?: Boolean;
    }

#### Getting Data

Use `getData` method to retrieve data, and it intake key as argument

eg:`this.StorageService.getData({key: 'key_of_data',decrypt:optional|boolean})`

#### Remove Data

 - `removeData` method is used remove single item based on key
 - `removeAll` method remove all data stored

 Examples :

 removeData : `this.StorageService.removeData('key_of_data')`

 removeAll : `this.StorageService.removeAll()`

 #### Available methods
      setData()
      getData()
      removeData()
      removeAll()

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Vivaldi |
| --------- | --------- | --------- | --------- |
| IE11, Edge| last 8 versions| last 8 versions| last 2 versions


## Built with 🔧


* HTML - For the web framework
* CSS - For styling components
* JavaScript - For magic!
* Angular - To add to the JavaScript magic!


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
