# MyStore AI Merchant - توثيق المشروع الشامل

> **ملاحظة مهمة جداً**: هذا التطبيق يتصل بـ Backend وFrontend موجودين مسبقاً. **لا تقم بتغيير أي شيء في البيئة الخلفية (Backend) أو الواجهة الأمامية (Frontend)** - فقط اربط التطبيق بما هو موجود حالياً.

---

## 📋 نظرة عامة على المشروع

### معلومات أساسية
- **اسم المشروع**: MyStore AI Merchant
- **النوع**: تطبيق React Native مع Expo
- **الإصدار**: 1.0.0
- **Bundle ID**:
  - iOS: `com.easymenu.mystore.merchant`
  - Android: `com.easymenu.mystore.merchant`
- **EAS Project ID**: `d43622fe-521d-42bc-9085-88e2e1b1a9cf`

### الغرض من التطبيق
تطبيق موبايل للتجار (Merchants) لإدارة متاجرهم الإلكترونية بما في ذلك:
- إدارة المنتجات والفئات
- متابعة الطلبات
- عرض الإحصائيات والتقارير
- إعدادات المتجر والحساب
- دعم متعدد اللغات (عربي/إنجليزي)
- دعم الوضع الداكن/الفاتح

---

## 🌐 معلومات Backend & API

### عناوين API
التطبيق يدعم ثلاث بيئات مختلفة:

#### 1. Development (تطوير محلي)
```
API_URL: http://192.168.1.207:8000/api/v1
```

#### 2. Staging (بيئة التجريب)
```
API_URL: https://api.my-store.ai/api/v1
```

#### 3. Production (الإنتاج)
```
API_URL: https://api.my-store.ai/api/v1
```

### اختيار البيئة
- البيئة المستخدمة تُحدد من خلال `appEnv` في ملف [app.json](../app.json) السطر 77
- القيمة الحالية: `"appEnv": "prod"`
- يمكن تغييرها إلى: `dev`, `staging`, أو `prod`

### معلومات مهمة عن Backend
- **Backend موجود بالفعل ويعمل** - لا تقم بتعديل أي شيء فيه
- الـ Backend يحتوي على IP خاص في إعدادات iOS: `164.90.226.98`
- يُسمح بـ HTTP غير الآمن لهذا الـ IP تحديداً (انظر [app.json](../app.json) السطر 26-30)
- كل الـ API endpoints جاهزة ومتاحة للاستخدام

### التوثيق (Authentication)
- نظام JWT Tokens (Access Token + Refresh Token)
- التوكنات تُخزن بشكل آمن في Expo SecureStore
- يتم إضافة التوكن تلقائياً لكل طلب في header: `Authorization: Bearer {token}`
- عند انتهاء صلاحية Access Token، يتم تحديثه تلقائياً باستخدام Refresh Token

---

## 🔌 API Endpoints الرئيسية

### Authentication (`/auth`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/auth/login` | POST | تسجيل الدخول |
| `/auth/register` | POST | إنشاء حساب جديد |
| `/auth/logout` | POST | تسجيل الخروج |
| `/auth/refresh` | POST | تحديث Access Token |
| `/auth/me` | POST | الحصول على معلومات المستخدم الحالي |
| `/auth/verify-email` | POST | تأكيد البريد الإلكتروني |
| `/auth/forgot-password` | POST | طلب إعادة تعيين كلمة المرور |
| `/auth/reset-password` | POST | إعادة تعيين كلمة المرور |

### Products (`/products`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/products` | GET | الحصول على جميع المنتجات (مع pagination وfilters) |
| `/products` | POST | إضافة منتج جديد (multipart/form-data) |
| `/products/{id}` | GET | الحصول على منتج معين |
| `/products/{id}` | POST | تحديث منتج (multipart/form-data) |
| `/products/{id}` | DELETE | حذف منتج |
| `/products/{id}/duplicate` | POST | نسخ منتج |

**Query Parameters للمنتجات:**
- `page`: رقم الصفحة
- `limit`: عدد العناصر في الصفحة
- `search`: البحث في الاسم
- `categoryId`: تصفية حسب الفئة
- `featured`: تصفية المنتجات المميزة

