/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string
  readonly VITE_ROLE?: 'admin' | 'user'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
