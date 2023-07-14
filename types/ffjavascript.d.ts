declare module 'ffjavascript' {
  export function getCurveFromName(name: string): Promise<{ terminate: () => Promise<void> }>;
}
