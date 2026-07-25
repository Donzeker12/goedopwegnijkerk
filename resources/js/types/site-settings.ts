export interface SiteSettingsHeroHighlight {
    eyebrow: string;
    title: string;
    description: string;
}

export interface SiteSettingsQualityCard {
    icon: string;
    title: string;
    description: string;
}

export interface SiteSettingsLinkItem {
    label: string;
    href: string;
}

export interface SiteSettingsFaqItem {
    question: string;
    answer: string;
}

export interface HomeHeroSettings {
    badge: string;
    title_line_1: string;
    title_highlight: string;
    description: string;
    tagline: string;
    primary_cta_label: string;
    primary_cta_href: string;
    secondary_cta_label: string;
    secondary_cta_href: string;
    highlights: SiteSettingsHeroHighlight[];
}

export interface HomeQualitySettings {
    eyebrow: string;
    title: string;
    cards: SiteSettingsQualityCard[];
}

export interface HomeMaintenanceCard {
    badge: string;
    title: string;
    description: string;
    items: string;
    price_label: string;
    price: string;
}

export interface HomeMaintenanceSettings {
    eyebrow: string;
    title: string;
    description: string;
    cards: HomeMaintenanceCard[];
}

export interface HomeFeaturedSettings {
    eyebrow: string;
    title: string;
    description: string;
    link_label: string;
    link_href: string;
}

export interface HomeCtaSettings {
    title: string;
    description: string;
    button_label: string;
    button_href: string;
}

export interface HomeInfoSettings {
    title: string;
    description: string;
    links: SiteSettingsLinkItem[];
}

export interface ShopHeroSettings {
    title: string;
    count_label_singular: string;
    count_label_plural: string;
}

export interface ShopInfoSettings {
    title: string;
    description: string;
    links: SiteSettingsLinkItem[];
}

export interface FaqHeroSettings {
    icon: string;
    title: string;
    description: string;
}

export interface FaqQuestionsSettings {
    items: SiteSettingsFaqItem[];
}

export interface FaqCtaSettings {
    title: string;
    description: string;
    button_label: string;
    button_href: string;
}
