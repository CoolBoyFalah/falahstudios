"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ar";
export type Theme = "dark" | "light";

/** [English, Arabic] pairs kept side by side so translations never drift apart. */
const messages = {
  // Brand & shell
  "brand.studio": ["Falah Studios", "استوديوهات فلاح"],
  "brand.os": ["Falah OS", "فلاح OS"],
  "brand.tagline": ["Your business, simplified.", "أعمالك، ببساطة."],
  "brand.version": ["Falah OS · v2.0", "فلاح OS · الإصدار 2.0"],
  "nav.workspace": ["Workspace", "مساحة العمل"],
  "nav.overview": ["Overview", "نظرة عامة"],
  "nav.website": ["Website", "الموقع الإلكتروني"],
  "nav.orders": ["Orders", "الطلبات"],
  "nav.customers": ["Customers", "العملاء"],
  "nav.bookings": ["Bookings", "الحجوزات"],
  "nav.analytics": ["Analytics", "التحليلات"],
  "nav.ai": ["Falah AI", "فلاح AI"],
  "nav.notifications": ["Notifications", "الإشعارات"],
  "nav.settings": ["Settings", "الإعدادات"],
  "nav.menu": ["Open menu", "فتح القائمة"],
  "nav.close": ["Close menu", "إغلاق القائمة"],
  "pref.language": ["Switch language", "تغيير اللغة"],
  "pref.dark": ["Dark", "داكن"],
  "pref.light": ["Light", "فاتح"],
  "pref.otherLanguage": ["العربية", "English"],
  "auth.signOut": ["Sign out", "تسجيل الخروج"],

  // Sign in
  "login.label": ["Access code", "رمز الدخول"],
  "login.continue": ["Continue", "متابعة"],
  "login.connecting": ["Connecting…", "جارٍ الاتصال…"],
  "login.required": ["Enter your access code.", "أدخل رمز الدخول."],
  "login.invalid": ["That access code isn't valid. Check it and try again.", "رمز الدخول غير صحيح. تحقّق منه وحاول مجددًا."],
  "login.expired": ["Your session ended. Please sign in again.", "انتهت جلستك. يرجى تسجيل الدخول مجددًا."],
  "login.noCode": ["Don't have an access code?", "ليس لديك رمز دخول؟"],
  "login.contact": ["Contact Falah Studios", "تواصل مع استوديوهات فلاح"],
  "login.or": ["or", "أو"],
  "login.demo": ["Try the live demo", "جرّب النسخة التجريبية"],
  "login.demoHint": ["No code needed. Explore a sample bakery.", "بدون رمز. استكشف مخبزًا تجريبيًا."],

  // Demo
  "demo.opening": ["Opening the demo…", "جارٍ فتح النسخة التجريبية…"],
  "demo.failed": ["The demo couldn't open. Please try again.", "تعذّر فتح النسخة التجريبية. يرجى المحاولة مجددًا."],
  "demo.retry": ["Try again", "حاول مجددًا"],
  "demo.banner": ["You're exploring a live demo. Try anything: it resets every night.", "أنت تستكشف نسخة تجريبية مباشرة. جرّب كل شيء، فهي تُعاد كل ليلة."],
  "demo.cta": ["Get Falah OS for your business", "احصل على فلاح OS لنشاطك"],
  "demo.locked": ["Business settings are locked in the demo.", "إعدادات النشاط مقفلة في النسخة التجريبية."],

  // Common
  "common.save": ["Save changes", "حفظ التغييرات"],
  "common.saving": ["Saving…", "جارٍ الحفظ…"],
  "common.saved": ["Changes saved.", "تم حفظ التغييرات."],
  "common.cancel": ["Cancel", "إلغاء"],
  "common.delete": ["Delete", "حذف"],
  "common.confirmDelete": ["Confirm delete", "تأكيد الحذف"],
  "common.deleted": ["Deleted.", "تم الحذف."],
  "common.edit": ["Edit", "تعديل"],
  "common.close": ["Close", "إغلاق"],
  "common.search": ["Search", "بحث"],
  "common.retry": ["Try again", "حاول مجددًا"],
  "common.viewAll": ["View all", "عرض الكل"],
  "common.all": ["All", "الكل"],
  "common.optional": ["optional", "اختياري"],
  "common.notes": ["Notes", "ملاحظات"],
  "common.email": ["Email", "البريد الإلكتروني"],
  "common.phone": ["Phone", "الهاتف"],
  "common.name": ["Name", "الاسم"],
  "common.total": ["Total", "الإجمالي"],
  "common.status": ["Status", "الحالة"],
  "common.date": ["Date", "التاريخ"],
  "common.previous": ["Previous", "السابق"],
  "common.next": ["Next", "التالي"],
  "common.pageOf": ["Page {page} of {pages}", "صفحة {page} من {pages}"],
  "common.copy": ["Copy", "نسخ"],
  "common.copied": ["Copied", "تم النسخ"],
  "common.today": ["Today", "اليوم"],
  "common.tomorrow": ["Tomorrow", "غدًا"],
  "common.minutes": ["{n} min", "{n} دقيقة"],

  // Statuses
  "status.pending": ["Pending", "قيد الانتظار"],
  "status.confirmed": ["Confirmed", "مؤكد"],
  "status.completed": ["Completed", "مكتمل"],
  "status.cancelled": ["Cancelled", "ملغي"],

  // Errors
  "error.network": ["Can't reach Falah OS right now. Check your connection and try again.", "تعذّر الوصول إلى فلاح OS الآن. تحقّق من اتصالك وحاول مجددًا."],
  "error.generic": ["Something went wrong. Please try again.", "حدث خطأ ما. يرجى المحاولة مجددًا."],
  "error.session": ["Your session has ended.", "انتهت جلستك."],
  "error.load": ["We couldn't load this page.", "تعذّر تحميل هذه الصفحة."],
  "error.duplicate": ["A record with these details already exists.", "يوجد سجل بهذه التفاصيل بالفعل."],
  "error.rateLimit": ["Too many attempts. Please wait a few minutes and try again.", "محاولات كثيرة. يرجى الانتظار بضع دقائق ثم المحاولة مجددًا."],

  // Overview
  "overview.kicker": ["Live workspace", "مساحة عمل مباشرة"],
  "overview.morning": ["Good morning,", "صباح الخير،"],
  "overview.afternoon": ["Good afternoon,", "مساء الخير،"],
  "overview.evening": ["Good evening,", "مساء الخير،"],
  "overview.subtitle": ["Everything important in your business, in one calm and clear place.", "كل ما يهم في أعمالك، في مكان واحد هادئ وواضح."],
  "overview.newOrder": ["New order", "طلب جديد"],
  "overview.newBooking": ["New booking", "حجز جديد"],
  "overview.manageWebsite": ["Manage website", "إدارة الموقع"],
  "overview.revenue30": ["Revenue · 30 days", "الإيرادات · 30 يومًا"],
  "overview.revenueAll": ["{value} all time", "{value} منذ البداية"],
  "overview.ordersToday": ["Orders today", "طلبات اليوم"],
  "overview.vsYesterday": ["{n} yesterday", "{n} أمس"],
  "overview.customers": ["Customers", "العملاء"],
  "overview.newCustomers": ["+{n} in 30 days", "+{n} خلال 30 يومًا"],
  "overview.bookingsToday": ["Bookings today", "حجوزات اليوم"],
  "overview.upcomingLabel": ["Scheduled for today", "مجدولة لليوم"],
  "overview.pendingBanner": ["{n} orders are waiting for confirmation.", "{n} طلبات بانتظار التأكيد."],
  "overview.pendingBannerOne": ["1 order is waiting for confirmation.", "طلب واحد بانتظار التأكيد."],
  "overview.review": ["Review", "مراجعة"],
  "overview.recent": ["Recent", "الأحدث"],
  "overview.latestOrders": ["Latest orders", "أحدث الطلبات"],
  "overview.noOrders": ["No orders yet.", "لا توجد طلبات حتى الآن."],
  "overview.noOrdersHint": ["Your new orders will appear here.", "ستظهر طلباتك الجديدة هنا."],
  "overview.upcoming": ["Upcoming", "القادمة"],
  "overview.nextBookings": ["Next bookings", "الحجوزات التالية"],
  "overview.noBookings": ["Nothing scheduled.", "لا يوجد شيء مجدول."],
  "overview.aiTitle": ["Your business, understood.", "أعمالك، مفهومة بوضوح."],
  "overview.aiBody": ["Get a private, instant read on how your business is doing.", "احصل على قراءة خاصة وفورية لأداء أعمالك."],
  "overview.aiCta": ["Ask Falah AI", "اسأل فلاح AI"],

  // Orders
  "orders.kicker": ["Commerce", "التجارة"],
  "orders.title": ["Orders", "الطلبات"],
  "orders.subtitle": ["Track every order from first request to completion.", "تابع كل طلب من لحظة استلامه حتى اكتماله."],
  "orders.new": ["New order", "طلب جديد"],
  "orders.search": ["Search customer or item…", "ابحث عن عميل أو صنف…"],
  "orders.empty": ["No orders yet.", "لا توجد طلبات حتى الآن."],
  "orders.emptyHint": ["Create your first order to get started.", "أنشئ أول طلب للبدء."],
  "orders.noMatch": ["No orders match your filters.", "لا توجد طلبات مطابقة."],
  "orders.customer": ["Customer", "العميل"],
  "orders.customerName": ["Customer name", "اسم العميل"],
  "orders.customerEmail": ["Customer email", "بريد العميل"],
  "orders.items": ["Items", "الأصناف"],
  "orders.item": ["Item", "الصنف"],
  "orders.qty": ["Qty", "الكمية"],
  "orders.price": ["Unit price", "سعر الوحدة"],
  "orders.addItem": ["Add item", "إضافة صنف"],
  "orders.removeItem": ["Remove item", "إزالة الصنف"],
  "orders.initialStatus": ["Initial status", "الحالة الأولية"],
  "orders.create": ["Create order", "إنشاء الطلب"],
  "orders.creating": ["Creating…", "جارٍ الإنشاء…"],
  "orders.created": ["Order created.", "تم إنشاء الطلب."],
  "orders.updated": ["Order updated.", "تم تحديث الطلب."],
  "orders.deleteConfirm": ["Delete this order? This can't be undone.", "حذف هذا الطلب؟ لا يمكن التراجع عن ذلك."],
  "orders.more": ["+{n} more", "+{n} أخرى"],

  // Customers
  "customers.kicker": ["Relationships", "العلاقات"],
  "customers.title": ["Customers", "العملاء"],
  "customers.subtitle": ["Everyone who has ordered from you, with their history.", "كل من طلب منك، مع سجله الكامل."],
  "customers.new": ["Add customer", "إضافة عميل"],
  "customers.search": ["Search name, email or phone…", "ابحث بالاسم أو البريد أو الهاتف…"],
  "customers.sort": ["Sort", "ترتيب"],
  "customers.sortRecent": ["Newest", "الأحدث"],
  "customers.sortSpend": ["Top spend", "الأعلى إنفاقًا"],
  "customers.sortName": ["A–Z", "أ–ي"],
  "customers.empty": ["No customers yet.", "لا يوجد عملاء حتى الآن."],
  "customers.emptyHint": ["Customers are added automatically when you create orders.", "يُضاف العملاء تلقائيًا عند إنشاء الطلبات."],
  "customers.noMatch": ["No customers match your search.", "لا يوجد عملاء مطابقون لبحثك."],
  "customers.noContact": ["No contact details", "لا توجد تفاصيل اتصال"],
  "customers.orders": ["{n} orders", "{n} طلبات"],
  "customers.ordersOne": ["1 order", "طلب واحد"],
  "customers.spent": ["Total spent", "إجمالي الإنفاق"],
  "customers.lastOrder": ["Last order", "آخر طلب"],
  "customers.since": ["Customer since", "عميل منذ"],
  "customers.history": ["Order history", "سجل الطلبات"],
  "customers.noHistory": ["No orders linked to this customer yet.", "لا توجد طلبات مرتبطة بهذا العميل بعد."],
  "customers.created": ["Customer added.", "تمت إضافة العميل."],
  "customers.updated": ["Customer updated.", "تم تحديث العميل."],
  "customers.deleteConfirm": ["Delete this customer? Their past orders are kept.", "حذف هذا العميل؟ سيتم الاحتفاظ بطلباته السابقة."],
  "customers.profile": ["Customer profile", "ملف العميل"],

  // Bookings
  "bookings.kicker": ["Schedule", "الجدولة"],
  "bookings.title": ["Bookings", "الحجوزات"],
  "bookings.subtitle": ["Appointments and reservations, organised by day.", "المواعيد والحجوزات، مرتبة حسب اليوم."],
  "bookings.new": ["New booking", "حجز جديد"],
  "bookings.upcoming": ["Upcoming", "القادمة"],
  "bookings.past": ["Past", "السابقة"],
  "bookings.service": ["Service", "الخدمة"],
  "bookings.when": ["Date & time", "التاريخ والوقت"],
  "bookings.duration": ["Duration (minutes)", "المدة (بالدقائق)"],
  "bookings.create": ["Create booking", "إنشاء الحجز"],
  "bookings.created": ["Booking created.", "تم إنشاء الحجز."],
  "bookings.updated": ["Booking updated.", "تم تحديث الحجز."],
  "bookings.emptyUpcoming": ["No upcoming bookings.", "لا توجد حجوزات قادمة."],
  "bookings.emptyPast": ["No past bookings.", "لا توجد حجوزات سابقة."],
  "bookings.emptyHint": ["New bookings will appear here, grouped by day.", "ستظهر الحجوزات الجديدة هنا مرتبة حسب اليوم."],
  "bookings.deleteConfirm": ["Delete this booking?", "حذف هذا الحجز؟"],
  "bookings.pastDate": ["This time is in the past.", "هذا الوقت في الماضي."],

  // Analytics
  "analytics.kicker": ["Performance", "الأداء"],
  "analytics.title": ["Analytics", "التحليلات"],
  "analytics.subtitle": ["How your business is trending over time.", "كيف يتطور أداء أعمالك مع الوقت."],
  "analytics.days": ["{n} days", "{n} يومًا"],
  "analytics.revenue": ["Completed revenue", "إيرادات الطلبات المكتملة"],
  "analytics.orders": ["Orders", "الطلبات"],
  "analytics.average": ["Average order", "متوسط الطلب"],
  "analytics.vsPrevious": ["vs previous {n} days", "مقارنة بالـ {n} يومًا السابقة"],
  "analytics.revenueChart": ["Revenue by day", "الإيرادات اليومية"],
  "analytics.revenueChartHint": ["Completed orders only", "الطلبات المكتملة فقط"],
  "analytics.statusBreakdown": ["Orders by status", "الطلبات حسب الحالة"],
  "analytics.bookingBreakdown": ["Bookings by status", "الحجوزات حسب الحالة"],
  "analytics.topCustomers": ["Top customers", "أفضل العملاء"],
  "analytics.noData": ["No data for this period yet.", "لا توجد بيانات لهذه الفترة بعد."],
  "analytics.new": ["New", "جديد"],

  // AI
  "ai.kicker": ["Business assistant", "مساعد الأعمال"],
  "ai.title": ["Falah AI", "فلاح AI"],
  "ai.subtitle": ["A private read on your workspace, based only on your own orders, customers and bookings.", "قراءة خاصة لمساحة عملك، مبنية فقط على طلباتك وعملائك وحجوزاتك."],
  "ai.question": ["How is my business doing?", "كيف تسير أعمالي؟"],
  "ai.refresh": ["Refresh insights", "تحديث التحليلات"],
  "ai.reviewing": ["Reviewing your workspace…", "جارٍ مراجعة مساحة عملك…"],
  "ai.generated": ["Updated {time}", "آخر تحديث {time}"],
  "ai.summaryOrders": ["Orders", "الطلبات"],
  "ai.summaryCustomers": ["Customers", "العملاء"],
  "ai.summaryBookings": ["Bookings", "الحجوزات"],
  "ai.summaryRevenue": ["Revenue", "الإيرادات"],
  "insight.empty.title": ["Your workspace is ready", "مساحة عملك جاهزة"],
  "insight.empty.body": ["Add your first order, customer or booking and insights will start appearing here.", "أضف أول طلب أو عميل أو حجز وستبدأ التحليلات بالظهور هنا."],
  "insight.revenueUp.title": ["Revenue is up this week", "الإيرادات في ارتفاع هذا الأسبوع"],
  "insight.revenueUp.body": ["{current} in completed orders over the last 7 days, up {change}% from {previous} the week before.", "{current} من الطلبات المكتملة خلال آخر 7 أيام، بارتفاع {change}% عن {previous} في الأسبوع السابق."],
  "insight.revenueDown.title": ["Revenue dipped this week", "انخفضت الإيرادات هذا الأسبوع"],
  "insight.revenueDown.body": ["{current} in completed orders over the last 7 days, down {change}% from {previous}. Following up on pending orders can help.", "{current} من الطلبات المكتملة خلال آخر 7 أيام، بانخفاض {change}% عن {previous}. متابعة الطلبات المعلّقة قد تساعد."],
  "insight.pendingOrders.title": ["Orders waiting on you", "طلبات بانتظارك"],
  "insight.pendingOrders.body": ["{count} orders are still pending. Confirming them quickly keeps customers confident.", "{count} طلبات ما زالت قيد الانتظار. تأكيدها بسرعة يعزز ثقة العملاء."],
  "insight.nextBooking.title": ["Next up: {service}", "التالي: {service}"],
  "insight.nextBooking.body": ["{customer} is booked for {at}. You have {week} bookings in the next 7 days.", "{customer} محجوز في {at}. لديك {week} حجوزات خلال الأيام السبعة القادمة."],
  "insight.topCustomer.title": ["{name} is your top customer", "{name} هو أفضل عملائك"],
  "insight.topCustomer.body": ["{spent} across {orders} orders. A personal thank-you goes a long way.", "{spent} عبر {orders} طلبات. كلمة شكر شخصية تصنع فرقًا كبيرًا."],
  "insight.repeatRate.title": ["{rate}% of customers come back", "{rate}% من العملاء يعودون"],
  "insight.repeatRate.body": ["{repeat} customers have ordered more than once.", "{repeat} عملاء طلبوا أكثر من مرة."],
  "insight.averageOrder.title": ["Average order: {value}", "متوسط الطلب: {value}"],
  "insight.averageOrder.body": ["Based on all completed orders. Bundles and add-ons are an easy way to lift it.", "بناءً على كل الطلبات المكتملة. العروض المجمّعة والإضافات طريقة سهلة لرفعه."],
  "insight.cancellations.title": ["Cancellations are high", "نسبة الإلغاء مرتفعة"],
  "insight.cancellations.body": ["{rate}% of orders in the last 30 days were cancelled. It may be worth checking in with those customers.", "{rate}% من الطلبات خلال آخر 30 يومًا أُلغيت. قد يكون من المفيد التواصل مع هؤلاء العملاء."],

  // Notifications
  "notifications.kicker": ["Inbox", "صندوق الوارد"],
  "notifications.title": ["Notifications", "الإشعارات"],
  "notifications.subtitle": ["New orders, bookings and updates from your workspace.", "الطلبات والحجوزات والتحديثات الجديدة في مساحة عملك."],
  "notifications.markAll": ["Mark all as read", "تحديد الكل كمقروء"],
  "notifications.empty": ["You're all caught up.", "لا توجد إشعارات جديدة."],
  "notifications.unread": ["{n} unread", "{n} غير مقروءة"],
  "notice.New order": ["New order", "طلب جديد"],
  "notice.New booking": ["New booking", "حجز جديد"],

  // Settings
  "settings.kicker": ["Workspace", "مساحة العمل"],
  "settings.title": ["Settings", "الإعدادات"],
  "settings.subtitle": ["Your business profile and how Falah OS looks for you.", "ملف نشاطك التجاري وطريقة ظهور فلاح OS لك."],
  "settings.profile": ["Business profile", "ملف النشاط التجاري"],
  "settings.businessName": ["Business name", "اسم النشاط التجاري"],
  "settings.workspace": ["Workspace details", "تفاصيل مساحة العمل"],
  "settings.slug": ["Workspace address", "عنوان مساحة العمل"],
  "settings.clientCode": ["Client code", "رمز العميل"],
  "settings.memberSince": ["Member since", "عضو منذ"],
  "settings.preferences": ["Preferences", "التفضيلات"],
  "settings.language": ["Language", "اللغة"],
  "settings.theme": ["Appearance", "المظهر"],
  "settings.session": ["Session", "الجلسة"],
  "settings.sessionBody": ["Sign out of Falah OS on this device.", "تسجيل الخروج من فلاح OS على هذا الجهاز."],

  // Website
  "website.kicker": ["Website", "الموقع الإلكتروني"],
  "website.title": ["Website Manager", "مدير الموقع الإلكتروني"],
  "website.subtitle": ["Update your business information without touching code.", "حدّث معلومات نشاطك التجاري من دون لمس الكود."],
  "website.business": ["Business information", "معلومات النشاط التجاري"],
  "website.businessHint": ["This appears throughout your website.", "تظهر هذه المعلومات في جميع أنحاء موقعك."],
  "website.businessName": ["Business name", "اسم النشاط التجاري"],
  "website.tagline": ["Tagline", "الشعار التعريفي"],
  "website.description": ["Description", "الوصف"],
  "website.contact": ["Contact details", "تفاصيل الاتصال"],
  "website.contactHint": ["How customers reach you.", "كيف يتواصل معك العملاء."],
  "website.contactEmail": ["Contact email", "بريد التواصل"],
  "website.whatsapp": ["WhatsApp", "واتساب"],
  "website.instagram": ["Instagram", "إنستغرام"],
  "website.address": ["Address", "العنوان"],
  "website.hours": ["Opening hours", "ساعات العمل"],
  "website.visibility": ["Visibility", "الظهور"],
  "website.published": ["Website is live", "الموقع منشور"],
  "website.publishedHint": ["Turn off to temporarily hide your website.", "أوقفه لإخفاء موقعك مؤقتًا."],
  "website.hidden": ["Website is hidden", "الموقع مخفي"],
  "website.preview": ["Live preview", "معاينة مباشرة"],
  "website.unsaved": ["Unsaved changes", "تغييرات غير محفوظة"],
  "website.discard": ["Discard", "تجاهل"],
  "website.lastSaved": ["Last saved {time}", "آخر حفظ {time}"],
  "website.chars": ["{n}/{max}", "{n}/{max}"],
  "website.placeholderName": ["Your business", "نشاطك التجاري"],
  "website.placeholderTagline": ["A short line that sums you up", "سطر قصير يعبّر عنك"],
  "website.placeholderDescription": ["Tell customers what you do and why they'll love it.", "أخبر عملاءك بما تقدمه ولماذا سيحبونه."],
  "website.nameRequired": ["Your website needs a business name.", "يحتاج موقعك إلى اسم النشاط التجاري."],
  "website.leaveWarning": ["You have unsaved changes.", "لديك تغييرات غير محفوظة."],

  // Catalog
  "nav.catalog": ["Catalog", "الكتالوج"],
  "catalog.kicker": ["Products & services", "المنتجات والخدمات"],
  "catalog.title": ["Catalog", "الكتالوج"],
  "catalog.subtitle": ["Everything you sell, with prices. Available items show on your website and speed up new orders.", "كل ما تبيعه مع الأسعار. تظهر العناصر المتاحة على موقعك وتسرّع إنشاء الطلبات."],
  "catalog.new": ["Add item", "إضافة عنصر"],
  "catalog.edit": ["Edit item", "تعديل العنصر"],
  "catalog.search": ["Search name or category…", "ابحث بالاسم أو الفئة…"],
  "catalog.products": ["Products", "المنتجات"],
  "catalog.services": ["Services", "الخدمات"],
  "catalog.product": ["Product", "منتج"],
  "catalog.service": ["Service", "خدمة"],
  "catalog.type": ["Type", "النوع"],
  "catalog.name": ["Name", "الاسم"],
  "catalog.price": ["Price", "السعر"],
  "catalog.category": ["Category", "الفئة"],
  "catalog.categoryHint": ["e.g. Pastries, Haircuts", "مثال: معجنات، قص الشعر"],
  "catalog.uncategorised": ["Other", "أخرى"],
  "catalog.description": ["Description", "الوصف"],
  "catalog.duration": ["Duration (minutes)", "المدة (بالدقائق)"],
  "catalog.available": ["Available", "متاح"],
  "catalog.availableHint": ["Unavailable items are hidden from your website and order form.", "العناصر غير المتاحة تُخفى من موقعك ونموذج الطلب."],
  "catalog.unavailable": ["Unavailable", "غير متاح"],
  "catalog.featured": ["Featured", "مميز"],
  "catalog.featuredHint": ["Shown first on your website.", "يظهر أولًا على موقعك."],
  "catalog.empty": ["Your catalog is empty.", "الكتالوج فارغ."],
  "catalog.emptyHint": ["Add what you sell once, then pick it when creating orders and bookings.", "أضف ما تبيعه مرة واحدة، ثم اختره عند إنشاء الطلبات والحجوزات."],
  "catalog.noMatch": ["No items match your search.", "لا توجد عناصر مطابقة لبحثك."],
  "catalog.created": ["Item added.", "تمت إضافة العنصر."],
  "catalog.updated": ["Item updated.", "تم تحديث العنصر."],
  "catalog.deleteConfirm": ["Delete this item? Past orders aren't affected.", "حذف هذا العنصر؟ لن تتأثر الطلبات السابقة."],
  "catalog.pick": ["Add from catalog…", "إضافة من الكتالوج…"],
  "catalog.pickService": ["Choose from your services…", "اختر من خدماتك…"],

  // Tax & receipts
  "tax.subtotal": ["Subtotal", "المجموع الفرعي"],
  "tax.vat": ["VAT {rate}%", "ضريبة القيمة المضافة {rate}%"],
  "tax.included": ["Includes VAT {rate}%", "شامل ضريبة القيمة المضافة {rate}%"],
  "receipt.print": ["Print receipt", "طباعة الإيصال"],
  "receipt.title": ["Receipt", "إيصال"],
  "receipt.taxInvoice": ["Tax invoice", "فاتورة ضريبية"],
  "receipt.number": ["No. {n}", "رقم {n}"],
  "receipt.billedTo": ["Billed to", "فاتورة إلى"],
  "receipt.trn": ["TRN {n}", "الرقم الضريبي {n}"],
  "receipt.back": ["Back to orders", "العودة إلى الطلبات"],
  "receipt.notFound": ["This order couldn't be found.", "تعذّر العثور على هذا الطلب."],

  // Business settings
  "settings.business": ["Business & tax", "النشاط التجاري والضريبة"],
  "settings.businessHint": ["Used for new orders and receipts. Existing orders keep their original amounts.", "تُستخدم للطلبات الجديدة والإيصالات. تحتفظ الطلبات الحالية بمبالغها الأصلية."],
  "settings.currency": ["Currency", "العملة"],
  "settings.taxRate": ["VAT rate (%)", "نسبة ضريبة القيمة المضافة (%)"],
  "settings.taxRateHint": ["0 turns tax off", "0 لإيقاف الضريبة"],
  "settings.pricesIncludeTax": ["Prices include VAT", "الأسعار شاملة الضريبة"],
  "settings.pricesIncludeTaxHint": ["Turn off to add VAT on top of your prices at checkout.", "أوقفه لإضافة الضريبة فوق أسعارك عند الدفع."],
  "settings.taxNumber": ["Tax registration number (TRN)", "رقم التسجيل الضريبي"],
  "settings.receiptNote": ["Receipt note", "ملاحظة الإيصال"],
  "settings.receiptNoteHint": ["Printed at the bottom of every receipt, e.g. a thank-you or return policy.", "تُطبع أسفل كل إيصال، مثل رسالة شكر أو سياسة الإرجاع."],

  // Website additions
  "website.tabDetails": ["Details", "التفاصيل"],
  "website.tabHours": ["Hours", "ساعات العمل"],
  "website.tabFaq": ["FAQ", "الأسئلة الشائعة"],
  "website.tabSeo": ["Search & social", "البحث والتواصل"],
  "website.announcement": ["Announcement banner", "شريط الإعلان"],
  "website.announcementHint": ["A short message across the top of your site — holidays, offers, closures.", "رسالة قصيرة أعلى موقعك — عطلات أو عروض أو إغلاق."],
  "website.announcementOn": ["Show announcement", "إظهار الإعلان"],
  "website.announcementPlaceholder": ["e.g. Closed for Eid, back on Monday", "مثال: مغلق بمناسبة العيد، نعود يوم الاثنين"],
  "website.weeklyHours": ["Weekly opening hours", "ساعات العمل الأسبوعية"],
  "website.weeklyHoursHint": ["Customers see when you're open. Leave a day closed if you don't open.", "يرى العملاء أوقات عملك. اترك اليوم مغلقًا إن لم تفتح فيه."],
  "website.open": ["Open", "مفتوح"],
  "website.closed": ["Closed", "مغلق"],
  "website.opens": ["Opens", "يفتح"],
  "website.closes": ["Closes", "يغلق"],
  "website.copyToAll": ["Copy to all open days", "نسخ إلى كل الأيام المفتوحة"],
  "website.hoursNote": ["Extra note on hours", "ملاحظة إضافية عن الساعات"],
  "website.hoursNotePlaceholder": ["e.g. Ramadan hours may vary", "مثال: قد تختلف الساعات في رمضان"],
  "website.faqs": ["Frequently asked questions", "الأسئلة الشائعة"],
  "website.faqsHint": ["Answer what customers ask most — delivery, payment, bookings.", "أجب عمّا يسأله العملاء كثيرًا — التوصيل والدفع والحجز."],
  "website.question": ["Question", "السؤال"],
  "website.answer": ["Answer", "الإجابة"],
  "website.addFaq": ["Add question", "إضافة سؤال"],
  "website.removeFaq": ["Remove question", "حذف السؤال"],
  "website.moveUp": ["Move up", "نقل لأعلى"],
  "website.moveDown": ["Move down", "نقل لأسفل"],
  "website.noFaqs": ["No questions yet.", "لا توجد أسئلة بعد."],
  "website.seo": ["Search engines", "محركات البحث"],
  "website.seoHint": ["How your site appears on Google.", "كيف يظهر موقعك على Google."],
  "website.seoTitle": ["Page title", "عنوان الصفحة"],
  "website.seoDescription": ["Meta description", "الوصف التعريفي"],
  "website.social": ["Social & maps", "التواصل والخرائط"],
  "website.tiktok": ["TikTok", "تيك توك"],
  "website.facebook": ["Facebook", "فيسبوك"],
  "website.mapsUrl": ["Google Maps link", "رابط خرائط Google"],
  "website.searchPreview": ["Search preview", "معاينة البحث"],
  "website.openNow": ["Open today {open}–{close}", "مفتوح اليوم {open}–{close}"],
  "website.closedToday": ["Closed today", "مغلق اليوم"],
  "day.0": ["Sunday", "الأحد"],
  "day.1": ["Monday", "الاثنين"],
  "day.2": ["Tuesday", "الثلاثاء"],
  "day.3": ["Wednesday", "الأربعاء"],
  "day.4": ["Thursday", "الخميس"],
  "day.5": ["Friday", "الجمعة"],
  "day.6": ["Saturday", "السبت"],
} as const satisfies Record<string, readonly [string, string]>;

