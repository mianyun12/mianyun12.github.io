---
title: "Linux Bash 命令工作速查手册"
pubDate: 2026-07-05
description: "面向 C/C++ 开发与服务器排障，集中整理文件操作、文本处理、构建、进程、权限、管道和性能分析命令。"
author: "眠云"
slugId: linux-bash-command-quick-reference
image: ""
tags: ["Linux","Bash","命令行"]
category: "小学期"
draft: false
---

## 导读

命令行速查表的意义，在于把高频场景中的查找、过滤、构建、排障和信息查询串成一条可复用的工作路径。本文保留原手册的场景化组织方式，适合 C/C++ 学习、Linux 实验和服务器问题定位时快速检索。

# Linux Bash 命令工作速查手册

> 面向 C/C++ 系统级开发与服务器排查场景，精炼至核心用法。

---

## 一、文件目录操作

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `ls` | 列出目录内容 | `-l` 长格式 `-a` 含隐藏 `.` `-h` 可读大小 `-t` 按时间 `-S` 按大小 `-R` 递归 |
| `cd` | 切换工作目录 | `-` 回退上一目录 `~` 家目录 |
| `pwd` | 打印当前绝对路径 | `-P` 显示物理路径（无视软链） |
| `mkdir` | 创建目录 | `-p` 递归创建父目录 `-v` 打印创建信息 `-m` 设置权限 |
| `touch` | 更新文件时间戳/创建空文件 | `-c` 文件不存在则不创建 `-t` 指定时间 `-r` 参考文件时间 |
| `rm` | 删除文件或目录 | `-r` 递归 `-f` 强制 `-i` 交互确认 `-v` 显示详情 |
| `cp` | 复制文件或目录 | `-r` 递归 `-i` 交互 `-u` 仅更新 `-p` 保留属性 `-a` 归档模式 |
| `mv` | 移动/重命名文件 | `-i` 交互 `-u` 仅更新 `-n` 不覆盖 |
| `find` | 递归搜索文件 | 见下方独立表格 |

### find — 文件搜索利器

```bash
# 按名称查找
find ./src -name "*.c" -type f
find /var -iname "*.log"                   # -iname 忽略大小写

# 按时间筛选
find . -mmin -60                           # 60 分钟内修改过的
find . -mtime +7 -delete                   # 删除 7 天前的文件

# 按大小筛选
find . -size +10M -size -100M              # 10M~100M 之间的文件

# 执行动作
find . -name "*.o" -exec rm {} \;          # 删除所有 .o 目标文件
find . -name "core" -exec ls -lh {} \;     # 定位 core dump

# 按权限 / 属主
find / -perm -4000 -type f                  # 查找 SUID 文件（提权风险）
find . ! -user $(whoami)                    # 不属于当前用户的文件
```

---

## 二、文本内容查看与处理

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `cat` | 拼接并输出文件内容 | `-n` 显示行号 `-b` 非空行编号 `-T` Tab 显示为 `^I` `-A` 显示所有不可见字符 |
| `head` | 输出文件开头 N 行 | `-n 20` 前 20 行（缺省 10） `-c 100` 前 100 字节 |
| `tail` | 输出文件末尾 N 行 | `-n 50` 后 50 行 `-f` 实时跟踪追加（`Ctrl+C` 退出） `-F` 跟踪且支持日志轮转 |
| `wc` | 统计行/词/字节数 | `-l` 行数 `-w` 词数 `-c` 字节数 `-L` 最长行长度 |
| `grep` | 按正则搜索文本 | `-i` 忽略大小写 `-r` 递归 `-n` 显示行号 `-v` 反选 `-c` 计数 `-l` 仅列文件名 `-E` 扩展正则 `-A/-B/-C` 上下文行 |

### grep 实战示例

```bash
# 在源码中搜索
grep -rn "EPERM" ./src --include="*.c"     # 递归搜索 .c 文件
grep -rn "TODO\|FIXME" . --include="*.c"   # 搜索多个模式

# 配合编译输出
./build.sh 2>&1 | grep -E "error|warning"   # 过滤编译错误/警告
dmesg | grep -i "error"                     # 内核日志查错

# 过滤进程 / 文件
ps aux | grep "[n]ginx"                     # 查 nginx 进程（自去 grep 本身）
grep -v "^#" /etc/nginx/nginx.conf          # 去注释行
```

