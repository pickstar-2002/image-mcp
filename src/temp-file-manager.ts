import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
 * 临时文件管理器
 */
export class TempFileManager {
  private static tempDir = path.join(os.tmpdir(), 'ai-ide-uploads');

  /**
   * 初始化临时目录
   */
  static init() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 保存上传文件到临时目录
   * @param fileBuffer 文件缓冲区
   * @param originalName 原始文件名
   */
  static async saveTempFile(fileBuffer: Buffer, originalName: string): Promise<string> {
    this.init();
    
    const tempFileName = `${uuidv4()}_${originalName}`;
    const tempFilePath = path.join(this.tempDir, tempFileName);
    
    fs.writeFileSync(tempFilePath, fileBuffer);
    
    // 设置自动清理（30分钟后删除）
    setTimeout(() => {
      this.cleanupFile(tempFilePath);
    }, 30 * 60 * 1000);
    
    return tempFilePath;
  }

  /**
   * 从URL保存文件
   */
  static async saveFromUrl(url: string, fileName?: string): Promise<string> {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    const finalFileName = fileName || path.basename(url) || `download_${Date.now()}`;
    return await this.saveTempFile(buffer, finalFileName);
  }

  /**
   * 清理临时文件
   */
  static cleanupFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`已清理临时文件: ${filePath}`);
      }
    } catch (error) {
      console.error(`清理文件失败: ${error}`);
    }
  }

  /**
   * 清理所有过期临时文件
   */
  static cleanupExpiredFiles(maxAge: number = 24 * 60 * 60 * 1000) {
    if (!fs.existsSync(this.tempDir)) return;

    const files = fs.readdirSync(this.tempDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(this.tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        this.cleanupFile(filePath);
      }
    });
  }
}