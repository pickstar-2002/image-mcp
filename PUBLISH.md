# 发布指南

## GitHub 发布步骤

1. **创建GitHub仓库**
```bash
# 在GitHub上创建新仓库 image-converter-mcp
# 然后添加远程仓库
git remote add origin https://github.com/your-username/image-converter-mcp.git
git branch -M main
git push -u origin main
```

2. **创建Release**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## NPM 发布步骤

1. **登录NPM**
```bash
npm login
```

2. **发布包**
```bash
npm publish
```

## 发布检查清单

- [x] 代码已提交到Git
- [x] package.json版本号正确
- [x] README.md文档完整
- [x] .npmignore配置正确
- [x] 构建成功 (npm run build)
- [x] 测试通过 (npm test)
- [ ] GitHub仓库已创建
- [ ] NPM账号已登录
- [ ] 包名可用性已检查

## 包信息

- **包名**: image-converter-mcp
- **版本**: 1.0.0
- **描述**: 基于MCP协议的多格式图像转换服务器
- **关键词**: mcp, image, converter, format, sharp, jimp, webp, avif