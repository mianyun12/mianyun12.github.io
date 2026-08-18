import type { Translation } from "@i18n/key";

const translation: Translation = {
    header: {
        home: "首页",
        archive: "归档",
        about: "关于",
        friends: "友链",
    },
    cover: {
        title: {
            home: "欢迎来到眠云的博客",
            archive: "文章归档",
            about: "关于",
            friends: "友链",
        },
        subTitle: {
            home: "Lightning Strike Horizon\n「惊雷破长空，千里赴山海」",
            archive: "共 {count} 篇文章",
            about: "一座小屋，慢慢搭，慢慢住",
            friends: "有趣的灵魂",
        }
    },
    about: {
        eyebrow: "ABOUT",
        title: "关于本站",
        subtitle: "一座小屋，慢慢搭，慢慢住，每一行代码都还热乎着。",
        greeting: "你好呀，很高兴遇见你 👋",
        introTitle: "我是眠云",
        quote: "把喜欢的事，\n一件一件，\n慢慢做到最好。",
        quoteNote: "慢一点没关系，错一些没关系——只要还在做。",
        showcaseEyebrow: "SHOWCASE",
        showcaseTitle: "项目展示集",
        showcaseDescription: "先把已经成形的作品认真摆好，新的灵感会继续补进这一排。",
        readmeEyebrow: "README",
        readmeTitle: "本站说明",
        readmeDescription: "字数有限，写不下我对它的所有偏爱。",
        readmeCardTitle: "眠云的山海行记",
        readmeCardParagraph1: "“眠云”是我给自己的一个坐标：在云下安静积蓄，也在山海之间不断出发。“山海行记”则是一份持续更新的记录——记录我写过的代码、走过的弯路、做成的作品，也记录那些还在路上的想法。",
        readmeCardParagraph2: "这里不追求一次写完的答案，只想把每一次尝试都留下，让回头再看时，能认出自己曾如何从一朵云，走向更远的山海。",
        playlogEyebrow: "PLAYLOG",
        playlogTitle: "我玩的游戏",
        playlogDescription: "代码之外的放松角落，收着最近常玩的几款游戏。",
        details: "查看详情 ↗",
        detailsUnavailable: "链接待配置",
        comingSoon: "COMING SOON",
        github: "GitHub",
        bilibili: "哔哩哔哩",
        previous: "上一个",
        next: "下一个",
        pauseCarousel: "暂停轮播",
        resumeCarousel: "继续轮播",
        carouselPosition: "第 {current} 项，共 {total} 项",
        gameUid: "UID",
        showUid: "查看 UID",
        hideUid: "收起 UID",
        noUid: "暂无",
    },
    toc: "目录",
    category: "分类",
    pageNavigation: {
        previous: "上一页",
        next: "下一页",
        currentPage: "第 {currentPage} 页，共 {totalPages} 页",
    },
    button: {
        switchDarkMode: "切换明暗模式",
        backToTop: "回到顶部",
        backToBottom: "回到底部",
        meun: "菜单",
        toc: "目录",
        backToComments: "前往评论区",
    },
    search: {
        placeholder: "输入关键词开始搜索",
        noresult: "未找到相关结果",
        error: "搜索出现错误，请稍后重试"
    },
    license: {
        author: "作者",
        license: "许可协议",
        publishon: "发布时间"
    },
    blogNavi: {
        next: "下一篇",
        prev: "上一篇"
    },
    pagecard: {
        words: "字",
        minutes: "分钟",
        uncategorized: "未分类"
    },
    comments: {
        name: "昵称",
        email: "邮箱",
        site: "网站",
        required: "必填",
        optional: "选填",
        welcome: "欢迎评论",
        comments: "条评论",
        cancel: "取消",
        send: "发送",
        sending: "发送中...",
        reply: "回复",
        replyPlaceholder: "写下你的回复...",
        loadMore: "加载更多",
        loading: "正在加载评论...",
        loadFailed: "加载失败",
        submitSuccess: "提交成功",
        submitFailed: "提交失败，请稍后再试",
        verificationRequired: "邮箱需要认证，请查收验证邮件",
        fillRequired: "请填写昵称、邮箱和评论内容",
        confirmDelete: "确定要删除这条评论吗？",
        delete: "删除",
        deleteSuccess: "删除成功",
        deleteFailed: "删除失败",
        deleteError: "删除评论失败",
        characters: "字符",
        words: "单词",
        contentTooLong: "评论内容超出限制：不超过2000字或1000单词",
        replyTo: "回复",
        write: "编辑",
        preview: "预览",
        previewError: "Markdown 语法错误",
        codeFence: "代码块标记 ``` 未闭合",
        inlineCode: "行内代码标记 ` 未闭合",
        bold: "粗体",
        italic: "斜体",
        quote: "引用",
        code: "代码",
        link: "链接",
        image: "图片",
        list: "列表",
        showMoreReplies: "查看剩余回复",
        collapseReplies: "收起回复",
    },
    langNote: {
        note: "注意：",
        description: "当前页面不支持简体中文，使用默认语言版本"
    },
    draftNote: {
        warning: "草稿警告：",
        description: "此文章为草稿，只出现在测试环境，生产环境将不会显示。"
    },
    page404: {
        title: "404 - 虚无之境",
        subTitle: "看起来你闯入了一片代码荒原，这里还没有被开发出来。",
        backToHome: "返回首页",
        backToPreview: "返回上一页",
        errorCode: "错误代码：404 - 虚无之境",
        notice: "或许你可以尝试："
    },
    themeInfo: {
        light: "切换到 浅色 模式",
        dark: "切换到 深色 模式",
        system: "切换到 跟随系统 模式"
    }
}

export default translation;