export type MessageKey = keyof typeof messages;
type Params = Record<string, string | number>;

/** Maps well-known API/transport errors to translated copy. */
const errorKeys: Record<string, MessageKey> = {
  network: "error.network",
  generic: "error.generic",
  session: "error.session",
  "Invalid access code": "login.invalid",
  "This record already exists": "error.duplicate",
  "Too many attempts. Please wait a few minutes and try again.": "error.rateLimit",
  "Too many requests. Please try again shortly.": "error.rateLimit",
  "This can't be changed in the demo.": "demo.locked",
};

interface Preferences {
  language: Language;
  theme: Theme;
  /** The workspace's default currency, used when an amount has no currency of its own. */
  currency: string;
  setCurrency: (currency: string) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: MessageKey, params?: Params) => string;
  /** Translates a key that may not exist (e.g. from the API), with a fallback. */
  tx: (key: string, fallback: string, params?: Params) => string;
  errorText: (message: string | null | undefined) => string;
  money: (value: number, currency?: string) => string;
  number: (value: number) => string;
  date: (value: string | Date, style?: "date" | "datetime" | "time" | "short" | "weekday" | "month" | "day" | "dayHeading") => string;
  relative: (value: string | Date) => string;
}

const PreferencesContext = createContext<Preferences | null>(null);

