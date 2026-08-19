export type SiteConfig = {
    title: string;
    subTitle: string;

    favicon: string;

    pageSize: number;
    toc: {
        enable: boolean;
        depth: number;
    };
    blogNavi: {
        enable: boolean;
    };
    comments: {
        enable: boolean;
        platform: string;
        backendUrl: string;
    };
    theme: {
        AOS: boolean;
        LQIP: boolean;
        PhotoSwipe: boolean;
        postCard: {
            imageMode: "top" | "background"; 
        };
    }
}

export type ProfileConfig = {
    avatar: string;
    name: string;
    description: string;
    indexPage?: string;
    startYear: number;
    links?: {
        name: string;
        url: string;
        icon: string;
        color: string;
    }[];
}

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type AboutAccent = "pink" | "lilac" | "peach" | "blue" | "mint";

export type AboutProject = {
    title: string;
    description: string;
    tags: string[];
    status: "online" | "soon";
    href?: string;
    accent: AboutAccent;
};

export type AboutGame = {
    title: string;
    image: string;
    uid?: string;
    href?: string;
    accent: AboutAccent;
};

export type AboutProfileLink = {
    name: string;
    url: string;
    icon: "github" | "bilibili" | string;
};

export type AboutConfig = {
    profile: {
        avatar: string;
        links: AboutProfileLink[];
    };
    projects: AboutProject[];
    games: AboutGame[];
    readme: {
        stack: string[];
        href?: string;
    };
};