---

## 三、打包压缩与构建

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `tar` | 归档/解压文件 | `-c` 创建 `-x` 解压 `-z` gzip `-j` bzip2 `-J` xz `-v` 详细 `-f` 指定包名 `-t` 查看内容 `-C` 指定目录 |
| `gzip`/`gunzip` | 单文件压缩/解压 | `-k` 保留原文件 `-d` 解压（同 `gunzip`） `-v` 显示压缩比 |
| `make` | 自动化构建工具 | `-j$(nproc)` 并行编译 `-C dir` 进入目录执行 `-B` 强制重编 `-n` 预览 |

```bash
# tar 典型用法
tar -czf project.tar.gz ./src/              # 创建 .tar.gz 归档
tar -xzf project.tar.gz -C /tmp/            # 解压到 /tmp
tar -tf project.tar.gz                      # 查看包内文件列表
tar -xvf package.tar                        # 解压纯 tar

# make 实战
make -j$(nproc)                             # 全核并行编译
make -C build clean && make -C build -j8    # 清理后重新构建
make install DESTDIR=/tmp/staging            # 指定安装前缀
make -n                                      # 预览即将执行的命令
```

---

## 四、进程管理与系统诊断

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `ps` | 快照进程状态 | `aux` 所有进程详细信息 `-ef` 标准格式 `-eo` 自定义输出 `-L` 显示线程 |
| `top` | 实时进程监控 | `-p PID` 盯单个 PID `-H` 线程模式（交互按 `H`） `-b -n 1` 批处理快照 |
| `kill` | 按 PID 发信号 | `-9` SIGKILL 强制 `-15` SIGTERM 优雅（默认） `-2` SIGINT `-3` SIGQUIT |
| `pkill` | 按名称发信号 | `-f` 匹配完整命令行 `-9` 强制 `-x` 精确匹配 `-u` 指定用户 |
| `killall` | 按进程名发信号 | `-r` 正则匹配 `-u` 限用户 `-I` 忽略大小写 |
| `jobs` / `fg` / `bg` | 作业控制 | `-l` 显示 PID；`fg %1` 前台恢复；`bg %1` 后台继续 |
| `nohup` | 忽略 HUP 信号 | 配合 `&` 后台持久跑：`nohup ./server &` |

```bash
# 进程排查三板斧
ps auxf                                       # 进程树，看父子关系
ps -eLo pid,tid,comm,pcpu | grep my_server    # 查看线程级 CPU 占用

# 优雅/强制杀进程
pkill -f "my_server"                          # 按命令行匹配杀死
kill -9 $(pgrep my_server)                    # 强制杀死
kill -3 $(pidof my_server)                    # SIGQUIT → 触发 coredump

# 后台持久化
nohup ./slow_task --config=prod.ini > task.log 2>&1 &
disown                                        # 从 shell 作业表移除
```

---

## 五、权限与校验

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `chmod` | 修改文件权限 | `u+x` 所有者加执行 `ugo=rwx` 三类用户 `-R` 递归 `--reference=RFILE` 参考权限 |
| `chown` | 修改文件所有者/组 | `user:group` 同时改 `-R` 递归 `--from=旧` 限从旧值改 |
| `umask` | 设置默认权限掩码 | `umask 022` → 文件 `644`，目录 `755` |
| `md5sum` | 计算/校验 MD5 摘要 | `-c` 检查文件一致性 `--tag` BSD 风格输出 |


```bash
chmod +x ./build.sh                           # 加执行权限
chmod -R u+rwX ./deploy/                      # 递归：所有者读写+执行(dir)
chown root:root ./a.out && chmod u+s ./a.out  # SUID 提权（谨慎使用）

# 校验文件完整性
md5sum project.iso                            # 计算 MD5
echo "d41d8cd98f00b204e9800998ecf8427e  file" | md5sum -c -  # 验证

# 校验下载包
md5sum -c downloaded.tar.gz.md5               # 依据 .md5 文件批量校验
```

---

## 六、重定向与管道

