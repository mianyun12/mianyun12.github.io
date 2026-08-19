import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join, relative, resolve, isAbsolute, sep } from 'path';
import { fileURLToPath } from 'url';

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node newpost.js <path> [lang] (default lang is zh-cn)');
    process.exit(1);
}

const folderPath = args[0].trim();
const lang = args[1] || 'zh-cn';

// 确保语言参数有效
const validLangs = ['en', 'zh-cn'];
if (!validLangs.includes(lang)) {
    console.error(`Invalid language: ${lang}. Valid options are: ${validLangs.join(', ')}`);
    process.exit(1);
}

// 定义基础路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basePath = resolve(__dirname, '..', 'src', 'content', 'blog');

// 允许传入 docs/test 或 docs/test.md，但始终按文章目录存储。
const normalizedFolderPath = folderPath.replace(/\\/g, '/').replace(/\.md$/i, '');
const fullPath = resolve(basePath, normalizedFolderPath);
const relativePath = relative(basePath, fullPath);

if (
    !normalizedFolderPath ||
    !relativePath ||
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
) {
    console.error('Invalid post path: the path must stay inside src/content/blog');
    process.exit(1);
}

// 创建文件夹（如果不存在）
try {
    await mkdir(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
} catch (error) {
    console.error(`Error creating directory: ${error.message}`);
    process.exit(1);
}

// 默认的 Markdown 内容
const defaultContent = `---
title: new post
pubDate: ${new Date().toISOString().split('T')[0]}
description: Some description here
author: 眠云
image: ""
tags: ["随笔"]
category: "随笔"
draft: false
slugId: ${normalizedFolderPath}
---

## Title

Content goes here...
`;

// 创建语言特定的 Markdown 文件
const filePath = join(fullPath, `${lang}.md`);

try {
    if (existsSync(filePath)) {
        console.warn(`File already exists: ${filePath}`);
    } else {
        await writeFile(filePath, defaultContent, 'utf8');
        console.log(`Created file: ${filePath}`);
    }
} catch (error) {
    console.error(`Error creating file: ${error.message}`);
    process.exit(1);
}

console.log(`Successfully created new post at: ${filePath}`);
