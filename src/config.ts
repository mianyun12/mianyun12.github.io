import type {
    SiteConfig,
    ProfileConfig,
    LicenseConfig,
    AboutConfig
} from "./types/config"

import type { FriendLink } from "./types/friend"

export const siteConfig: SiteConfig = {
    title: "眠云的山海行纪",
    subTitle: "Lightning Strike Horizon",

    favicon: "/favicon/favicon.ico", // Path of the favicon, relative to the /public directory

    pageSize: 6, // Number of posts per page
    toc: {
        enable: true,
        depth: 3 // Max depth of the table of contents, between 1 and 4
    },
    blogNavi: {
        enable: true // Whether to enable blog navigation in the blog footer
    },
    comments: {
        enable: true, // Whether to enable comments
        platform: "default", // Comment platform, set "default" to use Momo-backend, also supports "twikoo"
        backendUrl: "https://api-momo.motues.top" // Backend URL for comments
    },
    theme: {
        AOS: true, // Whether to enable AOS (Animate On Scroll) for animations
        LQIP: true, // Whether to enable LQIP (Low-Quality Image Placeholder) for image placeholders
        PhotoSwipe: true, // Whether to enable PhotoSwipe for image viewer
        postCard: {
            imageMode: "top" // Cover image mode for article cards: "top" shows the image above the content; "background" uses the image as the card background, fading to transparent from right to left
        }
    }
}

export const profileConfig: ProfileConfig = {
    avatar: "assets/Motues.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    name: "眠云",
    description: "Lightning Strike Horizon",
    indexPage: "https://mianyun12.github.io",
    startYear: 2026,
}

export const licenseConfig: LicenseConfig = {
    enable: true,
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const aboutConfig: AboutConfig = {
    profile: {
        avatar: "/assets/avatar.jpg",
        links: [
            {
                name: "GitHub",
                url: "https://github.com/mianyun12",
                icon: "github",
            },
            {
                name: "哔哩哔哩",
                url: "https://space.bilibili.com/242156718?spm_id_from=333.788.0.0",
                icon: "bilibili",
            },
        ],
    },
    projects: [
        {
            title: "算法可视化工具",
            description: "支持自定义输入参数的动态演示平台，直观理解底层逻辑。",
            tags: ["Web", "C/C++"],
            status: "online",
            accent: "lilac",
        },
        {
            title: "敬请期待",
            description: "这一格留给下一份让我兴奋的小作品。",
            tags: ["WIP"],
            status: "soon",
            accent: "blue",
        },
        {
            title: "敬请期待",
            description: "占位中。也许是一个工具、一个脚本。",
            tags: ["WIP"],
            status: "soon",
            accent: "peach",
        },
        {
            title: "敬请期待",
            description: "愿意等我慢慢做。",
            tags: ["WIP"],
            status: "soon",
            accent: "mint",
        },
    ],
    games: [
        { title: "王者荣耀", image: "/assets/games/wangzhe.jpg", uid: "", accent: "lilac" },
        { title: "崩坏：星穹铁道", image: "/assets/games/starrail.jpg", uid: "", accent: "peach" },
        { title: "明日方舟", image: "/assets/games/arknights.jpg", uid: "", accent: "blue" },
        { title: "明日方舟：终末地", image: "/assets/games/endfield.jpg", uid: "", accent: "mint" },
        { title: "重返未来：1999", image: "/assets/games/reverse1999.jpg", uid: "", accent: "pink" },
        { title: "鸣潮", image: "/assets/games/wuwa.jpg", uid: "", accent: "blue" },
        { title: "异环", image: "/assets/games/yihuan.jpg", uid: "", accent: "peach" },
        { title: "Steam", image: "/assets/games/steam.jpg", uid: "", accent: "lilac" },
        { title: "洛克王国：世界", image: "/assets/games/roco-world.jpg", uid: "", accent: "mint" },
    ],
    readme: {
        title: "眠云",
        paragraphs: [
            "这座小屋是一份缓慢生长的代码笔记——数据结构、底层实验、自动化脚本，从环境配置到自动部署都是亲手一行一行搭的(vibecoding)。",
            "它不是为了完美而存在，是为了在某个深夜里，翻起来还能笑着说一句：\"原来当时是这样写的。\"",
        ],
        stack: ["Astro", "Momo Theme", "GitHub Actions", "C/C++", "Python"],
    },
};

export const friendLinkConfig: FriendLink[] = [
    {
        name: 'Motues',
        avatar: 'https://www.motues.top/avatar.jpg',
        url: 'https://www.motues.top',
        description: 'Like River!'
    },
    {
        name: 'Astro',
        avatar: 'https://avatars.githubusercontent.com/u/44914786',
        url: 'https://astro.build',
        description: 'Build fast websites, faster.'
    }
    // Add more friend links here
]