| 符号 | 作用 | 示例 |
|------|------|------|
| `>` | 覆盖输出到文件 | `gcc main.c 2> build.log` |
| `>>` | 追加输出到文件 | `echo "EOF" >> log.txt` |
| `<` | 文件作为输入 | `wc -l < /etc/passwd` |
| `2>` | 重定向 stderr | `gcc main.c 2> err.log` |
| `&>` | 重定向 stdout+stderr | `./test &> output.log` |
| `2>&1` | stderr 并入 stdout | `cmd > log 2>&1` |
| `\|` | 管道：前 stdout → 后 stdin | `ps aux | grep nginx` |
| `tee` | 输出到文件+同时显示 | `make 2>&1 | tee build.log` |
| `$()` | 命令替换 | `gcc -o myapp $(find . -name "*.c")` |

```bash
# 编译输出分离
gcc -o server server.c util.c 2> build_err.log  # 错误单独记日志
gcc -o server *.c 2>&1 | tee build.log          # 全量输出 + 屏幕实时

# 调试信息采集
./daemon --verbose > /var/log/daemon.log 2>&1 & # 全部日志 + 后台

# 组合用法
cat /proc/cpuinfo | grep "model name" | head -4  # 查看 CPU 信息
find /proc -maxdepth 2 -name "maps" 2>/dev/null  # 静默抹掉权限错误
```
---

## 七、C 编译工具链

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `gcc` | GNU C 编译器 | `-o` 输出名 `-Wall -Wextra` 警告 `-g` 调试符号 `-O0~-O3` 优化等级 `-I` 头文件路径 `-L` 库路径 `-l` 链接库 `-D` 定义宏 `-std=c11/c17/c23` 标准 `-fsanitize=address` 地址消毒 |
| `g++` | GNU C++ 编译器 | 同上 + `-std=c++17/c++20/c++23` |
| `ldd` | 查看动态库依赖 | `-v` 详细版本信息 `-u` 未使用的直接依赖 |
| `objdump` | 反汇编/分析目标文件 | `-d` 反汇编 `-t` 符号表 `-x` 所有头信息 `-S` 混排源码+汇编 `-l` 行号对应 `-M intel` Intel 语法 |
| `nm` | 列出目标文件符号 | `-C` C++ demangle `-g` 仅外部符号 `-u` 未定义符号 |
| `strip` | 去除调试符号/减小体积 | `-g` 仅 strip 调试 `--strip-unneeded` 去除链接不需要的 |
| `size` | 查看段大小 | 输出 text/data/bss/dec/hex |
| `readelf` | ELF 文件分析器 | `-h` ELF 头 `-S` 段表 `-l` 程序头 `-s` 符号表 |
| `ar` | 静态库打包 | `-rcs` 创建/替换/索引 `-t` 查看内容 `-x` 解包 |

```bash
# 编译 debug 版
gcc -g -Wall -Wextra -std=c11 -o myapp main.c util.c

# 开启 ASan 内存检测
gcc -g -fsanitize=address -fno-omit-frame-pointer -o test test.c
./test                                           # 内存越界/泄漏当场崩溃并输出来源

# 发行版编译（优化 + 去符号）
gcc -O2 -march=native -flto -DNDEBUG -o release main.c
strip release                                    # 进一步减小体积

# 链接三方库
gcc -o app app.c -I/usr/local/include -L/usr/local/lib -lzmq -lpthread

# 反汇编查找热点
objdump -d myapp | grep -A 20 "hot_function>:"
objdump -d -M intel --no-show-raw-insn myapp | less   # Intel 语法反汇编

# 看链接库依赖
ldd myapp                                        # 检查动态库是否缺
readelf -d myapp | grep NEEDED                   # 同上，但更底层

# 静态库操作
ar -rcs libutil.a util1.o util2.o               # 打包静态库
ar -t libutil.a                                  # 查看包含的 .o
```

---

