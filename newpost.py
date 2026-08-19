import os
import sys
import re
import time
from datetime import datetime

def generate_slug(title: str) -> str:
    """根据标题和时间戳生成唯一的英文/数字 slugId"""
    # 提取英文和数字，若标题为纯中文则使用时间戳
    clean_title = re.sub(r'[^\w\s-]', '', title).strip().lower()
    clean_title = re.sub(r'[-\s]+', '-', clean_title)
    timestamp = int(time.time())
    
    if clean_title:
        return f"{clean_title}-{timestamp}"
    return f"post-{timestamp}"

def create_post():
    # 1. 获取文章标题
    if len(sys.argv) > 1:
        title = sys.argv[1].strip()
    else:
        title = input("请输入文章标题: ").strip()

    if not title:
        print("❌ 错误：文章标题不能为空！")
        return

    # 2. 定位项目路径（无论在根目录还是 script 目录运行均能正确定位）
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = script_dir
    blog_dir = os.path.join(project_root, "src", "content", "blog", title)
    file_path = os.path.join(blog_dir, "zh-cn.md")

    # 3. 检查是否重复
    if os.path.exists(file_path):
        print(f"⚠️ 警告：文章已存在 -> {file_path}")
        return

    # 4. 生成规范的 Frontmatter 元数据
    today = datetime.now().strftime("%Y-%m-%d")
    slug_id = generate_slug(title)

    template = f"""---
title: {title}
pubDate: {today}
description: 请在此处填写文章简述
author: 眠云
slugId: {slug_id}
image: "./cover.jpg"
tags: ["随笔"]
category: "随笔"
draft: false
---

在这里开始编写你的正文内容...
"""

    # 5. 写入文件
    os.makedirs(blog_dir, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(template)

    print(f"✅ 成功创建新文章模板！")
    print(f"📄 文件路径: src/content/blog/{title}/zh-cn.md")
    print(f"🏷️ slugId: {slug_id}")

if __name__ == "__main__":
    create_post()
