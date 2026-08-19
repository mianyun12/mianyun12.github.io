---
title: CSAPP Link Lab：重定位、静态链接与动态链接
pubDate: 2026-05-22
description: 从可重定位目标文件到可执行文件，记录 Link Lab 中重定位、静态库、共享库、GOT/PLT 和符号解析的完整实验过程。
author: 眠云
slugId: csapp-linklab-process
tags: ["csapp"]
category: "csapp"
draft: false
---

Link Lab 让我第一次把“gcc 编译并运行”拆成了可以逐字节验证的过程：编译器留下未决符号，汇编器写入重定位条目，链接器完成符号解析、节合并和地址修正；使用共享库时，PLT 和 GOT 又把部分地址绑定延迟到运行时。

这篇文章按实验时的排查路径组织，而不是只给理论定义。每个结论都尽量由链接前后的反汇编、符号表、重定位表、命令输出或地址计算闭环验证。

## 1. 实验目标：把链接从黑盒变成证据链

实验围绕四个问题展开：

1. 一个源文件引用另一个文件中的全局变量或函数时，链接器如何补齐地址；
2. 静态库在编译时如何被提取并合并；
3. 共享库在加载时和运行时分别如何参与程序执行；
4. 符号解析和链接错误为什么会导致看似诡异的结果。

公开文章中的校内课程地址统一省略，命令、文件名和分析方法保留。

## 2. 先建立工具箱和观察顺序

常用命令：

~~~shell
gcc -c main.c
gcc -c sum.c
objdump -dx main.o
objdump -r main.o
readelf -r main.o
readelf -s main.o
gcc -o prog main.o sum.o
objdump -dx prog
readelf -s prog
~~~

观察顺序固定为：

~~~text
源代码中的引用
        ↓
目标文件中的占位符和重定位条目
        ↓
链接后的机器码和符号地址
        ↓
运行时的跳转、输出或错误
~~~

如果只看最终可执行文件，容易知道结果是什么却不知道链接器如何得到结果；如果只看目标文件，又无法验证重定位是否真的闭环。

## 3. prog：分析 array 和 sum 的重定位

### 3.1 先看链接前的 main.o

实验中 main.c 引用了外部数组 array，并调用了在 sum.c 中定义的 sum。编译后查看：

~~~shell
gcc -c main.c
gcc -c sum.c
objdump -dx main.o > main-relo.d
objdump -r main.o
~~~

在 main.o 的 main 函数中，引用 array 的 lea 指令通常类似：

~~~asm
48 8d 3d 00 00 00 00
~~~

后面的 4 个字节还没有最终地址。重定位表会出现类似：

~~~text
R_X86_64_PC32 array-0x4
~~~

调用 sum 的 call 也会出现占位符：

~~~asm
e8 00 00 00 00
~~~

并伴随类似：

~~~text
R_X86_64_PLT32 sum-0x4
~~~

### 3.2 初始观察和假设

- 观察：机器码中地址部分为 0，目标文件中却有重定位条目。
- 假设：汇编器知道这里引用了哪个符号，但暂时不知道符号最终地址。
- 验证：对照反汇编中的占位符位置和 relocation offset。
- 结论：目标文件不是地址错误，而是有意留下待链接的补丁位置。

### 3.3 链接后验证 array 的 PC-relative 地址

链接：

~~~shell
gcc -o prog main.o sum.o
objdump -dx prog > prog-exe.d
readelf -s prog
~~~

文档中一次真实结果显示：

- array 的符号地址为 0x4010；
- main 中 lea 指令地址为 0x1136；
- 下一条指令地址为 0x113d；
- 重定位后的偏移为 0x2ed3，机器码以小端序显示为 d3 2e 00 00。

验证公式：

~~~text
真实地址 = 下一条指令地址 + PC-relative 偏移
         = 0x113d + 0x2ed3
         = 0x4010
~~~

### 3.4 链接后验证 sum 的 call

文档中的一次结果显示 sum 入口为 0x1147，main 中 call 位于 0x113d。call 指令长度为 5 字节，因此下一条指令地址为 0x1142。重定位后的偏移是 0x05：

~~~text
跳转目标 = 0x1142 + 0x05
         = 0x1147
~~~

机器码中的 05 00 00 00 正好对应这个相对偏移。

> **推理记录**
>
> - 现象：链接前 call 的偏移为 0，链接后变成具体的小端序数字。
> - 假设：链接器把 sum 的最终地址减去 call 下一条指令地址。
> - 验证：从符号表读取 sum 地址，用指令地址和长度计算。
> - 结论：PC-relative 重定位的本质是用目标地址减下一条指令地址填补占位符。