## 八、调试与分析

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `gdb` | GNU 调试器 | `-tui` 文本界面 `-batch` 批处理 `-ex` 执行命令 `-x file` 从 GDB 脚本读命令 `--args` 传参给被调试程序 |
| `valgrind` | 内存错误检测器 | `--tool=memcheck`（默认） `--leak-check=full` `--show-leak-kinds=all` `--track-origins=yes` |
| `strace` | 跟踪系统调用 | `-p PID` 附加进程 `-e trace=open,read` 过滤系统调用 `-c` 统计汇总 `-t` 时间戳 `-f` 跟踪子进程 |
| `ltrace` | 跟踪库函数调用 | `-p PID` 附加 `-e` 过滤 `-S` 同时显示系统调用 |
| `lsof` | 列出进程打开的文件 | `-i:PORT` 端口占用 `-u user` 用户文件 `-p PID` 进程文件 `+D dir` 目录占用 |
| `perf` | Linux 性能分析器 | `top` 实时热点 `record/report` 采样+报告 `stat` 硬件计数 |
| `time` | 测量命令执行时间 | `-p` POSIX 格式；建议用 `/usr/bin/time -v` 获取详细信息 |

### gdb 速查

```gdb
# 启动方式
gdb ./myapp                                    # 启动调试
gdb --args ./myapp --port=8080                 # 带参数启动
gdb ./myapp core.12345                         # 分析 core dump
gdb -p $(pgrep myapp)                          # 附加到运行中进程

# 常用 GDB 命令
b main                                         # 在 main 打断点
b file.c:42                                    # 在文件行号打断点
b func_name if x == 5                          # 条件断点
r                                              # 运行
bt                                             # 回溯栈帧（最常用：查崩溃点）
frame N                                        # 切换栈帧
info locals                                    # 查看本地变量
p variable                                     # 打印变量值
p *array@10                                    # 打印数组前 10 个
l                                              # 显示源码上下文
n / s                                          # next（步过）/ step（步入）
c                                              # continue 继续
finish                                         # 执行到函数返回
watch x                                        # 监视变量变化（硬件断点）
set var x = 42                                 # 运行时修改变量值
call func()                                    # 运行时调用函数
disas                                          # 反汇编当前函数
info registers                                 # 查看寄存器

# 宏/脚本
define mycmd                                   # 自定义命令
  bt
  info locals
end
```

```bash
# core dump 分析
ulimit -c unlimited                            # 开启 core dump
./crash                                        # 触发 segfault
gdb ./crash core.*                             # bt 立刻看到崩溃位置

# strace 排障
strace -f -e trace=network -t ./my_server      # 跟踪所有网络相关系统调用
strace -p 1234 -e trace=open,read,write -c     # 统计某进程文件操作次数

# 端口/文件排查
lsof -i :8080                                  # 谁占用了 8080？
lsof -p $(pidof myapp) | grep '\.so$'          # 进程加载了哪些 so
fuser -v 8080/tcp                              # 更简洁的端口查找

# perf 性能采样
perf record -g ./myapp                         # 以调用图模式采样
perf report -g graph                           # 报告热点路径
perf top -p $(pidof myapp)                     # 实时看热点函数
```

---

## 九、信息查询与帮助

| 命令 | 一句话总结 | 常用参数 |
|------|-----------|----------|
| `man` | 查看系统手册 | `-k` 关键词搜索（等价 `apropos`） `-f` 等于 `whatis` `N` 在 man 内数字键切章节 |
| `which` | 定位可执行文件路径 | `-a` 列出所有匹配（PATH 中全部位置） |
| `whereis` | 定位二进制/源码/man | `-b` 仅二进制 `-s` 仅源码 `-m` 仅 man |
| `history` | 查看命令历史 | `N` 回显第 N 条 `!!` 上一条 `!$` 上条参数 `!vim` 最近的 vim 命令 |
| `file` | 识别文件类型 | 输出 ELF/ASCII/脚本/压缩包等描述 |
| `uname` | 系统信息 | `-a` 全部信息 `-r` 内核版本 |
| `uptime` | 系统运行时间+负载 | 输出 1/5/15 分钟平均负载 |
| `dmesg` | 查看内核环形缓冲区 | `-H` 人性化时间 `-T` 可读时间 `-w` 实时跟踪 `-l err` 仅错误级别 |
| `free` | 内存使用情况 | `-h` 可读格式 `-m` MB `-s N` 每 N 秒刷新 |
| `df` | 磁盘分区空间 | `-h` 可读 `-T` 文件系统类型 `-i` inode 使用 |
| `du` | 目录/文件磁盘占用 | `-sh *` 汇总当前目录各项大小 `-h` 可读 `--max-depth=1` 一层深度 |

