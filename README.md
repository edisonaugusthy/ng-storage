# ng7-storage

Share Data among multiple components in angular using browser session storage

see [Stackblitz Demo](https://stackblitz.com/edit/ng-storage-sample) here
More on [Github](https://github.com/edisonaugusthy/ng-storage)

Angular compatibility
| Angular Version | package version |
| -------------------------------- | :-------------: |
| angular 8 and below | 1.1.4 and below |
| angular 9 and above(ivy version) | 1.1.5 and above |
| angular 10 and above|1.1.8 and above |
| angular 14 and above|1.1.9 and above |

## Usage steps

- Run `npm i ng7-storage --save`

- Add to providers array in app module

```ts
   providers: [
    NgStorageService
   ],
```

- Then import NgStorageService service `import { NgStorageService } from 'ng7-storage';` in the components that you would like to use
- Then Initialize `NgStorageService` in the component constructor

  ```ts
  constructor(private ngStorage: NgStorageService) {

  }
  ```

follow below methods to set and retrieve data to storage

##### Setting Data

```ts
this.ngStorage.setData( key: "key", value: "string|object|array", encrypt: boolean );
```

> Pass key value pairs to store data , and key should be valid string

NB:_`encrypt` is a development onprogress feature and may have issues when setting data that has special characters_

#### Getting Data

eg:

```js
  this.ngStorage.getData(key: "key", decrypt?: boolean );
```

> Use `getData` method to retrieve data, pass `key` of the item. pass `decrypt` as `true` if you have encrypted the data

#### Remove Data

For removing data, we can either remove by a single key or we can remove all data at once

- `removeData` method is used remove single item based on key
- `removeAll` method remove all data stored

Examples :

removeData : `this.ngStorage.removeData('key')`

removeAll : `this.ngStorage.removeAll()`

#### All Available methods

```ts
setData();
getData();
removeData();
removeAll();
```

## Author 🔮

<table>
  <tr>
    <td align="center"><a href="https://github.com/edisonaugusthy"><img src="https://github.com/edisonaugusthy.png?size=100" width="100px;" alt="Edison"/><br /><sub><b>Edison Augusthy</b></sub></a><br /><a href="https://github.com/edisonaugusthy/ng-storage/commits?author=edisonaugusthy" title="Edison">💻</a></td>

  </tr>

</table>
