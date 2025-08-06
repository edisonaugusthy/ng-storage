# NgxStorage

[![npm version](https://badge.fury.io/js/ngx-storage.svg)](https://badge.fury.io/js/ngx-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-20.0%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)](https://www.typescriptlang.org/)

🚀 **A modern, reactive Angular storage with AES-GCM encryption, TTL support, change notifications, and signal-based reactivity.**

## ✨ Features

- 🔄 **Reactive State Management** - Built with Angular signals and RxJS
- 🔐 **AES-GCM Encryption** - Encryption with Web Crypto API
- ⏰ **TTL Support** - Automatic data expiration
- 📡 **Change Notifications** - Real-time storage change watching
- 🏪 **Multi-Storage Support** - localStorage and sessionStorage
- 🎯 **Multiple Instances** - Named storage configurations
- 📊 **Storage Analytics** - Usage statistics and monitoring
- 🛡️ **Type Safe** - Full TypeScript support with generics
- 🌐 **Cross-Browser** - Graceful fallbacks for older browsers

## 📦 Installation

```bash
npm install ngx-storage
```

## 🔢 Versioning

This library follows Angular's versioning for clear compatibility:

| Angular Version | NgxStorage Version | Status     |
| --------------- | ------------------ | ---------- |
| 20.0.x          | 20.0.x             | ✅ Current |
| 20.1.x          | 20.1.x             | 🔄 Planned |

## 🚀 Quick Start

### Basic Setup

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideNgxStorage } from "ngx-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxStorage({
      prefix: "myapp",
      storageType: "localStorage",
      defaultTTL: 60, // 1 hour
      enableLogging: false,
    }),
  ],
};
```

### Component Usage

```typescript
import { Component, inject, signal } from "@angular/core";
import { NgxStorageService } from "ngx-storage";

@Component({
  selector: "app-user-profile",
  template: `
    <div>
      <input [(ngModel)]="username" placeholder="Username" />
      <button (click)="saveUser()">Save</button>
      <button (click)="saveUserSecure()">Save Encrypted</button>

      @if (currentUser(); as user) {
      <p>Welcome, {{ user.name }}!</p>
      }

      <p>Items in storage: {{ storage.stats().itemCount }}</p>
    </div>
  `,
})
export class UserProfileComponent {
  private storage = inject(NgxStorageService);

  username = "";
  currentUser = signal<User | null>(null);

  async ngOnInit() {
    // Create reactive signal for user data
    this.currentUser = await this.storage.createSignal<User>("currentUser");
  }

  async saveUser() {
    const user = { name: this.username, id: Date.now() };
    await this.storage.setData("currentUser", user);
  }

  async saveUserSecure() {
    const user = { name: this.username, id: Date.now() };
    await this.storage.setData("currentUser", user, {
      encrypt: true,
      ttlMinutes: 60,
    });
  }
}
```

## 🔐 Security Features

### AES-GCM Encryption

NgxStorage provides military-grade encryption using the Web Crypto API:

```typescript
// Store sensitive data with encryption
await storage.setData("apiToken", "secret-key-123", {
  encrypt: true,
  ttlMinutes: 120, // Expires in 2 hours
});

// Retrieve encrypted data
const token = await storage.getData("apiToken", {
  decrypt: true,
  defaultValue: null,
});

