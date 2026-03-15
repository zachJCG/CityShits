// Shim for expo-sqlite on web — prevents WASM bundling errors.
// The actual web data layer uses web-store.tsx (React Context + in-memory).
// This file is only loaded because Metro bundles native route files
// alongside .web.tsx files; none of this code actually executes on web.

export function useSQLiteContext(): never {
  throw new Error('expo-sqlite is not available on web. Use useWebStore instead.');
}

export function SQLiteProvider({ children }: { children: React.ReactNode }) {
  return children;
}

import React from 'react';
export default { useSQLiteContext, SQLiteProvider };
