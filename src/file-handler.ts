import * as fs from 'fs';
import * as path from 'path';

/**
 * 高效文件处理器 - 避免base64编码
 */
export class FileHandler {
  /**
   * 直接通过文件路径处理文件
   * @param filePath 文件绝对路径
   */
  static async processFileByPath(filePath: string) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      // 获取文件信息
      const stats = fs.statSync(filePath);
      const fileInfo = {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        extension: path.extname(filePath),
        lastModified: stats.mtime
      };

      console.log('文件信息:', fileInfo);
      
      // 根据文件类型选择处理方式
      if (this.isImageFile(filePath)) {
        return await this.processImage(filePath);
      } else if (this.isTextFile(filePath)) {
        return await this.processTextFile(filePath);
      } else {
        return await this.processBinaryFile(filePath);
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      throw error;
    }
  }

  /**
   * 流式读取大文件
   */
  static async processLargeFile(filePath: string, chunkSize: number = 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => {
        chunks.push(chunk);
        console.log(`已读取 ${chunk.length} 字节`);
      });

      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      stream.on('error', reject);
    });
  }

  /**
   * 检查是否为图片文件
   */
  private static isImageFile(filePath: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff'];
    return imageExtensions.includes(path.extname(filePath).toLowerCase());
  }

  /**
   * 检查是否为文本文件
   */
  private static isTextFile(filePath: string): boolean {
    const textExtensions = ['.txt', '.json', '.xml', '.csv', '.md', '.js', '.ts', '.html', '.css'];
    return textExtensions.includes(path.extname(filePath).toLowerCase());
  }

  /**
   * 处理图片文件
   */
  private static async processImage(filePath: string) {
    // 直接返回文件路径，让图片处理库直接读取
    return {
      type: 'image',
      path: filePath,
      // 可以添加图片元数据提取
      metadata: await this.getImageMetadata(filePath)
    };
  }

  /**
   * 处理文本文件
   */
  private static async processTextFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return {
      type: 'text',
      path: filePath,
      content: content,
      encoding: 'utf-8'
    };
  }

  /**
   * 处理二进制文件
   */
  private static async processBinaryFile(filePath: string) {
    return {
      type: 'binary',
      path: filePath,
      // 只返回路径，需要时再读取
      size: fs.statSync(filePath).size
    };
  }

  /**
   * 获取图片元数据（示例）
   */
  private static async getImageMetadata(filePath: string) {
    // 这里可以使用 sharp 或其他库获取图片信息
    return {
      format: path.extname(filePath).slice(1),
      size: fs.statSync(filePath).size
    };
  }
}