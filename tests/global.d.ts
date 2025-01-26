declare module "cloudflare:test" {
  interface ProvidedEnv {
    test: DurableObjectNamespace<import("./worker.ts").TestDurableObject>;
  }
}