// Check encryption support
if (storage.isEncryptionSupported()) {
  console.log("Using AES-GCM encryption");
} else {
  console.log("Falling back to Base64 encoding");
}
```

### Security Comparison

| Feature               | Base64 Fallback | AES-GCM Encryption |
| --------------------- | --------------- | ------------------ |
| **Key Length**        | None            | 256-bit            |
| **Data Integrity**    | ❌              | ✅ Authenticated   |
| **Tamper Protection** | ❌              | ✅ Auth Tags       |
| **Browser Support**   | Universal       | Modern + Fallback  |

## ⚙️ Configuration

### Simple Configuration

```typescript
import { provideNgxStorage } from "ngx-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxStorage({
      prefix: "myapp",
      storageType: "localStorage",
      defaultTTL: 0, // No expiration
      enableLogging: false,
      caseSensitive: false,
    }),
  ],
};
```

### Advanced Configuration with Factories

```typescript
import { provideNgxStorage } from "ngx-storage";
import { environment } from "./environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxStorage(
      () => ({
        prefix: environment.production ? "prod-app" : "dev-app",
        storageType: environment.production ? "localStorage" : "sessionStorage",
        defaultTTL: environment.production ? 60 : 30,
        enableLogging: !environment.production,
        caseSensitive: false,
      }),
      {
        autoCleanup: true,
        strictMode: environment.production,
        enableMetrics: !environment.production,
      }
    ),
  ],
};
```

### Multiple Named Storage Instances

```typescript
import { provideNamedNgxStorage, NgxStorageManager } from "ngx-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    provideNamedNgxStorage(() => ({
      user: {
        prefix: "user-data",
        storageType: "localStorage",
        defaultTTL: 0, // Persistent
        enableLogging: false,
      },
      cache: {
        prefix: "app-cache",
        storageType: "localStorage",
        defaultTTL: 60, // 1 hour
        enableLogging: false,
      },
      session: {
        prefix: "session-data",
        storageType: "sessionStorage",
        defaultTTL: 30, // 30 minutes
        enableLogging: true,
      },
    })),
    NgxStorageManager,
  ],
};
```

## 📚 API Reference

### Core Methods

#### `setData<T>(key: string, value: T, options?): Promise<boolean>`

Store data with optional encryption and TTL.

```typescript
// Basic storage
await storage.setData("user", { name: "John", age: 30 });

// With encryption and TTL
await storage.setData("session", userData, {
  encrypt: true,
  ttlMinutes: 60,
});
```

#### `getData<T>(key: string, options?): Promise<T | null>`

Retrieve data with optional decryption.

```typescript
// Basic retrieval
const user = await storage.getData<User>("user");

// With decryption and default value
const theme = await storage.getData("theme", {
  decrypt: true,
  defaultValue: "light",
});
```

#### `hasKey(key: string): Promise<boolean>`

Check if a key exists in storage.

```typescript
const userExists = await storage.hasKey("currentUser");
```

#### `removeData(key: string): boolean`

Remove a specific key from storage.

```typescript
storage.removeData("temporaryData");
```

#### `removeAll(): boolean`

Clear all storage data with the current prefix.

```typescript
storage.removeAll();
```

### Reactive Features

#### `createSignal<T>(key: string, defaultValue?): Promise<Signal<T | null>>`

Create a reactive signal that automatically updates when storage changes.

```typescript
// Create reactive signals
const userSignal = await storage.createSignal<User>("currentUser");
const themeSignal = await storage.createSignal("theme", "light");

// Use in template
@Component({
  template: `<p>Hello {{ userSignal()?.name }}!</p>`,
})
export class MyComponent {
  userSignal = signal<User | null>(null);

