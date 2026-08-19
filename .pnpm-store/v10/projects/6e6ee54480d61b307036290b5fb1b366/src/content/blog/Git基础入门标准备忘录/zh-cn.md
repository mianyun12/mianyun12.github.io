---
title: "Git 基础入门标准备忘录"
pubDate: 2026-07-06
description: "整理 Git 的安装配置、提交、远程仓库、分支、合并、推拉、贮藏、重置与变基操作。"
author: "眠云"
slugId: git-basics-reference-memo
image: ""
tags: ["Git","版本控制","工程协作"]
category: "小学期"
draft: false
---

## 导读

Git 的命令很多，但日常工作通常围绕几个核心动作展开：记录状态、提交变化、同步远程、管理分支，以及在需要时安全地回退或整理历史。这篇文章将原有备忘录转换为更适合在线阅读的速查文章，建议结合真实仓库边操作边对照。

# Git 基础入门标准备忘录

## 一、安装与配置

首次使用时添加全局身份说明（设置昵称与邮箱） ：

```bash
git config --global user.name "你的昵称"
git config --global user.email 邮箱@example.com

```

在当前项目文件夹下初始化并创建全新仓库 ：

```bash
git init

```

克隆他人项目到本地创建仓库 ：

```bash
git clone <项目url>

```

## 二、状态与提交版本

跟踪（暂存）指定的单个文件 ：

```bash
git add <name>

```

跟踪当前目录下的所有文件 ：

```bash
git add .

```

取消跟踪并从工作区删除文件 ：

```bash
git rm <name>

```

保留工作区文件，但从 Git 中取消跟踪 ：

```bash
git rm --cached <name>

```

取消指定文件的暂存（缓存）状态，恢复为已修改未暂存 ：

```bash
git reset HEAD <name>

```

提交已暂存的修改记录 ：

```bash
git commit

```

提交并直接附带描述信息 ：

```bash
git commit -m "你对提交内容的描述"

```

连带未暂存的已修改文件一起提交并附带描述 ：

```bash
git commit -am "提交描述"

```

仅取消上一次的提交操作，将修改内容退回到暂存区保留:

HEAD: 当前的提交

HEAD~: 上次的提交

HEAD~2: 倒数第二次的提交

```bash
git reset --soft HEAD~

```

查看当前文件及修改状态（红色未暂存，绿色已暂存） ：

```bash
git status

```

详细查看文件的具体修改差异（定位到行与字符） ：

```bash
git diff

```

查看基础提交历史信息 ：

```bash
git log

```

查看所有分支的提交记录 ：

```bash
git log --all

```

结合分支图（Graph）查看所有分支的提交历史 ：

```bash
git log --all --graph

```

以单行自定义格式查看提交记录 ：

```bash
git log --pretty=oneline

```

仅查看当前分支的分支图 ：

```bash
git log --graph

```

## 三、远程仓库

将本地仓库链接到远程仓库 ：

```bash
git remote add origin <远程仓库链接>

```

重命名远程仓库指向 ：

```bash
git remote rename <目标仓库名> <修改内容>

```

推送到指定的远程仓库与分支 ：

```bash
git push <仓库名> <分支名>

```

## 四、分支

创建新分支 ：

```bash
git branch <分支名>

```

创建并直接切换到新分支 ：

```bash
git checkout -b <分支名>

```

查看当前仓库的分支列表 ：

```bash
git branch --list

```

切换到指定分支 ：

```bash
git checkout <分支名>

```

## 五、分支合并

将指定分支无冲突合并到当前所在的分支 ：

```bash
git merge <要合并的分支>

```

处理冲突并提交合并结果（需先手动解决冲突文件并保存） ：

```bash
git status 查看哪里有冲突
vi 到冲突文件中, 选择一个分支的内容保留下来, 保存退出
git add <文件名>
git commit -m "提交描述"

```

## 六、推拉与远程跟踪分支

将本地分支推送到远程仓库 ：

```bash
git push <仓库名> <分支名>

```

首次推送并指定默认跟踪的上游分支（此后可直接简写 git push） ：

```bash
git push -u <仓库名> <分支名>

```

拉取远程仓库的更新信息 ：

```bash
git fetch

```

切换到已拉取的远程分支 ：

```bash
git checkout <远程分支>

```

基于远程分支创建并切换到新的本地分支 ：

```bash
git checkout -b <本地分支名> <远程分支>

```

创建本地分支并直接跟踪对应的远程分支 ：

```bash
git checkout --track <远程分支>

```

## 七、贮藏功能

将当前未提交的修改内容储藏起来，以便切换分支 ：

```bash
git stash

```

切换回来后，恢复之前存储的内容 ：

```bash
git stash apply

```

回看并列出所有的存储记录列表 ：

```bash
git stash list

```

恢复指定的存储记录 ：

```bash
git stash apply stash@{记录号}

```

恢复并直接删除最近一次的存储记录 ：

```bash
git stash pop

```

仅删除指定的存储记录 ：

```bash
git stash drop stash@{记录号}

```

## 八、重置与变基

仅取消上一次的 Commit 操作，将修改内容退回到暂存区保留 ：

HEAD: 当前的提交

HEAD~: 上次的提交

HEAD~2: 倒数第二次的提交

```bash
git reset --soft HEAD~

```

彻底取消暂存并清空修改内容，强行回到上一次提交的纯净状态（易丢失数据，慎用） ：

```bash
git reset --hard HEAD~

```

将 B 分支的修改变基（Rebase）移动到 A 分支的基础之上 ：

```bash
git checkout B
git rebase A

```

## 小结

Git 命令涉及历史修改时尤其需要谨慎。养成先查看 `git status` 和 `git diff`、再执行提交或重置的习惯，可以让版本控制从“记命令”变成可追踪、可恢复的工作流。

