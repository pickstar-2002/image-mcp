import * as fs from 'fs';
import { Transform, Readable } from 'stream';
import { pipeline } from 'stream/promises';

/**
 * 流式文件处理器
 */
export class StreamProcessor {
  /**
   * 流式处理文件，避免一次性加载到内存
   */
  static async processFileStream(
    inputPath: string,
    outputPath: string,
    transformer?: Transform
  ) {
    try {
      const readStream = fs.createReadStream(inputPath);
      const writeStream = fs.createWriteStream(outputPath);

      if (transformer) {
        await pipeline(readStream, transformer, writeStream);
      } else {
        await pipeline(readStream, writeStream);
      }

      console.log(`文件流式处理完成: ${inputPath} -> ${outputPath}`);
    } catch (error) {
      console.error('流式处理失败:', error);
      throw error;
    }
  }

  /**
   * 创建文件读取流
   */
  static createFileReadStream(filePath: string, options?: {
    chunkSize?: number;
    start?: number;
    end?: number;
  }) {
    const streamOptions: any = {};
    
    if (options?.chunkSize) {
      streamOptions.highWaterMark = options.chunkSize;
    }
    if (options?.start !== undefined) {
      streamOptions.start = options.start;
    }
    if (options?.end !== undefined) {
      streamOptions.end = options.end;
    }

    return fs.createReadStream(filePath, streamOptions);
  }

  /**
   * 分块读取文件
   */
  static async readFileInChunks(
    filePath: string,
    chunkSize: number = 1024 * 1024,
    onChunk?: (chunk: Buffer, index: number) => void
  ) {
    const stream = this.createFileReadStream(filePath, { chunkSize });
    let chunkIndex = 0;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        if (onChunk) {
          onChunk(chunk, chunkIndex++);
        }
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', reject);
    });
  }
}