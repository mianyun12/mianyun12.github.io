---
title: "C 语言文件输入函数整理文档"
pubDate: 2026-07-13
description: "整理 C 语言中通过 FILE 流读取数据的 fread、fscanf、fgets、fgetc 与 getc 函数。"
author: "眠云"
slugId: c-file-input-functions-reference
image: ""
tags: ["C语言","文件IO","标准库"]
category: "小学期"
draft: false
---

## 导读

文件输入函数看似都在“读取数据”，但它们面对的数据单位、格式约束和返回值语义并不相同。本文保留原有函数原型、参数说明和示例，按读取粒度整理成一份适合 C 语言学习与复习的在线参考文档。

# 文件输入函数整理文档

根据提供的图像资料，以下整理了专用于从文件流中读取数据（非终端输入）的 C 语言库函数。这些函数均需要明确传入 `FILE *stream` 指针作为目标。

### 1. `fread` (二进制块数据读入)

* **函数原型**：`size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream)`
* **功能描述**：从给定流 stream 读取数据到 ptr 所指向的数组中。
* **参数解析**：
* `ptr`：指向接收数据的内存块（如数组、结构体）的指针。
* `size`：每次读取的单个数据元素的字节大小。
* `nmemb`：预期读取的元素个数。
* `stream`：指向处于打开状态的输入文件流的指针。


* **返回值**：返回实际成功读取的元素总数（`size_t` 类型）。如果该返回值小于传入的 `nmemb`，通常说明已到达文件末尾或读取时发生了错误。
* **应用举例**：
```c
FILE *fp = fopen("data.bin", "rb");
int buffer[10];
if (fp != NULL) {
    // 从文件中读取 10 个 int 大小的数据到 buffer 数组中
    size_t items_read = fread(buffer, sizeof(int), 10, fp);
    fclose(fp);
}

```



---

### 2. `fscanf` (格式化读入)

* **函数原型**：`int fscanf(FILE *stream, const char *format, ...)`
* **功能描述**：从流 stream 读取格式化输入。
* **参数解析**：
* `stream`：指向输入文件流的指针。
* `format`：格式化控制字符串，包含转换说明符（如 `%d`, `%s`, `%f`），定义了期望的数据格式。
* `...`：可变参数列表，为对应格式说明符解析出的值提供存储地址（指针）。


* **返回值**：返回成功匹配并完成赋值的输入项个数。如果文件为空或在首次转换前遇到读取错误，则返回宏 `EOF`。
* **应用举例**：
```c
FILE *fp = fopen("config.txt", "r");
int width, height;
if (fp != NULL) {
    // 从文本文件中按照特定格式读取两个整数
    fscanf(fp, "resolution=%dx%d", &width, &height);
    fclose(fp);
}

```



---

### 3. `fgets` (按行读取字符串)

* **函数原型**：`char *fgets(char *str, int n, FILE *stream)`
* **功能描述**：从指定的流 stream 读取一行，并把它存储在 str 所指向的字符串内。 当读取 (n-1) 个字符时，或者读取到换行符时，或者到达文件末尾时，它会停止，具体视情况而定。
* **参数解析**：
* `str`：指向用于存储读取结果的字符数组指针。
* `n`：单次允许读取的最大字符数（包含末尾自动添加的 `\0` 终止符）。
* `stream`：指向输入文件流的指针。


* **返回值**：读取成功时返回 `str` 的地址；若在读取任何字符前到达文件末尾或发生读取错误，则返回 `NULL`。
* **应用举例**：
```c
FILE *fp = fopen("log.txt", "r");
char line[256];
if (fp != NULL) {
    // 安全地从文件中读取一行，防止缓冲区溢出
    if (fgets(line, sizeof(line), fp) != NULL) {
        printf("Read: %s", line);
    }
    fclose(fp);
}

```



---

### 4. `fgetc` (单字符读入函数)

* **函数原型**：`int fgetc(FILE *stream)`
* **功能描述**：从指定的流 stream 获取下一个字符（一个无符号字符），并把位置标识符往前移动。
* **参数解析**：
* `stream`：指向输入文件流的指针。


* **返回值**：将读取到的无符号字符以 `int` 形式返回。如果到达文件末尾或遇到读错误，则返回 `EOF`。
* **应用举例**：
```c
FILE *fp = fopen("text.txt", "r");
int ch;
if (fp != NULL) {
    // 逐字符读取直到文件末尾
    while ((ch = fgetc(fp)) != EOF) {
        putchar(ch); 
    }
    fclose(fp);
}

```



---

### 5. `getc` (单字符读入宏/函数)

* **函数原型**：`int getc(FILE *stream)`
* **功能描述**：从指定的流 stream 获取下一个字符（一个无符号字符），并把位置标识符往前移动。
* **参数解析**：
* `stream`：指向输入文件流的指针。


* **返回值**：与 `fgetc` 完全一致，返回读取到的字符或 `EOF`。
* **补充说明**：在标准库实现中，`getc` 通常被高度优化并定义为宏，而 `fgetc` 强制作为函数实现。
* **应用举例**：
```c
FILE *fp = fopen("data.txt", "r");
if (fp != NULL) {
    // 读取文件的第一个字符
    int first_char = getc(fp);
    fclose(fp);
}

```

## 小结

选择文件输入函数时，可以先明确读取目标是二进制块、格式化字段、完整文本行还是单个字符；同时检查文件流是否成功打开，并正确处理返回值和 `EOF`，这样才能让读取逻辑更加可靠。

