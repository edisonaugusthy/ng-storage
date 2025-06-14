# ng7-storage Documentation

**An Angular service for browser session storage management with optional base64 encryption/decryption**

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)
9. [Browser Compatibility](#browser-compatibility)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

---

## Overview

`ng7-storage` is a lightweight Angular service designed to simplify browser session storage management. It provides a clean, intuitive API for storing, retrieving, and managing session-based data with optional base64 encryption for enhanced security.

**Key Benefits:**

- Simple and intuitive API
- Optional data encryption/decryption
- Built-in error handling
- Type-safe implementation
- Zero dependencies beyond Angular
- Lightweight footprint

---

## Features

### Core Features

- ✅ **Session Storage Management** - Store, retrieve, and clear session-based data
- ✅ **Optional Encryption** - Secure data with base64 encoding
- ✅ **Error Handling** - Comprehensive error management for unsupported browsers
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Angular Integration** - Injectable service for seamless Angular integration

### Storage Operations

- Store data with or without encryption
- Retrieve data with automatic decryption
- Remove specific storage items
- Clear all session storage data
- Validate storage availability

---

## Installation

### Using npm

```bash
npm install ng7-storage --save
```

### Using yarn

```bash
yarn add ng7-storage
```

---

## Quick Start

### 1. Import the Service

```typescript
import { NgStorageService } from "ng7-storage";
```

### 2. Inject in Component/Service

```typescript
import { Component, inject } from "@angular/core";
import { NgStorageService } from "ng7-storage";

@Component({
  selector: "app-example",
  templateUrl: "./example.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  readonly #storageService = inject(NgStorageService);
}
```

### 3. Basic Usage

```typescript
// Store data
this.#storageService.setData("userToken", "abc123");

// Retrieve data
const token = this.#storageService.getData("userToken");

// Store with encryption
this.#storageService.setData("sensitive", { password: "secret" }, true);

// Retrieve with decryption
const sensitive = this.#storageService.getData("sensitive", true);
```

---

## API Reference

### Methods

#### `setData(key: string, value: any, encrypt?: boolean): boolean`

Stores data in session storage with optional encryption.

**Parameters:**

- `key` (string): The storage key identifier
- `value` (any): The data to store (objects will be JSON stringified)
- `encrypt` (boolean, optional): Whether to encrypt the data using base64 encoding

**Returns:**

- `boolean`: `true` if storage was successful, `false` otherwise

**Throws:**

- Error if browser doesn't support session storage
- Error if key is invalid or missing

#### `getData(key: string, decrypt?: boolean): any`

Retrieves data from session storage with optional decryption.

**Parameters:**

- `key` (string): The storage key identifier
- `decrypt` (boolean, optional): Whether to decrypt the data using base64 decoding

**Returns:**

- `any`: The retrieved data, or `null` if key doesn't exist

#### `removeData(key: string): void`

Removes the data associated with the specified key.

**Parameters:**

- `key` (string): The storage key identifier to remove

#### `removeAll(): void`

Clears all session storage data.

---

## Usage Examples

### Basic Data Storage

```typescript
export class UserComponent {
  constructor(private storage: NgStorageService) {}

  saveUserPreferences() {
    const preferences = {
      theme: "dark",
      language: "en",
      notifications: true,
    };

    this.storage.setData("userPrefs", preferences);
  }

  loadUserPreferences() {
    const preferences = this.storage.getData("userPrefs");
    if (preferences) {
      console.log("User preferences:", preferences);
    }
  }
}
```

### Encrypted Data Storage

```typescript
export class AuthComponent {
  constructor(private storage: NgStorageService) {}

  storeAuthToken(token: string) {
    // Store encrypted token
    this.storage.setData("authToken", token, true);
  }

  getAuthToken(): string | null {
    // Retrieve and decrypt token
    return this.storage.getData("authToken", true);
  }

  logout() {
    // Remove specific auth data
    this.storage.removeData("authToken");
    this.storage.removeData("refreshToken");
  }
}
```

### Shopping Cart Example

```typescript
export class CartService {
  constructor(private storage: NgStorageService) {}

  addToCart(item: CartItem) {
    let cart = this.getCart();
    cart.push(item);
    this.storage.setData("shoppingCart", cart);
  }

  getCart(): CartItem[] {
    return this.storage.getData("shoppingCart") || [];
  }

  clearCart() {
    this.storage.removeData("shoppingCart");
  }

  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.price, 0);
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
```

### Form Data Persistence

```typescript
export class FormComponent {
  formData: any = {};

  constructor(private storage: NgStorageService) {
    this.loadDraft();
  }

  onFormChange() {
    // Auto-save form data
    this.storage.setData("formDraft", this.formData);
  }

  loadDraft() {
    const draft = this.storage.getData("formDraft");
    if (draft) {
      this.formData = draft;
    }
  }

  submitForm() {
    // Submit logic here

    // Clear draft after successful submission
    this.storage.removeData("formDraft");
  }
}
```

### Session Management

```typescript
export class SessionManager {
  constructor(private storage: NgStorageService) {}

  createSession(userId: string, sessionData: any) {
    const session = {
      userId,
      timestamp: Date.now(),
      data: sessionData,
    };

    // Store encrypted session
    this.storage.setData("userSession", session, true);
  }

  getSession() {
    return this.storage.getData("userSession", true);
  }

  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Check if session is less than 1 hour old
    const oneHour = 60 * 60 * 1000;
    return Date.now() - session.timestamp < oneHour;
  }

  destroySession() {
    this.storage.removeAll();
  }
}
```

---

## Error Handling

The service includes comprehensive error handling:

### Browser Support Check

```typescript
try {
  this.storage.setData("test", "value");
} catch (error) {
  console.error("Session storage not supported:", error);
  // Fallback logic here
}
```

### Invalid Key Handling

```typescript
try {
  this.storage.setData("", "value"); // Will throw error
} catch (error) {
  console.error("Invalid key provided:", error);
}
```

### Custom Error Handler

```typescript
export class SafeStorageService {
  constructor(private storage: NgStorageService) {}

  safeSetData(key: string, value: any, encrypt = false): boolean {
    try {
      return this.storage.setData(key, value, encrypt);
    } catch (error) {
      console.warn("Storage operation failed:", error);
      return false;
    }
  }

  safeGetData(key: string, decrypt = false): any {
    try {
      return this.storage.getData(key, decrypt);
    } catch (error) {
      console.warn("Retrieval operation failed:", error);
      return null;
    }
  }
}
```

---

## Security Considerations

### Base64 Encoding Limitations

**Important:** The optional encryption feature uses base64 encoding, which is **not** true encryption but rather encoding for obfuscation.

```typescript
// This provides obfuscation, not cryptographic security
this.storage.setData("data", "sensitive", true);
```

### Best Practices

1. **Don't store highly sensitive data** like passwords or credit card numbers
2. **Use HTTPS** to protect data in transit
3. **Implement proper session timeouts**
4. **Validate data** when retrieving from storage

### Enhanced Security Example

```typescript
export class SecureStorageService {
  constructor(private storage: NgStorageService) {}

  storeWithExpiry(key: string, value: any, ttlMinutes: number) {
    const item = {
      value,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };

    this.storage.setData(key, item, true);
  }

  getWithExpiry(key: string): any {
    const item = this.storage.getData(key, true);

    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.storage.removeData(key);
      return null;
    }

    return item.value;
  }
}
```

---

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ IE 8+
- ✅ Edge (all versions)
- ✅ Opera 10.5+

### Feature Detection

```typescript
export class CompatibilityChecker {
  static isSessionStorageSupported(): boolean {
    try {
      const test = "__session_storage_test__";
      sessionStorage.setItem(test, "test");
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Session storage not supported" Error

**Cause:** Browser doesn't support session storage or it's disabled

**Solution:**

```typescript
if (CompatibilityChecker.isSessionStorageSupported()) {
  this.storage.setData("key", "value");
} else {
  // Use alternative storage or fallback
  this.useAlternativeStorage("key", "value");
}
```

#### 2. Data Not Persisting

**Cause:** Session storage is cleared when tab/window closes

**Solution:** Use localStorage wrapper if persistence across sessions is needed

#### 3. Quota Exceeded Error

**Cause:** Session storage limit reached (usually 5-10MB)

**Solution:**

```typescript
try {
  this.storage.setData("key", largeData);
} catch (error) {
  if (error.name === "QuotaExceededError") {
    // Clear old data or use compression
    this.storage.removeAll();
    this.storage.setData("key", largeData);
  }
}
```

#### 4. Encryption/Decryption Issues

**Cause:** Mismatch between encrypt/decrypt flags

**Solution:**

```typescript
// Always match encrypt/decrypt flags
this.storage.setData("key", "value", true); // encrypted
const value = this.storage.getData("key", true); // decrypted
```

### Debug Mode

```typescript
export class DebugStorageService {
  constructor(private storage: NgStorageService) {}

  debugSetData(key: string, value: any, encrypt = false) {
    console.log(`Setting data for key: ${key}`, { value, encrypt });
    const result = this.storage.setData(key, value, encrypt);
    console.log(`Storage result: ${result}`);
    return result;
  }

  debugGetData(key: string, decrypt = false) {
    console.log(`Getting data for key: ${key}`, { decrypt });
    const result = this.storage.getData(key, decrypt);
    console.log(`Retrieved data:`, result);
    return result;
  }
}
```

---

## License

This package is licensed under the MIT License.

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests to the [GitHub repository](https://github.com/edisonaugusthy/ng-storage).

### Author

**Edison Augusthy** - [GitHub Profile](https://github.com/edisonaugusthy)

---

## Related Libraries

If you need additional features, consider these alternatives:

- **ngx-webstorage** - More comprehensive storage solution with decorators
- **angular-web-storage** - Storage with expiration support
- **@ngxs/storage-plugin** - For NGXS state management
