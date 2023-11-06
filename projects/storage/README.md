# ng7-storage

Share Data among multiple components in angular using browser session storage

see [Stackblitz Demo](https://stackblitz.com/edit/ng-storage-sample) here
More on [Github](https://github.com/edisonaugusthy/ng-storage)

Angular compatibility
| Angular Version | package version |
| -------------------------------- | :-------------: |
| angular 8 and below | 1.1.4 and below |
| angular 9 and above(ivy version) | 1.1.5 and above |
| angular 10 and above(ivy version)|1.1.8 and above |

## Usage steps

- Run `npm i ng7-storage --save` in command prompt from root of your project folder
- Add import to App Module like this `import { StorageModule } from 'ng7-storage';`
- Add to imports array in app module

```ts
   imports: [
    BrowserModule,
    StorageModule
   ],
```

- Then import NgStorageService service `import { NgStorageService } from 'ng7-storage';` in the components that you would like to use
- Then Initialize `StorageService` in the component constructor

  ```ts
  constructor(private StorageService: NgStorageService) {

  }
  ```

follow below methods to set and retrieve data to storage

##### Setting Data

```ts
this.StorageService.setData({ key: "key_of_data", value: res, encrypt: optional | boolean });
```

> Pass key value pairs to store data , and key should be valid string

NB: data format that accepted by `setData` method is

```ts
export interface dataFormat {
  key: string;
  value?: any;
  encrypt?: Boolean;
  decrypt?: Boolean;
}
```

NB:_`encrypt` is a development onprogress feature and may have issues when setting data that has special characters_

#### Getting Data

eg:

```js
this.StorageService.getData({ key: "key_of_data", decrypt: optional | boolean });
```

> Use `getData` method to retrieve data, pass `key` of the item. pass `decrypt` as `true` if you have encrypted the data

#### Remove Data

For removing data, we can either remove by a single key or we can remove all data at once

- `removeData` method is used remove single item based on key
- `removeAll` method remove all data stored

Examples :

removeData : `this.StorageService.removeData('key_of_data')`

removeAll : `this.StorageService.removeAll()`

#### All Available methods

```ts
setData();
getData();
removeData();
removeAll();
```

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/vivaldi/vivaldi_48x48.png" alt="Vivaldi" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Vivaldi |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                      | last 8 versions                                                                                                                                                                                                   | last 8 versions                                                                                                                                                                                               | last 5 versions                                                                                                                                                                                                   |

## Author 🔮

<table>
  <tr>
    <td align="center"><a href="https://github.com/edisonaugusthy"><img src="https://github.com/edisonaugusthy.png?size=100" width="100px;" alt="Edison"/><br /><sub><b>Edison Augusthy</b></sub></a><br /><a href="https://github.com/edisonaugusthy/ng-storage/commits?author=edisonaugusthy" title="Edison">💻</a></td>

  </tr>

</table>
