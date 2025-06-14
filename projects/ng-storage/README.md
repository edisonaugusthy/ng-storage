# NgStorageService

[![npm version](https://badge.fury.io/js/ng-storage-service.svg)](https://badge.fury.io/js/ng-storage-service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-19%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

🚀 **A modern, reactive Angular service for browser storage management with optional encryption, TTL, and change notifications.**

## ✨ Features

- 🔄 **Reactive State Management** - Built with Angular signals and RxJS observables
- 🔐 **Optional Encryption** - Base64 encoding for sensitive data
- ⏰ **TTL Support** - Automatic data expiration
- 📡 **Change Notifications** - Watch for storage changes in real-time
- 🏪 **Dual Storage Support** - localStorage and sessionStorage
- 🎯 **Type Safety** - Full TypeScript support with generics
- 🧹 **Auto Cleanup** - Automatic removal of expired items
- 📊 **Storage Statistics** - Monitor usage and performance
- 🔧 **Configurable** - Extensive configuration options
- ✅ **Well Tested** - Comprehensive test suite with Jest

## 📦 Installation

```bash
npm install ng-storage-service
```

## 🚀 Quick Start

### Basic Setup

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { NgStorageService } from "ng-storage-service";

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: NgStorageService,
      useFactory: () =>
        new NgStorageService({
          prefix: "myapp",
          storageType: "localStorage",
          defaultTTL: 60, // 1 hour
          enableLogging: false,
        }),
    },
  ],
};
```

### Component Usage

```typescript
import { Component, inject } from "@angular/core";
import { NgStorageService } from "ng-storage-service";

@Component({
  selector: "app-example",
  template: `
    <div>
      <input [(ngModel)]="username" placeholder="Username" />
      <button (click)="saveUser()">Save</button>
      <button (click)="loadUser()">Load</button>
      <p>Current user: {{ currentUser() || "None" }}</p>
    </div>
  `,
})
export class ExampleComponent {
  private storage = inject(NgStorageService);

  username = "";
  currentUser = this.storage.createSignal<string>("currentUser");

  saveUser() {
    this.storage.setData("currentUser", this.username);
  }

  loadUser() {
    const user = this.storage.getData("currentUser");
    this.username = user || "";
  }
}
```

## 📚 API Documentation

### Configuration

```typescript
interface StorageConfig {
  prefix?: string; // Storage key prefix (default: 'ng-storage')
  defaultTTL?: number; // Default TTL in minutes (default: 0 = no expiry)
  enableLogging?: boolean; // Enable debug logging (default: false)
  caseSensitive?: boolean; // Case sensitive keys (default: false)
  storageType?: "localStorage" | "sessionStorage"; // Storage type (default: 'sessionStorage')
}
```

### Core Methods

#### `setData<T>(key: string, value: T, options?): boolean`

Stores data with optional encryption and TTL.

```typescript
// Basic usage
storage.setData("user", { name: "John", age: 30 });

// With encryption
storage.setData("token", "secret-token", { encrypt: true });

// With TTL (expires in 30 minutes)
storage.setData("cache", data, { ttlMinutes: 30 });

// With both encryption and TTL
storage.setData("session", userData, {
  encrypt: true,
  ttlMinutes: 60,
});
```

#### `getData<T>(key: string, options?): T | null`

Retrieves data with optional decryption.

```typescript
// Basic retrieval
const user = storage.getData<User>("user");

// With decryption
const token = storage.getData("token", { decrypt: true });

// With default value
const theme = storage.getData("theme", { defaultValue: "light" });
```

#### `removeData(key: string): boolean`

Removes a specific key from storage.

```typescript
storage.removeData("user");
```

#### `removeAll(): boolean`

Clears all storage data with the current prefix.

```typescript
storage.removeAll();
```

### Reactive Features

#### `createSignal<T>(key: string, defaultValue?): Signal<T | null>`

Creates a reactive signal that automatically updates when storage changes.

```typescript
const userSignal = storage.createSignal<User>('currentUser');

// Use in template
@Component({
  template: `<p>Welcome {{ userSignal()?.name }}!</p>`
})
```

#### `watch<T>(key: string): Observable<T | null>`

Watches for changes to a specific key.

```typescript
storage.watch<string>("theme").subscribe((theme) => {
  console.log("Theme changed:", theme);
  document.body.className = theme;
});
```

#### `watchAll(): Observable<StorageChangeEvent>`

Watches for all storage changes.

```typescript
storage.watchAll().subscribe((event) => {
  console.log(`${event.action} on ${event.key}:`, event.newValue);
});
```

#### `watchKeys<T>(keys: string[]): Observable<{key: string, value: T}>`

Watches for changes to multiple specific keys.

```typescript
storage.watchKeys(["user", "settings"]).subscribe(({ key, value }) => {
  console.log(`${key} changed:`, value);
});
```

#### `watchPattern<T>(pattern: string): Observable<{key: string, value: T}>`

Watches for changes to keys matching a pattern.

```typescript
// Watch all user-related keys
storage.watchPattern("user.*").subscribe(({ key, value }) => {
  console.log(`User data ${key} changed:`, value);
});
```

### Advanced Methods

#### `updateData<T>(key: string, updateFn: (current: T | null) => T, options?): boolean`

Updates existing data using a function.

```typescript
// Increment counter
storage.updateData("counter", (current) => (current || 0) + 1);

