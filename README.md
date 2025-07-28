# 图像转换MCP服务器

基于MCP协议的多格式图像转换服务器，支持JPG/PNG/WebP/GIF/BMP/TIFF/SVG/ICO/AVIF等格式互转。

## 🚀 快速开始

### 安装

```bash
# 全局安装
npm install -g image-converter-mcp-server

# 或直接运行
npx image-converter-mcp-server
```

### 使用方法

#### 方式1: 直接启动

```bash
image-converter-mcp-server
```

#### 方式2: 通过MCP配置文件

在你的MCP客户端配置文件中添加：

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

或者如果已全局安装：

```json
{
  "mcpServers": {
    "image-converter": {
      "command": "image-converter-mcp-server"
    }
  }
}
```

#### 方式3: Claude Desktop配置

在 `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 或 `%APPDATA%\Claude\claude_desktop_config.json` (Windows) 中添加：

```json
{
  "mcpServers": {
    "image-converter": {
      "command": "npx",
      "args": ["image-converter-mcp-server"],
      "env": {}
    }
  }
}
```

## ✨ 功能特性

- **多格式支持**: 支持11种输入格式和9种输出格式
- **高性能**: 基于Sharp和Jimp双引擎优化
- **批量处理**: 支持多文件同时转换
- **质量控制**: 可调节压缩质量和图片尺寸
- **MCP协议**: 完整的4个工具接口
- **类型安全**: 完整的TypeScript支持

## 📋 支持格式

### 输入格式 (11种)
- JPG/JPEG
- PNG
- WebP
- GIF
- BMP
- TIFF
- SVG
- ICO
- AVIF
- HEIC
- PDF

### 输出格式 (9种)
- JPG/JPEG
- PNG
- WebP
- GIF
- BMP
- TIFF
- ICO
- AVIF
- PDF

## 🛠️ MCP工具接口

### 1. convert_image
单个图像格式转换

**参数:**
- `inputPath`: 输入图片路径
- `outputPath`: 输出图片路径
- `format`: 目标格式
- `quality`: 压缩质量 (1-100)
- `width`: 输出宽度
- `height`: 输出高度

### 2. batch_convert_images
批量图像格式转换

**参数:**
- `inputDir`: 输入目录路径
- `outputDir`: 输出目录路径
- `format`: 目标格式
- `quality`: 压缩质量
- `width`: 输出宽度
- `height`: 输出高度

### 3. get_image_info
获取图片详细信息

**参数:**
- `imagePath`: 图片路径

### 4. list_supported_formats
列出所有支持的格式

## 💻 开发

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/pickstar-2025/image-converter-mcp.git
cd image-converter-mcp

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 启动
npm start
```

## 📦 技术栈

- **MCP SDK**: @modelcontextprotocol/sdk
- **图像处理**: Sharp + Jimp
- **类型检查**: Zod
- **开发语言**: TypeScript

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系

如有问题或建议，请通过GitHub Issues联系我们。