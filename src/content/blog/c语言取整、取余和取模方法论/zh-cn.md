---
title: c语言取整、取余和取模方法论
pubDate: 2026-08-20
description: 请在此处填写文章简述
author: 眠云
slugId: c语言取整取余和取模方法论-1787221498
image: "./cover.jpg"
tags: ["技术笔记"]
category: "技术笔记"
draft: false
---

# 1.取整方法论

## 向0取整

C语言中整数除法(/)就是遵循这一取整方式。下面代码中浮点数字面量拷贝赋值时发生了隐式类型转换

```
#include<stdio.h>
int main()
{
    int i = -2.9;
    int j = 2.9;
    printf("%d\n", i); //结果是-2
    printf("%d\n", j); //结果是2
    
    return 0;
}
```

或者使用trunc取整函数

```
#include<math.h>
#include<stdio.h>
int main()
{
    int i = -2.9;
    int j = 2.9;
    printf("%f\n", trunc(i)); //结果是-2
    printf("%f\n", trunc(j)); //结果是2
    
    return 0;
}
```

## floor取整（需要math.h头文件）

本质是向-∞取整，注意输出格式要不然看不到结果，比如：

```
#include <stdio.h>
#include <math.h> //因为使用了floor函数，需要添加该头文件
int main()
{
    printf("%.1f\n", floor(-2.9)); //结果是-3
    printf("%.1f\n", floor(-2.1)); //结果是-3
    printf("%.1f\n", floor(2.9)); //结果是2
    printf("%.1f\n", floor(2.1)); //结果是2
    
    return 0;
}
```

## ceil取整（需要math.h头文件）

本质是向+∞取整，注意输出格式要不然看不到结果，比如：

```
#include <stdio.h>
#include <math.h>
int main()
{
    printf("%.1f\n", ceil(-2.9)); //结果是-2
    printf("%.1f\n", ceil(-2.1)); //结果是-2
    printf("%.1f\n", ceil(2.9)); //结果是3
    printf("%.1f\n", ceil(2.1)); //结果是3
    
    return 0;
}
```

## round取整（需要math.h头文件）

本质是四舍五入取整，比如：

```text
#include <stdio.h>
#include <math.h>
int main()
{
    printf("%.1f\n", round(2.1));//结果是2
    printf("%.1f\n", round(2.9));//结果是3
    printf("%.1f\n", round(-2.1));//结果是-2
    printf("%.1f\n", round(-2.9));//结果是-3
    
    return 0;
}
```

# 2.取余、取模方法论

根据推导公式 `被除数 = 商 * 除数 + 余数`（即 `a = q * d + r`），在C语言中：

- **当两数同号时**：取余和取模的结果一致。
- **当两数异号时**：余数的符号永远与“被除数（即 `%` 左边的数）”保持一致。

**典型计算示例直观对照**

- **异号（左负右正）**：`-10 / 3 = -3` 👉 `-10 % 3 = -1` （余数符号跟着左边的 `-10` 走，为负）
- **异号（左正右负）**：`10 / -3 = -3` 👉 `10 % -3 = 1` （余数符号跟着左边的 `10` 走，为正）
- **文首的引例**：`2 / (-2) = -1`，因为能够完全整除，所以 `2 % (-2) = 0`。

**一句话总结口诀**：在C语言里算 `%`，先正常做除法求出商，余数的正负号直接抄被除数（左边的数）的即可！
