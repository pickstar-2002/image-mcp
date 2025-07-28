import sharp from 'sharp';
import Jimp from 'jimp';
import { promises as fs } from 'fs';
import path from 'path';

export interface ConvertImageOptions {
  input_path: string;
  output_format: string;
  quality?: number;
  width?: number;
  height?: number;
  maintain_aspect_ratio?: boolean;
  output_path?: string;
}

export interface BatchConvertOptions {
  input_paths: string[];
  output_format: string;
  quality?: number;
  width?: number;
  height?: number;
  maintain_aspect_ratio?: boolean;
  output_directory?: string;
}

export interface ConvertResult {
  output_path: string;
  file_size: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
}

export interface BatchConvertResult {
  success: boolean;
  output_path?: string;
  error?: string;
}

export interface ImageInfo {
  format: string;
  width: number;
  height: number;
  channels: number;
  size: number;
  space?: string;
}

export class ImageConverter {
  private supportedInputFormats = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 
    'webp', 'svg', 'ico', 'psd', 'heic', 'heif', 'avif'
  ];

  private supportedOutputFormats = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 
    'svg', 'ico', 'avif'
  ];

  constructor() {}

  /**
   * 转换单个图片
   */
  async convertImage(options: ConvertImageOptions): Promise<ConvertResult> {
    const { input_path, output_format, quality, width, height, maintain_aspect_ratio = true, output_path } = options;

    // 验证输入文件是否存在
    try {
      await fs.access(input_path);
    } catch {
      throw new Error(`输入文件不存在: ${input_path}`);
    }

    // 验证输出格式
    const normalizedFormat = output_format.toLowerCase().replace('.', '');
    if (!this.supportedOutputFormats.includes(normalizedFormat)) {
      throw new Error(`不支持的输出格式: ${output_format}`);
    }

    // 生成输出路径
    const finalOutputPath = output_path || this.generateOutputPath(input_path, normalizedFormat);

    // 确保输出目录存在
    const outputDir = path.dirname(finalOutputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // 检查输入格式
    const inputFormat = this.getFileFormat(input_path);
    
    // 验证输入格式是否支持
    if (!this.supportedInputFormats.includes(inputFormat)) {
      throw new Error(`不支持的输入格式: ${inputFormat}`);
    }

    // 对于特殊格式的处理说明
    if (inputFormat === 'heic' || inputFormat === 'heif') {
      try {
        // Sharp 0.32+ 支持HEIC，但需要libvips支持
        await sharp(input_path).metadata();
      } catch {
        throw new Error(`HEIC/HEIF格式需要系统支持libvips，请先转换为JPG或PNG格式`);
      }
    } else if (inputFormat === 'psd') {
      throw new Error(`PSD格式暂不支持，请使用Photoshop导出为JPG或PNG格式`);
    }

    try {
      let sharpInstance = sharp(input_path);

      // 调整尺寸
      if (width || height) {
        const resizeOptions: sharp.ResizeOptions = {
          fit: maintain_aspect_ratio ? 'inside' : 'fill',
          withoutEnlargement: false
        };

        if (width && height) {
          sharpInstance = sharpInstance.resize(width, height, resizeOptions);
        } else if (width) {
          sharpInstance = sharpInstance.resize(width, undefined, resizeOptions);
        } else if (height) {
          sharpInstance = sharpInstance.resize(undefined, height, resizeOptions);
        }
      }

      // 根据格式设置输出选项
      switch (normalizedFormat) {
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: quality || 90 });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: quality || 90 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: quality || 90 });
          break;
        case 'gif':
          // Sharp不直接支持GIF输出，使用Jimp
          return await this.convertWithJimp(input_path, finalOutputPath, normalizedFormat, { width, height, quality });
        case 'bmp':
          // 使用Jimp处理BMP
          return await this.convertWithJimp(input_path, finalOutputPath, normalizedFormat, { width, height, quality });
        case 'tiff':
          sharpInstance = sharpInstance.tiff({ quality: quality || 90 });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: quality || 90 });
          break;
        case 'ico':
          // ICO格式需要特殊处理
          return await this.convertToIco(input_path, finalOutputPath, { width: width || 32, height: height || 32 });
        case 'svg':
          // SVG格式转换
          return await this.convertToSvg(input_path, finalOutputPath, { width, height });
        default:
          throw new Error(`暂不支持转换为格式: ${normalizedFormat}`);
      }

      // 执行转换
      await sharpInstance.toFile(finalOutputPath);

      // 获取结果信息
      const stats = await fs.stat(finalOutputPath);
      const metadata = await sharp(finalOutputPath).metadata();

      return {
        output_path: finalOutputPath,
        file_size: stats.size,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        },
        format: normalizedFormat
      };

    } catch (error) {
      throw new Error(`图片转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 批量转换图片
   */
  async batchConvertImages(options: BatchConvertOptions): Promise<BatchConvertResult[]> {
    const { input_paths, output_format, quality, width, height, maintain_aspect_ratio, output_directory } = options;
    const results: BatchConvertResult[] = [];

    for (const inputPath of input_paths) {
      try {
        const outputPath = output_directory 
          ? path.join(output_directory, this.generateOutputFilename(inputPath, output_format))
          : this.generateOutputPath(inputPath, output_format);

        await this.convertImage({
          input_path: inputPath,
          output_format,
          quality,
          width,
          height,
          maintain_aspect_ratio,
          output_path: outputPath
        });

        results.push({
          success: true,
          output_path: outputPath
        });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(imagePath: string): Promise<ImageInfo> {
    try {
      await fs.access(imagePath);
      const stats = await fs.stat(imagePath);
      const metadata = await sharp(imagePath).metadata();

      return {
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        channels: metadata.channels || 0,
        size: stats.size,
        space: metadata.space
      };
    } catch (error) {
      throw new Error(`无法获取图片信息: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取支持的格式列表
   */
  getSupportedFormats() {
    return {
      input: this.supportedInputFormats,
      output: this.supportedOutputFormats
    };
  }

  /**
   * 使用Jimp进行转换（用于Sharp不支持的格式）
   */
  private async convertWithJimp(inputPath: string, outputPath: string, format: string, options: any): Promise<ConvertResult> {
    try {
      let image = await Jimp.read(inputPath);

      // 调整尺寸
      if (options.width || options.height) {
        if (options.width && options.height) {
          image = image.resize(options.width, options.height);
        } else if (options.width) {
          image = image.resize(options.width, Jimp.AUTO);
        } else if (options.height) {
          image = image.resize(Jimp.AUTO, options.height);
        }
      }

      // 设置质量
      if (options.quality && (format === 'jpg' || format === 'jpeg')) {
        image = image.quality(options.quality);
      }

      await image.writeAsync(outputPath);

      const stats = await fs.stat(outputPath);
      
      return {
        output_path: outputPath,
        file_size: stats.size,
        dimensions: {
          width: image.getWidth(),
          height: image.getHeight()
        },
        format
      };
    } catch (error) {
      throw new Error(`Jimp转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 转换为SVG格式
   */
  private async convertToSvg(inputPath: string, outputPath: string, options: { width?: number; height?: number }): Promise<ConvertResult> {
    try {
      // 获取原始图片信息
      const metadata = await sharp(inputPath).metadata();
      const originalWidth = metadata.width || 800;
      const originalHeight = metadata.height || 600;
      
      // 使用指定尺寸或原始尺寸
      const svgWidth = options.width || originalWidth;
      const svgHeight = options.height || originalHeight;
      
      // 将图片转换为base64
      const imageBuffer = await sharp(inputPath)
        .resize(svgWidth, svgHeight, { fit: 'fill' })
        .png()
        .toBuffer();
      
      const base64Image = imageBuffer.toString('base64');
      
      // 创建SVG内容
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image x="0" y="0" width="${svgWidth}" height="${svgHeight}" xlink:href="data:image/png;base64,${base64Image}"/>
</svg>`;

      // 写入SVG文件
      await fs.writeFile(outputPath, svgContent, 'utf8');
      
      const stats = await fs.stat(outputPath);
      
      return {
        output_path: outputPath,
        file_size: stats.size,
        dimensions: {
          width: svgWidth,
          height: svgHeight
        },
        format: 'svg'
      };
    } catch (error) {
      throw new Error(`SVG转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 转换为ICO格式（简化版本）
   */
  private async convertToIco(inputPath: string, outputPath: string, options: { width: number; height: number }): Promise<ConvertResult> {
    try {
      // 先转换为PNG，然后重命名为ICO（简化处理）
      const tempPngPath = outputPath.replace('.ico', '.png');
      
      await sharp(inputPath)
        .resize(options.width, options.height, { fit: 'fill' })
        .png()
        .toFile(tempPngPath);

      // 将PNG重命名为ICO
      await fs.rename(tempPngPath, outputPath);

      const stats = await fs.stat(outputPath);
      
      return {
        output_path: outputPath,
        file_size: stats.size,
        dimensions: {
          width: options.width,
          height: options.height
        },
        format: 'ico'
      };
    } catch (error) {
      throw new Error(`ICO转换失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取文件格式
   */
  private getFileFormat(filePath: string): string {
    return path.extname(filePath).toLowerCase().replace('.', '');
  }

  /**
   * 生成输出文件路径
   */
  private generateOutputPath(inputPath: string, outputFormat: string): string {
    const dir = path.dirname(inputPath);
    const name = path.parse(inputPath).name;
    return path.join(dir, `${name}_converted.${outputFormat}`);
  }

  /**
   * 生成输出文件名
   */
  private generateOutputFilename(inputPath: string, outputFormat: string): string {
    const name = path.parse(inputPath).name;
    return `${name}_converted.${outputFormat}`;
  }
}