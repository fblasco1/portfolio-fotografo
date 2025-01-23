import { createI18nServer } from "next-international/server";

const locales = {
    en: () => import("./en"),
    es: () => import("./es"),
};

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } =
    createI18nServer<typeof locales, { en: any; es: any }>(locales);