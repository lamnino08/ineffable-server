// languages.d.ts
type NestedKeys<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${NestedKeys<T[K]>}` : never }[keyof T]
  : "";

import en from "./languages/en.json"; 
export type TranslationKeys = NestedKeys<typeof en>;
