export async function register() {
  const { loadLocalEnv } = await import("@/lib/load-local-env");
  loadLocalEnv();
}
