// Global type shims for the project

declare module "lucide-react" {
  export const AlertCircle: any;
  export const AlertTriangle: any;
  export const Info: any;
  export const XCircle: any;
  export const RefreshCw: any;
}

declare const process: {
  env: {
    NODE_ENV: "development" | "production" | string;
    [key: string]: string | undefined;
  };
};

export {};