### 3.5 函数关系图

~~~text
main.c  ──引用 array、调用 sum──┐
                                 ├─ gcc -c ─→ main.o
sum.c   ──定义 sum───────────────┘             │
                                               ↓
                               链接器：符号解析、节合并、重定位
                                               ↓
prog：array 地址确定，sum 地址确定，占位符被相对偏移替换
~~~

## 4. 静态链接：代码被拷贝进最终文件

### 4.1 构建静态库

~~~shell
gcc -c addvec.c multvec.c
ar rcs libvector.a addvec.o multvec.o
gcc -c main2.c
gcc -o prog2c main2.o ./libvector.a
objdump -dx prog2c
~~~

### 4.2 观察和假设

- 观察：prog2c 不需要运行时寻找 libvector.a。
- 假设：链接器从静态库中提取被引用的目标模块，将其代码合并进可执行文件。
- 验证：在 prog2c 反汇编中同时找到 main2 和 addvec 的代码。
- 结论：静态库是目标文件的归档；链接器按符号需求提取成员，而不是把整个库无条件复制进去。

静态链接的优点是不依赖运行时外部库，调用路径可以直接落到库函数；缺点是文件体积变大，库更新后需要重新链接。

## 5. 加载时共享库：PLT 和 GOT 的间接跳转

### 5.1 构建和运行

~~~shell
gcc -fPIC -c addvec.c multvec.c
gcc -shared -o libvector.so addvec.o multvec.o
gcc -o prog2l main2.o ./libvector.so
objdump -dx prog2l > prog2l-exe.d
readelf -r prog2l
~~~

如果运行时找不到共享库，需要在课程环境中设置库搜索路径，例如：

~~~shell
LD_LIBRARY_PATH=. ./prog2l
~~~

### 5.2 第一次观察：main 没有直接跳到 addvec

文档中的一次反汇编出现：

~~~asm
118b: e8 d0 fe ff ff    call 1060 <addvec@plt>
~~~

这里的目标不是 addvec 的真实实现，而是 PLT 桩。继续查看：

~~~asm
0000000000001060 <addvec@plt>:
    jmp *0x2f5e(%rip)
~~~

执行间接跳转时，下一条指令地址为 0x106a。根据 PC-relative 规则：

~~~text
GOT 地址 = 0x106a + 0x2f5e = 0x3fc8
~~~

0x3fc8 位于 GOT 中。第一次调用时动态链接器会解析真实地址并更新 GOT；后续调用可以直接通过 GOT 中已经写入的地址跳转。

### 5.3 推理记录

- 观察：main 调用的是 addvec@plt，PLT 又间接读取 GOT。
- 假设：共享库函数的真实地址在最终加载前无法固定，调用必须经过间接层。
- 验证：用 objdump 查看 PLT，用 readelf 或节表确认 GOT 地址。
- 结论：PLT 提供调用入口，GOT 保存可被动态链接器修正的真实地址，二者共同支持延迟绑定。

## 6. 运行时共享库：dlopen、dlsym 和 dlclose

### 6.1 调用流程

运行时加载版本的核心代码结构：

~~~c
void *handle = dlopen("./libvector.so", RTLD_LAZY);
void *symbol = dlsym(handle, "addvec");
addvec = (function_pointer)symbol;
addvec(x, y, z, 2);
dlclose(handle);
~~~

对应的思考顺序：

1. dlopen 将共享库映射进当前进程地址空间；
2. dlsym 从动态符号表中找到 addvec 的真实运行地址；
3. 函数指针调用目标函数；
4. dlclose 释放库句柄和相关资源。

如果 handle 或 symbol 为空，应立即用 dlerror 输出错误，而不是继续调用空指针。

### 6.2 运行结果验证

~~~shell
./prog2r
~~~

文档中的一次运行结果为向量相加后的 z 输出。这个结果验证的是动态加载、符号查找和函数调用链已经完整工作，不代表所有输入都会得到同一组数值。

## 7. Symbol Practice：从输出反推强弱符号规则

### 7.1 先掌握规则

链接器通常按以下顺序处理同名符号：

1. 多个强符号同名：链接失败；
2. 一个强符号和一个或多个弱符号：使用强符号；
3. 多个弱符号：链接器合并或选择一份空间，结果不应依赖这种模糊用法；
4. 链接器主要识别符号名和链接属性，不替 C 语言做完整类型安全检查。

### 7.2 foo3/bar3：强符号覆盖弱符号

实验中一个文件定义并初始化强符号 x，另一个文件使用未初始化的同名全局变量。构建运行：