### Orders (`/orders`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/orders` | GET | الحصول على جميع الطلبات (مع pagination وfilters) |
| `/orders/{id}` | GET | الحصول على طلب معين |
| `/orders/{id}/status` | PUT | تحديث حالة الطلب |
| `/orders/{id}/payment-status` | PUT | تحديث حالة الدفع |

**Query Parameters للطلبات:**
- `page`: رقم الصفحة
- `limit`: عدد العناصر في الصفحة
- `status`: تصفية حسب الحالة
- `customerId`: تصفية حسب العميل
- `startDate`: من تاريخ
- `endDate`: إلى تاريخ

### Categories (`/categories`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/categories` | GET | الحصول على جميع الفئات |
| `/categories` | POST | إضافة فئة جديدة |
| `/categories/{id}` | GET | الحصول على فئة معينة |
| `/categories/{id}` | PUT | تحديث فئة |
| `/categories/{id}` | DELETE | حذف فئة |
| `/categories/{id}/status` | PUT | تغيير حالة الفئة |

### Dashboard (`/merchant`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/merchant/dashboard` | GET | الحصول على إحصائيات Dashboard |

### Upload (`/upload`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/upload/image` | POST | رفع صورة واحدة (multipart/form-data) |
| `/upload/images` | POST | رفع عدة صور (multipart/form-data) |

**معلومات Upload:**
- الصور تُرفع إلى AWS S3
- يتم إنشاء 3 أحجام تلقائياً: thumbnail, medium, large
- الحد الأقصى: 10 صور في الطلب الواحد
- الصيغ المدعومة: JPG, JPEG, PNG, WEBP
- الحد الأقصى للحجم: 5MB لكل صورة

### Notifications (`/notifications`)
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/notifications` | GET | الحصول على الإشعارات |
| `/notifications/{id}/read` | PUT | تحديد إشعار كمقروء |

### Store Settings
| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/merchant/settings` | GET | إعدادات المتجر |
| `/merchant/settings` | PUT | تحديث إعدادات المتجر |
| `/merchant/payment-methods` | GET/POST/PUT/DELETE | طرق الدفع |
| `/merchant/shipping` | GET/POST/PUT/DELETE | طرق الشحن |

---

## 📁 بنية المشروع

