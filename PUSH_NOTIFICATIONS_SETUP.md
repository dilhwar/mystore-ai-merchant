# 🔔 نظام الإشعارات - MyStore AI Merchant App

تم تنفيذ نظام إشعارات **Push Notifications** كامل في تطبيق التاجر والباكند.

---

## ✅ ما تم تنفيذه

### 📱 **في التطبيق (Mobile App)**

#### 1. **Push Notifications Hook**
- 📄 الملف: `src/hooks/usePushNotifications.ts`
- ✨ الميزات:
  - طلب أذونات الإشعارات تلقائياً
  - تسجيل Expo Push Token
  - استقبال الإشعارات في Foreground
  - معالجة النقر على الإشعارات
  - إنشاء Notification Channels للأندرويد

#### 2. **تفعيل في App Layout**
- 📄 الملف: `src/app/_layout.tsx`
- يرسل Push Token للباكند عند فتح التطبيق
- يربط الـ Token بحساب التاجر

#### 3. **خدمة الإشعارات**
- 📄 الملف: `src/services/notifications.service.ts`
- إرسال Push Token للباكند
- جلب الإشعارات من الباكند
- تحديث حالة القراءة

#### 4. **الأذونات**
- 📄 الملف: `app.json`
- أذونات Android:
  - `POST_NOTIFICATIONS` - إرسال الإشعارات
  - `RECEIVE_BOOT_COMPLETED` - استقبال عند بدء الجهاز
  - `VIBRATE` - اهتزاز الجهاز
- Plugin: `expo-notifications`

---

### 🔧 **في الباكند**

#### 1. **Database Schema**
- 📄 الملف: `backend/prisma/schema.prisma`
- جداول جديدة:
  - **`merchant_push_tokens`**: حفظ Push Tokens للتجار
  - **`merchant_notifications`**: سجل الإشعارات

```prisma
model MerchantPushToken {
  id         String   @id @default(uuid())
  merchantId String
  pushToken  String   @db.Text
  platform   Platform @default(ANDROID)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  merchant   Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@unique([merchantId, pushToken])
  @@index([merchantId])
  @@index([isActive])
  @@map("merchant_push_tokens")
}

model MerchantNotification {
  id         String           @id @default(uuid())
  merchantId String
  title      String
  message    String           @db.Text
  type       NotificationType @default(INFO)
  isRead     Boolean          @default(false)
  orderId    String?
  productId  String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  merchant   Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@index([merchantId])
  @@index([isRead])
  @@index([createdAt(sort: Desc)])
  @@map("merchant_notifications")
}
```

#### 2. **Notifications Service**
- 📄 الملف: `backend/src/services/notifications.service.ts`
- الوظائف:
  - `registerPushToken()` - تسجيل Token
  - `sendPushNotification()` - إرسال إشعار
  - `sendNewOrderNotification()` - إشعار طلب جديد
  - `sendOrderStatusChangeNotification()` - إشعار تغيير حالة
  - `sendLowStockNotification()` - إشعار نقص المخزون
  - `getMerchantNotifications()` - جلب الإشعارات
  - `markAsRead()` - تحديد كمقروء

