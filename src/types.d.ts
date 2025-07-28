declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }
  
  function convert(options: ConvertOptions): Promise<Buffer>;
  export = convert;
}

declare module 'to-ico' {
  function toIco(buffers: Buffer[]): Promise<Buffer>;
  export = toIco;
}

declare module 'psd' {
  interface PSDImage {
    toPng(): Buffer;
  }
  
  interface PSD {
    parse(): void;
    image: PSDImage;
  }
  
  export function fromFile(path: string): PSD;
}