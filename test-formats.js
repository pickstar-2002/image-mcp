#!/usr/bin/env node

import { ImageConverter } from './dist/converter.js';
import { promises as fs } from 'fs';
import path from 'path';

const converter = new ImageConverter();

async function testFormats() {
  console.log('🎨 图像格式转换测试');
  console.log('='.repeat(50));

  // 显示支持的格式
  const formats = converter.getSupportedFormats();
  console.log('📥 支持的输入格式:');
  console.log(formats.input.join(', '));
  console.log('\n📤 支持的输出格式:');
  console.log(formats.output.join(', '));
  console.log('\n');

  // 测试图片路径
  const testImagePath = './image-test/test.png';
  
  try {
    await fs.access(testImagePath);
  } catch {
    console.log('❌ 测试图片不存在，请确保 ./image-test/test.png 文件存在');
    return;
  }

  // 获取原始图片信息
  try {
    const info = await converter.getImageInfo(testImagePath);
    console.log('📊 原始图片信息:');
    console.log(`   格式: ${info.format}`);
    console.log(`   尺寸: ${info.width}x${info.height}`);
    console.log(`   大小: ${(info.size / 1024).toFixed(2)} KB`);
    console.log(`   通道: ${info.channels}`);
    console.log('\n');
  } catch (error) {
    console.log(`❌ 获取图片信息失败: ${error.message}`);
    return;
  }

  // 测试各种输出格式
  const outputFormats = ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico', 'avif'];
  
  console.log('🔄 开始格式转换测试...\n');

  for (const format of outputFormats) {
    try {
      console.log(`   转换为 ${format.toUpperCase()}...`);
      
      const result = await converter.convertImage({
        input_path: testImagePath,
        output_format: format,
        quality: 85,
        width: format === 'ico' ? 32 : undefined,
        height: format === 'ico' ? 32 : undefined
      });

      console.log(`   ✅ ${format.toUpperCase()} 转换成功`);
      console.log(`      输出: ${result.output_path}`);
      console.log(`      尺寸: ${result.dimensions.width}x${result.dimensions.height}`);
      console.log(`      大小: ${(result.file_size / 1024).toFixed(2)} KB\n`);

    } catch (error) {
      console.log(`   ❌ ${format.toUpperCase()} 转换失败: ${error.message}\n`);
    }
  }

  // 测试批量转换
  console.log('📦 测试批量转换...');
  try {
    const batchResults = await converter.batchConvertImages({
      input_paths: [testImagePath],
      output_format: 'webp',
      quality: 80,
      output_directory: './image-test/batch'
    });

    const successCount = batchResults.filter(r => r.success).length;
    console.log(`✅ 批量转换完成: ${successCount}/${batchResults.length} 成功\n`);
  } catch (error) {
    console.log(`❌ 批量转换失败: ${error.message}\n`);
  }

  console.log('🎉 测试完成！');
}

testFormats().catch(console.error);