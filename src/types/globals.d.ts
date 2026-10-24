/**
 * Ambient global declarations for testing environments and browser globals.
 */
declare global {
  // Flag used by React 19 testing environments to suppress act() warnings
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

export {};