function interpolate(text: string, params?: Params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (params[name] !== undefined ? String(params[name]) : match));
}

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function applyToDocument(language: Language, theme: Theme) {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";
  root.dataset.theme = theme;
}

/**
 * Runs before hydration (inlined in <head>) so the first paint already has the
 * right theme and direction — no flash of the wrong one.
 */
export const preferencesBootScript = `(function(){try{var l=localStorage.getItem("falah_os_language")==="ar"?"ar":"en";var t=localStorage.getItem("falah_os_theme")==="light"?"light":"dark";var r=document.documentElement;r.lang=l;r.dir=l==="ar"?"rtl":"ltr";r.dataset.theme=t;}catch(e){}})();`;

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [currency, setCurrency] = useState("AED");

  useEffect(() => {
    const savedLanguage = read("falah_os_language", ["en", "ar"] as const, "en");
    const savedTheme = read("falah_os_theme", ["dark", "light"] as const, "dark");
    setLanguageState(savedLanguage);
    setThemeState(savedTheme);
    applyToDocument(savedLanguage, savedTheme);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    try { localStorage.setItem("falah_os_language", next); } catch { /* private mode */ }
    setLanguageState(next);
    applyToDocument(next, document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try { localStorage.setItem("falah_os_theme", next); } catch { /* private mode */ }
    setThemeState(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const value = useMemo<Preferences>(() => {
    const index = language === "ar" ? 1 : 0;
    const locale = language === "ar" ? "ar-AE" : "en-AE";
    const t = (key: MessageKey, params?: Params) => interpolate(messages[key][index], params);
    const tx = (key: string, fallback: string, params?: Params) =>
      key in messages ? t(key as MessageKey, params) : interpolate(fallback, params);

    const numberFormat = new Intl.NumberFormat(locale);
    const moneyFormats = new Map<string, Intl.NumberFormat>();
    // Whole amounts stay clean (AED 45); anything with fils/cents shows both digits (AED 18.50).
    const money = (amount: number, code = currency) => {
      const digits = Number.isInteger(Math.round(amount * 100) / 100) ? 0 : 2;
      const key = `${code}:${digits}`;
      if (!moneyFormats.has(key)) {
        moneyFormats.set(key, new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: digits, minimumFractionDigits: digits }));
      }
      return moneyFormats.get(key)!.format(amount);
    };

    const dateOptions: Record<string, Intl.DateTimeFormatOptions> = {
      date: { dateStyle: "medium" },
      datetime: { dateStyle: "medium", timeStyle: "short" },
      time: { timeStyle: "short" },
      short: { day: "numeric", month: "short" },
      weekday: { weekday: "long", day: "numeric", month: "long" },
      dayHeading: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
      month: { month: "short" },
      day: { day: "numeric" },
    };
    const date = (input: string | Date, style: keyof typeof dateOptions = "datetime") =>
      new Intl.DateTimeFormat(locale, dateOptions[style]).format(new Date(input));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const relative = (input: string | Date) => {
      const seconds = (new Date(input).getTime() - Date.now()) / 1000;
      const abs = Math.abs(seconds);
      if (abs < 60) return rtf.format(Math.round(seconds), "second");
      if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
      if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
      if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), "day");
      return date(input, "date");
    };

    const errorText = (message: string | null | undefined) => {
      if (!message) return t("error.generic");
      const key = errorKeys[message];
      return key ? t(key) : message;
    };

    return { language, theme, currency, setCurrency, setLanguage, setTheme, t, tx, errorText, money, number: (n) => numberFormat.format(n), date, relative };
  }, [language, theme, currency, setLanguage, setTheme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