  async ngOnInit() {
    this.userSignal = await inject(NgxStorageService).createSignal<User>("user");
  }
}
```

#### `watch<T>(key: string): Observable<T | null>`

Watch for changes to a specific key.

```typescript
// Watch single key
storage.watch<string>("theme").subscribe((theme) => {
  document.body.className = theme || "light";
});
```

#### `watchAll(): Observable<StorageChangeEvent>`

Watch for all storage changes.

```typescript
storage.watchAll().subscribe((event) => {
  console.log(`${event.action} on ${event.key}:`, event.newValue);
});
```

#### `watchKeys<T>(keys: string[]): Observable<{key: string, value: T}>`

Watch multiple specific keys.

```typescript
storage.watchKeys(["user", "settings", "theme"]).subscribe(({ key, value }) => {
  console.log(`${key} changed:`, value);
});
```

#### `watchPattern<T>(pattern: string): Observable<{key: string, value: T}>`

Watch keys matching a pattern.

```typescript
// Watch all user-related keys
storage.watchPattern("user.*").subscribe(({ key, value }) => {
  console.log(`User data ${key} changed:`, value);
});
```

### Advanced Methods

#### `updateData<T>(key, updateFn, options?): Promise<boolean>`

Update existing data using a function.

```typescript
await storage.updateData("cart", (current: CartItem[] = []) => [...current, newItem], { encrypt: true });
```

#### `setIfNotExists<T>(key, value, options?): Promise<boolean>`

Set data only if key doesn't exist.

```typescript
const wasSet = await storage.setIfNotExists("config", defaultConfig);
```

#### `getStorageStats(): Promise<StorageStats>`

Get detailed storage statistics.

```typescript
const stats = await storage.getStorageStats();
console.log(`Total: ${stats.totalItems} items, ${stats.totalSize} bytes`);
```

### Security Methods

#### `isEncryptionSupported(): boolean`

Check if AES-GCM encryption is available.

```typescript
if (storage.isEncryptionSupported()) {
  // Use full encryption
} else {
  // Handle fallback
}
```

#### `clearEncryptionKey(): void`

Clear cached encryption key (useful for logout).

```typescript
// Clear encryption key for security
storage.clearEncryptionKey();
```

## 💼 Real-World Examples

### User Authentication Service

```typescript
@Injectable({ providedIn: "root" })
export class AuthService {
  private storage = inject(NgxStorageService);

  // Reactive authentication state
  isAuthenticated = computed(() => this.storage.stats().keys.includes("auth"));
  currentUser = signal<User | null>(null);

  async ngOnInit() {
    this.currentUser = await this.storage.createSignal<User>("currentUser");
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const result = await this.authApi.login(credentials);

    // Store encrypted auth token with 8-hour TTL
    await this.storage.setData("auth", result.token, {
      encrypt: true,
      ttlMinutes: 8 * 60,
    });

    await this.storage.setData("currentUser", result.user);
  }

  async logout(): Promise<void> {
    this.storage.removeMultiple(["auth", "currentUser"]);
    this.storage.clearEncryptionKey();
  }
}
```

### Shopping Cart Service

```typescript
@Injectable({ providedIn: "root" })
export class CartService {
  private storage = inject(NgxStorageService);

  // Reactive cart state
  items = signal<CartItem[]>([]);
  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  async ngOnInit() {
    this.items = await this.storage.createSignal<CartItem[]>("cart", []);
  }

  async addItem(product: Product, quantity = 1): Promise<void> {
    await this.storage.updateData(
      "cart",
      (current: CartItem[] = []) => {
        const existing = current.find((item) => item.id === product.id);
        if (existing) {
          existing.quantity += quantity;
          return [...current];
        }
        return [...current, { ...product, quantity }];
      },
      { encrypt: true, ttlMinutes: 60 }
    );
  }

  async removeItem(productId: string): Promise<void> {
    await this.storage.updateData("cart", (current: CartItem[] = []) => current.filter((item) => item.id !== productId), { encrypt: true });
  }

  clearCart(): void {
    this.storage.removeData("cart");
  }
}
```

### User Preferences Service

```typescript
@Injectable({ providedIn: "root" })
export class PreferencesService {
  private storage = inject(NgxStorageService);

  // Reactive preferences
  theme = signal<"light" | "dark">("light");
  language = signal<string>("en");
  notifications = signal<boolean>(true);

  async ngOnInit() {
    // Initialize reactive preferences
    this.theme = await this.storage.createSignal("theme", "light");
    this.language = await this.storage.createSignal("language", "en");
    this.notifications = await this.storage.createSignal("notifications", true);

    // Auto-apply theme changes
    effect(() => {
      document.body.setAttribute("data-theme", this.theme());
    });
  }