```
mystore-ai-merchant/
├── src/
│   ├── app/                      # Expo Router - الصفحات والتنقل
│   │   ├── auth/                 # صفحات المصادقة
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── verify-otp.tsx
│   │   ├── tabs/                 # التبويبات الرئيسية
│   │   │   ├── _layout.tsx       # تخطيط التبويبات مع دعم RTL
│   │   │   ├── dashboard.tsx     # الصفحة الرئيسية
│   │   │   ├── orders.tsx        # الطلبات
│   │   │   ├── categories.tsx    # الفئات
│   │   │   ├── products.tsx      # المنتجات
│   │   │   └── settings.tsx      # الإعدادات
│   │   ├── products/             # صفحات المنتجات
│   │   │   ├── [id].tsx          # عرض منتج
│   │   │   ├── add.tsx           # إضافة منتج
│   │   │   └── edit/[id].tsx     # تعديل منتج
│   │   ├── orders/               # صفحات الطلبات
│   │   │   └── [id].tsx          # تفاصيل الطلب
│   │   ├── settings/             # صفحات الإعدادات
│   │   │   ├── account.tsx
│   │   │   ├── store-profile.tsx
│   │   │   ├── store-settings.tsx
│   │   │   ├── apps.tsx
│   │   │   ├── help-support.tsx
│   │   │   └── order-settings/   # إعدادات الطلبات
│   │   ├── _layout.tsx           # التخطيط الرئيسي
│   │   ├── index.tsx             # الشاشة الأولى (Splash/Redirect)
│   │   └── notifications.tsx     # الإشعارات
│   │
│   ├── components/               # المكونات القابلة لإعادة الاستخدام
│   │   ├── ui/                   # مكونات UI عامة
│   │   ├── forms/                # مكونات النماذج
│   │   ├── dashboard/            # مكونات Dashboard
│   │   ├── orders/               # مكونات الطلبات
│   │   └── charts/               # مكونات الرسوم البيانية
│   │
│   ├── services/                 # API Services
│   │   ├── api.ts                # Axios instance مع interceptors
│   │   ├── auth.service.ts       # خدمات المصادقة
│   │   ├── products.service.ts   # خدمات المنتجات
│   │   ├── orders.service.ts     # خدمات الطلبات
│   │   ├── categories.service.ts # خدمات الفئات
│   │   ├── dashboard.service.ts  # خدمات Dashboard
│   │   ├── upload.service.ts     # خدمات رفع الملفات
│   │   ├── notifications.service.ts
│   │   ├── store.service.ts
│   │   ├── payment-methods.service.ts
│   │   ├── shipping.service.ts
│   │   └── ... (المزيد)
│   │
│   ├── store/                    # State Management (Zustand)
│   │   ├── authStore.ts          # حالة المصادقة
│   │   ├── themeStore.ts         # حالة السمة (داكن/فاتح)
│   │   └── languageStore.ts      # حالة اللغة
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── usePushNotifications.ts
│   │   └── useDynamicForm.ts
│   │
│   ├── utils/                    # دوال مساعدة
│   │   ├── secureStorage.ts      # تخزين آمن للـ Tokens
│   │   ├── storage.ts            # AsyncStorage wrapper
│   │   ├── i18n.helper.ts
│   │   ├── currency.ts
│   │   ├── language.ts
│   │   ├── haptics.ts
│   │   └── logger.ts
│   │
│   ├── config/                   # إعدادات التطبيق
│   │   └── env.ts                # متغيرات البيئة
│   │
│   ├── theme/                    # تصميم وألوان
│   │   ├── index.ts
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── design.ts
│   │
│   ├── locales/                  # الترجمات
│   │   ├── i18n.ts               # إعداد i18next
│   │   ├── ar/                   # الترجمات العربية
│   │   └── en/                   # الترجمات الإنجليزية
│   │
│   ├── types/                    # TypeScript Types
│   │   └── api.types.ts          # أنواع API
│   │
│   └── constants/                # الثوابت
│       ├── countries.ts
│       └── currencies.ts
│
├── assets/                       # الصور والأيقونات
├── app.json                      # إعدادات Expo
├── eas.json                      # إعدادات EAS Build
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── .env                          # متغيرات البيئة (لا تُرفع على Git)
```

---

## 🎨 المميزات الرئيسية

### 1. دعم متعدد اللغات (i18n)
- **اللغات المدعومة**: العربية (ar) والإنجليزية (en)
- **المكتبة المستخدمة**: `react-i18next`
- **دعم RTL/LTR**: تلقائي حسب اللغة
- **الترجمات**: موجودة في [src/locales/](../src/locales/)
- **التبديل بين اللغات**: يتم حفظ اللغة المختارة في AsyncStorage

### 2. الوضع الداكن/الفاتح (Dark/Light Mode)
- **إدارة السمة**: Zustand store ([src/store/themeStore.ts](../src/store/themeStore.ts))
- **الألوان**: محددة في [src/theme/colors.ts](../src/theme/colors.ts)
- **تطبيق تلقائي**: على كل المكونات والشاشات

### 3. التنقل (Navigation)
- **Router**: Expo Router (file-based routing)
- **التبويبات**: 5 تبويبات رئيسية (Dashboard, Orders, Categories, Products, Settings)
- **دعم RTL**: ترتيب التبويبات يتغير تلقائياً حسب اللغة

### 4. إدارة الحالة (State Management)
- **المكتبة**: Zustand
- **Stores الرئيسية**:
  - `authStore`: معلومات المستخدم والـ tokens
  - `themeStore`: السمة الحالية
  - `languageStore`: اللغة الحالية

### 5. التخزين الآمن
- **Access/Refresh Tokens**: في Expo SecureStore
- **البيانات العادية**: في AsyncStorage

### 6. رفع الصور (Image Upload)
- **الوجهة**: AWS S3 (من خلال Backend)
- **المكتبة**: `expo-image-picker`
- **الأحجام المُنشأة تلقائياً**: thumbnail, medium, large
- **التحقق**: حجم، أبعاد، صيغة

### 7. الإشعارات (Push Notifications)
- **المكتبة**: `expo-notifications`
- **معالجة**: في [src/hooks/usePushNotifications.ts](../src/hooks/usePushNotifications.ts)

