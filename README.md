# MyStore AI - Merchant Dashboard 📱

Mobile application for merchants to manage their stores on the MyStore AI platform.

## Features ✨

- 🌍 **Bilingual**: Arabic (RTL) + English (LTR)
- 🌓 **Dark Mode**: Light + Dark themes
- 🎨 **Minimalist Design**: Clean UI, small icons, concise text
- 📊 **Dashboard**: Sales analytics and stats
- 📦 **Products**: Full CRUD with image upload
- 📋 **Orders**: Order management and tracking
- ⚙️ **Settings**: Store configuration
- 🔄 **OTA Updates**: Fix bugs without App Store submission!

## Tech Stack 🛠️

- React Native + Expo
- TypeScript
- Zustand (state management)
- React Query (data fetching)
- Axios (API client)
- i18next (internationalization)
- Victory Native (charts)
- Lucide Icons

## Prerequisites 📋

- Node.js 20+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Installation 🚀

```bash
# Navigate to project
cd /Users/dilhwar/My-Store/mystore-ai-merchant

# Install dependencies
npm install

# Start development server
npm start
```

## Development 💻

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure 📁

```
src/
├── app/              # Screens (Expo Router)
├── components/       # Reusable components
├── hooks/            # Custom hooks
├── store/            # Zustand stores
├── services/         # API services
├── theme/            # Design system
├── locales/          # Translations (AR/EN)
├── utils/            # Utilities
└── config/           # Configuration
```

## Configuration ⚙️

1. Copy `.env.example` to `.env`
2. Update environment variables:
   ```
   API_URL=https://api.my-store.ai/api/v1
   ```

## Building for Production 🏗️

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## OTA Updates 🔄

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Users receive update automatically!
```

## Deployment 🚀

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## Design Guidelines 🎨

### Icons
- Default size: **20px** (small and clean)
- Library: lucide-react-native
- Stroke width: 1.5

### Colors
- Primary: #007AFF (iOS Blue)
- Use soft shadows (opacity < 0.05)
- Support light and dark modes

### Text
- Keep concise (3 words max)
- Use Inter font (EN) / Cairo font (AR)

### Spacing
- Follow 8pt grid system
- Use generous white space

## API Integration 🔌

Backend API: `https://api.my-store.ai/api/v1`

Key endpoints:
- `/auth/*` - Authentication
- `/products/*` - Product management
- `/orders/*` - Order management
- `/admin/analytics` - Dashboard stats

## Internationalization 🌍

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('products');
<Text>{t('title')}</Text>
```

Supported languages:
- English (en)
- Arabic (ar) with RTL support

## Theme Switching 🌓

```typescript
import { useThemeStore } from '@store/themeStore';

const { colors, isDark, toggleTheme } = useThemeStore();
```

## Contributing 🤝

1. Follow the existing code style
2. Use TypeScript types
3. Add translations for new text
4. Test on both iOS and Android
5. Ensure RTL support works

## Documentation 📚

- [TECHNICAL_PLAN.md](./TECHNICAL_PLAN.md) - Complete technical documentation
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)

## Support 💬

For issues or questions, contact the development team.

## License 📄

Proprietary - MyStore AI Platform

---

**Version**: 1.0.0
**Created**: October 2025
**Status**: In Development 🚧
