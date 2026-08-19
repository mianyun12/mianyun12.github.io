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
        { title: "崩坏：星穹铁道", image: "/assets/games/e837f1753a2b195d9bb8589336e7c025_720.jpg", uid: "128370313", accent: "peach" },
        { title: "明日方舟", image: "/assets/games/5e0cca5f8ebfa9f0618ae003294df8fa_720.jpg", uid: "86862039", accent: "blue" },
        { title: "明日方舟：终末地", image: "/assets/games/34bf023e6ebdb94978f8799b349a0982_720.jpg", uid: "1490133132", accent: "mint" },
        { title: "重返未来：1999", image: "/assets/games/67876c9242e6293eee4ac9c48588aa2a_720.jpg", uid: "117642743", accent: "pink" },
        { title: "鸣潮", image: "/assets/games/b9fc69a6dd289f2dd1dca4e36a8a06fb_720.jpg", uid: "128134441", accent: "blue" },
        { title: "异环", image: "/assets/games/560b15b4a714ded853f9a5e5e9068513_720.jpg", uid: "220065568041", accent: "peach" },
        { title: "Steam", image: "/assets/games/steam.png", uid: "", accent: "lilac" },
        { title: "洛克王国：世界", image: "/assets/games/0f133c1e4891a7c52a1237562bf8944c_720.jpg", uid: "370469064", accent: "mint" },
    ],
    readme: {
        stack: ["Astro", "Momo Theme", "GitHub Actions", "C/C++", "Python"],
    },
};

export const friendLinkConfig: FriendLink[] = []
