import { InjectionToken } from '@angular/core';

export type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiry?: number;
  encrypted?: boolean;
}

export interface StorageConfig {
  prefix?: string;
  defaultTTL?: number; // in minutes
  enableLogging?: boolean;
  caseSensitive?: boolean;
  storageType?: StorageType;
}

export interface NamedStorageConfig {
  [name: string]: StorageConfig;
}

export interface StorageFlags {
  autoCleanup?: boolean;
  strictMode?: boolean;
  enableMetrics?: boolean;
}

export interface StorageStats {
  totalItems: number;
  totalSize: number; // in bytes
  availableSpace: number;
  items: Array<{
    key: string;
    size: number;
    timestamp: number;
    hasExpiry: boolean;
  }>;
}

export interface StorageChangeEvent<T = any> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  action: 'set' | 'remove' | 'clear' | 'expire';
  timestamp: number;
}

// Injection Tokens
export const STORAGE_OPTIONS = new InjectionToken<StorageConfig>(
  'StorageOptions'
);
export const STORAGE_NAMED_OPTIONS = new InjectionToken<NamedStorageConfig>(
  'StorageNamedOptions'
);
export const STORAGE_FLAGS = new InjectionToken<StorageFlags>('StorageFlags');

// Default Configuration
export const DEFAULT_STORAGE_CONFIG: Required<StorageConfig> = {
  prefix: 'ngx-browser-storage',
  defaultTTL: 0,
  enableLogging: false,
  caseSensitive: false,
  storageType: 'sessionStorage',
};

export const DEFAULT_STORAGE_FLAGS: Required<StorageFlags> = {
  autoCleanup: true,
  strictMode: false,
  enableMetrics: false,
};
