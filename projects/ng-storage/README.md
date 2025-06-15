# NgStorageService

[![npm version](https://badge.fury.io/js/ng7-storage.svg)](https://badge.fury.io/js/ng7-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-19%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

🚀 **A modern, reactive Angular service for browser storage management with optional encryption, TTL, change notifications, and Apollo-style providers.**

## ✨ Features

- 🔄 **Reactive State Management** - Built with Angular signals and RxJS observables
- 🏗️ **Apollo-Style Providers** - Clean, functional configuration system
- 🔐 **Optional Encryption** - Base64 encoding for sensitive data
- ⏰ **TTL Support** - Automatic data expiration
- 📡 **Change Notifications** - Watch for storage changes in real-time
- 🏪 **Dual Storage Support** - localStorage and sessionStorage
- 🎯 **Multiple Instances** - Named storage instances with NgStorageManager
- 📊 **Storage Statistics** - Monitor usage and performance
- 🔧 **Configurable Flags** - Auto-cleanup, strict mode, metrics
- ✅ **Well Tested** - Comprehensive test suite with Jest

## 📦 Installation

```bash
npm install ng7-storage
```

## 🚀 Quick Start

### Basic Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideNgStorageConfig } from "ng7-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    // Simple configuration
    ...provideNgStorageConfig({
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
import { Component, inject } from "@angular/core";
import { NgStorageService } from "ng7-storage";

@Component({
  selector: "app-example",
  template: `
    <div>
      <input [(ngModel)]="username" placeholder="Username" />
      <button (click)="saveUser()">Save</button>
      <p>Current user: {{ currentUser() || "None" }}</p>
      <p>Total items: {{ storage.stats().itemCount }}</p>
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
}
```

## 🏗️ Configuration

### Apollo-Style Providers

#### Simple Static Configuration

```typescript
import { provideNgStorageConfig } from "ng7-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideNgStorageConfig({
      prefix: "myapp",
      storageType: "localStorage",
      defaultTTL: 60,
      enableLogging: false,
    }),
  ],
};
```

#### Dynamic Configuration with Factory

```typescript
import { provideNgStorage } from "ng7-storage";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideNgStorage(
      () => ({
        prefix: environment.production ? "myapp" : "myapp-dev",
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

#### Multiple Named Storage Instances

```typescript
import { provideNamedNgStorage, NgStorageManager } from "ng7-storage";

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideNamedNgStorage(() => ({
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
    NgStorageManager,
  ],
};
```

### Configuration Options

```typescript
interface StorageConfig {
  prefix?: string; // Storage key prefix (default: 'ng-storage')
  defaultTTL?: number; // Default TTL in minutes (default: 0 = no expiry)
  enableLogging?: boolean; // Enable debug logging (default: false)
  caseSensitive?: boolean; // Case sensitive keys (default: false)
  storageType?: "localStorage" | "sessionStorage"; // Storage type (default: 'sessionStorage')
}

interface StorageFlags {
  autoCleanup?: boolean; // Auto cleanup expired items (default: true)
  strictMode?: boolean; // Throw errors vs warnings (default: false)
  enableMetrics?: boolean; // Enable performance metrics (default: false)
}
```

## 📚 API Documentation

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
const userSignal = storage.createSignal<User>("currentUser");
const themeSignal = storage.createSignal("theme", "light");

// Use in component
@Component({
  template: `<p>Welcome {{ userSignal()?.name }}!</p>`,
})
export class MyComponent {
  userSignal = inject(NgStorageService).createSignal<User>("user");
}
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

interface StorageChangeEvent<T = any> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  action: "set" | "remove" | "clear" | "expire";
  timestamp: number;
}
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

### Multiple Storage Instances

#### Using NgStorageManager

```typescript
@Component({})
export class DashboardComponent {
  private storageManager = inject(NgStorageManager);

  private userStorage = this.storageManager.getStorage("user");
  private cacheStorage = this.storageManager.getStorage("cache");
  private sessionStorage = this.storageManager.getStorage("session");

  ngOnInit() {
    // Load user data from persistent storage
    const userData = this.userStorage.getData("profile");

    // Load cached data
    const cachedData = this.cacheStorage.getData("dashboard-data");

    // Save session state
    this.sessionStorage.setData("current-view", "dashboard");
  }
}
```

#### Creating Dynamic Storage Instances

```typescript
@Injectable()
export class StorageManagerService {
  private storageManager = inject(NgStorageManager);

  createTenantStorage(tenantId: string): NgStorageService {
    return this.storageManager.createStorage(`tenant-${tenantId}`, {
      prefix: `tenant-${tenantId}`,
      storageType: "localStorage",
      defaultTTL: 0,
    });
  }
}
```

## 💡 Usage Examples

### User Authentication Service

```typescript
@Injectable({ providedIn: "root" })
export class AuthService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("user");

  // Reactive authentication state
  isAuthenticated = computed(() => this.storage.hasKey("auth"));
  currentUser = this.storage.createSignal<User>("currentUser");

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const result = await this.http.post<AuthResult>("/api/login", credentials).toPromise();

    // Store encrypted auth data with 8-hour TTL
    this.storage.setData("auth", result.token, {
      encrypt: true,
      ttlMinutes: 8 * 60,
    });

    this.storage.setData("currentUser", result.user);
    return result;
  }

  logout(): void {
    this.storage.removeMultiple(["auth", "currentUser"]);
  }
}
```

### User Preferences Service

```typescript
@Injectable({ providedIn: "root" })
export class PreferencesService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("user");

  // Reactive preferences
  theme = this.storage.createSignal("theme", "light");
  language = this.storage.createSignal("language", "en");
  notifications = this.storage.createSignal("notifications", true);

  // Watch for theme changes and apply to document
  constructor() {
    this.theme$.subscribe((theme) => {
      document.body.setAttribute("data-theme", theme);
    });
  }

  get theme$() {
    return this.storage.watch<string>("theme");
  }

  updatePreferences(updates: Partial<UserPreferences>): void {
    Object.entries(updates).forEach(([key, value]) => {
      this.storage.setData(key, value);
    });
  }

  resetToDefaults(): void {
    this.storage.removeMultiple(["theme", "language", "notifications"]);
  }
}
```

### Shopping Cart Service

```typescript
@Injectable({ providedIn: "root" })
export class CartService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("session");

  // Reactive cart state
  items = this.storage.createSignal<CartItem[]>("cart", []);

  // Computed values
  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  addItem(product: Product, quantity = 1): void {
    this.storage.updateData("cart", (current: CartItem[] = []) => {
      const existingIndex = current.findIndex((item) => item.id === product.id);

      if (existingIndex >= 0) {
        current[existingIndex].quantity += quantity;
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

### Form Auto-Save Service

```typescript
@Injectable({ providedIn: "root" })
export class FormAutoSaveService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("session");
  private saveTimeouts = new Map<string, number>();

  autoSave<T>(formId: string, data: T, delayMs = 1000): void {
    // Clear existing timeout
    const existingTimeout = this.saveTimeouts.get(formId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      this.storage.setData(
        `form_${formId}`,
        {
          data,
          savedAt: Date.now(),
        },
        {
          ttlMinutes: 60, // Auto-save expires in 1 hour
        }
      );
      this.saveTimeouts.delete(formId);
    }, delayMs);

    this.saveTimeouts.set(formId, timeoutId);
  }

  getSavedData<T>(formId: string): { data: T; savedAt: number } | null {
    return this.storage.getData(`form_${formId}`);
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
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("user");

  storeSecurely<T>(key: string, value: T, ttlMinutes: number): void {
    const secureItem = {
      value,
      timestamp: Date.now(),
      checksum: this.generateChecksum(JSON.stringify(value)),
    };

    this.storage.setData(key, secureItem, {
      encrypt: true,
      ttlMinutes,
    });
  }

  getSecurely<T>(key: string): T | null {
    const item = this.storage.getData(key, { decrypt: true });

    if (!item) return null;

    // Validate checksum
    const expectedChecksum = this.generateChecksum(JSON.stringify(item.value));
    if (item.checksum !== expectedChecksum) {
      this.storage.removeData(key);
      throw new Error("Data integrity check failed");
    }

    return item.value;
  }

  private generateChecksum(data: string): string {
    // Simple checksum - use crypto library in production
    return btoa(data).slice(0, 8);
  }
}
```

## 🧪 Testing

### Test Configuration

```typescript
import { provideNgStorageConfig } from "ng7-storage";

// test-setup.ts
export function provideStorageForTesting() {
  return provideNgStorageConfig(
    {
      prefix: "test",
      storageType: "sessionStorage",
      defaultTTL: 0,
      enableLogging: true,
      caseSensitive: false,
    },
    {
      autoCleanup: false, // Manual cleanup in tests
      strictMode: true,
      enableMetrics: false,
    }
  );
}

// In test files
describe("Component with NgStorageService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideStorageForTesting()],
    });
  });

  it("should store and retrieve data", () => {
    const service = TestBed.inject(NgStorageService);
    service.setData("test", "value");
    expect(service.getData("test")).toBe("value");
  });
});
```

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

## 🔄 Migration Guide

### Breaking Changes in v2.0.0

#### 🚨 **Constructor Changes**

**Before (v1.x):**

```typescript
// v1.x - Manual constructor injection
constructor(config: Partial<StorageConfig> = {}) { }

// Usage
const storage = new NgStorageService({ prefix: 'app' });
```

**After (v2.x):**

```typescript
// v2.x - Angular DI with injection tokens
constructor(
  @Optional() @Inject(STORAGE_OPTIONS) options?: StorageConfig,
  @Optional() @Inject(STORAGE_FLAGS) flags?: StorageFlags
) { }

// Usage - Use providers instead
...provideNgStorageConfig({ prefix: 'app' })
```

**Migration:**

```typescript
// OLD: Direct instantiation
const storage = new NgStorageService({ prefix: 'app' });

// NEW: Use static factory methods
const storage = NgStorageService.create({ prefix: 'app' });

// OR: Use providers in app.config.ts
...provideNgStorageConfig({ prefix: 'app' })
```

#### 🚨 **Configuration System Changes**

**Before (v1.x):**

```typescript
// v1.x - Single injection token
import { STORAGE_CONFIG } from "ng7-storage";

providers: [{ provide: STORAGE_CONFIG, useValue: config }, NgStorageService];
```

**After (v2.x):**

```typescript
// v2.x - Provider functions (recommended)
import { provideNgStorageConfig } from "ng7-storage";

providers: [...provideNgStorageConfig(config)];
```

#### 🚨 **API Changes**

**Before (v1.x):**

```typescript
// v1.x - Optional parameters were truly optional
service.setData("key", "value"); // ✅ Worked
service.getData("key"); // ✅ Worked
```

**After (v2.x):**

```typescript
// v2.x - Options object pattern
service.setData("key", "value", {}); // ✅ Options object
service.getData("key", {}); // ✅ Options object

// But these still work for backward compatibility
service.setData("key", "value"); // ✅ Still works
service.getData("key"); // ✅ Still works
```

#### 🚨 **New Features (Non-Breaking)**

These are new features that don't break existing code:

```typescript
// ✨ New: Storage flags
...provideNgStorageConfig(config, {
  autoCleanup: true,
  strictMode: false,
  enableMetrics: true
})

// ✨ New: Multiple named instances
...provideNamedNgStorage(() => ({
  user: { prefix: 'user' },
  cache: { prefix: 'cache' }
}))

// ✨ New: NgStorageManager
const manager = inject(NgStorageManager);
const userStorage = manager.getStorage('user');

// ✨ New: Enhanced reactive features
const signal = storage.createSignal('key', 'default');
const pattern$ = storage.watchPattern('user.*');
```

### Migration Steps

#### Step 1: Update Imports

```typescript
// Before
import { NgStorageService, STORAGE_CONFIG } from "ng7-storage";

// After
import { NgStorageService, provideNgStorageConfig, NgStorageManager } from "ng7-storage";
```

#### Step 2: Update Configuration

```typescript
// Before
providers: [{ provide: STORAGE_CONFIG, useValue: { prefix: "app" } }, NgStorageService];

// After
providers: [...provideNgStorageConfig({ prefix: "app" })];
```

#### Step 3: Update Static Instantiation (if used)

```typescript
// Before
const storage = new NgStorageService({ prefix: "app" });

// After
const storage = NgStorageService.create({ prefix: "app" });
```

#### Step 4: Leverage New Features (Optional)

```typescript
// Add multiple storage instances
providers: [
  ...provideNamedNgStorage(() => ({
    user: { prefix: "user-data", storageType: "localStorage" },
    temp: { prefix: "temp-data", storageType: "sessionStorage" },
  })),
  NgStorageManager,
];

// Use in components
export class MyComponent {
  private manager = inject(NgStorageManager);
  private userStorage = this.manager.getStorage("user");
  private tempStorage = this.manager.getStorage("temp");
}
```

### Compatibility

- ✅ **Angular 18+** required
- ✅ **TypeScript 5.0+** required
- ✅ **Most v1.x code** works without changes
- ✅ **Static factory methods** maintain full compatibility
- ⚠️ **Direct constructor usage** requires migration to `NgStorageService.create()`

## 🌐 Browser Compatibility

| Browser | Version | localStorage | sessionStorage |
| ------- | ------- | ------------ | -------------- |
| Chrome  | 4+      | ✅           | ✅             |
| Firefox | 3.5+    | ✅           | ✅             |
| Safari  | 4+      | ✅           | ✅             |
| Edge    | All     | ✅           | ✅             |
| IE      | 8+      | ✅           | ✅             |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/edisonaugusthy/ng7-storage.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

## 📝 Changelog

### v2.0.0 - Major Release

- ✨ **BREAKING:** Added Angular 19+ requirement
- ✨ **BREAKING:** New dependency injection system with providers
- ✨ Added provider functions (`provideNgStorage`, `provideNamedNgStorage`)
- ✨ Added `NgStorageManager` for multiple storage instances
- ✨ Added storage flags system (autoCleanup, strictMode, enableMetrics)
- ✨ Enhanced reactive features with signals
- ✨ Added `watchPattern()` for pattern-based key watching
- 🐛 Fixed all critical decryption and error handling bugs
- 🔧 Improved TypeScript support with better generics
- 📚 Comprehensive documentation update

### v1.0.0 - Initial Release

- 🎉 Initial release
- ✨ Basic storage operations (set, get, remove)
- ✨ Base64 encryption support
- ✨ TTL functionality
- ✨ Basic reactive features
- ✨ Angular service integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework and signals
- Apollo GraphQL team for the inspiration on provider patterns
- RxJS team for reactive programming utilities
- All contributors and users of this library

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/edisonaugusthy/ng-storage/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/edisonaugusthy/ng-storage/discussions)
- 📧 **Email**: your-email@example.com

---

<div align="center">

**Made with ❤️ for the Angular community**

[⭐ Star this repo](https://github.com/edisonaugusthy/ng-storage) | [🍴 Fork it](https://github.com/edisonaugusthy/ng-storage/fork) | [📋 Report Issues](https://github.com/edisonaugusthy/ng-storage/issues)

</div>