### 8. UI Components
- **مكتبة UI**: Gluestack UI + React Native Paper
- **الأيقونات**: `lucide-react-native`
- **الرسوم البيانية**: `victory-native`
- **الصور**: `expo-image` (أداء أفضل من Image العادي)

---

## 🔧 المكتبات والتقنيات المستخدمة

### Core
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo SDK**: 54.0.0
- **TypeScript**: 5.9.2

### Navigation & Routing
- **expo-router**: 6.0.14
- **@react-navigation/native**: 7.0.14

### State Management & Data Fetching
- **zustand**: 4.5.0
- **@tanstack/react-query**: 5.59.0
- **axios**: 1.7.7

### UI Libraries
- **@gluestack-ui/themed**: 1.1.73
- **react-native-paper**: 5.14.5
- **lucide-react-native**: 0.447.0
- **expo-image**: 3.0.10

### Forms & Validation
- **react-hook-form**: 7.53.0
- **@hookform/resolvers**: 3.9.0
- **zod**: 3.23.0

### Internationalization
- **i18next**: 23.15.0
- **react-i18next**: 15.0.0
- **expo-localization**: 17.0.7

### Storage
- **@react-native-async-storage/async-storage**: 2.2.0
- **expo-secure-store**: 15.0.7

### Charts & Visualizations
- **victory-native**: 41.20.1
- **@shopify/react-native-skia**: 2.3.10

### Utilities
- **date-fns**: 3.6.0
- **clsx**: 2.1.1
- **expo-haptics**: 15.0.7

---

## 🚀 البدء مع المشروع

### التثبيت
```bash
npm install
```

### التشغيل على Development
```bash
npm start
# أو
expo start
```

### التشغيل على منصات محددة
```bash
# iOS
npm run ios

# Android
npm run android

# Web (للتجربة)
npm run web
```

### بناء التطبيق (EAS Build)
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all
```

---

## ⚙️ إعدادات متغيرات البيئة

### ملف `.env`
```env
# API Configuration
API_URL=https://api.my-store.ai/api/v1
API_TIMEOUT=10000

# App Configuration
APP_ENV=development

# Sentry (Error Tracking)
SENTRY_DSN=

# EAS Project ID (for OTA updates)
EAS_PROJECT_ID=
```

### ملف `app.json`
- **appEnv**: يحدد البيئة (`dev`, `staging`, أو `prod`)
- **Backend IP المسموح**: 164.90.226.98 (للـ HTTP)

---

## 🔐 أمان التطبيق

### 1. التوكنات (Tokens)
- Access Token و Refresh Token يُخزنان في **Expo SecureStore**
- يتم إرسال Access Token في كل طلب API في Header
- عند انتهاء الصلاحية، يتم التحديث تلقائياً

### 2. الـ API Interceptors
- **Request Interceptor**: يضيف JWT token تلقائياً
- **Response Interceptor**: يتعامل مع الأخطاء ويحدث التوكن عند الحاجة

### 3. HTTPS
- في Production، يتم استخدام HTTPS فقط
- HTTP مسموح فقط للـ IP: 164.90.226.98 (للتطوير)

---

## 📱 صفحات التطبيق الرئيسية

### 1. Authentication Flow
- **Login** ([src/app/auth/login.tsx](../src/app/auth/login.tsx)): تسجيل الدخول
- **Register** ([src/app/auth/register.tsx](../src/app/auth/register.tsx)): إنشاء حساب جديد
- **Verify OTP** ([src/app/auth/verify-otp.tsx](../src/app/auth/verify-otp.tsx)): التحقق من الهاتف

### 2. Main Tabs
- **Dashboard** ([src/app/tabs/dashboard.tsx](../src/app/tabs/dashboard.tsx)): الصفحة الرئيسية مع الإحصائيات
- **Orders** ([src/app/tabs/orders.tsx](../src/app/tabs/orders.tsx)): إدارة الطلبات
- **Categories** ([src/app/tabs/categories.tsx](../src/app/tabs/categories.tsx)): إدارة الفئات
- **Products** ([src/app/tabs/products.tsx](../src/app/tabs/products.tsx)): إدارة المنتجات
- **Settings** ([src/app/tabs/settings.tsx](../src/app/tabs/settings.tsx)): الإعدادات

### 3. Product Pages
- **View Product** ([src/app/products/[id].tsx](../src/app/products/[id].tsx)): عرض تفاصيل منتج
- **Add Product** ([src/app/products/add.tsx](../src/app/products/add.tsx)): إضافة منتج جديد
- **Edit Product** ([src/app/products/edit/[id].tsx](../src/app/products/edit/[id].tsx)): تعديل منتج

### 4. Order Pages
- **Order Details** ([src/app/orders/[id].tsx](../src/app/orders/[id].tsx)): تفاصيل الطلب

### 5. Settings Pages
- **Account** ([src/app/settings/account.tsx](../src/app/settings/account.tsx)): إعدادات الحساب
- **Store Profile** ([src/app/settings/store-profile.tsx](../src/app/settings/store-profile.tsx)): ملف المتجر
- **Store Settings** ([src/app/settings/store-settings.tsx](../src/app/settings/store-settings.tsx)): إعدادات عامة
- **Order Settings**: إعدادات الطلبات (طرق الدفع، الشحن، WhatsApp، حقول النموذج)
- **Apps** ([src/app/settings/apps.tsx](../src/app/settings/apps.tsx)): التطبيقات المتكاملة
- **Help & Support** ([src/app/settings/help-support.tsx](../src/app/settings/help-support.tsx)): المساعدة والدعم

---

## 🧪 الاختبار

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

---

## 📝 نصائح للتطوير

### 1. عند إضافة ميزة جديدة
- **لا تعدل Backend**: استخدم الـ endpoints الموجودة فقط
- **استخدم Services**: كل تعامل مع API يجب أن يكون من خلال ملفات services
- **أضف Types**: حدد TypeScript types للبيانات الجديدة
- **اختبر في كلا الوضعين**: تأكد من عمل الميزة في Dark/Light mode
- **اختبر في كلا اللغتين**: تأكد من الترجمة العربية والإنجليزية

### 2. عند التعامل مع API
```typescript
// مثال صحيح
import { getProducts } from '@/services/products.service';

