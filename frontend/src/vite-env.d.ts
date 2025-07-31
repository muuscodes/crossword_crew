/// <reference types="vite/client" />
import "vite";

declare module "vite" {
  interface UserConfig {
    test?: {
      globals?: boolean;
      environment?: string;
      setupFiles?: string;
    };
  }
}
