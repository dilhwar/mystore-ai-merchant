# 🚀 Quick Start Guide - Gluestack UI Upgrade

## ⚡ TL;DR

تم ترقية التطبيق بنجاح! إليك كيفية البدء في 5 دقائق:

---

## 1️⃣ تشغيل التطبيق

```bash
# خطوة واحدة فقط - تنظيف الـ cache
npm start -- --clear

# أو
expo start -c
```

**مهم:** يجب تنظيف الـ cache بعد تغييرات Babel!

---

## 2️⃣ الشاشات الجديدة

### الملفات:
```
src/app/tabs/
├── dashboard-new.tsx    ← Dashboard V1 (بسيط)
├── dashboard-v2.tsx     ← Dashboard V2 (مع كل المخططات) ⭐
├── orders-new.tsx       ← Orders (بحث + فلاتر) ⭐
└── products-new.tsx     ← Products (Grid layout) ⭐
```

### لتفعيل الشاشات الجديدة:

**Option 1: إعادة تسمية (الأسرع)**
```bash
# احفظ نسخة احتياطية
mv src/app/tabs/dashboard.tsx src/app/tabs/dashboard-old.tsx
mv src/app/tabs/orders.tsx src/app/tabs/orders-old.tsx
mv src/app/tabs/products.tsx src/app/tabs/products-old.tsx

# فعّل الجديدة
mv src/app/tabs/dashboard-v2.tsx src/app/tabs/dashboard.tsx
mv src/app/tabs/orders-new.tsx src/app/tabs/orders.tsx
mv src/app/tabs/products-new.tsx src/app/tabs/products.tsx
```

**Option 2: تعديل الـ routing**
في `src/app/tabs/_layout.tsx`:
```typescript
<Tabs.Screen
  name="dashboard-v2"  // بدلاً من "dashboard"
  options={{ title: 'Dashboard' }}
/>
```

---

## 3️⃣ المكونات الجاهزة للاستخدام

### StatsWidget
```typescript
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { DollarSign } from 'lucide-react-native';

<StatsWidget
  stats={[
    {
      title: 'Total Sales',
      value: '$12,345',
      icon: DollarSign,
      color: '$success400',
      bgColor: '$success50',
      darkBgColor: '$success950',
      trend: '+12.5%',
      trendUp: true,
    },
  ]}
  columns={2}
  size="md"
/>
```

### DonutChartCard
```typescript
import { DonutChartCard } from '@/components/charts/PieChartCard';

<DonutChartCard
  title="Orders by Status"
  data={[
    { x: 'Delivered', y: 145, color: '#10B981' },
    { x: 'Pending', y: 25, color: '#F59E0B' },
  ]}
  size="md"
  innerRadiusRatio={0.5}
/>
```

### SkeletonLoader
```typescript
import { StatCardSkeleton, OrderCardSkeleton } from '@/components/ui/SkeletonLoader';

{isLoading && <StatCardSkeleton />}
```

---

## 4️⃣ Design Tokens - الأكثر استخداماً

### الألوان
```typescript
// Primary Actions
bg="$primary500"         // #007AFF (أزرق iOS)

// Success (Sales, Revenue)
bg="$success400"         // #10B981 (أخضر)

// Error (Cancelled, Failed)
bg="$error500"           // #EF4444 (أحمر)

// Warning (Pending)
bg="$warning400"         // #F59E0B (برتقالي)

// Background
bg="$backgroundLight"
$dark-bg="$backgroundDark"

// Card
bg="$cardLight"
$dark-bg="$cardDark"

// Text
color="$textLight"
$dark-color="$textDark"
```

### المسافات
```typescript
p="$4"        // padding: 16px
px="$4"       // paddingHorizontal: 16px
m="$6"        // margin: 24px
space="md"    // gap في HStack/VStack
```

### الحواف
```typescript
borderRadius="$lg"     // 16px (الأكثر استخداماً)
borderRadius="$xl"     // 20px
borderRadius="$full"   // دائرة كاملة
```

---

## 5️⃣ Animations السريعة

### FadeIn
```typescript
import Animated, { FadeIn } from 'react-native-reanimated';

<AnimatedBox entering={FadeIn.duration(300)} />
```

### Staggered List
```typescript
{items.map((item, index) => (
  <AnimatedCard
    key={item.id}
    entering={FadeInDown.delay(index * 100).springify()}
  >
    {/* content */}
  </AnimatedCard>
))}
```

### Layout Transitions
```typescript
<AnimatedCard layout={Layout.springify()}>
  {/* المحتوى يتحرك بسلاسة عند التغيير */}
</AnimatedCard>
```

---

## 6️⃣ الأيقونات (Lucide)

```typescript
import {
  DollarSign,      // Sales
  ShoppingBag,     // Orders
  Users,           // Customers
  Package,         // Products
  TrendingUp,      // Trend up
  TrendingDown,    // Trend down
  Search,          // Search
  Filter,          // Filter
  Plus,            // Add
  Edit2,           // Edit
  Trash2,          // Delete
} from 'lucide-react-native';

<DollarSign size={20} color={colors.success} strokeWidth={2} />
```

---

## 7️⃣ Gluestack Components الأساسية

### Layout
```typescript
<Box>           {/* div */}
<HStack>        {/* flex row */}
<VStack>        {/* flex column */}
<Card>          {/* elevated container */}
```