const fetchProducts = async () => {
  try {
    const data = await getProducts({ page: 1, limit: 20 });
    // استخدم البيانات
  } catch (error) {
    // تعامل مع الخطأ
  }
};
```

### 3. عند إضافة صفحة جديدة
- ضعها في المكان الصحيح داخل [src/app/](../src/app/)
- أضف التنقل إليها في الملف المناسب
- استخدم `useTheme()` للحصول على الألوان
- استخدم `useTranslation()` للترجمات

### 4. عند العمل مع الصور
```typescript
import { uploadImage } from '@/services/upload.service';

const handleImageUpload = async (imageUri: string) => {
  try {
    const result = await uploadImage(imageUri, 'products');
    // result.sizes.large.url هو الرابط المباشر للصورة
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### 1. "Network Error" عند الاتصال بالـ API
- تأكد من أن البيئة صحيحة في `app.json` (`appEnv`)
- تحقق من أن الـ Backend يعمل
- في Development، تأكد من أن الـ IP صحيح في `env.ts`

#### 2. "401 Unauthorized"
- التوكن منتهي الصلاحية: سيتم تحديثه تلقائياً
- إذا استمرت المشكلة، قد تحتاج لتسجيل الدخول مرة أخرى

#### 3. الصور لا تظهر
- تحقق من أن الرابط صحيح ويبدأ بـ `https://`
- تأكد من أن الصورة موجودة على S3

#### 4. الترجمة لا تعمل
- تأكد من وجود المفتاح في ملفات الترجمة
- استخدم `t('key')` من `useTranslation()`

---

## 🎯 الخلاصة

هذا التطبيق جاهز للتطوير والتوسع. جميع الخدمات والـ APIs موجودة ومتصلة.

**تذكر دائماً:**
1. **لا تعدل Backend** - فقط استخدمه
2. **استخدم Services** - لا تستدعي API مباشرة
3. **اختبر في كلا الوضعين** - Dark/Light
4. **اختبر في كلا اللغتين** - AR/EN
5. **اتبع البنية الموجودة** - ضع الملفات في أماكنها الصحيحة

---

## 📞 للمزيد من المعلومات

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/

---

**آخر تحديث**: 2025-01-08
**الإصدار**: 1.0.0