  async updatePreference<T>(key: string, value: T): Promise<void> {
    await this.storage.setData(key, value, { encrypt: true });
  }

  async resetToDefaults(): Promise<void> {
    await this.updatePreference("theme", "light");
    await this.updatePreference("language", "en");
    await this.updatePreference("notifications", true);
  }
}
```

### Form Auto-Save Service

```typescript
@Injectable({ providedIn: "root" })
export class FormAutoSaveService {
  private storage = inject(NgxStorageService);
  private saveTimeouts = new Map<string, number>();

  async autoSave<T>(formId: string, data: T, delayMs = 1000): Promise<void> {
    // Debounce saves
    const existingTimeout = this.saveTimeouts.get(formId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = setTimeout(async () => {
      await this.storage.setData(
        `form_${formId}`,
        {
          data,
          savedAt: Date.now(),
        },
        {
          encrypt: true,
          ttlMinutes: 60,
        }
      );
      this.saveTimeouts.delete(formId);
    }, delayMs);

    this.saveTimeouts.set(formId, timeoutId);
  }

  async getSavedData<T>(formId: string): Promise<{ data: T; savedAt: number } | null> {
    return await this.storage.getData(`form_${formId}`, { decrypt: true });
  }

  clearSavedData(formId: string): void {
    const timeoutId = this.saveTimeouts.get(formId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.saveTimeouts.delete(formId);
    }
    this.storage.removeData(`form_${formId}`);
  }
}
```

### Multiple Storage Instances

```typescript
@Component({
  selector: "app-dashboard",
})
export class DashboardComponent {
  private storageManager = inject(NgxStorageManager);

  // Different storage instances for different purposes
  private userStorage = this.storageManager.getStorage("user");
  private cacheStorage = this.storageManager.getStorage("cache");
  private sessionStorage = this.storageManager.getStorage("session");

  async ngOnInit() {
    // Load persistent user data
    const userProfile = await this.userStorage.getData("profile");

    // Load cached application data
    const cachedData = await this.cacheStorage.getData("dashboard-metrics");

    // Save current session state
    await this.sessionStorage.setData("current-view", "dashboard", {
      encrypt: true,
      ttlMinutes: 30,
    });
  }
}
```

## 🧪 Testing

### Test Configuration

```typescript
import { provideNgxStorage } from "ngx-storage";

// test-setup.ts
export function provideStorageForTesting() {
  return provideNgxStorage(
    {
      prefix: "test",
      storageType: "sessionStorage",
      defaultTTL: 0,
      enableLogging: true,
      caseSensitive: false,
    },
    {
      autoCleanup: false,
      strictMode: true,
      enableMetrics: false,
    }
  );
}

// In test files
describe("NgxStorageService", () => {
  let service: NgxStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideStorageForTesting()],
    });
    service = TestBed.inject(NgxStorageService);
  });

  it("should store and retrieve data", async () => {
    await service.setData("test", "value");
    const result = await service.getData("test");
    expect(result).toBe("value");
  });

  it("should handle encryption", async () => {
    await service.setData("secret", "encrypted-data", { encrypt: true });
    const result = await service.getData("secret", { decrypt: true });
    expect(result).toBe("encrypted-data");
  });

  it("should create reactive signals", async () => {
    const signal = await service.createSignal<string>("reactive-test", "default");
    expect(signal()).toBe("default");

    await service.setData("reactive-test", "updated");
    expect(signal()).toBe("updated");
  });
});
```

## 🔄 Migration Guide

### From ng7-storage to ngx-storage

This is a breaking change that requires updates:

#### 1. Package Installation

```bash
# Remove old package
npm uninstall ng7-storage

# Install new package
npm install ngx-storage
```

#### 2. Update Imports

```typescript
// Before
import { provideNgStorageConfig } from "ng7-storage";

// After
import { provideNgxStorage } from "ngx-storage";
```

#### 3. Update Method Calls

```typescript
// Before (synchronous)
const user = storage.getData("user");
storage.setData("user", newUser);

