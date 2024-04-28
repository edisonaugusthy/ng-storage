
# ng7-storage

**ng7-storage** is an Angular service for browser session storage management. It provides a simple API to store, retrieve, and clear session-based data, with optional encryption for additional security.

## Features

- Store data in session storage

- Optional encryption/decryption using base64 encoding

- Error handling for unsupported browsers and missing keys

- Angular service for easy integration into Angular projects

## Installation

To install the package, use npm:

```bash
npm  install  ng7-storage  --save
```

## Usage

After installing the package, you can import the `NgStorageService` into your Angular components or services to store, retrieve, and remove data from session storage.

### Importing the Service

To begin, import the service into your Angular component or service:

```typescript
import { NgStorageService } from  'ng7-storage';
```

### Storing Data

```typescript
export  class  ExampleComponent {

constructor(private  storageService:  NgStorageService) {}

storeData() {

// Store with optional encryption

this.storageService.setData("user", { name: "John Doe", age: 30 }, true);

}

}

```

### Retrieving Data

```typescript
export  class  ExampleComponent {

constructor(private  storageService:  NgStorageService) {}

getData() {

// Retrieve with optional decryption

const  userData  =  this.storageService.getData("user", true);

console.log("Retrieved data:", userData);

}

}
```

### Removing Data

```typescript

export  class  ExampleComponent {

constructor(private  storageService:  NgStorageService) {}

clearData() {
// Remove specific data
this.storageService.removeData('user');
// Or clear all data
this.storageService.removeAll();
}
}
```

## Error Handling

- The `NgStorageService` throws an error if the browser does not support session storage.

- An error is thrown if a key is invalid or missing when storing data.

## API Documentation

- `setData(key: string, value: any, encrypt?: boolean): boolean`

   > Stores data under the specified key in session storage with optional encryption.

- `getData(key: string, decrypt?: boolean): any`

    > Retrieves data from session storage with optional decryption.

- `removeData(key: string): void`

   > Removes the data associated with the specified key.

- `removeAll(): void`

   > Clears all session storage data.

License

This package is licensed under the MIT License. See the license file for more details.

## Author 🔮

<table>

<tr>

<td  align="center"><a  href="https://github.com/edisonaugusthy"><img  src="https://github.com/edisonaugusthy.png?size=100"  width="100px;"  alt="Edison"/><br /><sub><b>Edison Augusthy</b></sub></a><br /><a  href="https://github.com/edisonaugusthy/ng-storage/commits?author=edisonaugusthy"  title="Edison">💻</a></td>

</tr>

</table>
