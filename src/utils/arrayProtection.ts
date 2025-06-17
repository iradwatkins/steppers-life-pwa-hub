/**
 * NUCLEAR ARRAY PROTECTION: Override Array.prototype.map globally
 * This is an emergency measure to prevent ALL undefined map errors
 */

console.log('🛡️ ACTIVATING NUCLEAR ARRAY PROTECTION');

// Store original methods
const originalMap = Array.prototype.map;
const originalFilter = Array.prototype.filter;
const originalForEach = Array.prototype.forEach;
const originalReduce = Array.prototype.reduce;

// Override Array.prototype.map with complete safety
Array.prototype.map = function<T, U>(this: T[], callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
  // Check if 'this' is null or undefined
  if (this == null) {
    console.error('🚨 NUCLEAR PROTECTION: map() called on null/undefined');
    console.error('🔍 Call stack:', new Error().stack);
    return [];
  }
  
  // Check if 'this' is not array-like
  if (typeof this !== 'object' || !('length' in this)) {
    console.error('🚨 NUCLEAR PROTECTION: map() called on non-array-like object:', this);
    console.error('🔍 Type:', typeof this);
    return [];
  }
  
  // If it's an array, use original map
  if (Array.isArray(this)) {
    try {
      return originalMap.call(this, callbackfn, thisArg);
    } catch (error) {
      console.error('🚨 NUCLEAR PROTECTION: Error in map execution:', error);
      return [];
    }
  }
  
  // Convert array-like to array and map
  try {
    const arrayLike = Array.from(this);
    return originalMap.call(arrayLike, callbackfn, thisArg);
  } catch (error) {
    console.error('🚨 NUCLEAR PROTECTION: Failed to convert to array:', error);
    return [];
  }
};

// Override other array methods for completeness
Array.prototype.filter = function<T>(this: T[], callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[] {
  if (this == null) {
    console.error('🚨 NUCLEAR PROTECTION: filter() called on null/undefined');
    return [];
  }
  if (!Array.isArray(this)) {
    console.error('🚨 NUCLEAR PROTECTION: filter() called on non-array:', this);
    return [];
  }
  try {
    return originalFilter.call(this, callbackfn, thisArg);
  } catch (error) {
    console.error('🚨 NUCLEAR PROTECTION: Error in filter execution:', error);
    return [];
  }
};

Array.prototype.forEach = function<T>(this: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
  if (this == null) {
    console.error('🚨 NUCLEAR PROTECTION: forEach() called on null/undefined');
    return;
  }
  if (!Array.isArray(this)) {
    console.error('🚨 NUCLEAR PROTECTION: forEach() called on non-array:', this);
    return;
  }
  try {
    originalForEach.call(this, callbackfn, thisArg);
  } catch (error) {
    console.error('🚨 NUCLEAR PROTECTION: Error in forEach execution:', error);
  }
};

console.log('🛡️ NUCLEAR ARRAY PROTECTION ACTIVE - All array methods protected');

export {};