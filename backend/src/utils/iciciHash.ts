import crypto from 'crypto';

/**
 * ICICI Payment Gateway Secure Hash Utilities
 * 
 * Implements ICICI Hash Calculation strictly according to:
 * - Step Wise Document for PG Direct integration (Sorted key values concatenation)
 * - Gateway Interface Specification V0.4 (Sorted Key-Value pair and minified JSON V2)
 */

/**
 * Build sorted values concatenated string as specified in Step Wise Document:
 * 1. Filter out null, undefined, empty strings, and 'secureHash' / 'hash'
 * 2. Sort keys alphabetically in ascending order
 * 3. Concatenate values in that sorted order
 */
export function buildSortedValuesConcatenatedString(params: Record<string, any>): string {
  const keys = Object.keys(params)
    .filter((key) => {
      if (key === 'secureHash' || key === 'hash') return false;
      const val = params[key];
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
      return true;
    })
    .sort();

  let concatenated = '';
  for (const key of keys) {
    let val = params[key];
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
    } else {
      val = String(val);
    }
    concatenated += val;
  }

  return concatenated;
}

/**
 * Build sorted key+value concatenated string (Specification V1):
 */
export function buildSortedKeyValueConcatenatedString(params: Record<string, any>): string {
  const keys = Object.keys(params)
    .filter((key) => {
      if (key === 'secureHash' || key === 'hash') return false;
      const val = params[key];
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.trim() === '') return false;
      return true;
    })
    .sort();

  let concatenated = '';
  for (const key of keys) {
    let val = params[key];
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
    } else {
      val = String(val);
    }
    concatenated += `${key}${val}`;
  }

  return concatenated;
}

/**
 * Generate SecureHash according to ICICI Bank specification.
 * Default is sorted values concatenation (Direct integration standard).
 */
export function generateSecureHash(
  data: Record<string, any> | string,
  secretKey: string,
  mode: 'values' | 'keyvalue' | 'v2' | 'v1' = 'values'
): string {
  if (!secretKey) {
    throw new Error('ICICI Secret Key is missing for secureHash generation.');
  }

  let textToHash = '';

  if (mode === 'v2') {
    if (typeof data === 'string') {
      try {
        textToHash = JSON.stringify(JSON.parse(data));
      } catch {
        textToHash = data.trim();
      }
    } else {
      const copy = { ...data };
      delete copy.secureHash;
      delete copy.hash;
      textToHash = JSON.stringify(copy);
    }
  } else if (mode === 'keyvalue' || mode === 'v1') {
    textToHash = typeof data === 'string' ? data : buildSortedKeyValueConcatenatedString(data);
  } else {
    // Default: 'values' sorted concatenation
    textToHash = typeof data === 'string' ? data : buildSortedValuesConcatenatedString(data);
  }

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(textToHash, 'utf8');
  return hmac.digest('hex').toLowerCase();
}

/**
 * Verify SecureHash from ICICI Gateway callback or response.
 */
export function verifySecureHash(
  data: Record<string, any> | string,
  receivedHash: string,
  secretKey: string,
  mode?: 'values' | 'keyvalue' | 'v2' | 'v1'
): boolean {
  if (!receivedHash || !secretKey) {
    return false;
  }

  try {
    if (mode === 'v2') {
      const computed = generateSecureHash(data, secretKey, 'v2');
      return computed.toLowerCase() === receivedHash.toLowerCase();
    }

    // Try both values and keyvalue modes to ensure compatibility with all response types
    const hashValues = generateSecureHash(data, secretKey, 'values');
    const hashKeyValue = generateSecureHash(data, secretKey, 'keyvalue');

    const cleanReceived = receivedHash.toLowerCase();
    if (hashValues.toLowerCase() === cleanReceived || hashKeyValue.toLowerCase() === cleanReceived) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('[ICICI HASH VERIFICATION ERROR]:', err);
    return false;
  }
}

/**
 * Mask sensitive payment data
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'cardNumber', 'cardNo', 'pan', 'cvv', 'cvv2', 'securityCode',
    'secretKey', 'password', 'otp', 'pin', 'token'
  ];

  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(s => lowerKey.includes(s))) {
      if (typeof masked[key] === 'string' && masked[key].length > 4) {
        masked[key] = `****${masked[key].slice(-4)}`;
      } else {
        masked[key] = '******';
      }
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
}
