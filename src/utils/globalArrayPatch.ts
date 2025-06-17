/**
 * EMERGENCY PATCH: Override Array.prototype.map to prevent production crashes
 * This is a last resort to catch any remaining unsafe map operations
 */

// Store the original map function
const originalMap = Array.prototype.map;

// Override Array.prototype.map with safety checks
Array.prototype.map = function(this: any, ...args: any[]) {
  // If this is null or undefined, return empty array instead of crashing
  if (this == null) {
    console.error('🚨 EMERGENCY PATCH: map() called on null/undefined:', this);
    console.trace('Stack trace for map() on null/undefined');
    return [];
  }
  
  // If this is not array-like, return empty array
  if (typeof this !== 'object' || typeof this.length !== 'number') {
    console.error('🚨 EMERGENCY PATCH: map() called on non-array-like object:', this);
    console.trace('Stack trace for map() on non-array');
    return [];
  }
  
  // Call the original map function
  try {
    return originalMap.apply(this, args);
  } catch (error) {
    console.error('🚨 EMERGENCY PATCH: map() threw error:', error);
    console.error('🚨 Context:', { this: this, args: args });
    console.trace('Stack trace for map() error');
    return [];
  }
};

console.log('🛡️ EMERGENCY ARRAY MAP PATCH ACTIVATED');

export {};