// Update user profile
storage.updateData("user", (current) => ({
  ...current,
  lastLogin: new Date(),
}));
```

#### `setIfNotExists<T>(key: string, value: T, options?): boolean`

Sets data only if the key doesn't already exist.

```typescript
// Set default preferences only if not already set
storage.setIfNotExists("preferences", defaultPreferences);
```

#### `hasKey(key: string): boolean`

Checks if a key exists in storage.

```typescript
if (storage.hasKey("user")) {
  console.log("User is logged in");
}
```

#### `getKeys(): string[]`

Gets all keys managed by this service.

```typescript
const allKeys = storage.getKeys();
console.log("Stored keys:", allKeys);
```

#### `getStorageStats(): StorageStats`

Gets storage usage statistics.

```typescript
const stats = storage.getStorageStats();
console.log(`Using ${stats.totalSize} bytes for ${stats.totalItems} items`);
```

## 🏭 Factory Methods

### Static Factory Methods

```typescript
// Create localStorage instance
const localStorage = NgStorageService.localStorage({
  prefix: "app-local",
  defaultTTL: 0, // Persistent
});

// Create sessionStorage instance
const sessionStorage = NgStorageService.sessionStorage({
  prefix: "app-session",
  defaultTTL: 60, // 1 hour
});

// Create with specific storage type
const customStorage = NgStorageService.withStorageType({
  storageType: "localStorage",
  prefix: "custom",
});
```

## 🔧 Configuration Examples

### Application-Wide Configuration

```typescript
// storage.config.ts
import { InjectionToken } from "@angular/core";
import { StorageConfig } from "ng-storage-service";

export const STORAGE_CONFIG = new InjectionToken<StorageConfig>("StorageConfig");

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  prefix: "myapp",
  defaultTTL: 60,
  enableLogging: false,
  caseSensitive: false,
  storageType: "localStorage",
};

// app.config.ts
import { ApplicationConfig } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: STORAGE_CONFIG, useValue: DEFAULT_STORAGE_CONFIG },
    {
      provide: NgStorageService,
      useFactory: (config: StorageConfig) => new NgStorageService(config),
      deps: [STORAGE_CONFIG],
    },
  ],
};
```

### Environment-Based Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  storage: {
    prefix: "myapp-dev",
    enableLogging: true,
    storageType: "sessionStorage" as const,
  },
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  storage: {
    prefix: "myapp",
    enableLogging: false,
    storageType: "localStorage" as const,
  },
};
```

### Multiple Storage Instances

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // User data storage (persistent)
    {
      provide: "UserStorage",
      useFactory: () =>
        NgStorageService.localStorage({
          prefix: "user-data",
          defaultTTL: 0,
        }),
    },

    // Cache storage (with TTL)
    {
      provide: "CacheStorage",
      useFactory: () =>
        NgStorageService.localStorage({
          prefix: "app-cache",
          defaultTTL: 60,
        }),
    },

    // Temporary storage (session only)
    {
      provide: "TempStorage",
      useFactory: () =>
        NgStorageService.sessionStorage({
          prefix: "temp-data",
          defaultTTL: 30,
        }),
    },
  ],
};
```

## 💡 Usage Examples

### User Authentication Service

```typescript
@Injectable({ providedIn: "root" })
export class AuthService {
  private storage = inject(NgStorageService);

  login(credentials: LoginCredentials): Observable<AuthResult> {
    return this.http.post<AuthResult>("/api/login", credentials).pipe(
      tap((result) => {
        // Store encrypted auth data with 8-hour TTL
        this.storage.setData("auth", result, {
          encrypt: true,
          ttlMinutes: 8 * 60,
        });
      })
    );
  }

  getAuthData(): AuthResult | null {
    return this.storage.getData("auth", { decrypt: true });
  }

  isAuthenticated(): boolean {
    return this.storage.hasKey("auth");
  }

  logout(): void {
    this.storage.removeData("auth");
  }
}
```

### User Preferences Service

```typescript
@Injectable({ providedIn: "root" })
export class PreferencesService {
  private storage = inject(NgStorageService);

  // Reactive theme signal
  theme = this.storage.createSignal("theme", "light");

  // Watch for theme changes
  theme$ = this.storage.watch<string>("theme");

