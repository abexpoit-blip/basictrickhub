import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./types";

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  ready: boolean;
  needsPick: boolean;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);
  const [needsPick, setNeedsPick] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bt-lang") as Lang | null;
    if (saved === "en" || saved === "bn") {
      setLangState(saved);
      setNeedsPick(false);
    } else {
      setNeedsPick(true);
    }
    setReady(true);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem("bt-lang", l);
    setLangState(l);
    setNeedsPick(false);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, ready, needsPick }}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export const copy = {
  en: {
    navShop: "Shop",
    navMethod: "Method",
    navTools: "Tools",
    navLicense: "License",
    navContact: "Contact Us",
    getStarted: "Join Telegram",
    heroTitle: "Trusted Telegram Community",
    heroSub:
      "Facebook Autopay Threshold methods, ad boost systems, and free community tools — earn $10–100 daily with Basictrick.",
    heroCtaTools: "Open Tools",
    heroCtaShop: "View Shop",
    trusted: "Trusted by media buyers",
    toolsTitle: "Community Tools",
    shopTitle: "Shop",
    methodTitle: "Methods",
    contactTitle: "Contact Us",
    buyTelegram: "Buy on Telegram",
    download: "Download",
    launch: "Launch Tool",
    releaseNotes: "Release Notes",
    version: "Version",

    pickTitle: "Choose your language",
    pickSub: "Select how you want to experience Basictrick.",
    pickEn: "Continue in English",
    pickBn: "বাংলায় চালিয়ে যান",

    whatYouGet: "What you get",
    tryAdsterra: "Try Adsterra Generator",
    perk1: "Facebook Autopay Threshold methods",
    perk2: "Ads boost systems for $10–100/day",
    perk3: "Free Facebook ID & BM checkers",
    perk4: "Adsterra play-button image generator",
    perk5: "Extensions & bookmark tools for the community",

    servicesEy: "Our services",
    servicesTitle: "Everything a media buyer needs in one place",
    servicesSub:
      "Basictrick is built for Facebook advertisers — methods, tools, and community support to grow daily income.",

    s1t: "Autopay Threshold Method",
    s1d: "Learn the Autopay Threshold system step by step — account setup, pacing, and safe scaling used by our community.",
    s2t: "Ads Boost System",
    s2d: "Practical boost frameworks: creatives, audiences, and budget rules to target $10–100 earnings per day.",
    s3t: "Facebook Checker Tools",
    s3d: "Check Live UID, Live BM, BM Verified, invite links, BM names, and find Facebook IDs — free for members.",
    s4t: "Adsterra Image Generator",
    s4d: "Upload any image, auto-resize for Facebook ads, and add a pixel-perfect play button that looks like a real video.",
    s5t: "Extensions & Bookmarks",
    s5d: "Community Chrome extensions and bookmark tools to speed up Business Manager and ads workflows.",
    s6t: "Telegram VIP Support",
    s6d: "Join our trusted Telegram community for daily tips, tool drops, private method packs, and live support.",

    howEy: "How it works",
    howTitle: "Start earning with Basictrick in 3 steps",
    how1t: "Join the community",
    how1d: "Enter our Telegram group and pick the method or tools you need.",
    how2t: "Use free tools",
    how2d: "Open Facebook ID tools and Adsterra generator from the Tools page — no Meta App needed.",
    how3t: "Learn & scale",
    how3d: "Follow Autopay Threshold and boost methods, then scale with community guidance.",

    whyEy: "Why Basictrick",
    whyTitle: "Built for real ad-agency workflows",
    why1: "Trusted Telegram community focused on Facebook ads",
    why2: "Free online tools + downloadable community tools",
    why3: "Clear Bangla & English support",
    why4: "Shop methods and VIP access via Telegram",

    ctaTitle: "Ready to grow with Basictrick?",
    ctaSub: "Join Telegram now — get methods, free tools, and daily earning guidance.",
    ctaBtn: "Join Telegram Community",
    footerTag: "Trusted Telegram Community — Bangladesh & Global.",
  },
  bn: {
    navShop: "শপ",
    navMethod: "মেথড",
    navTools: "টুলস",
    navLicense: "লাইসেন্স",
    navContact: "যোগাযোগ",
    getStarted: "টেলিগ্রাম জয়েন",
    heroTitle: "বিশ্বস্ত টেলিগ্রাম কমিউনিটি",
    heroSub:
      "Facebook Autopay Threshold মেথড, অ্যাড বুস্ট সিস্টেম ও ফ্রি কমিউনিটি টুলস — Basictrick-এ দৈনিক $১০–১০০ আয় করুন।",
    heroCtaTools: "টুলস খুলুন",
    heroCtaShop: "শপ দেখুন",
    trusted: "মিডিয়া বায়ারদের বিশ্বস্ত",
    toolsTitle: "কমিউনিটি টুলস",
    shopTitle: "শপ",
    methodTitle: "মেথড",
    contactTitle: "যোগাযোগ",
    buyTelegram: "টেলিগ্রামে কিনুন",
    download: "ডাউনলোড",
    launch: "টুল চালু",
    releaseNotes: "রিলিজ নোট",
    version: "ভার্সন",

    pickTitle: "আপনার ভাষা বেছে নিন",
    pickSub: "Basictrick আপনি কোন ভাষায় ব্যবহার করতে চান?",
    pickEn: "Continue in English",
    pickBn: "বাংলায় চালিয়ে যান",

    whatYouGet: "আপনি যা পাবেন",
    tryAdsterra: "Adsterra জেনারেটর ব্যবহার করুন",
    perk1: "Facebook Autopay Threshold মেথড",
    perk2: "দৈনিক $১০–১০০ আয়ের অ্যাড বুস্ট সিস্টেম",
    perk3: "ফ্রি Facebook ID ও BM চেকার টুলস",
    perk4: "Adsterra প্লে-বাটন ইমেজ জেনারেটর",
    perk5: "কমিউনিটি এক্সটেনশন ও বুকমার্ক টুলস",

    servicesEy: "আমাদের সার্ভিস",
    servicesTitle: "মিডিয়া বায়ারের জন্য সবকিছু এক জায়গায়",
    servicesSub:
      "Basictrick তৈরি Facebook অ্যাডভার্টাইজারদের জন্য — মেথড, টুলস ও কমিউনিটি সাপোর্ট দিয়ে দৈনিক আয় বাড়ান।",

    s1t: "Autopay Threshold মেথড",
    s1d: "Autopay Threshold সিস্টেম ধাপে ধাপে শিখুন — অ্যাকাউন্ট সেটআপ, পেসিং ও সেইফ স্কেলিং আমাদের কমিউনিটির মতো।",
    s2t: "অ্যাড বুস্ট সিস্টেম",
    s2d: "প্র্যাকটিক্যাল বুস্ট ফ্রেমওয়ার্ক: ক্রিয়েটিভ, অডিয়েন্স ও বাজেট রুল — দৈনিক $১০–১০০ টার্গেট।",
    s3t: "Facebook চেকার টুলস",
    s3d: "Live UID, Live BM, BM Verified, ইনভাইট লিংক, BM নাম ও Facebook ID খুঁজুন — মেম্বারদের জন্য ফ্রি।",
    s4t: "Adsterra ইমেজ জেনারেটর",
    s4d: "যেকোনো ইমেজ আপলোড করুন, Facebook অ্যাড সাইজে রিসাইজ করুন, আর রিয়েল ভিডিওর মতো প্লে বাটন যোগ করুন।",
    s5t: "এক্সটেনশন ও বুকমার্ক",
    s5d: "Business Manager ও অ্যাডস ওয়ার্কফ্লো দ্রুত করতে কমিউনিটি Chrome এক্সটেনশন ও বুকমার্ক টুলস।",
    s6t: "টেলিগ্রাম VIP সাপোর্ট",
    s6d: "দৈনিক টিপস, টুল ড্রপ, প্রাইভেট মেথড প্যাক ও লাইভ সাপোর্টের জন্য আমাদের বিশ্বস্ত টেলিগ্রাম কমিউনিটিতে জয়েন করুন।",

    howEy: "কীভাবে কাজ করে",
    howTitle: "৩ ধাপে Basictrick দিয়ে শুরু করুন",
    how1t: "কমিউনিটিতে জয়েন করুন",
    how1d: "আমাদের টেলিগ্রাম গ্রুপে ঢুকুন এবং প্রয়োজনীয় মেথড বা টুল বেছে নিন।",
    how2t: "ফ্রি টুলস ব্যবহার করুন",
    how2d: "Tools পেজ থেকে Facebook ID টুলস ও Adsterra জেনারেটর চালু করুন — Meta App লাগে না।",
    how3t: "শিখুন ও স্কেল করুন",
    how3d: "Autopay Threshold ও বুস্ট মেথড ফলো করুন, তারপর কমিউনিটি গাইডেন্স নিয়ে স্কেল করুন।",

    whyEy: "কেন Basictrick",
    whyTitle: "রিয়েল অ্যাড-এজেন্সি ওয়ার্কফ্লোর জন্য তৈরি",
    why1: "Facebook অ্যাডস ফোকাসড বিশ্বস্ত টেলিগ্রাম কমিউনিটি",
    why2: "ফ্রি অনলাইন টুলস + ডাউনলোডেবল কমিউনিটি টুলস",
    why3: "স্পষ্ট বাংলা ও ইংরেজি সাপোর্ট",
    why4: "টেলিগ্রামে মেথড শপ ও VIP অ্যাক্সেস",

    ctaTitle: "Basictrick-এর সাথে এগোতে প্রস্তুত?",
    ctaSub: "এখনই টেলিগ্রামে জয়েন করুন — মেথড, ফ্রি টুলস ও দৈনিক আয়ের গাইডেন্স নিন।",
    ctaBtn: "টেলিগ্রাম কমিউনিটি জয়েন",
    footerTag: "বিশ্বস্ত টেলিগ্রাম কমিউনিটি — বাংলাদেশ ও গ্লোবাল।",
  },
} as const;