### Typography
```typescript
<Heading size="2xl">Title</Heading>
<Text fontSize="$sm">Body</Text>
```

### Input
```typescript
<Input>
  <InputSlot pl="$4">
    <InputIcon as={Search} />
  </InputSlot>
  <InputField placeholder="Search..." />
</Input>
```

### Actions
```typescript
<Pressable onPress={() => {}}>
  <Text>Click me</Text>
</Pressable>

<Fab placement="bottom right" bg="$primary500">
  <FabIcon as={Plus} />
</Fab>
```

### Feedback
```typescript
<Badge action="success" variant="solid">
  <BadgeText>Active</BadgeText>
</Badge>

<Actionsheet isOpen={isOpen} onClose={onClose}>
  <ActionsheetContent>
    <ActionsheetItem onPress={() => {}}>
      <ActionsheetItemText>Edit</ActionsheetItemText>
    </ActionsheetItem>
  </ActionsheetContent>
</Actionsheet>
```

---

## 8️⃣ Charts (Victory Native)

### Line + Area Chart
```typescript
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis } from 'victory-native';

<VictoryChart width={300} height={200}>
  <VictoryAxis />
  <VictoryAxis dependentAxis />
  <VictoryArea data={data} />
  <VictoryLine data={data} />
</VictoryChart>
```

### Bar Chart
```typescript
<VictoryChart>
  <VictoryBar data={data} />
</VictoryChart>
```

### Pie Chart
```typescript
<VictoryPie
  data={data}
  innerRadius={50}  // للـ donut
  colorScale={['#007AFF', '#10B981', '#F59E0B']}
/>
```

---

## 9️⃣ Haptic Feedback

```typescript
import { haptics } from '@/utils/haptics';

haptics.light();      // لمسة خفيفة
haptics.medium();     // لمسة متوسطة
haptics.success();    // نجاح
haptics.error();      // خطأ
haptics.selection();  // تغيير اختيار
```

---

## 🔟 Dark Mode

### في المكونات:
```typescript
// كل Gluestack component يدعم dark mode
<Box
  bg="$backgroundLight"
  $dark-bg="$backgroundDark"
>
  <Text
    color="$textLight"
    $dark-color="$textDark"
  >
    Hello
  </Text>
</Box>
```

### الحصول على Theme:
```typescript
import { useTheme } from '@/store/themeStore';

const { colors, isDark } = useTheme();

// استخدم colors للألوان الديناميكية
<Icon color={colors.primary} />
```

---

## 🐛 حل المشاكل السريع

### المشكلة: Animations لا تعمل
```bash
# التأكد من Babel config
# تأكد أن 'react-native-reanimated/plugin' آخر plugin
# ثم:
expo start -c
```

### المشكلة: Dark mode لا يتغير
```typescript
// تأكد من GluestackUIProvider
<GluestackUIProvider
  config={config}
  colorMode={isDark ? 'dark' : 'light'}  // ← مهم!
>
```

### المشكلة: Components not found
```typescript
// تأكد من الـ import
import { Box, Text, Heading } from '@gluestack-ui/themed';
// ليس من '@gluestack-ui/themed/build'
```

---

## 📱 اختبار سريع

### الأشياء التي يجب اختبارها:

1. ✅ **Dashboard V2**
   - 4 Stat cards مع animations
   - 4 Charts (Line, Bar, 2× Donut)
   - Pull to refresh

2. ✅ **Orders**
   - Search (اكتب order number)
   - Filter (اضغط Filter button)
   - Empty state (ابحث عن شيء غير موجود)

3. ✅ **Products**
   - Grid layout (2 columns)
   - Long press على card
   - Filter chips (All, Active, Inactive)

4. ✅ **Dark Mode**
   - غيّر الثيم في Settings
   - جميع الشاشات يجب أن تتغير

5. ✅ **Animations**
   - شاهد staggered entrance للـ cards
   - جرب pull-to-refresh
   - شاهد skeleton loaders

---

## 🎯 النصائح الذهبية

### للمطورين الجدد:
1. ابدأ بنسخ screen موجود
2. استخدم `StatsWidget` لأي stats
3. استخدم `DonutChartCard` لأي pie chart
4. دائماً أضف `$dark-bg` و `$dark-color`

### للمطورين المتمرسين:
1. اقرأ `gluestack-ui.config.ts` للـ tokens
2. استكشف `src/components/` للمكونات الجاهزة
3. استخدم `AnimatedBox` و `AnimatedCard` من البداية
4. ابني مكونات قابلة لإعادة الاستخدام

---

## 📚 الموارد

- **Gluestack Docs:** https://gluestack.io/ui/docs
- **Reanimated Docs:** https://docs.swmansion.com/react-native-reanimated
- **Victory Docs:** https://formidable.com/open-source/victory
- **Lucide Icons:** https://lucide.dev/icons

---

## 🎉 الخلاصة

لديك الآن:
- ✅ 3 شاشات احترافية جاهزة
- ✅ 3 مكونات قابلة لإعادة الاستخدام
- ✅ نظام تصميم كامل (200+ tokens)
- ✅ Animations سلسة (60-120 FPS)
- ✅ Charts احترافية
- ✅ Dark mode جاهز

**ابدأ الآن:** `npm start -- --clear` 🚀

---

*للتوثيق الكامل: راجع `GLUESTACK-UPGRADE.md`*
