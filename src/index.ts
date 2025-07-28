#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ImageConverter } from './converter.js';
import { z } from 'zod';

// 工具参数验证模式
const ConvertImageArgsSchema = z.object({
  input_path: z.string().describe('源图片文件路径'),
  output_format: z.string().describe('目标格式（png/jpg/jpeg/gif/bmp/tiff/webp/svg/ico等）'),
  quality: z.number().min(1).max(100).optional().describe('压缩质量（1-100，仅适用于有损格式）'),
  width: z.number().positive().optional().describe('目标宽度（像素）'),
  height: z.number().positive().optional().describe('目标高度（像素）'),
  maintain_aspect_ratio: z.boolean().default(true).describe('保持宽高比'),
  output_path: z.string().optional().describe('输出文件路径（可选，默认自动生成）')
});

const BatchConvertArgsSchema = z.object({
  input_paths: z.array(z.string()).describe('源图片文件路径数组'),
  output_format: z.string().describe('目标格式'),
  quality: z.number().min(1).max(100).optional().describe('压缩质量'),
  width: z.number().positive().optional().describe('目标宽度'),
  height: z.number().positive().optional().describe('目标高度'),
  maintain_aspect_ratio: z.boolean().default(true).describe('保持宽高比'),
  output_directory: z.string().optional().describe('输出目录（可选）')
});

class ImageConverterMCPServer {
  private server: Server;
  private converter: ImageConverter;

  constructor() {
    this.server = new Server(
      {
        name: 'image-converter-mcp',
        version: '1.0.0',
      }
    );

    this.converter = new ImageConverter();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'convert_image',
            description: '将图片转换为指定格式',
            inputSchema: {
              type: 'object',
              properties: {
                input_path: {
                  type: 'string',
                  description: '源图片文件路径'
                },
                output_format: {
                  type: 'string',
                  description: '目标格式（png/jpg/jpeg/gif/bmp/tiff/webp/svg/ico等）'
                },
                quality: {
                  type: 'number',
                  minimum: 1,
                  maximum: 100,
                  description: '压缩质量（1-100，仅适用于有损格式）'
                },
                width: {
                  type: 'number',
                  minimum: 1,
                  description: '目标宽度（像素）'
                },
                height: {
                  type: 'number',
                  minimum: 1,
                  description: '目标高度（像素）'
                },
                maintain_aspect_ratio: {
                  type: 'boolean',
                  default: true,
                  description: '保持宽高比'
                },
                output_path: {
                  type: 'string',
                  description: '输出文件路径（可选，默认自动生成）'
                }
              },
              required: ['input_path', 'output_format']
            }
          },
          {
            name: 'batch_convert_images',
            description: '批量转换多个图片文件',
            inputSchema: {
              type: 'object',
              properties: {
                input_paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '源图片文件路径数组'
                },
                output_format: {
                  type: 'string',
                  description: '目标格式'
                },
                quality: {
                  type: 'number',
                  minimum: 1,
                  maximum: 100,
                  description: '压缩质量'
                },
                width: {
                  type: 'number',
                  minimum: 1,
                  description: '目标宽度'
                },
                height: {
                  type: 'number',
                  minimum: 1,
                  description: '目标高度'
                },
                maintain_aspect_ratio: {
                  type: 'boolean',
                  default: true,
                  description: '保持宽高比'
                },
                output_directory: {
                  type: 'string',
                  description: '输出目录'
                }
              },
              required: ['input_paths', 'output_format']
            }
          },
          {
            name: 'get_image_info',
            description: '获取图片文件信息',
            inputSchema: {
              type: 'object',
              properties: {
                image_path: {
                  type: 'string',
                  description: '图片文件路径'
                }
              },
              required: ['image_path']
            }
          },
          {
            name: 'list_supported_formats',
            description: '列出支持的图片格式',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'convert_image': {
            const validatedArgs = ConvertImageArgsSchema.parse(args);
            const result = await this.converter.convertImage(validatedArgs);
            return {
              content: [
                {
                  type: 'text',
                  text: `图片转换成功！\n输出文件：${result.output_path}\n文件大小：${result.file_size} bytes\n图片尺寸：${result.dimensions.width}x${result.dimensions.height}\n格式：${result.format}`
                }
              ]
            };
          }

          case 'batch_convert_images': {
            const validatedArgs = BatchConvertArgsSchema.parse(args);
            const results = await this.converter.batchConvertImages(validatedArgs);
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.length - successCount;
            
            let resultText = `批量转换完成！\n成功：${successCount} 个文件\n失败：${failureCount} 个文件\n\n`;
            
            results.forEach((result, index) => {
              if (result.success) {
                resultText += `✓ ${validatedArgs.input_paths[index]} -> ${result.output_path}\n`;
              } else {
                resultText += `✗ ${validatedArgs.input_paths[index]}: ${result.error}\n`;
              }
            });

            return {
              content: [
                {
                  type: 'text',
                  text: resultText
                }
              ]
            };
          }

          case 'get_image_info': {
            const { image_path } = args as { image_path: string };
            const info = await this.converter.getImageInfo(image_path);
            return {
              content: [
                {
                  type: 'text',
                  text: `图片信息：\n文件路径：${image_path}\n格式：${info.format}\n尺寸：${info.width}x${info.height}\n文件大小：${info.size} bytes\n颜色通道：${info.channels}\n颜色空间：${info.space || '未知'}`
                }
              ]
            };
          }

          case 'list_supported_formats': {
            const formats = this.converter.getSupportedFormats();
            return {
              content: [
                {
                  type: 'text',
                  text: `支持的图片格式：\n输入格式：${formats.input.join(', ')}\n输出格式：${formats.output.join(', ')}`
                }
              ]
            };
          }

          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('图片转换MCP服务器已启动');
  }
}

// 启动服务器
const server = new ImageConverterMCPServer();
server.run().catch(console.error);