#!/usr/bin/env node

import { ImageConverter } from './dist/converter.js';
import { promises as fs } from 'fs';
import sharp from 'sharp';

async function createTestImage() {
  // 创建一个简单的测试图片
  const testImagePath = './image-test/test.png';
  
  try {
    await fs.mkdir('./image-test', { recursive: true });
    
    // 创建一个200x200的红色方块作为测试图片
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 }
      }
    })
    .png()
    .toFile(testImagePath);
    
    console.log('✅ 测试图片创建成功:', testImagePath);
    return testImagePath;
  } catch (error) {
    console.error('❌ 创建测试图片失败:', error.message);
    throw error;
  }
}

async function testConverter() {
  console.log('🎨 图像格式转换测试');
  console.log('='.repeat(50));

  const converter = new ImageConverter();
  
  // 显示支持的格式
  const formats = converter.getSupportedFormats();
  console.log('📥 支持的输入格式:');
  console.log(formats.input.join(', '));
  console.log('\n📤 支持的输出格式:');
  console.log(formats.output.join(', '));
  console.log('\n');

  // 创建测试图片
  const testImagePath = await createTestImage();

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

  // 测试核心输出格式
  const coreFormats = ['jpg', 'png', 'webp', 'gif', 'bmp', 'tiff'];
  
  console.log('🔄 开始格式转换测试...\n');

  for (const format of coreFormats) {
    try {
      console.log(`   转换为 ${format.toUpperCase()}...`);
      
      const result = await converter.convertImage({
        input_path: testImagePath,
        output_format: format,
        quality: 85
      });

      console.log(`   ✅ ${format.toUpperCase()} 转换成功`);
      console.log(`      输出: ${result.output_path}`);
      console.log(`      尺寸: ${result.dimensions.width}x${result.dimensions.height}`);
      console.log(`      大小: ${(result.file_size / 1024).toFixed(2)} KB\n`);

    } catch (error) {
      console.log(`   ❌ ${format.toUpperCase()} 转换失败: ${error.message}\n`);
    }
  }

  // 测试特殊格式
  const specialFormats = ['svg', 'ico', 'avif'];
  
  console.log('🔧 测试特殊格式...\n');

  for (const format of specialFormats) {
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
      console.log(`   ⚠️  ${format.toUpperCase()} 转换失败: ${error.message}\n`);
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
  console.log('\n📋 支持的格式总结:');
  console.log('✅ 完全支持: JPG, PNG, WebP, GIF, BMP, TIFF');
  console.log('⚠️  部分支持: SVG (嵌入位图), ICO (简化版), AVIF (需Sharp支持)');
  console.log('❌ 需要额外处理: HEIC/HEIF, PSD');
}

testConverter().catch(console.error);