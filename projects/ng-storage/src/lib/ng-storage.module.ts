import { Provider } from '@angular/core';
import {
  DEFAULT_STORAGE_FLAGS,
  NamedStorageConfig,
  STORAGE_FLAGS,
  STORAGE_NAMED_OPTIONS,
  STORAGE_OPTIONS,
  StorageConfig,
  StorageFlags,
} from './ng-storage.model';
import { NgStorageService } from './ng-storage.service';

export function provideNgStorage<T = any>(
  optionsFactory: () => StorageConfig,
  flags: StorageFlags = {}
): Provider[] {
  return [
    NgStorageService,
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
 * Provides multiple named NgStorageService instances
 */
export function provideNamedNgStorage(
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
