const appName = "sairi";

export function createLSPMethod(name: string): string {
  return `${appName}/${name}`;
}
