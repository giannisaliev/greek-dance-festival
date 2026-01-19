# Greek Language Translation System

This document describes the Greek language translation system implemented in the Greek Dance Festival application.

## Overview

The application now supports **English (EN)** and **Greek (EL)** languages with an easy-to-use toggle switcher. The admin panel remains in English only.

## Features

- ✅ Full Greek translation for all user-facing pages
- ✅ Language toggle switcher in the navigation
- ✅ Persistent language preference (saved in localStorage)
- ✅ Admin panel excluded from translations (remains in English)
- ✅ Smooth language switching without page reload

## File Structure

```
lib/i18n/
  ├── LanguageContext.tsx    # React Context for language management
  └── translations.ts         # All translations (EN and EL)

app/components/
  └── LanguageSwitcher.tsx    # Language toggle button component
```

## How It Works

### 1. Language Context Provider

The `LanguageProvider` wraps the entire application in `app/providers.tsx`:

```tsx
<LanguageProvider>
  <AnalyticsProvider>{children}</AnalyticsProvider>
</LanguageProvider>
```

### 2. Using Translations in Components

Import and use the `useLanguage` hook:

```tsx
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t.home.title}</h1>
      <p>{t.home.description}</p>
    </div>
  );
}
```

### 3. Language Switcher

The language switcher is integrated into the Navigation component and shows:
- 🇬🇷 EL when English is active (click to switch to Greek)
- 🇬🇧 EN when Greek is active (click to switch to English)

### 4. Admin Panel Exception

The admin panel automatically detects admin routes and doesn't show the language switcher:

```tsx
const isAdminPage = pathname?.startsWith('/admin');
if (!isAdminPage) {
  // Show language switcher
}
```

## Translation Structure

All translations are organized by page/section in `lib/i18n/translations.ts`:

```typescript
{
  nav: { /* Navigation items */ },
  home: { /* Home page content */ },
  pricing: { /* Pricing page content */ },
  register: { /* Registration form */ },
  // ... etc
}
```

## Adding New Translations

1. Open `lib/i18n/translations.ts`
2. Add your new key to both `en` and `el` objects:

```typescript
export const translations = {
  en: {
    myNewSection: {
      title: "My Title",
      description: "My Description"
    }
  },
  el: {
    myNewSection: {
      title: "Ο Τίτλος Μου",
      description: "Η Περιγραφή Μου"
    }
  }
}
```

3. Use in your component:

```tsx
const { t } = useLanguage();
return <h1>{t.myNewSection.title}</h1>;
```

## Translated Pages

The following pages have full Greek translations:

- ✅ Home page (`/`)
- ✅ Pricing page (`/pricing`)
- ✅ Registration page (`/register`)
- ✅ Login page (`/login`)
- ✅ Signup page (`/signup`)
- ✅ Information page (`/information`)
- ✅ Teachers page (`/teachers`)
- ✅ Hotel page (`/hotel`)
- ✅ Navigation menu

## Admin Panel

The admin panel (`/admin/*`) is intentionally **not translated** and remains in English for consistency and ease of management.

## Browser Support

The language preference is stored in `localStorage`, which is supported by all modern browsers. The system gracefully handles:
- Initial page load before localStorage is available
- Server-side rendering (defaults to English)
- Client-side hydration

## Testing

To test the translation system:

1. Open the application in your browser
2. Look for the language switcher in the navigation (🇬🇷 EL or 🇬🇧 EN)
3. Click to toggle between languages
4. Navigate through different pages to see translations
5. Refresh the page - your language preference should be maintained
6. Try accessing `/admin` - the language switcher should not appear

## Future Enhancements

Potential improvements:
- Add more languages (e.g., German, French)
- URL-based language routing (e.g., `/el/pricing`)
- Language detection based on browser preferences
- Translation management UI for admin panel
