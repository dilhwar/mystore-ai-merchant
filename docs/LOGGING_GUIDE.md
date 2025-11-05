# دليل نظام Logging في قسم المنتجات

## 🎯 نظرة عامة

تم إنشاء نظام logging قوي وشامل لتتبع جميع العمليات في قسم المنتجات. النظام يوفر:

- ✅ تتبع تفصيلي لجميع العمليات (تحميل، بحث، فلترة، ترتيب، إنشاء، تحديث، حذف)
- ✅ معلومات السياق (Context) لكل عملية (اللغة، المستخدم، الصفحة، إلخ)
- ✅ معلومات الأخطاء المفصلة
- ✅ ألوان مميزة لكل نوع من السجلات
- ✅ تخزين السجلات في الذاكرة للمراجعة
- ✅ إحصائيات شاملة عن السجلات

## 📁 الملفات الرئيسية

### 1. `src/utils/logger.ts`
الملف الأساسي الذي يحتوي على:
- **Logger Class**: الفئة الرئيسية لإدارة السجلات
- **productLogger**: Logger متخصص لعمليات المنتجات
- **categoryLogger**: Logger متخصص لعمليات الفئات
- **apiLogger**: Logger متخصص لطلبات API

### 2. `src/app/tabs/products.tsx`
تم دمج نظام الـ logging في جميع العمليات

## 🔍 أنواع السجلات (Log Levels)

```typescript
debug   // معلومات تطويرية تفصيلية (لون أزرق سماوي)
info    // معلومات عامة (لون أزرق)
warn    // تحذيرات (لون أصفر)
error   // أخطاء (لون أحمر)
success // عمليات ناجحة (لون أخضر)
```

## 📊 العمليات المُسجّلة

### 1. تحميل المنتجات
```typescript
// بداية التحميل
productLogger.loadList({ language: 'ar' });

// نجاح التحميل
productLogger.loadListSuccess(count, { totalPages, language });

// فشل التحميل
productLogger.loadListError(error, { language });
```

**مثال السجل:**
```
[2025-01-15T10:30:45.123Z] [INFO] Loading products list | {"component":"ProductsList","action":"load","language":"ar"}
[2025-01-15T10:30:45.678Z] [SUCCESS] Products loaded successfully: 12 items | {"component":"ProductsList","action":"load_success","count":12,"totalPages":1,"language":"ar"}
```

### 2. البحث
```typescript
// نتائج البحث
productLogger.searchResults(query, count, { originalCount, language });
```

**مثال السجل:**
```
[2025-01-15T10:31:20.456Z] [INFO] Search results for "laptop": 3 items | {"component":"ProductsList","action":"search_results","query":"laptop","count":3,"originalCount":12,"language":"ar"}
```

### 3. الفلترة
```typescript
// تطبيق الفلاتر
productLogger.applyFilters({
  category: 'electronics',
  stockLevel: 'in_stock',
  activeStatus: 'active',
  resultCount: 8,
  language: 'ar'
});

// مسح الفلاتر
productLogger.clearFilters({ language: 'ar' });
```

**مثال السجل:**
```
[2025-01-15T10:32:10.789Z] [INFO] Applying filters | {"component":"ProductsList","action":"apply_filters","filters":{"category":"electronics","stockLevel":"in_stock","activeStatus":"active","resultCount":8},"language":"ar"}
```

### 4. الترتيب
```typescript
productLogger.sort(sortBy, order, { itemCount, language });
```

**مثال السجل:**
```
[2025-01-15T10:33:05.234Z] [DEBUG] Sorting products by price (asc) | {"component":"ProductsList","action":"sort","sortBy":"price","order":"asc","itemCount":8,"language":"ar"}
```

### 5. التحديث (Refresh)
```typescript
// بداية التحديث
productLogger.refresh({ language: 'ar' });

// نجاح التحديث
productLogger.refreshSuccess(count, { totalPages, language });

// فشل التحديث
productLogger.refreshError(error, { language });
```

### 6. تحميل المزيد (Pagination)
```typescript
// بداية تحميل الصفحة التالية
productLogger.loadMore(page, { language });

// نجاح التحميل
productLogger.loadMoreSuccess(page, count, { totalItems, language });

// فشل التحميل
productLogger.loadMoreError(page, error, { language });
```

**مثال السجل:**
```
[2025-01-15T10:34:15.567Z] [DEBUG] Loading more products: page 2 | {"component":"ProductsList","action":"load_more","page":2,"language":"ar"}
[2025-01-15T10:34:16.123Z] [SUCCESS] Loaded more products: page 2, 10 items | {"component":"ProductsList","action":"load_more_success","page":2,"count":10,"totalItems":22,"language":"ar"}
```

### 7. إنشاء منتج
```typescript
// بداية الإنشاء
productLogger.createStart(data, { language });

// نجاح الإنشاء
productLogger.createSuccess(productId, { language });

// فشل الإنشاء
productLogger.createError(error, { language });
```

### 8. تحديث منتج
```typescript
// بداية التحديث
productLogger.updateStart(productId, data, { language });

// نجاح التحديث
productLogger.updateSuccess(productId, { language });

// فشل التحديث
productLogger.updateError(productId, error, { language });
```

### 9. حذف منتج
```typescript
// بداية الحذف
productLogger.deleteStart(productId, { language });

// نجاح الحذف
productLogger.deleteSuccess(productId, { language });

// فشل الحذف
productLogger.deleteError(productId, error, { language });
```

### 10. رفع الصور
```typescript
// بداية الرفع
productLogger.imageUploadStart(count, { language });

// تقدم الرفع
productLogger.imageUploadProgress(index, total, percentage, { language });

// نجاح الرفع
productLogger.imageUploadSuccess(count, urls, { language });

// فشل الرفع
productLogger.imageUploadError(error, { language });
```

