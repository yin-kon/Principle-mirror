/** lz-string 1.5.0 未随包提供类型声明，本地补最小契约（仅用到的方法）。 */
declare module 'lz-string' {
  export function compressToBase64(input: string): string
  export function decompressFromBase64(input: string): string | null
  export function compressToEncodedURIComponent(input: string): string
  export function decompressFromEncodedURIComponent(input: string): string | null
}
