# 图像格式转换 MCP 服务器

[![npm version](https://badge.fury.io/js/image-converter-mcp.svg)](https://badge.fury.io/js/image-converter-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

基于 Model Context Protocol (MCP) 的多格式图像转换服务器，支持11种输入格式和9种输出格式的相互转换。

## 📦 安装

### NPM 安装
```bash
npm install -g image-converter-mcp
```

### 从源码安装
```bash
git clone https://github.com/your-username/image-converter-mcp.git
cd image-converter-mcp
npm install
npm run build
```

## 🎯 功能特性

### 支持的输入格式
- **JPG/JPEG** - 最常用的有损压缩格式
- **PNG** - 支持透明度的无损格式
- **WebP** - Google开发的现代格式
- **GIF** - 支持动画的格式
- **BMP** - Windows位图格式
- **TIFF/TIF** - 高质量无损格式
- **SVG** - 矢量图格式
- **ICO** - 图标格式
- **AVIF** - 新一代高效格式
- **HEIC/HEIF** - 苹果设备常用格式（需系统支持）
- **PSD** - Photoshop格式（需预处理）

### 支持的输出格式
- **JPG/JPEG** - 有损压缩，文件小
- **PNG** - 无损压缩，支持透明
- **WebP** - 现代高效格式
- **GIF** - 动画支持
- **BMP** - 无压缩位图
- **TIFF** - 高质量存储
- **SVG** - 矢量图（通过嵌入位图实现）
- **ICO** - 图标格式
- **AVIF** - 下一代格式

## 🚀 快速开始

### 作为MCP服务器使用
```bash
# 全局安装后直接使用
image-converter-mcp

# 或者使用npx
npx image-converter-mcp
```

### 开发模式
```bash
git clone https://github.com/your-username/image-converter-mcp.git
cd image-converter-mcp
npm install
npm run dev
```

### 运行测试
```bash
npm test
```

## 🔧 MCP工具

### 1. convert_image
转换单个图片文件

**参数：**
- `input_path` (必需): 源图片文件路径
- `output_format` (必需): 目标格式
- `quality` (可选): 压缩质量 (1-100)
- `width` (可选): 目标宽度
- `height` (可选): 目标高度
- `maintain_aspect_ratio` (可选): 保持宽高比，默认true
- `output_path` (可选): 输出文件路径

**示例：**
```json
{
  "input_path": "./test.jpg",
  "output_format": "png",
  "quality": 90,
  "width": 800,
  "height": 600
}
```

### 2. batch_convert_images
批量转换多个图片文件

**参数：**
- `input_paths` (必需): 源图片文件路径数组
- `output_format` (必需): 目标格式
- `quality` (可选): 压缩质量
- `width` (可选): 目标宽度
- `height` (可选): 目标高度
- `maintain_aspect_ratio` (可选): 保持宽高比
- `output_directory` (可选): 输出目录

### 3. get_image_info
获取图片文件信息

**参数：**
- `image_path` (必需): 图片文件路径

### 4. list_supported_formats
列出所有支持的图片格式

## 📊 格式支持详情

| 格式 | 输入支持 | 输出支持 | 说明 |
|------|----------|----------|------|
| JPG/JPEG | ✅ | ✅ | 完全支持，有损压缩 |
| PNG | ✅ | ✅ | 完全支持，支持透明度 |
| WebP | ✅ | ✅ | 完全支持，现代格式 |
| GIF | ✅ | ✅ | 完全支持，使用Jimp处理 |
| BMP | ✅ | ✅ | 完全支持，使用Jimp处理 |
| TIFF | ✅ | ✅ | 完全支持，高质量格式 |
| SVG | ✅ | ✅ | 输出为嵌入位图的SVG |
| ICO | ✅ | ✅ | 简化版ICO支持 |
| AVIF | ✅ | ✅ | 需Sharp库支持 |
| HEIC/HEIF | ⚠️ | ❌ | 需系统libvips支持 |
| PSD | ⚠️ | ❌ | 需预处理为其他格式 |

## 🧪 测试

运行测试脚本：
```bash
node test-simple.js
```

这将创建一个测试图片并尝试转换为所有支持的格式。

## 📝 使用示例

### 在MCP客户端中使用

1. **转换单个图片：**
```javascript
// 将JPG转换为PNG
await mcp.callTool('convert_image', {
  input_path: './photo.jpg',
  output_format: 'png',
  quality: 95
});
```

2. **批量转换：**
```javascript
// 批量转换为WebP格式
await mcp.callTool('batch_convert_images', {
  input_paths: ['./img1.jpg', './img2.png', './img3.gif'],
  output_format: 'webp',
  quality: 85,
  output_directory: './converted'
});
```

3. **获取图片信息：**
```javascript
// 查看图片详细信息
await mcp.callTool('get_image_info', {
  image_path: './photo.jpg'
});
```

## ⚙️ 技术栈

- **Sharp** - 高性能图像处理库
- **Jimp** - 纯JavaScript图像处理库
- **MCP SDK** - Model Context Protocol支持
- **TypeScript** - 类型安全的JavaScript

## 🔍 故障排除

### HEIC/HEIF格式问题
如果遇到HEIC/HEIF格式转换问题，请确保：
1. 系统安装了libvips
2. Sharp版本支持HEIC格式
3. 或者先用其他工具转换为JPG/PNG

### PSD格式问题
PSD格式需要特殊处理：
1. 使用Photoshop导出为JPG/PNG
2. 或使用专门的PSD转换工具

### 构建问题
如果遇到构建问题：
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如果遇到问题，请：
1. 查看故障排除部分
2. 运行测试脚本检查环境
3. 提交Issue描述问题