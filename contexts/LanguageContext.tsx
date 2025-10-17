import React, { createContext, useState, useMemo, FC, ReactNode } from 'react';
import { en } from '../locales/en';
import { es } from '../locales/es';
import { hi } from '../locales/hi';
import { te } from '../locales/te';
import { ta } from '../locales/ta';
import { kn } from '../locales/kn';
import { fr } from '../locales/fr';
import { de } from '../locales/de';
import { pt } from '../locales/pt';
import { bn } from '../locales/bn';

const translations = { en, es, hi, te, ta, kn, fr, de, pt, bn };

export type Locale = 'en' | 'es' | 'hi' | 'te' | 'ta' | 'kn' | 'fr' | 'de' | 'pt' | 'bn';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, values?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getTranslation = (obj: any, key: string): string => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>('en');

    const t = useMemo(() => (key: string, values?: { [key: string]: string | number }) => {
        let translation = getTranslation(translations[locale], key) || key;
        if (values) {
            Object.keys(values).forEach(valueKey => {
                const regex = new RegExp(`{${valueKey}}`, 'g');
                translation = translation.replace(regex, String(values[valueKey]));
            });
        }
        return translation;
    }, [locale]);

    const value = {
        locale,
        setLocale,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};