### 11. التحقق من الصور
```typescript
// بداية التحقق
productLogger.imageValidationStart(count, { language });

// نجاح التحقق
productLogger.imageValidationSuccess(count, { language });

// فشل التحقق
productLogger.imageValidationError(errors, { language });
```

### 12. توليد محتوى AI
```typescript
// بداية التوليد
productLogger.aiGenerateStart(imageUri, { language });

// نجاح التوليد
productLogger.aiGenerateSuccess(content, { language });

// فشل التوليد
productLogger.aiGenerateError(error, { language });
```

### 13. تحميل منتج واحد
```typescript
// بداية التحميل
productLogger.loadProduct(productId, { language });

// نجاح التحميل
productLogger.loadProductSuccess(productId, product, { language });

// فشل التحميل
productLogger.loadProductError(productId, error, { language });
```

## 🛠 الوظائف المساعدة

### 1. الحصول على جميع السجلات
```typescript
import { logger } from '@/utils/logger';

// جميع السجلات
const allLogs = logger.getLogs();

// سجلات محددة (فقط الأخطاء مثلاً)
const errorLogs = logger.getLogs('error');
```

### 2. مسح السجلات
```typescript
logger.clearLogs();
```

### 3. تصدير السجلات كـ JSON
```typescript
const logsJson = logger.exportLogs();
console.log(logsJson);
// يمكن حفظها في ملف أو إرسالها للسيرفر
```

### 4. الحصول على ملخص السجلات
```typescript
const summary = logger.getSummary();
console.log(summary);
// {
//   total: 145,
//   byLevel: {
//     debug: 45,
//     info: 60,
//     warn: 15,
//     error: 10,
//     success: 15
//   }
// }
```

## 📈 أمثلة عملية

### مثال 1: تتبع مشكلة في تحميل المنتجات

```typescript
// عند حدوث خطأ، سيظهر في console:
[2025-01-15T10:35:30.123Z] [ERROR] Failed to load products list | {"component":"ProductsList","action":"load_error","language":"ar"}
Error Details: {
  message: "Network request failed",
  code: "ERR_NETWORK",
  response: undefined,
  status: undefined,
  stack: "Error: Network request failed\n    at..."
}
```

### مثال 2: تتبع عملية بحث كاملة

```typescript
// 1. المستخدم يدخل "laptop" في البحث
[DEBUG] Searching products: "laptop"

// 2. النتائج تظهر
[INFO] Search results for "laptop": 3 items | {"originalCount":12}

// 3. المستخدم يطبق فلتر (فقط المتوفر)
[INFO] Applying filters | {"stockLevel":"in_stock","resultCount":2}

// 4. المستخدم يرتب حسب السعر
[DEBUG] Sorting products by price (asc) | {"itemCount":2}
```

### مثال 3: تتبع عملية إنشاء منتج

```typescript
[INFO] Creating new product | {"data":{...}}
[INFO] Uploading 3 images
[DEBUG] Image upload progress: 1/3 (33%)
[DEBUG] Image upload progress: 2/3 (66%)
[DEBUG] Image upload progress: 3/3 (100%)
[SUCCESS] Images uploaded successfully: 3 items
[SUCCESS] Product created successfully: abc123
```

## 🎨 الألوان في Console

عند التطوير (__DEV__ = true)، السجلات تظهر بألوان:

- 🔵 **DEBUG**: أزرق سماوي
- 🔷 **INFO**: أزرق
- 🟡 **WARN**: أصفر
- 🔴 **ERROR**: أحمر
- 🟢 **SUCCESS**: أخضر

## 💡 نصائح الاستخدام

### 1. دائماً أضف السياق (Context)
```typescript
// ❌ سيء
productLogger.loadList();

// ✅ جيد
productLogger.loadList({ language: currentLanguage, userId: user.id });
```

### 2. استخدم المستوى المناسب
- **debug**: للمعلومات التطويرية التفصيلية
- **info**: للعمليات العادية
- **warn**: للتحذيرات والحالات غير المعتادة
- **error**: للأخطاء فقط
- **success**: للعمليات الناجحة المهمة

### 3. أضف معلومات مفيدة
```typescript
// ❌ سيء
productLogger.error('Failed', error);

// ✅ جيد
productLogger.loadListError(error, {
  language: currentLanguage,
  page: currentPage,
  filters: { category, stockLevel },
  userId: user.id
});
```

## 🔧 التطوير المستقبلي

### أفكار للتحسين:
1. **إرسال السجلات للسيرفر**: حفظ السجلات في قاعدة البيانات
2. **تنبيهات تلقائية**: إرسال تنبيه عند حدوث أخطاء متكررة
3. **لوحة تحكم**: واجهة مرئية لعرض السجلات
4. **تصفية متقدمة**: البحث في السجلات حسب التاريخ، المكون، إلخ
5. **تحليلات**: إحصائيات عن أداء التطبيق

## 📞 الدعم

للأسئلة أو المشاكل المتعلقة بنظام الـ logging، يرجى:
1. مراجعة هذا الدليل أولاً
2. فحص console للسجلات
3. استخدام `logger.getSummary()` لمعرفة حالة السجلات
4. استخدام `logger.exportLogs()` لتصدير السجلات للمراجعة

## 🎓 خلاصة

نظام الـ logging الجديد يوفر:
- 📊 رؤية شاملة لجميع العمليات
- 🔍 تتبع سهل للمشاكل
- 📈 تحليل أداء التطبيق
- 🐛 تشخيص الأخطاء بسرعة
- 📝 توثيق تلقائي للعمليات

**الآن يمكنك تتبع أي مشكلة في قسم المنتجات بسهولة!** 🎉
