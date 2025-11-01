// Secure token storage with encryption
const STORAGE_KEY = 'auth_data';
const ENCRYPTION_KEY = 'soko_safi_2024'; // In production, use env variable

// Simple XOR encryption (production should use Web Crypto API)
const encrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

const decrypt = (encrypted, key) => {
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return null;
  }
};

export const secureStorage = {
  setToken: (token) => {
    const data = { token, timestamp: Date.now() };
    const encrypted = encrypt(JSON.stringify(data), ENCRYPTION_KEY);
    localStorage.setItem(STORAGE_KEY, encrypted);
  },
  
  getToken: () => {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    
    const decrypted = decrypt(encrypted, ENCRYPTION_KEY);
    if (!decrypted) return null;
    
    try {
      const data = JSON.parse(decrypted);
      return data.token;
    } catch {
      return null;
    }
  },
  
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('user');
  }
};