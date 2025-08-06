import { Provider } from '@angular/core';
import {
  DEFAULT_STORAGE_FLAGS,
  NamedStorageConfig,
  STORAGE_FLAGS,
  STORAGE_NAMED_OPTIONS,
  STORAGE_OPTIONS,
  StorageConfig,
  StorageFlags,
} from './ngx-storage.model';
import { NgxStorageService } from './ngx-storage.service';

export function provideNgxStorage<T = any>(
  optionsFactory: () => StorageConfig,
  flags: StorageFlags = {}
): Provider[] {
  return [
    NgxStorageService,
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
 * Provides multiple named NgxStorageService instances
 */
export function provideNamedNgxStorage(
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