  setTheme(theme: string): void {
    this.storage.setData("theme", theme);
  }

  getPreferences(): UserPreferences {
    return this.storage.getData("preferences") || this.getDefaults();
  }

  updatePreference(key: keyof UserPreferences, value: any): void {
    this.storage.updateData("preferences", (current) => ({
      ...this.getDefaults(),
      ...current,
      [key]: value,
    }));
  }

  private getDefaults(): UserPreferences {
    return {
      theme: "light",
      language: "en",
      notifications: true,
    };
  }
}
```

### Shopping Cart Service

```typescript
@Injectable({ providedIn: "root" })
export class CartService {
  private storage = inject(NgStorageService);

  // Reactive cart items
  items = this.storage.createSignal<CartItem[]>("cart", []);

  // Computed total
  total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  addItem(product: Product, quantity = 1): void {
    this.storage.updateData("cart", (current: CartItem[] = []) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
        return [...current];
      } else {
        return [...current, { ...product, quantity }];
      }
    });
  }

  removeItem(productId: string): void {
    this.storage.updateData("cart", (current: CartItem[] = []) => current.filter((item) => item.id !== productId));
  }

  clear(): void {
    this.storage.removeData("cart");
  }
}
```

## 🔐 Security Considerations

> **Important:** The encryption feature uses base64 encoding, which provides **obfuscation**, not cryptographic security.

### Best Practices

- ❌ **Don't store** highly sensitive data (passwords, credit cards)
- ✅ **Do use** HTTPS to protect data in transit
- ✅ **Do implement** proper session timeouts
- ✅ **Do validate** data when retrieving from storage
- ✅ **Do use** TTL for temporary sensitive data

### Enhanced Security Example

```typescript
@Injectable({ providedIn: "root" })
export class SecureStorageService {
  private storage = inject(NgStorageService);

  storeWithExpiry<T>(key: string, value: T, ttlMinutes: number): void {
    const item = {
      value,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
      checksum: this.generateChecksum(JSON.stringify(value)),
    };

    this.storage.setData(key, item, { encrypt: true });
  }

  getWithValidation<T>(key: string): T | null {
    const item = this.storage.getData(key, { decrypt: true });

    if (!item) return null;

    // Validate checksum
    const expectedChecksum = this.generateChecksum(JSON.stringify(item.value));
    if (item.checksum !== expectedChecksum) {
      this.storage.removeData(key);
      throw new Error("Data integrity check failed");
    }

    // Check expiry
    if (Date.now() > item.expiry) {
      this.storage.removeData(key);
      return null;
    }

    return item.value;
  }

  private generateChecksum(data: string): string {
    // Simple checksum - use crypto library in production
    return btoa(data).slice(0, 8);
  }
}
```

## 🌐 Browser Compatibility

| Browser | Version | localStorage | sessionStorage |
| ------- | ------- | ------------ | -------------- |
| Chrome  | 4+      | ✅           | ✅             |
| Firefox | 3.5+    | ✅           | ✅             |
| Safari  | 4+      | ✅           | ✅             |
| Edge    | All     | ✅           | ✅             |
| IE      | 8+      | ✅           | ✅             |

## 🧪 Testing

### Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Example

```typescript
describe("NgStorageService", () => {
  let service: NgStorageService;

  beforeEach(() => {
    service = new NgStorageService();
  });

  it("should store and retrieve data", () => {
    service.setData("test", "value");
    expect(service.getData("test")).toBe("value");
  });

  it("should handle encrypted data", () => {
    service.setData("secret", "data", { encrypt: true });
    expect(service.getData("secret", { decrypt: true })).toBe("data");
  });

  it("should emit change events", (done) => {
    service.watch("key").subscribe((value) => {
      expect(value).toBe("value");
      done();
    });

    service.setData("key", "value");
  });
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ng-storage-service.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Changelog

### v2.0.0

- ✨ Added Angular 18+ signals support
- ✨ Added reactive change notifications
- ✨ Added dual storage support (localStorage/sessionStorage)
- ✨ Added TTL functionality
- ✨ Added comprehensive test suite
- 🐛 Fixed decryption bugs
- 🔧 Improved TypeScript support

### v1.0.0

- 🎉 Initial release
- ✨ Basic storage operations
- ✨ Base64 encryption
- ✨ Angular service integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- RxJS team for reactive programming utilities
- All contributors and users of this library

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/ng-storage-service/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/ng-storage-service/discussions)
- 📧 **Email**: your-email@example.com

---

<div align="center">

**Made with ❤️ for the Angular community**

[⭐ Star this repo](https://github.com/your-username/ng-storage-service) | [🍴 Fork it](https://github.com/your-username/ng-storage-service/fork) | [📋 Report Issues](https://github.com/your-username/ng-storage-service/issues)

</div>
