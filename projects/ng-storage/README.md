# NgStorageService

[![npm version](https://badge.fury.io/js/ng7-storage.svg)](https://badge.fury.io/js/ng7-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-20%2B-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)

🚀 **A modern, reactive Angular service for browser storage management with AES-GCM encryption, TTL, change notifications, and Apollo-style providers.**

## ✨ Features

- 🔄 **Reactive State Management** - Built with Angular signals and RxJS observables
- 🔐 **AES-GCM Encryption** - Military-grade encryption using Web Crypto API with fallback
- ⏰ **TTL Support** - Automatic data expiration
- 📡 **Change Notifications** - Watch for storage changes in real-time
- 🏪 **Dual Storage Support** - localStorage and sessionStorage
- 🎯 **Multiple Instances** - Named storage instances with NgStorageManager
- 📊 **Storage Statistics** - Monitor usage and performance
- 🔧 **Configurable Flags** - Auto-cleanup, strict mode, metrics
- 🌐 **Cross-Browser Compatibility** - Graceful degradation for older browsers
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
      <button (click)="saveUserEncrypted()">Save Encrypted</button>
      <p>Current user: {{ currentUser() || "None" }}</p>
      <p>Total items: {{ storage.stats().itemCount }}</p>
      <p>Encryption supported: {{ storage.isEncryptionSupported() }}</p>
    </div>
  `,
})
export class ExampleComponent {
  private storage = inject(NgStorageService);

  username = "";
  currentUser = this.storage.createSignal<string>("currentUser");

  async saveUser() {
    await this.storage.setData("currentUser", this.username);
  }

  async saveUserEncrypted() {
    await this.storage.setData("currentUser", this.username, {
      encrypt: true,
      ttlMinutes: 60,
    });
  }
}
```

## 🔐 Enhanced Security Features

### AES-GCM Encryption

NgStorageService now uses **AES-GCM encryption** with the Web Crypto API, providing:

- **256-bit AES encryption** - Military-grade security
- **Galois/Counter Mode (GCM)** - Provides both confidentiality and authenticity
- **Unique IVs** - Each encryption uses a random initialization vector
- **Authentication tags** - Prevents tampering and ensures data integrity
- **PBKDF2 key derivation** - Secure key generation with 100,000 iterations
- **Automatic fallback** - Base64 encoding for unsupported browsers

### Encryption Usage Examples

```typescript
// Store encrypted sensitive data
await storage.setData("apiToken", "secret-api-key", {
  encrypt: true,
  ttlMinutes: 60, // Expires in 1 hour
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
  console.log("Using Base64 fallback");
}

// Clear encryption key for security
storage.clearEncryptionKey();
```

### Security Features Comparison

| Feature                   | Previous (Base64) | New (AES-GCM)             |
| ------------------------- | ----------------- | ------------------------- |
| **Security Level**        | Obfuscation only  | Military-grade encryption |
| **Key Length**            | None              | 256-bit                   |
| **Authentication**        | None              | 128-bit auth tag          |
| **Tampering Protection**  | ❌                | ✅                        |
| **Unique Per Encryption** | ❌                | ✅ Random IV              |
| **Browser Support**       | Universal         | Modern + fallback         |

## 🏗️ Configuration

### Global Providers

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

### Core Methods (Now Async for Encryption Support)

#### `setData<T>(key: string, value: T, options?): Promise<boolean>`

Stores data with optional encryption and TTL.

```typescript
// Basic usage
await storage.setData("user", { name: "John", age: 30 });

// With AES-GCM encryption
await storage.setData("token", "secret-token", { encrypt: true });

// With TTL (expires in 30 minutes)
await storage.setData("cache", data, { ttlMinutes: 30 });

// With both encryption and TTL
await storage.setData("session", userData, {
  encrypt: true,
  ttlMinutes: 60,
});
```

#### `getData<T>(key: string, options?): Promise<T | null>`

Retrieves data with optional decryption.

```typescript
// Basic retrieval
const user = await storage.getData<User>("user");

// With decryption
const token = await storage.getData("token", { decrypt: true });

// With default value
const theme = await storage.getData("theme", { defaultValue: "light" });
```

#### `hasKey(key: string): Promise<boolean>`

Checks if a key exists (now async to handle encrypted data).

```typescript
const exists = await storage.hasKey("user");
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

### Encryption Methods

#### `isEncryptionSupported(): boolean`

Checks if AES-GCM encryption is available.

```typescript
if (storage.isEncryptionSupported()) {
  // Use full encryption features
  await storage.setData("secret", data, { encrypt: true });
} else {
  // Browser falls back to Base64 encoding
  console.warn("Using Base64 fallback");
}
```

#### `clearEncryptionKey(): void`

Clears the cached encryption key (useful for key rotation).

```typescript
// Clear key for security or testing
storage.clearEncryptionKey();
```

### Reactive Features

#### `createSignal<T>(key: string, defaultValue?): Promise<Signal<T | null>>`

Creates a reactive signal that automatically updates when storage changes.

```typescript
// Create reactive signals (now async)
const userSignal = await storage.createSignal<User>("currentUser");
const themeSignal = await storage.createSignal("theme", "light");

// Use in component
@Component({
  template: `<p>Welcome {{ userSignal()?.name }}!</p>`,
})
export class MyComponent {
  userSignal: Signal<User | null> = signal(null);

  async ngOnInit() {
    this.userSignal = await inject(NgStorageService).createSignal<User>("user");
  }
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

### Storage Statistics (Now Async)

#### `getStorageStats(): Promise<StorageStats>`

Gets storage statistics (now async to handle encrypted data).

```typescript
const stats = await storage.getStorageStats();
console.log(`Total items: ${stats.totalItems}`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Available space: ${stats.availableSpace} bytes`);
```

### Enhanced Methods (Now Async)

#### `updateData<T>(key, updateFn, options?): Promise<boolean>`

Updates existing data with a function.

```typescript
await storage.updateData(
  "cart",
  (current: CartItem[] = []) => {
    return [...current, newItem];
  },
  { encrypt: true }
);
```

#### `setIfNotExists<T>(key, value, options?): Promise<boolean>`

Sets data only if key doesn't exist.

```typescript
const wasSet = await storage.setIfNotExists("config", defaultConfig, {
  encrypt: true,
});
```

#### `cleanup(): Promise<number>`

Forces cleanup of expired items.

```typescript
const removedCount = await storage.cleanup();
console.log(`Removed ${removedCount} expired items`);
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

  async ngOnInit() {
    // Load user data from persistent storage
    const userData = await this.userStorage.getData("profile");

    // Load cached data
    const cachedData = await this.cacheStorage.getData("dashboard-data");

    // Save session state with encryption
    await this.sessionStorage.setData("current-view", "dashboard", {
      encrypt: true,
      ttlMinutes: 30,
    });
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
  currentUser: Signal<User | null> = signal(null);

  async ngOnInit() {
    this.currentUser = await this.storage.createSignal<User>("currentUser");
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const result = await this.http.post<AuthResult>("/api/login", credentials).toPromise();

    // Store encrypted auth data with 8-hour TTL
    await this.storage.setData("auth", result.token, {
      encrypt: true,
      ttlMinutes: 8 * 60,
    });

    await this.storage.setData("currentUser", result.user);
    return result;
  }

  logout(): void {
    this.storage.removeMultiple(["auth", "currentUser"]);
    // Clear encryption key for security
    this.storage.clearEncryptionKey();
  }
}
```

### Secure User Preferences Service

```typescript
@Injectable({ providedIn: "root" })
export class PreferencesService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("user");

  // Reactive preferences
  theme: Signal<string | null> = signal(null);
  language: Signal<string | null> = signal(null);
  notifications: Signal<boolean | null> = signal(null);

  async ngOnInit() {
    // Initialize reactive preferences
    this.theme = await this.storage.createSignal("theme", "light");
    this.language = await this.storage.createSignal("language", "en");
    this.notifications = await this.storage.createSignal("notifications", true);

    // Watch for theme changes and apply to document
    this.theme$.subscribe((theme) => {
      document.body.setAttribute("data-theme", theme || "light");
    });
  }

  get theme$() {
    return this.storage.watch<string>("theme");
  }

  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    // Store preferences with encryption
    for (const [key, value] of Object.entries(updates)) {
      await this.storage.setData(key, value, { encrypt: true });
    }
  }

  resetToDefaults(): void {
    this.storage.removeMultiple(["theme", "language", "notifications"]);
  }
}
```

### Secure Shopping Cart Service

```typescript
@Injectable({ providedIn: "root" })
export class CartService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("session");

  // Reactive cart state
  items: Signal<CartItem[]> = signal([]);

  // Computed values
  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  async ngOnInit() {
    this.items = await this.storage.createSignal<CartItem[]>("cart", []);
  }

  async addItem(product: Product, quantity = 1): Promise<void> {
    await this.storage.updateData(
      "cart",
      (current: CartItem[] = []) => {
        const existingIndex = current.findIndex((item) => item.id === product.id);

        if (existingIndex >= 0) {
          current[existingIndex].quantity += quantity;
          return [...current];
        } else {
          return [...current, { ...product, quantity }];
        }
      },
      {
        encrypt: true, // Encrypt cart data
        ttlMinutes: 60, // Cart expires in 1 hour
      }
    );
  }

  async removeItem(productId: string): Promise<void> {
    await this.storage.updateData("cart", (current: CartItem[] = []) => current.filter((item) => item.id !== productId), {
      encrypt: true,
    });
  }

  clear(): void {
    this.storage.removeData("cart");
  }
}
```

### Enhanced Form Auto-Save Service

```typescript
@Injectable({ providedIn: "root" })
export class FormAutoSaveService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("session");
  private saveTimeouts = new Map<string, number>();

  async autoSave<T>(formId: string, data: T, delayMs = 1000): Promise<void> {
    // Clear existing timeout
    const existingTimeout = this.saveTimeouts.get(formId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      await this.storage.setData(
        `form_${formId}`,
        {
          data,
          savedAt: Date.now(),
        },
        {
          encrypt: true, // Encrypt form data
          ttlMinutes: 60, // Auto-save expires in 1 hour
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

## 🔐 Security Considerations

### AES-GCM Encryption Benefits

✅ **Cryptographically Secure** - Uses industry-standard AES-GCM encryption  
✅ **Tamper-Proof** - Authentication tags prevent data modification  
✅ **Unique Per Session** - Random IVs ensure unique encryption each time  
✅ **Key Derivation** - PBKDF2 with 100,000 iterations for secure key generation  
✅ **Browser Native** - Uses Web Crypto API for optimal performance

### Security Best Practices

- ✅ **Do use encryption** for sensitive data (API tokens, user preferences)
- ✅ **Do implement** proper session timeouts with TTL
- ✅ **Do validate** data when retrieving from storage
- ✅ **Do clear encryption keys** on logout for enhanced security
- ✅ **Do use HTTPS** to protect data in transit
- ❌ **Don't store** highly sensitive data (passwords, credit cards, SSNs)
- ❌ **Don't rely solely** on client-side encryption for critical security

### Enhanced Security Example

```typescript
@Injectable({ providedIn: "root" })
export class SecureStorageService {
  private storageManager = inject(NgStorageManager);
  private storage = this.storageManager.getStorage("user");

  async storeSecurely<T>(key: string, value: T, ttlMinutes: number): Promise<void> {
    const secureItem = {
      value,
      timestamp: Date.now(),
      checksum: await this.generateChecksum(JSON.stringify(value)),
    };

    await this.storage.setData(key, secureItem, {
      encrypt: true,
      ttlMinutes,
    });
  }

  async getSecurely<T>(key: string): Promise<T | null> {
    const item = await this.storage.getData(key, { decrypt: true });

    if (!item) return null;

    // Validate checksum
    const expectedChecksum = await this.generateChecksum(JSON.stringify(item.value));
    if (item.checksum !== expectedChecksum) {
      this.storage.removeData(key);
      throw new Error("Data integrity check failed");
    }

    return item.value;
  }

  private async generateChecksum(data: string): Promise<string> {
    // Use Web Crypto API for secure checksums
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  }
}
```

### Browser Compatibility for Encryption

| Browser        | AES-GCM Support    | Fallback           |
| -------------- | ------------------ | ------------------ |
| Chrome 37+     | ✅ Full encryption | N/A                |
| Firefox 34+    | ✅ Full encryption | N/A                |
| Safari 7+      | ✅ Full encryption | N/A                |
| Edge 12+       | ✅ Full encryption | N/A                |
| IE 11          | ❌                 | ✅ Base64 encoding |
| Older browsers | ❌                 | ✅ Base64 encoding |

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

  it("should store and retrieve data", async () => {
    const service = TestBed.inject(NgStorageService);
    await service.setData("test", "value");
    const result = await service.getData("test");
    expect(result).toBe("value");
  });

  it("should encrypt and decrypt data", async () => {
    const service = TestBed.inject(NgStorageService);
    await service.setData("encrypted", "secret", { encrypt: true });
    const result = await service.getData("encrypted", { decrypt: true });
    expect(result).toBe("secret");
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

### Breaking Changes in v2.1.0 - Encryption Update

#### 🚨 **Method Signature Changes**

**Before (v2.0.x):**

```typescript
// v2.0.x - Synchronous methods
storage.setData("key", "value"); // ✅ Synchronous
storage.getData("key"); // ✅ Synchronous
storage.hasKey("key"); // ✅ Synchronous
```

**After (v2.1.x):**

```typescript
// v2.1.x - Async methods for encryption support
await storage.setData("key", "value"); // 🔄 Now async
await storage.getData("key"); // 🔄 Now async
await storage.hasKey("key"); // 🔄 Now async
```

#### 🚨 **Encryption System Changes**

**Before (v2.0.x):**

```typescript
// v2.0.x - Base64 encoding only
storage.setData("token", "secret", { encrypt: true }); // Base64 only
```

**After (v2.1.x):**

```typescript
// v2.1.x - AES-GCM encryption with fallback
await storage.setData("token", "secret", { encrypt: true }); // AES-GCM or Base64

// Check encryption capabilities
if (storage.isEncryptionSupported()) {
  console.log("Using AES-GCM encryption");
} else {
  console.log("Falling back to Base64");
}
```

#### 🚨 **Reactive Features Changes**

**Before (v2.0.x):**

```typescript
// v2.0.x - Synchronous signal creation
const signal = storage.createSignal("key", "default");
```

**After (v2.1.x):**

```typescript
// v2.1.x - Async signal creation
const signal = await storage.createSignal("key", "default");

// Or in component lifecycle
async ngOnInit() {
  this.userSignal = await this.storage.createSignal<User>("user");
}
```

### Migration Steps

#### Step 1: Update Method Calls to Async

```typescript
// Before
const user = storage.getData("user");
storage.setData("user", newUser);
const exists = storage.hasKey("user");

// After
const user = await storage.getData("user");
await storage.setData("user", newUser);
const exists = await storage.hasKey("user");
```

#### Step 2: Update Component Lifecycle

```typescript
// Before
export class MyComponent {
  userSignal = this.storage.createSignal<User>("user");
}

// After
export class MyComponent {
  userSignal: Signal<User | null> = signal(null);

  async ngOnInit() {
    this.userSignal = await this.storage.createSignal<User>("user");
  }
}
```

#### Step 3: Update Service Methods

```typescript
// Before
@Injectable()
export class UserService {
  saveUser(user: User): void {
    this.storage.setData("user", user);
  }

  getUser(): User | null {
    return this.storage.getData("user");
  }
}

// After
@Injectable()
export class UserService {
  async saveUser(user: User): Promise<void> {
    await this.storage.setData("user", user, { encrypt: true });
  }

  async getUser(): Promise<User | null> {
    return await this.storage.getData("user", { decrypt: true });
  }
}
```

#### Step 4: Leverage New Encryption Features

```typescript
// Enhanced security with new encryption
await storage.setData("sensitiveData", data, {
  encrypt: true,
  ttlMinutes: 60,
});

// Check encryption support
if (storage.isEncryptionSupported()) {
  // Use full encryption features
} else {
  // Handle fallback gracefully
}

// Clear encryption key on logout
storage.clearEncryptionKey();
```

### Compatibility

- ✅ **Angular 20+** required (updated from 19+)
- ✅ **TypeScript 5.0+** required
- ✅ **Web Crypto API** for full encryption (with fallback)
- ⚠️ **Breaking**: Most core methods are now async
- ⚠️ **Breaking**: Signal creation is now async
- ✅ **Enhanced**: Much stronger encryption than before
- ✅ **Backward Compatible**: Existing stored data still works

## 🌐 Browser Compatibility

| Browser | Version | localStorage | sessionStorage | AES-GCM Encryption   |
| ------- | ------- | ------------ | -------------- | -------------------- |
| Chrome  | 37+     | ✅           | ✅             | ✅                   |
| Firefox | 34+     | ✅           | ✅             | ✅                   |
| Safari  | 7+      | ✅           | ✅             | ✅                   |
| Edge    | 12+     | ✅           | ✅             | ✅                   |
| IE      | 11      | ✅           | ✅             | ❌ (Base64 fallback) |
| IE      | 8-10    | ✅           | ✅             | ❌ (Base64 fallback) |

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

### v2.1.0 - Major Encryption Update

- ✨ **BREAKING:** Core methods now async for encryption support
- ✨ **NEW:** PBKDF2 key derivation with 100,000 iterations
- ✨ **NEW:** Automatic fallback to Base64 for older browsers
- ✨ **NEW:** `isEncryptionSupported()` method
- ✨ **NEW:** `clearEncryptionKey()` method for security
- ✨ **ENHANCED:** Signal creation now async
- ✨ **ENHANCED:** Storage statistics now async
- ✨ **ENHANCED:** Better error handling and logging
- 🔧 **IMPROVED:** Cross-browser compatibility
- 🔧 **IMPROVED:** Performance with key caching
- 🛡️ **SECURITY:** Data integrity protection with authentication tags
- 🛡️ **SECURITY:** Unique encryption per data item with random IVs

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
- Web Crypto API for enabling secure client-side encryption
- All contributors and users of this library

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/edisonaugusthy/ng-storage/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/edisonaugusthy/ng-storage/discussions)
- 📧 **Email**: your-email@example.com
- 🔐 **Security Issues**: Please report security vulnerabilities privately

---

<div align="center">

**Made with ❤️ and 🔐 for the Angular community**

[⭐ Star this repo](https://github.com/edisonaugusthy/ng-storage) | [🍴 Fork it](https://github.com/edisonaugusthy/ng-storage/fork) | [📋 Report Issues](https://github.com/edisonaugusthy/ng-storage/issues)

</div> AES-GCM encryption using Web Crypto API
- ✨ **NEW:** 256-bit encryption with authentication
- ✨ **NEW:**
