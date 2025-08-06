export class CryptoUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 128; // 128 bits authentication tag

  private static encryptionKey: CryptoKey | null = null;
  private static keyPromise: Promise<CryptoKey> | null = null;

  /**
   * Derives a consistent key from a password using PBKDF2
   */
  private static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Gets or creates the encryption key
   */
  private static async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    if (this.keyPromise) {
      return this.keyPromise;
    }

    this.keyPromise = this.createEncryptionKey();
    this.encryptionKey = await this.keyPromise;
    return this.encryptionKey;
  }

  /**
   * Creates a new encryption key or derives from stored salt
   */
  private static async createEncryptionKey(): Promise<CryptoKey> {
    const keyIdentifier = '__ng_storage_key_salt__';
    let salt: Uint8Array;

    // Try to get existing salt from localStorage
    try {
      const existingSalt = localStorage.getItem(keyIdentifier);
      if (existingSalt) {
        salt = new Uint8Array(JSON.parse(existingSalt));
      } else {
        // Generate new salt
        salt = crypto.getRandomValues(new Uint8Array(32));
        localStorage.setItem(keyIdentifier, JSON.stringify(Array.from(salt)));
      }
    } catch {
      // Fallback to generated salt if localStorage is not available
      salt = crypto.getRandomValues(new Uint8Array(32));
    }

    // Use a default password - in production, you might want to make this configurable
    const password = 'ngx-storage-default-key-2024';

    return this.deriveKey(password, salt);
  }

  /**
   * Encrypts data using AES-GCM
   */
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH,
        },
        key,
        dataBuffer
      );

      // Combine IV and encrypted data
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const combined = new Uint8Array(iv.length + encryptedArray.length);
      combined.set(iv);
      combined.set(encryptedArray, iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      throw new Error(
        `Encryption failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Decrypts data using AES-GCM
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();

      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map((char) => char.charCodeAt(0))
      );

      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const encryptedBuffer = combined.slice(this.IV_LENGTH);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH,
        },
        key,
        encryptedBuffer
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      throw new Error(
        `Decryption failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Checks if Web Crypto API is available
   */
  static isSupported(): boolean {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.subtle.encrypt === 'function'
    );
  }

  /**
   * Clears the cached encryption key (useful for testing or key rotation)
   */
  static clearKey(): void {
    this.encryptionKey = null;
    this.keyPromise = null;
  }
}