#### 3. **API Endpoints**
- 📄 الملف: `backend/src/routes/notifications.routes.ts`

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/v1/notifications/register-token` | تسجيل Push Token |
| GET | `/api/v1/notifications` | جلب كل الإشعارات |
| GET | `/api/v1/notifications/unread-count` | عدد الإشعارات غير المقروءة |
| PATCH | `/api/v1/notifications/:id/read` | تحديد إشعار كمقروء |
| PATCH | `/api/v1/notifications/read-all` | تحديد الكل كمقروء |

#### 4. **التكامل مع الطلبات**
- 📄 الملف: `backend/src/controllers/order.controller.ts`
- عند إنشاء طلب جديد، يتم:
  1. إرسال إشعار WhatsApp للتاجر (موجود مسبقاً)
  2. **إرسال Push Notification للتطبيق** (جديد!)

```typescript
// عند إنشاء طلب جديد
pushNotifications.sendNewOrderNotification(
  store.merchantId,
  order.orderNumber,
  order.total,
  order.id
);
```

---

## 🚀 كيفية الاستخدام

### 1️⃣ **تشغيل التطبيق**

```bash
cd /Users/dilhwar/My-Store/mystore-ai-merchant
npm start
```

### 2️⃣ **فتح على جهاز حقيقي**

⚠️ **مهم**: Push Notifications لا تعمل على المحاكي!

- على Android: امسح QR Code بتطبيق Expo Go
- على iOS: امسح QR Code بالكاميرا

### 3️⃣ **منح الأذونات**

عند فتح التطبيق لأول مرة، سيطلب منك:
- ✅ السماح بالإشعارات

### 4️⃣ **اختبار الإشعارات**

1. سجّل دخول في التطبيق
2. افتح موقع المتجر
3. اصنع طلب جديد
4. **يجب أن تصلك إشعار على الجوال!** 📱🔔

---

## 🔍 تتبع الأخطاء

### **في التطبيق:**

افتح Metro Bundler logs:
```bash
# سترى رسائل مثل:
✅ Push token registered for merchant abc123
✅ Expo Push Token: ExponentPushToken[xxxxxx]
```

### **في الباكند:**

```bash
cd /Users/dilhwar/My-Store/my-store-platform/backend
pm2 logs mystore-api
```

سترى رسائل مثل:
```
✅ Push token registered successfully
✅ Sent 1 push notifications
```

---

## 📊 أنواع الإشعارات

### 1. **طلب جديد** 📦
```
العنوان: "📦 طلب جديد!"
الرسالة: "طلب رقم #ORD-2025-0001 بقيمة 250.00 ريال"
```

### 2. **تغيير حالة الطلب** 🚚
```
العنوان: "🚚 تم شحن الطلب"
الرسالة: "الطلب #ORD-2025-0001 - تم شحن الطلب"
```

### 3. **تنبيه مخزون** ⚠️
```
العنوان: "⚠️ تنبيه مخزون"
الرسالة: "منتج \"iPhone 15\" على وشك النفاذ (5 قطع متبقية)"
```

---

## 🛠️ إعداد Production

### 1. إنشاء Expo Project

في الترمينال:
```bash
cd /Users/dilhwar/My-Store/mystore-ai-merchant
eas init
```

سيسألك:
```
? Would you like to create a project for @dilhwar/mystore-ai-merchant? (Y/n)
```
اختر `Y`

### 2. تحديث app.json

سيضاف تلقائياً:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "abc-123-def-456"
      }
    }
  }
}
```

### 3. Build للإنتاج

**Android:**
```bash
eas build --platform android --profile production
```

**iOS:**
```bash
eas build --platform ios --profile production
```

---

## 📱 تجربة على الجهاز الحقيقي

### **Android (بدون Build)**

1. ثبّت Expo Go من Play Store
2. شغّل التطبيق: `npm start`
3. امسح QR Code
4. ✅ الإشعارات ستعمل!

### **iOS (بدون Build)**

1. ثبّت Expo Go من App Store
2. شغّل التطبيق: `npm start`
3. امسح QR Code بالكاميرا
4. ✅ الإشعارات ستعمل!

---

## 🎯 الخطوات القادمة (اختياري)

### 1. **إضافة إشعارات أخرى**

في `backend/src/services/notifications.service.ts`، يمكنك إضافة:

```typescript
// عند إلغاء طلب
export async function sendOrderCancelledNotification(
  merchantId: string,
  orderNumber: string,
  orderId: string
): Promise<void> {
  await sendPushNotification({
    merchantId,
    title: '❌ تم إلغاء طلب',
    message: `الطلب #${orderNumber} تم إلغاؤه من العميل`,
    type: 'ORDER',
    orderId,
  });
}
```

### 2. **إشعارات مجدولة**

```typescript
import { scheduleLocalNotification } from '@/hooks/usePushNotifications';

// إشعار بعد ساعة
await scheduleLocalNotification(
  'تذكير',
  'لديك 5 طلبات في انتظار التأكيد',
  { type: 'reminder' }
);
```

### 3. **Badge Count**

```typescript
import { setBadgeCount } from '@/hooks/usePushNotifications';

// عرض عدد الإشعارات غير المقروءة على أيقونة التطبيق
await setBadgeCount(unreadCount);
```

---

## ❓ الأسئلة الشائعة

### **Q: الإشعارات لا تعمل على المحاكي؟**
A: Push Notifications تعمل فقط على أجهزة حقيقية.

### **Q: لم أستلم إشعار؟**
A: تحقق من:
1. ✅ الأذونات ممنوحة
2. ✅ مسجل دخول في التطبيق
3. ✅ الباكند يعمل
4. ✅ تحقق من logs

### **Q: كيف أختبر الإشعارات بدون طلب؟**
A: استخدم Expo Push Notification Tool:
https://expo.dev/notifications

---

## 📚 المراجع

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## ✅ الخلاصة

✨ **تم تنفيذ نظام إشعارات كامل!**

- 📱 التطبيق جاهز لاستقبال الإشعارات
- 🔧 الباكند جاهز لإرسال الإشعارات
- 📦 يرسل إشعار عند كل طلب جديد
- 🎯 يمكن توسيعه بسهولة

**جرّب الآن!** افتح التطبيق على جهازك واصنع طلب جديد 🚀