```bash
# 快速查手册
man 2 open                                     # 查看系统调用 open（章节 2）
man 3 printf                                   # 查看库函数 printf（章节 3）
man -k "shared memory"                         # 搜索共享内存相关手册

# 查看系统/资源
uname -a                                       # 完整内核版本信息
free -h                                        # 内存总量 / 使用 / 可用
df -hT                                         # 磁盘分区 + 文件系统类型
du -sh /var/log/*.log                          # 各日志文件体积
dmesg -T | tail -20                            # 最近内核日志
dmesg -T | grep -i "oom\|killed"               # 看是否被 OOM Killer 杀了

# 文件类型识别
file /bin/ls                                   # → ELF 64-bit LSB executable
file unknown.bin                               # 识别未知二进制
```

---

## 十、高频组合与场景速查

### 场景 1：服务进程挂了，查原因

```bash
dmesg -T | tail -50                            # 看内核是否杀了它（OOM/segfault）
tail -100 /var/log/syslog                      # 系统日志
strace -p $PID 2>&1 | head -20                 # 若还在运行，卡在哪
gdb ./server core                              # core dump → bt 查崩溃点
```

### 场景 2：磁盘满了

```bash
df -h                                          # 先看哪个分区满了
du -sh /* 2>/dev/null                          # 定位一级目录大户
du -sh /var/log/*.log | sort -rh | head -10    # 日志文件 TOP10
find /var -type f -name "*.log" -size +100M    # 超 100M 的日志
lsof | grep deleted                            # 已被删除但仍被进程占用的文件
```

### 场景 3：谁占着端口

```bash
ss -tlnp | grep :8080                          # 现代版更快的 netstat
lsof -i :8080                                  # 传统查找
fuser -v 8080/tcp                              # 更简洁
```

### 场景 4：编译报错分析

```bash
make -j$(nproc) 2>&1 | tee build.log           # 全量输出存盘
grep -E "error:" build.log                     # 只看错误
grep -E "warning:" build.log | wc -l           # 数警告数量
gcc -E main.c -o main.i                        # 只预处理，查宏展开
```

### 场景 5：批量处理文件

```bash
# 批量重命名 .c → .bak
for f in *.c; do mv "$f" "${f}.bak"; done

# 批量删除 .o 和 .a
find . \( -name "*.o" -o -name "*.a" \) -delete

# 批量替换文本（sed）
find ./src -name "*.c" -exec sed -i 's/DEBUG/NDEBUG/g' {} \;

# 统计所有 .c 行数
find . -name "*.c" -exec wc -l {} + | tail -1
```

### 场景 6：环境与别名

```bash
# 个人常用别名（写入 ~/.bashrc 或 ~/.bash_aliases）
alias ll='ls -lhF'
alias la='ls -lAh'
alias gcc-debug='gcc -g -Wall -Wextra -std=c11 -DDEBUG -fsanitize=address'
alias ports='ss -tlnp'
alias memusage='ps -eo pid,comm,rss --sort=-rss | head -15'

# 环境变量
export CFLAGS="-O2 -march=native -flto"
export PATH=$PATH:~/tools/cross-compiler/bin
```

---

### 附录：信号速查表

| 信号 | 编号 | 默认动作 | 用途 |
|------|------|---------|------|
| SIGHUP | 1 | 终止 | 挂起/重读配置（nginx -s reload 发此信号） |
| SIGINT | 2 | 终止 | 键盘 `Ctrl+C` |
| SIGQUIT | 3 | 终止+core | 键盘 `Ctrl+\`，用于触发 coredump |
| SIGKILL | 9 | 终止 | 强杀（进程不可捕获/忽略） |
| SIGSEGV | 11 | 终止+core | 段错误（空指针/越界） |
| SIGTERM | 15 | 终止 | 优雅终止（默认 kill 发此信号） |
| SIGSTOP | 19 | 暂停 | `Ctrl+Z` 停止进程（不可忽略） |

---

> **编写原则**：每条命令只留最常用的 3–6 个参数，示例贴近 C 编译、进程调试、系统排障等真实场景。可 Ctrl+F 在此页快速检索命令名。

## 小结

面对具体问题时，可以先判断它属于文件、文本、进程、权限、构建还是性能分析，再从对应章节选择最小的一组命令组合使用。命令的参数不在于越多越好，而在于理解它们对输入、输出和系统状态的影响。