~~~shell
gcc -Og -o foobar3 foo3.c bar3.c
./foobar3
nm foobar3 | grep x
~~~

观察到 bar3 中的访问绑定到 foo3 的强符号地址，后续赋值修改的是同一块内存。输出中的 x 发生变化，验证了强符号优先级。

### 7.3 foo4/bar4：两个弱符号

两个文件都定义未初始化的同名全局变量时，链接器可能把它们放到同一块 BSS 空间。程序先从一个文件写入，再由另一个文件修改，最终输出显示双方访问的是同一位置。

这里的思考重点不是记住最后一定是多少，而是认识到这种写法依赖实现细节，应该改用头文件中的 extern 声明和单一实体定义。

### 7.4 foo5/bar5：类型不匹配造成覆写

文档中的关键现象是：一侧把 x 当作 4 字节 int，另一侧把同名 x 当作 8 字节 double。链接器仍然可能按符号名把两者绑定到同一地址，却不检查两边的类型和大小。

结果是 8 字节写入覆盖了相邻变量 y。输出中 x 和 y 都出现异常值，说明问题不是普通算术，而是内存边界已经被破坏。

> **推理记录**
>
> - 观察：程序能链接甚至运行，但相邻变量值被改变。
> - 假设：同名符号绑定成功，却存在访问宽度不一致。
> - 验证：用 nm 查看符号地址，用 sizeof 和反汇编确认写入宽度，再查看相邻内存。
> - 结论：链接成功不代表类型使用正确；跨文件全局符号必须共享一致声明。

### 7.5 foo6：编译期声明错误和 warning

文档中还遇到过两个看似属于链接实验、实际发生在编译阶段的问题：

- 调用了 f，却没有函数声明，现代 GCC 报 implicit declaration；
- 把不合法的对象当成 main，触发 Werror=main。

排查步骤：

~~~shell
gcc -Wall -Og -o foobar6 foo6.c bar6.c
~~~

先看报错文件、行号和阶段，再补充正确的函数原型或修正函数定义。不能把所有错误都归类为链接器错误。

## 8. Fail at Link Time：从错误信息定位阶段

### 8.1 未定义引用

~~~shell
make linkerror
~~~

如果看到 undefined reference to f，说明源文件可以生成目标文件，但链接器在所有输入文件中找不到 f 的定义。修正思路是提供实现文件，或确认目标文件确实加入链接命令。

### 8.2 多个强符号

~~~shell
make foobar1
~~~

如果报 multiple definition of main，说明多个目标文件都定义了强符号 main。链接器无法决定保留哪一个，所以停止链接。

### 8.3 多个同名强变量

~~~shell
make foobar2
~~~

如果报 multiple definition of x，说明多个文件都定义了同名强符号变量。应当只保留一处定义，其他文件通过 extern 声明引用，或使用 static 限制文件内可见性。

### 8.4 Makefile 的作用

实验通过 Makefile 统一构建不同部分：

~~~shell
make
make prog2c
make prog2l
make prog2r
make foobar3
make foobar4
make foobar5
make linkerror
make clean
~~~

遇到“找不到可执行文件”或“Permission denied”时，先检查前一条编译是否真的成功、文件是否存在、是否有执行权限，不要直接把运行失败当成实验原理。

## 9. 从实验前到实验后的认识变化

### 9.1 实验前的猜测

实验开始前，我知道源代码会经过预处理、编译、汇编和链接，也知道多个 .o 文件最终会被合成可执行文件，但不知道未知地址如何被保存、谁负责修补，也不了解静态库、共享库和 GOT/PLT 在机器码层面的差异。

### 9.2 实验后的结论

1. 重定位是把占位符替换为可计算地址的过程；
2. 符号解析先建立引用和定义关系，重定位再修正机器码；
3. 静态链接把使用到的目标模块拷贝到最终文件；
4. 共享库通过 PIC、PLT 和 GOT 将地址绑定推迟到加载或第一次调用；
5. 符号解析阶段可能缺少完整类型检查，因此跨文件全局变量必须规范声明；
6. 链接错误信息可以帮助定位究竟是编译、汇编还是链接阶段失败。

## 10. 最终方法总结

遇到链接问题时，按以下顺序排查：

~~~text
先判断失败发生在哪个阶段
        ↓
查看目标文件是否有未决符号
        ↓
查看 relocation 条目和占位符
        ↓
查看符号表中的最终地址
        ↓
手算 PC-relative 偏移
        ↓
对照链接后机器码
        ↓
再观察运行时 PLT、GOT 或输出
~~~

理解链接不只是为了记住命令，而是为了能把“源代码—符号—机器码—地址—内存—运行结果”串成一条可验证的因果链。

