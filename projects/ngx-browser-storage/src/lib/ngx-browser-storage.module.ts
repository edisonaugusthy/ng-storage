import { Provider } from '@angular/core';
import {
  DEFAULT_STORAGE_FLAGS,
  NamedStorageConfig,
  STORAGE_FLAGS,
  STORAGE_NAMED_OPTIONS,
  STORAGE_OPTIONS,
  StorageConfig,
  StorageFlags,
} from './ngx-browser-storage.model';
import { NgxBrowserStorageService } from './ngx-browser-storage.service';

export function provideNgxBrowserStorage<T = any>(
  optionsFactory: () => StorageConfig,
  flags: StorageFlags = {}
): Provider[] {
  return [
    NgxBrowserStorageService,
    {
      provide: STORAGE_OPTIONS,
      useFactory: optionsFactory,
    },
    {
      provide: STORAGE_FLAGS,
      useValue: { ...DEFAULT_STORAGE_FLAGS, ...flags },
    },
  ];
}

/**
 * Provides multiple named NgxBrowserStorageService instances
 */
export function provideNamedNgxBrowserStorage(
  optionsFactory: () => NamedStorageConfig,
  flags: StorageFlags = {}
): Provider[] {
  return [
    {
      provide: STORAGE_NAMED_OPTIONS,
      useFactory: optionsFactory,
    },
    {
      provide: STORAGE_FLAGS,
      useValue: { ...DEFAULT_STORAGE_FLAGS, ...flags },
    },
  ];
}
