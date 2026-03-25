/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOCAL_BACKEND_URL: string;
  // Add other env variables here as you create them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}