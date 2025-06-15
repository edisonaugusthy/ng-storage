import {
  Injectable,
  signal,
  computed,
  Inject,
  Optional,
  Provider,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  distinctUntilChanged,
} from 'rxjs';
import {
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_STORAGE_FLAGS,
  STORAGE_FLAGS,
  STORAGE_OPTIONS,
  StorageChangeEvent,
  StorageConfig,
  StorageFlags,
  StorageItem,
  StorageStats,
  StorageType,
} from './ng-storage.model';
import { provideNgStorage } from './ng-storage.module';

/**
 * Simple provider for basic configuration
 */
export function provideNgStorageConfig(
  config: StorageConfig,
  flags: StorageFlags = {}
): Provider[] {
  return provideNgStorage(() => config, flags);
}

@Injectable({
  providedIn: 'root',
})
export class NgStorageService {
  private readonly config: Required<StorageConfig>;
  private readonly flags: Required<StorageFlags>;
  private readonly storage: Storage;
  private readonly storageTypeName: string;
  private readonly supportedMessage: string;
  private readonly isSupported: boolean;

  // Reactive state management
  private readonly _storageData = signal<Record<string, any>>({});
  private readonly _changeSubject = new Subject<StorageChangeEvent>();
  private readonly _keyChangeSubjects = new Map<string, BehaviorSubject<any>>();

  // Public reactive properties
  public readonly storageData = this._storageData.asReadonly();
  public readonly changes$ = this._changeSubject.asObservable();

  // Computed stats
  public readonly stats = computed(() => {
    const data = this._storageData();
    return {
      itemCount: Object.keys(data).length,
      isEmpty: Object.keys(data).length === 0,
      keys: Object.keys(data),
    };
  });

  constructor(
    @Optional() @Inject(STORAGE_OPTIONS) options?: StorageConfig,
    @Optional() @Inject(STORAGE_FLAGS) flags?: StorageFlags
  ) {
    // Merge configurations
    this.config = {
      ...DEFAULT_STORAGE_CONFIG,
      ...options,
    };

    this.flags = {
      ...DEFAULT_STORAGE_FLAGS,
      ...flags,
    };

    // Set storage type and messages
    this.storageTypeName =
      this.config.storageType === 'localStorage'
        ? 'local storage'
        : 'session storage';
    this.supportedMessage = `Your browser doesn't support ${this.storageTypeName}. Please update your browser.`;

    // Get the appropriate storage instance
    this.storage = this.getStorageInstance();

    // Check if storage is supported
    this.isSupported = this.checkStorageSupport();

    if (!this.isSupported) {
      console.error(this.supportedMessage);
      if (this.flags.strictMode) {
        throw new Error(this.supportedMessage);
      }
    }

    // Initialize reactive state
    this.initializeReactiveState();

    // Clean expired items on initialization
    if (this.flags.autoCleanup) {
      this.cleanupExpiredItems();
    }

    // Set up periodic cleanup
    if (typeof window !== 'undefined' && this.flags.autoCleanup) {
      setInterval(() => this.cleanupExpiredItems(), 5 * 60 * 1000); // Every 5 minutes
    }
  }

