// 简单的测试脚本
import { ImageConverter } from './dist/converter.js';
import { promises as fs } from 'fs';
import path from 'path';

async function testConverter() {
  const converter = new ImageConverter();
  
  console.log('支持的格式：');
  console.log(converter.getSupportedFormats());
  
  // 创建测试目录
  const testDir = './test-images';
  try {
    await fs.mkdir(testDir, { recursive: true });
    console.log(`测试目录已创建: ${testDir}`);
  } catch (error) {
    console.log('测试目录已存在');
  }
  
  console.log('\n图片转换MCP服务测试完成！');
  console.log('请将图片文件放入 test-images 目录进行测试');
}

testConverter().catch(console.error);