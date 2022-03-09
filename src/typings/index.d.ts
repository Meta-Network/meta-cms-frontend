import type { Vditor } from 'vditor/dist/index.d';

declare global {
  interface Window {
    vditor: Vditor;
  }
}
