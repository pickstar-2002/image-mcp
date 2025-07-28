# Image Converter MCP Server

[![npm version](https://badge.fury.io/js/image-converter-mcp-server.svg)](https://badge.fury.io/js/image-converter-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

基于MCP（Model Context Protocol）协议的多格式图像转换服务器，支持JPG/PNG/WebP/GIF/BMP/TIFF/SVG/ICO/AVIF等格式互转。提供高性能的图像处理能力，支持批量转换、尺寸调整、质量控制等功能。

## ✨ 特性

- 🔄 **多格式支持**: 支持15+种图片格式互转
- 📁 **批量处理**: 一次性转换多个图片文件
- 🎯 **智能输入**: 支持文件路径和直接数据输入两种方式
- 📏 **尺寸控制**: 支持自定义宽高和保持宽高比
- 🎨 **质量调节**: 支持压缩质量控制（1-100）
- ⚡ **高性能**: 基于Sharp和Jimp双引擎处理
- 🛡️ **类型安全**: 完整的TypeScript支持
- 🔍 **详细信息**: 提供图片元数据查询功能

## 📦 安装

### 使用 npm

```bash
npm install -g image-converter-mcp-server
```

### 使用 yarn

```bash
yarn global add image-converter-mcp-server
```

### 从源码安装

```bash
git clone https://github.com/pickstar-2025/image-converter-mcp.git
cd image-converter-mcp
npm install
npm run build
```

## 🚀 使用方法

### 作为MCP服务器启动

```bash
# 直接启动
image-converter-mcp-server

# 或使用npx
npx image-converter-mcp-server
```

### 在MCP客户端中使用

将以下配置添加到您的MCP客户端配置文件中：

```json
{
  "mcpServers": {
    "image-converter": {
      "command": "npx",
      "args": ["image-converter-mcp-server"]
    }
  }
}
```

## 📖 API参考

### convert_image

转换单个图片文件

```typescript
interface ConvertImageParams {
  input_path?: string;           // 源图片文件路径
  input_data?: string | Buffer;  // 图片数据（Buffer或base64字符串）
  input_filename?: string;       // 原始文件名，用于确定格式
  output_format: string;         // 目标格式（必需）
  quality?: number;              // 压缩质量（1-100）
  width?: number;                // 目标宽度
  height?: number;               // 目标高度
  maintain_aspect_ratio?: boolean; // 保持宽高比，默认true
  output_path?: string;          // 输出文件路径
}
```

**使用示例：**

```json
{
  "tool": "convert_image",
  "arguments": {
    "input_path": "./photos/image.jpg",
    "output_format": "webp",
    "quality": 80,
    "width": 800
  }
}
```

### batch_convert_images

批量转换多个图片文件

```typescript
interface BatchConvertParams {
  input_paths?: string[];        // 源图片文件路径数组
  input_files?: Array<{          // 上传的文件数据数组
    data: string | Buffer;
    filename: string;
  }>;
  output_format: string;         // 目标格式（必需）
  quality?: number;              // 压缩质量
  width?: number;                // 目标宽度
  height?: number;               // 目标高度
  maintain_aspect_ratio?: boolean; // 保持宽高比
  output_directory?: string;     // 输出目录
}
```

### get_image_info

获取图片文件信息

```typescript
interface GetImageInfoParams {
  image_path?: string;           // 图片文件路径
  image_data?: string | Buffer;  // 图片数据
}
```

### list_supported_formats

列出所有支持的图片格式

```json
{
  "tool": "list_supported_formats",
  "arguments": {}
}
```

## 🎯 支持的格式

### 输入格式
- **JPEG/JPG** - 标准JPEG格式
- **PNG** - 便携式网络图形
- **GIF** - 图形交换格式
- **BMP** - 位图格式
- **TIFF/TIF** - 标记图像文件格式
- **WebP** - 现代Web图像格式
- **SVG** - 可缩放矢量图形
- **ICO** - 图标格式
- **AVIF** - AV1图像文件格式
- **HEIC/HEIF** - 高效图像格式（需要系统支持）
- **PSD** - Photoshop文档（有限支持）

### 输出格式
- **JPEG/JPG** - 有损压缩，适合照片
- **PNG** - 无损压缩，支持透明度
- **WebP** - 现代格式，优秀的压缩比
- **GIF** - 支持动画
- **BMP** - 无压缩位图
- **TIFF** - 高质量存档格式
- **ICO** - Windows图标格式
- **AVIF** - 下一代图像格式
- **SVG** - 矢量图形格式

## ⚙️ 配置

### 环境变量

```bash
# 设置临时文件目录
TEMP_DIR=/path/to/temp

# 设置最大文件大小（字节）
MAX_FILE_SIZE=10485760

# 设置并发处理数量
MAX_CONCURRENT=4
```

### 配置文件

创建 `config.json` 文件：

```json
{
  "tempDir": "./temp",
  "maxFileSize": 10485760,
  "maxConcurrent": 4,
  "defaultQuality": 80,
  "supportedFormats": {
    "input": ["jpg", "png", "gif", "bmp", "tiff", "webp", "svg", "ico", "avif"],
    "output": ["jpg", "png", "gif", "bmp", "tiff", "webp", "svg", "ico", "avif"]
  }
}
```

## 📝 使用示例

### 基础转换

```bash
# 将JPEG转换为WebP
{
  "tool": "convert_image",
  "arguments": {
    "input_path": "photo.jpg",
    "output_format": "webp",
    "quality": 85
  }
}
```

### 调整尺寸

```bash
# 转换并调整尺寸
{
  "tool": "convert_image",
  "arguments": {
    "input_path": "large_image.png",
    "output_format": "jpg",
    "width": 800,
    "height": 600,
    "maintain_aspect_ratio": true
  }
}
```

### 批量转换

```bash
# 批量转换多个文件
{
  "tool": "batch_convert_images",
  "arguments": {
    "input_paths": ["img1.png", "img2.jpg", "img3.gif"],
    "output_format": "webp",
    "quality": 80,
    "output_directory": "./converted"
  }
}
```

### 处理上传数据

```bash
# 处理base64编码的图片数据
{
  "tool": "convert_image",
  "arguments": {
    "input_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "input_filename": "uploaded.jpg",
    "output_format": "png"
  }
}
```

## 🏗️ 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/pickstar-2025/image-converter-mcp.git
cd image-converter-mcp

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test
```

### 项目结构

```
image-converter-mcp/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── converter.ts          # 图像转换核心逻辑
│   ├── file-handler.ts       # 文件处理工具
│   ├── temp-file-manager.ts  # 临时文件管理
│   ├── stream-processor.ts   # 流处理器
│   └── usage-examples.ts     # 使用示例
├── dist/                     # 编译输出目录
├── image-test/              # 测试图片目录
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 部署

### Git仓库部署

1. **初始化Git仓库**

```bash
git init
git add .
git commit -m "Initial commit"
```

2. **添加远程仓库**

```bash
git remote add origin https://github.com/your-username/image-converter-mcp.git
git branch -M main
git push -u origin main
```

3. **版本标签**

```bash
git tag v1.0.0
git push origin v1.0.0
```

### NPM包发布

1. **准备发布**

```bash
# 登录npm
npm login

# 检查包信息
npm pack --dry-run
```

2. **发布到NPM**

```bash
# 发布
npm publish

# 发布beta版本
npm publish --tag beta
```

3. **版本管理**

```bash
# 更新版本
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 发布新版本
npm publish
```

### 必需的配置文件

#### package.json
```json
{
  "name": "image-converter-mcp-server",
  "version": "1.0.0",
  "description": "基于MCP协议的多格式图像转换服务器",
  "main": "dist/index.js",
  "type": "module",
  "bin": {
    "image-converter-mcp-server": "./dist/index.js"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "package.json"
  ],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### .gitignore
```
node_modules/
dist/
*.log
.env
.DS_Store
temp/
coverage/
.nyc_output/
```

#### .npmignore
```
src/
*.ts
!*.d.ts
tsconfig.json
.git/
.github/
tests/
coverage/
.nyc_output/
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 报告问题

1. 检查现有的[Issues](https://github.com/pickstar-2025/image-converter-mcp/issues)
2. 创建新的Issue，包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息

### 提交代码

1. **Fork项目**

```bash
git clone https://github.com/your-username/image-converter-mcp.git
cd image-converter-mcp
```

2. **创建功能分支**

```bash
git checkout -b feature/your-feature-name
```

3. **提交更改**

```bash
git add .
git commit -m "feat: add your feature description"
```

4. **推送分支**

```bash
git push origin feature/your-feature-name
```

5. **创建Pull Request**

### 代码规范

- 使用TypeScript编写代码
- 遵循ESLint配置
- 添加适当的测试
- 更新相关文档
- 提交信息遵循[Conventional Commits](https://conventionalcommits.org/)

### 提交信息格式

```
type(scope): description

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

```
MIT License

Copyright (c) 2024 CodeBuddy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 作者信息

**CodeBuddy**
- GitHub: [@pickstar-2025](https://github.com/pickstar-2025)
- Email: codebuddy@example.com
- 项目主页: [https://github.com/pickstar-2025/image-converter-mcp](https://github.com/pickstar-2025/image-converter-mcp)

## 🙏 致谢

感谢以下开源项目：

- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图像处理库
- [Jimp](https://github.com/jimp-dev/jimp) - JavaScript图像处理库
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP协议规范
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript
- [Zod](https://zod.dev/) - TypeScript优先的模式验证库

## 📊 统计信息

![GitHub stars](https://img.shields.io/github/stars/pickstar-2025/image-converter-mcp?style=social)
![GitHub forks](https://img.shields.io/github/forks/pickstar-2025/image-converter-mcp?style=social)
![GitHub issues](https://img.shields.io/github/issues/pickstar-2025/image-converter-mcp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/pickstar-2025/image-converter-mcp)

---

<div align="center">
  <p>如果这个项目对您有帮助，请给我们一个⭐️！</p>
  <p>Made with ❤️ by CodeBuddy</p>
</div>