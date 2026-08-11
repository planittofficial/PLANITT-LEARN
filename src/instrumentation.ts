export async function register() {
  // load-local-env uses node:fs — must not run in the Edge runtime bundle.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { loadLocalEnv } = await import("@/lib/load-local-env");
    loadLocalEnv();
  }
}
