/**
 * Safe array helpers to prevent map errors
 */

// Override Array.prototype.map globally to be safer
declare global {
  interface Array<T> {
    safeMap<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
  }
}

// Add a safe map method to Array prototype
if (typeof Array.prototype.safeMap === 'undefined') {
  Array.prototype.safeMap = function<T, U>(
    this: T[], 
    callbackfn: (value: T, index: number, array: T[]) => U, 
    thisArg?: any
  ): U[] {
    if (!this || !Array.isArray(this)) {
      console.warn('safeMap called on non-array:', this);
      return [];
    }
    return this.map(callbackfn, thisArg);
  };
}

/**
 * Ensures a value is an array, returns empty array if undefined/null
 */
export const ensureArray = <T>(value: T[] | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  // If it's not an array but has length property, try to convert
  if (typeof value === 'object' && 'length' in value) {
    return Array.from(value as ArrayLike<T>);
  }
  return [];
};

/**
 * Safe map function that handles undefined/null arrays
 */
export const safeMap = <T, U>(
  array: T[] | undefined | null,
  mapFn: (item: T, index: number, array: T[]) => U
): U[] => {
  const safeArray = ensureArray(array);
  return safeArray.map(mapFn);
};

/**
 * Safe filter function that handles undefined/null arrays
 */
export const safeFilter = <T>(
  array: T[] | undefined | null,
  filterFn: (item: T, index: number, array: T[]) => boolean
): T[] => {
  const safeArray = ensureArray(array);
  return safeArray.filter(filterFn);
};

/**
 * Safe forEach function that handles undefined/null arrays
 */
export const safeForEach = <T>(
  array: T[] | undefined | null,
  forEachFn: (item: T, index: number, array: T[]) => void
): void => {
  const safeArray = ensureArray(array);
  safeArray.forEach(forEachFn);
};

export default {
  ensureArray,
  safeMap,
  safeFilter,
  safeForEach
};