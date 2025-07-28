import { FileHandler } from './file-handler';
import { TempFileManager } from './temp-file-manager';
import { StreamProcessor } from './stream-processor';

/**
 * 使用示例
 */
export class UsageExamples {
  /**
   * 示例1: 直接处理文件路径
   */
  static async example1() {
    // AI IDE 提供文件路径而不是base64
    const filePath = '/path/to/uploaded/file.jpg';
    
    try {
      const result = await FileHandler.processFileByPath(filePath);
      console.log('处理结果:', result);
    } catch (error) {
      console.error('处理失败:', error);
    }
  }

  /**
   * 示例2: 处理大文件
   */
  static async example2() {
    const largeFilePath = '/path/to/large/file.zip';
    
    try {
      // 流式读取，避免内存溢出
      const buffer = await FileHandler.processLargeFile(largeFilePath, 2 * 1024 * 1024); // 2MB chunks
      console.log(`大文件处理完成，总大小: ${buffer.length} 字节`);
    } catch (error) {
      console.error('大文件处理失败:', error);
    }
  }

  /**
   * 示例3: 临时文件管理
   */
  static async example3() {
    // 如果必须使用buffer，至少要高效管理
    const fileBuffer = Buffer.from('文件内容');
    
    try {
      const tempPath = await TempFileManager.saveTempFile(fileBuffer, 'example.txt');
      console.log(`临时文件保存至: ${tempPath}`);
      
      // 处理临时文件
      const result = await FileHandler.processFileByPath(tempPath);
      console.log('处理结果:', result);
    } catch (error) {
      console.error('临时文件处理失败:', error);
    }
  }

  /**
   * 示例4: 流式处理
   */
  static async example4() {
    const inputPath = '/path/to/input.txt';
    const outputPath = '/path/to/output.txt';
    
    try {
      // 流式复制文件
      await StreamProcessor.processFileStream(inputPath, outputPath);
      
      // 分块读取
      await StreamProcessor.readFileInChunks(inputPath, 1024, (chunk, index) => {
        console.log(`处理第 ${index} 块，大小: ${chunk.length} 字节`);
      });
    } catch (error) {
      console.error('流式处理失败:', error);
    }
  }
}