// After (asynchronous)
const user = await storage.getData("user");
await storage.setData("user", newUser);
```

#### 4. Update Reactive Features

```typescript
// Before
const signal = storage.createSignal("user");

// After
const signal = await storage.createSignal("user");
```

#### 5. Storage Prefix Changes

The default prefix changed from `ng-storage` to `ngx-storage`. Existing data with the old prefix won't be automatically migrated. You can:

- Keep using a custom prefix: `prefix: 'ng-storage'`
- Or migrate data manually in your application

### Breaking Changes Summary

- ⚠️ **Package Name**: `ng7-storage` → `ngx-storage`
- ⚠️ **Method Signatures**: Core methods now async
- ⚠️ **Signal Creation**: Now async
- ⚠️ **Default Prefix**: `ng-storage` → `ngx-storage`
- ✅ **Enhanced**: Much stronger AES-GCM encryption
- ✅ **Compatible**: Existing stored data still readable

## 🌐 Browser Compatibility

| Browser | Version | Storage Support | AES-GCM Encryption   |
| ------- | ------- | --------------- | -------------------- |
| Chrome  | 37+     | ✅              | ✅                   |
| Firefox | 34+     | ✅              | ✅                   |
| Safari  | 7+      | ✅              | ✅                   |
| Edge    | 12+     | ✅              | ✅                   |
| IE      | 11      | ✅              | ❌ (Base64 fallback) |
| IE      | 8-10    | ✅              | ❌ (Base64 fallback) |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/edisonaugusthy/ng-storage.git

# Install dependencies
npm install

# Run tests
npm test

# Build library
npm run build

# Check Angular version alignment
npm run check-angular-version
```

## 📝 Changelog

### v20.0.3 - Major Rebranding & Enhancement

#### 🚨 Breaking Changes

- **Package renamed**: `ng7-storage` → `ngx-storage`
- **Methods now async**: `setData()`, `getData()`, `hasKey()` for encryption support
- **Signal creation async**: `createSignal()` now returns `Promise<Signal<T>>`
- **Default prefix changed**: `ng-storage` → `ngx-storage`

#### ✨ New Features

- **AES-GCM Encryption**: Military-grade security with Web Crypto API
- **PBKDF2 Key Derivation**: 100,000 iterations for secure key generation
- **Version Alignment**: Now follows Angular version numbers (20.0.3)
- **Enhanced Security**: Data integrity protection with authentication tags
- **Better Fallbacks**: Automatic Base64 fallback for older browsers
- **Improved TypeScript**: Better type safety and generics

#### 🛡️ Security Enhancements

- **Unique Encryption**: Random IVs ensure unique encryption per data item
- **Tamper Protection**: Authentication tags prevent data modification
- **Key Management**: Secure key caching and rotation support
- **Browser Detection**: Automatic encryption capability detection

#### 🔧 Improvements

- **Performance**: Optimized key caching and encryption operations
- **Error Handling**: Better error messages and fallback strategies
- **Documentation**: Comprehensive guides and examples
- **Testing**: Enhanced test coverage and utilities

### Legacy Versions

- **v19.0.0**: Previous version with basic Base64 encoding
- **v1.0.0**: Initial release

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework and signals
- Web Crypto API for enabling secure client-side encryption
- RxJS team for reactive programming utilities
- Community contributors and users

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/edisonaugusthy/ng-storage/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/edisonaugusthy/ng-storage/discussions)
- 🔐 **Security Issues**: Please report security vulnerabilities privately via email

---

<div align="center">

**Made with ❤️ for the Angular community**

[⭐ Star this repo](https://github.com/edisonaugusthy/ng-storage) | [🍴 Fork it](https://github.com/edisonaugusthy/ng-storage/fork) | [📋 Report Issues](https://github.com/edisonaugusthy/ng-storage/issues)

</div>