  /**
   * Gets the appropriate storage instance based on configuration
   */
  private getStorageInstance(): Storage {
    if (typeof window === 'undefined') {
      throw new Error('Storage is not available in server-side rendering');
    }

    switch (this.config.storageType) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      default:
        throw new Error(`Unsupported storage type: ${this.config.storageType}`);
    }
  }

  /**
   * Checks if the configured storage is supported and available
   */
  private checkStorageSupport(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const testKey = '__ng_storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initializes reactive state from existing storage
   */
  private initializeReactiveState(): void {
    try {
      const data: Record<string, any> = {};
      const prefix = `${this.config.prefix}:`;

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(prefix)) {
          const originalKey = key.substring(prefix.length);
          try {
            const value = this.getDataInternal(originalKey);
            if (value !== null) {
              data[originalKey] = value;
            }
          } catch (error) {
            this.log(
              'Failed to load key during initialization',
              originalKey,
              error
            );
          }
        }
      }

      this._storageData.set(data);
    } catch (error) {
      this.log('Failed to initialize reactive state', '', error);
    }
  }

  /**
   * Generates a storage key with prefix
   */
  private generateKey(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('Storage key must be a non-empty string');
    }

    const processedKey = this.config.caseSensitive ? key : key.toLowerCase();
    return `${this.config.prefix}:${processedKey}`;
  }

  /**
   * Logs debug information if logging is enabled
   */
  private log(action: string, key: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[NgStorageService] ${action}:`, { key, data });
    }
  }

  /**
   * Encrypts data using base64 encoding
   */
  private encrypt(data: string): string {
    try {
      return window.btoa(encodeURIComponent(data));
    } catch (error) {
      this.log('Encryption failed', '', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts data using base64 decoding
   */
  private decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(window.atob(encryptedData));
    } catch (error) {
      this.log('Decryption failed', '', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Calculates the expiry timestamp
   */
  private calculateExpiry(ttlMinutes?: number): number | undefined {
    const ttl = ttlMinutes ?? this.config.defaultTTL;
    return ttl > 0 ? Date.now() + ttl * 60 * 1000 : undefined;
  }

  /**
   * Checks if an item has expired
   */
  private isExpired(item: StorageItem): boolean {
    return item.expiry ? Date.now() > item.expiry : false;
  }

  /**
   * Emits change event
   */
  private emitChange<T>(
    key: string,
    oldValue: T | null,
    newValue: T | null,
    action: StorageChangeEvent['action']
  ): void {
    const event: StorageChangeEvent<T> = {
      key,
      oldValue,
      newValue,
      action,
      timestamp: Date.now(),
    };

    this._changeSubject.next(event);

    // Update key-specific subject
    const keySubject = this._keyChangeSubjects.get(key);
    if (keySubject) {
      keySubject.next(newValue);
    }

    this.log('Change emitted', key, event);
  }

  /**
   * Updates reactive state
   */
  private updateReactiveState(
    key: string,
    value: any,
    action: StorageChangeEvent['action']
  ): void {
    const currentData = this._storageData();
    const oldValue = currentData[key] ?? null;

    if (action === 'remove' || action === 'clear' || action === 'expire') {
      const newData = { ...currentData };
      delete newData[key];
      this._storageData.set(newData);
      this.emitChange(key, oldValue, null, action);
    } else {
      this._storageData.update((data) => ({ ...data, [key]: value }));
      this.emitChange(key, oldValue, value, action);
    }
  }

  /**
   * Internal get data method without reactive updates
   */
  private getDataInternal<T = any>(
    key: string,
    options: { decrypt?: boolean; defaultValue?: T } = {}
  ): T | null {
    try {
      const storageKey = this.generateKey(key);
      const { decrypt = false, defaultValue = null } = options;

      const rawData = this.storage.getItem(storageKey);

      if (!rawData) {
        return defaultValue;
      }

      let parsedData: string;

      if (decrypt) {
        parsedData = this.decrypt(rawData);
      } else {
        parsedData = rawData;
      }

      const item: StorageItem<T> = JSON.parse(parsedData);

      // Check if item has expired
      if (this.isExpired(item)) {
        this.storage.removeItem(storageKey);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      this.log('Get data failed', key, error);
      return options.defaultValue ?? null;
    }
  }

  /**
   * Removes expired items from storage
   */
  private cleanupExpiredItems(): void {
    try {
      const keysToRemove: string[] = [];
      const currentData = this._storageData();

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(`${this.config.prefix}:`)) {
          try {
            const rawData = this.storage.getItem(key);
            if (rawData) {
              let parsedData = rawData;

              // Try to detect if encrypted
              try {
                JSON.parse(parsedData);
              } catch {
                try {
                  parsedData = this.decrypt(rawData);
                } catch {
                  keysToRemove.push(key);
                  continue;
                }
              }

              const item: StorageItem = JSON.parse(parsedData);
              if (this.isExpired(item)) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((storageKey) => {
        const originalKey = storageKey.substring(
          `${this.config.prefix}:`.length
        );
        this.storage.removeItem(storageKey);

        if (currentData[originalKey] !== undefined) {
          this.updateReactiveState(originalKey, null, 'expire');
        }

        this.log('Removed expired item', originalKey);
      });
    } catch (error) {
      this.log('Cleanup failed', '', error);
    }
  }

  /**
   * Stores data in session storage with optional encryption and TTL
   */
  setData<T = any>(
    key: string,
    value: T,
    options: {
      encrypt?: boolean;
      ttlMinutes?: number;
    } = {}
  ): boolean {
    try {
      if (!this.isSupported) {
        throw new Error(this.supportedMessage);
      }

      const storageKey = this.generateKey(key);
      const { encrypt = false, ttlMinutes } = options;

      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: this.calculateExpiry(ttlMinutes),
        encrypted: encrypt,
      };

      let serializedData = JSON.stringify(item);

      if (encrypt) {
        serializedData = this.encrypt(serializedData);
      }

      this.storage.setItem(storageKey, serializedData);
      this.updateReactiveState(key, value, 'set');
      this.log('Data stored', key, { value, options });

      return true;
    } catch (error) {
      this.log('Set data failed', key, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Try clearing some data.');
      }
      throw error;
    }
  }

  /**
   * Retrieves data from session storage with automatic decryption and expiry check
   */
  getData<T = any>(
    key: string,
    options: {
      decrypt?: boolean;
      defaultValue?: T;
    } = {}
  ): T | null {
    // Try to get from reactive state first
    const reactiveValue = this._storageData()[key];
    if (reactiveValue !== undefined) {
      return reactiveValue;
    }

    // Fallback to storage
    const value = this.getDataInternal<T>(key, options);

    // Update reactive state if value found
    if (value !== null) {
      this._storageData.update((data) => ({ ...data, [key]: value }));
    }

    return value;
  }

  /**
   * Creates a signal for a specific key
   */
  createSignal<T = any>(key: string, defaultValue?: T) {
    const initialValue = this.getData<T>(key) ?? defaultValue ?? null;
    const keySignal = signal<T | null>(initialValue);

    // Subscribe to changes for this key
    this.watch<T>(key).subscribe((value) => {
      keySignal.set(value);
    });

    return keySignal.asReadonly();
  }

  /**
   * Watch changes for a specific key
   */
  watch<T = any>(key: string): Observable<T | null> {
    if (!this._keyChangeSubjects.has(key)) {
      const currentValue = this.getData<T>(key);
      this._keyChangeSubjects.set(
        key,
        new BehaviorSubject<T | null>(currentValue)
      );
    }

    return this._keyChangeSubjects
      .get(key)!
      .asObservable()
      .pipe(distinctUntilChanged());
  }

  /**
   * Watch all changes
   */
  watchAll(): Observable<StorageChangeEvent> {
    return this.changes$;
  }

  /**
   * Watch changes for multiple keys
   */
  watchKeys<T = any>(
    keys: string[]
  ): Observable<{ key: string; value: T | null }> {
    return this.changes$.pipe(
      filter((event) => keys.includes(event.key)),
      map((event) => ({ key: event.key, value: event.newValue as T | null }))
    );
  }

  /**
   * Watch changes by pattern (simple glob-like matching)
   */
  watchPattern<T = any>(
    pattern: string
  ): Observable<{ key: string; value: T | null }> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return this.changes$.pipe(
      filter((event) => regex.test(event.key)),
      map((event) => ({ key: event.key, value: event.newValue as T | null }))
    );
  }

  /**
   * Removes data associated with the specified key
   */
  removeData(key: string): boolean {
    try {
      if (!this.isSupported) {
        throw new Error(this.supportedMessage);
      }

      const storageKey = this.generateKey(key);
      this.storage.removeItem(storageKey);
      this.updateReactiveState(key, null, 'remove');
      this.log('Data removed', key);
      return true;
    } catch (error) {
      this.log('Remove data failed', key, error);
      return false;
    }
  }

  /**
   * Removes multiple items at once
   */
  removeMultiple(keys: string[]): { success: string[]; failed: string[] } {
    const result = { success: [] as string[], failed: [] as string[] };

    keys.forEach((key) => {
      if (this.removeData(key)) {
        result.success.push(key);
      } else {
        result.failed.push(key);
      }
    });

    return result;
  }

  /**
   * Clears all storage data with the current prefix
   */
  removeAll(): boolean {
    try {
      if (!this.isSupported) {
        throw new Error(this.supportedMessage);
      }

      const keysToRemove: string[] = [];
      const currentData = this._storageData();

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(`${this.config.prefix}:`)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => this.storage.removeItem(key));

      // Clear reactive state and emit events
      Object.keys(currentData).forEach((key) => {
        this.updateReactiveState(key, null, 'clear');
      });

      this.log('All data cleared', '', { removedCount: keysToRemove.length });

      return true;
    } catch (error) {
      this.log('Clear all failed', '', error);
      return false;
    }
  }

  /**
   * Checks if a key exists in storage
   */
  hasKey(key: string): boolean {
    // Check reactive state first
    if (this._storageData()[key] !== undefined) {
      return true;
    }

    // Check storage
    try {
      if (!this.isSupported) {
        return false;
      }

      const value = this.getDataInternal(key);
      const exists = value !== null;

      // Update reactive state if found
      if (exists) {
        this._storageData.update((data) => ({ ...data, [key]: value }));
      }

      return exists;
    } catch (error) {
      this.log('Has key check failed', key, error);
      return false;
    }
  }

  /**
   * Gets all keys managed by this service
   */
  getKeys(): string[] {
    return Object.keys(this._storageData());
  }

  /**
   * Gets storage statistics
   */
  getStorageStats(): StorageStats {
    const stats: StorageStats = {
      totalItems: 0,
      totalSize: 0,
      availableSpace: 0,
      items: [],
    };

    try {
      if (!this.isSupported) {
        return stats;
      }

      const prefix = `${this.config.prefix}:`;

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(prefix)) {
          const data = this.storage.getItem(key);
          if (data) {
            const size = new Blob([data]).size;
            stats.totalSize += size;
            stats.totalItems++;

            try {
              let parsedData = data;
              try {
                JSON.parse(parsedData);
              } catch {
                parsedData = this.decrypt(data);
              }

              const item: StorageItem = JSON.parse(parsedData);

              stats.items.push({
                key: key.substring(prefix.length),
                size,
                timestamp: item.timestamp,
                hasExpiry: Boolean(item.expiry),
              });
            } catch {
              stats.items.push({
                key: key.substring(prefix.length),
                size,
                timestamp: 0,
                hasExpiry: false,
              });
            }
          }
        }
      }

      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      stats.availableSpace = Math.max(0, estimatedLimit - stats.totalSize);
    } catch (error) {
      this.log('Get storage stats failed', '', error);
    }

    return stats;
  }

  /**
   * Updates existing data if key exists
   */
  updateData<T = any>(
    key: string,
    updateFn: (currentValue: T | null) => T,
    options: {
      encrypt?: boolean;
      ttlMinutes?: number;
    } = {}
  ): boolean {
    try {
      const currentValue = this.getData<T>(key, { decrypt: options.encrypt });
      const newValue = updateFn(currentValue);
      return this.setData(key, newValue, options);
    } catch (error) {
      this.log('Update data failed', key, error);
      return false;
    }
  }

  /**
   * Sets data only if key doesn't exist
   */
  setIfNotExists<T = any>(
    key: string,
    value: T,
    options: {
      encrypt?: boolean;
      ttlMinutes?: number;
    } = {}
  ): boolean {
    if (!this.hasKey(key)) {
      return this.setData(key, value, options);
    }
    return false;
  }

  /**
   * Gets storage configuration
   */
  getConfig(): Required<StorageConfig> {
    return { ...this.config };
  }

  /**
   * Gets the current storage type
   */
  getStorageType(): StorageType {
    return this.config.storageType;
  }

  /**
   * Switches storage type (creates a new instance)
   */
  static withStorageType(
    config: Partial<StorageConfig> & { storageType: StorageType }
  ): NgStorageService {
    return new NgStorageService(config);
  }

  /**
   * Creates a localStorage instance
   */
  static localStorage(
    config: Partial<Omit<StorageConfig, 'storageType'>> = {}
  ): NgStorageService {
    return new NgStorageService({ ...config, storageType: 'localStorage' });
  }

  /**
   * Creates a sessionStorage instance
   */
  static sessionStorage(
    config: Partial<Omit<StorageConfig, 'storageType'>> = {}
  ): NgStorageService {
    return new NgStorageService({ ...config, storageType: 'sessionStorage' });
  }

  /**
   * Checks if storage is supported
   */
  isStorageSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Forces cleanup of expired items
   */
  cleanup(): number {
    const initialStats = this.getStorageStats();
    this.cleanupExpiredItems();
    const finalStats = this.getStorageStats();

    const removedCount = initialStats.totalItems - finalStats.totalItems;
    this.log('Manual cleanup completed', '', { removedCount });

    return removedCount;
  }

  /**
   * Destroys all subscriptions and cleanup
   */
  destroy(): void {
    this._changeSubject.complete();
    this._keyChangeSubjects.forEach((subject) => subject.complete());
    this._keyChangeSubjects.clear();
  }
}
