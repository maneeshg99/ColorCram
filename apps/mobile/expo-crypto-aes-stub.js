// Stub for ExpoCryptoAES native module which crashes in Expo Go.
// expo-auth-session depends on expo-crypto but never uses AES features.
// aes/index.js extends EncryptionKey and SealedData, so we must provide
// real classes (not a plain object) to avoid "Super expression must either
// be null or a function".
class EncryptionKey {}
class SealedData {
  static fromParts() { return new SealedData(); }
  static fromCombined() { return new SealedData(); }
}

export default {
  EncryptionKey,
  SealedData,
  encryptAsync() { throw new Error('AES not available in Expo Go'); },
  decryptAsync() { throw new Error('AES not available in Expo Go'); },
};
