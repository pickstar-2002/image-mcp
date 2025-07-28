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
  input_path: z.string().optional().describe('源图片文件路径'),
  input_data: z.string().optional().describe('图片数据（Buffer或base64字符串）'),
  input_filename: z.string().optional().describe('原始文件名，用于确定格式'),
  output_format: z.string().describe('目标格式（png/jpg/jpeg/gif/bmp/tiff/webp/svg/ico等）'),
  quality: z.number().min(1).max(100).optional().describe('压缩质量（1-100，仅适用于有损格式）'),
  width: z.number().positive().optional().describe('目标宽度（像素）'),
  height: z.number().positive().optional().describe('目标高度（像素）'),
  maintain_aspect_ratio: z.boolean().default(true).describe('保持宽高比'),
  output_path: z.string().optional().describe('输出文件路径（可选，默认自动生成）')
});

const BatchConvertArgsSchema = z.object({
  input_paths: z.array(z.string()).optional().describe('源图片文件路径数组'),
  input_files: z.array(z.object({
    data: z.string().describe('文件数据（Buffer或base64字符串）'),
    filename: z.string().describe('文件名')
  })).optional().describe('上传的文件数据数组'),
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
                  description: '源图片文件路径（与input_data二选一）'
                },
                input_data: {
                  type: 'string',
                  description: '图片数据（Buffer或base64字符串，与input_path二选一）'
                },
                input_filename: {
                  type: 'string',
                  description: '原始文件名，用于确定格式（使用input_data时建议提供）'
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
              required: ['output_format']
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
                  description: '源图片文件路径数组（与input_files二选一）'
                },
                input_files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'string',
                        description: '文件数据（Buffer或base64字符串）'
                      },
                      filename: {
                        type: 'string',
                        description: '文件名'
                      }
                    },
                    required: ['data', 'filename']
                  },
                  description: '上传的文件数据数组（与input_paths二选一）'
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
              required: ['output_format']
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
                  description: '图片文件路径（与image_data二选一）'
                },
                image_data: {
                  type: 'string',
                  description: '图片数据（Buffer或base64字符串，与image_path二选一）'
                }
              }
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
            
            // 确定输入源的总数
            const totalInputs = (validatedArgs.input_paths?.length || 0) + (validatedArgs.input_files?.length || 0);
            
            results.forEach((result, index) => {
              let inputName = `文件${index + 1}`;
              
              // 优先从input_paths获取名称
              if (validatedArgs.input_paths && index < validatedArgs.input_paths.length) {
                inputName = validatedArgs.input_paths[index];
              } 
              // 然后从input_files获取名称
              else if (validatedArgs.input_files) {
                const fileIndex = index - (validatedArgs.input_paths?.length || 0);
                if (fileIndex >= 0 && fileIndex < validatedArgs.input_files.length) {
                  inputName = validatedArgs.input_files[fileIndex].filename;
                }
              }
              
              if (result.success) {
                resultText += `✓ ${inputName} -> ${result.output_path}\n`;
              } else {
                resultText += `✗ ${inputName}: ${result.error}\n`;
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
            const { image_path, image_data } = args as { image_path?: string; image_data?: string };
            const info = await this.converter.getImageInfo(image_path, image_data);
            const source = image_path ? `文件路径：${image_path}` : '上传文件';
            return {
              content: [
                {
                  type: 'text',
                  text: `图片信息：\n${source}\n格式：${info.format}\n尺寸：${info.width}x${info.height}\n文件大小：${info.size} bytes\n颜色通道：${info.channels}\n颜色空间：${info.space || '未知'}`
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