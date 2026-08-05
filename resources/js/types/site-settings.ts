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

export interface HomeMaintenanceServiceCard {
    icon: string;
    title: string;
    description: string;
    button_label: string;
    button_href: string;
}

export interface HomeMaintenanceSettings {
    eyebrow: string;
    title: string;
    description: string;
    service_cards: HomeMaintenanceServiceCard[];
}

export interface MaintenancePageSettings {
    eyebrow: string;
    title: string;
    description: string;
    small_badge: string;
    small_title: string;
    small_description: string;
    small_items: string;
    small_price_label: string;
    small_price: string;
    large_badge: string;
    large_title: string;
    large_description: string;
    large_items: string;
    large_price_label: string;
    large_price: string;
}

export interface HomeReviewItem {
    name: string;
    city: string;
    rating: string;
    text: string;
}

export interface HomeReviewsSettings {
    eyebrow: string;
    title: string;
    description: string;
    items: HomeReviewItem[];
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
