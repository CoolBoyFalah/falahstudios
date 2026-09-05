"use client";

import { useEffect } from "react";

const arabic: Record<string, string> = {
  "Your business, simplified.": "أعمالك، ببساطة.", "Access code": "رمز الدخول", "Continue": "متابعة", "Connecting...": "جارٍ الاتصال...", "Enter your access code.": "أدخل رمز الدخول.", "Invalid access code.": "رمز الدخول غير صحيح.", "Something went wrong.": "حدث خطأ ما.", "Don’t have an access code?": "ليس لديك رمز دخول؟", "Contact Falah Studios": "تواصل مع استوديوهات فلاح",
  "Overview": "نظرة عامة", "Website": "الموقع الإلكتروني", "Orders": "الطلبات", "Customers": "العملاء", "Bookings": "الحجوزات", "Analytics": "التحليلات", "Notifications": "الإشعارات", "Settings": "الإعدادات", "Workspace": "مساحة العمل", "Falah Studios": "استوديوهات فلاح", "Dark": "داكن", "Light": "فاتح", "Switch language": "تغيير اللغة", "Use dark theme": "استخدام المظهر الداكن", "Use light theme": "استخدام المظهر الفاتح",
  "Good morning,": "صباح الخير،", "Live workspace": "مساحة عمل مباشرة", "Everything important in your business, in one calm and clear place.": "كل ما يهم في أعمالك، في مكان واحد هادئ وواضح.", "Create order": "إنشاء طلب", "Manage website": "إدارة الموقع", "Revenue": "الإيرادات", "Completed orders": "الطلبات المكتملة", "Today": "اليوم", "Total": "الإجمالي", "Latest activity": "أحدث النشاطات", "Recent": "الأحدث", "Orders across your workspace.": "الطلبات في مساحة عملك.", "View orders": "عرض الطلبات", "No activity yet.": "لا يوجد نشاط حتى الآن.", "Your new orders will appear here.": "ستظهر طلباتك الجديدة هنا.", "Your business, understood.": "أعمالك، مفهومة بوضوح.", "Get a private, instant summary based on the activity in your workspace.": "احصل على ملخص خاص وفوري بناءً على نشاط مساحة عملك.", "Ask for an instant, private summary of your workspace.": "احصل على ملخص فوري وخاص لمساحة عملك.", "Ask Falah AI": "اسأل فلاح للذكاء الاصطناعي", "notifications": "إشعارات",
  "Commerce": "التجارة", "Customer name": "اسم العميل", "Item": "الصنف", "Price (AED)": "السعر (درهم)", "Creating...": "جارٍ الإنشاء...", "All orders": "كل الطلبات", "No orders yet.": "لا توجد طلبات حتى الآن.", "pending": "قيد الانتظار", "confirmed": "مؤكد", "completed": "مكتمل", "cancelled": "ملغي", "Unable to create order.": "تعذر إنشاء الطلب.", "Unable to update order.": "تعذر تحديث الطلب.",
  "Relationships": "العلاقات", "Email (optional)": "البريد الإلكتروني (اختياري)", "Phone (optional)": "الهاتف (اختياري)", "Notes (optional)": "ملاحظات (اختياري)", "Add customer": "إضافة عميل", "No contact details": "لا توجد تفاصيل اتصال", "No customers yet.": "لا يوجد عملاء حتى الآن.", "Unable to add customer.": "تعذر إضافة العميل.", "orders": "طلبات",
  "Schedule": "الجدولة", "Service": "الخدمة", "Create booking": "إنشاء حجز", "No bookings yet.": "لا توجد حجوزات حتى الآن.", "Unable to create booking.": "تعذر إنشاء الحجز.", "Unable to update booking.": "تعذر تحديث الحجز.",
  "Performance": "الأداء", "A clear view of the activity captured in your workspace.": "عرض واضح للنشاط المسجل في مساحة عملك.", "Completed revenue": "إيرادات الطلبات المكتملة", "Orders today": "طلبات اليوم", "Bookings today": "حجوزات اليوم",
  "Business assistant": "مساعد الأعمال", "How is my business doing?": "كيف تسير أعمالي؟", "Get a private overview based only on your workspace’s orders, customers, and bookings.": "احصل على نظرة خاصة تستند فقط إلى طلبات ومساحة عملك وعملائك وحجوزاتك.", "Generate business insight": "إنشاء تحليل للأعمال", "Reviewing...": "جارٍ المراجعة...",
  "You’re all caught up.": "لا توجد إشعارات جديدة.", "Business profile": "ملف النشاط التجاري", "Business name": "اسم النشاط التجاري", "Client code:": "رمز العميل:", "Save settings": "حفظ الإعدادات", "Settings saved.": "تم حفظ الإعدادات.", "Sign out": "تسجيل الخروج",
  "Website Manager": "مدير الموقع الإلكتروني", "Save changes": "حفظ التغييرات", "Saving...": "جارٍ الحفظ...", "Manage your website": "إدارة موقعك الإلكتروني", "Update your business information without touching code.": "حدّث معلومات نشاطك التجاري من دون لمس الكود.", "Business information": "معلومات النشاط التجاري", "This information appears throughout your website.": "تظهر هذه المعلومات في جميع أنحاء موقعك الإلكتروني.", "Tagline": "الشعار التعريفي", "Description": "الوصف", "Loading website details...": "جارٍ تحميل تفاصيل الموقع...", "Changes saved.": "تم حفظ التغييرات.", "Website sections": "أقسام الموقع", "Manage the main sections of your website.": "إدارة الأقسام الرئيسية لموقعك الإلكتروني.", "Homepage": "الصفحة الرئيسية", "Hero, introduction and featured content": "القسم الرئيسي والمقدمة والمحتوى المميز", "About": "من نحن", "Your story and business information": "قصتك ومعلومات نشاطك التجاري", "Products": "المنتجات", "Products, services and pricing": "المنتجات والخدمات والأسعار", "Contact": "اتصل بنا", "Contact information and location": "معلومات الاتصال والموقع", "Edit": "تعديل", "Website status": "حالة الموقع", "Your website connection and publishing status.": "حالة اتصال موقعك ونشره.", "Website connected": "الموقع متصل", "Changes can be published from Falah OS.": "يمكن نشر التغييرات من فلاح OS.", "CONNECTED": "متصل", "Unable to load website details.": "تعذر تحميل تفاصيل الموقع.", "Unable to save changes.": "تعذر حفظ التغييرات.",
};

const originals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Record<string, string>>();

function translateText(text: string) {
  const orderNotice = text.match(/^A new order from (.+) was received\.$/);
  if (orderNotice) return `تم استلام طلب جديد من ${orderNotice[1]}.`;
  const bookingNotice = text.match(/^(.+) booked (.+)\.$/);
  if (bookingNotice) return `${bookingNotice[1]} قام بحجز ${bookingNotice[2]}.`;
  return arabic[text] || text.replace(/\b(pending|confirmed|completed|cancelled|notifications|orders)\b/g, (word) => arabic[word] || word);
}

function updateDocument(language: "en" | "ar") {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    if (node.parentElement?.closest("script, style")) continue;
    if (!originals.has(node)) originals.set(node, node.nodeValue || "");
    const nextValue = language === "ar" ? translateText(originals.get(node) || "") : originals.get(node) || "";
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
  }

  document.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]").forEach((element) => {
    const original = attributeOriginals.get(element) || {};
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      const value = element.getAttribute(attribute);
      if (value !== null && original[attribute] === undefined) original[attribute] = value;
      if (original[attribute] !== undefined) {
        const nextValue = language === "ar" ? translateText(original[attribute]) : original[attribute];
        if (element.getAttribute(attribute) !== nextValue) element.setAttribute(attribute, nextValue);
      }
    }
    attributeOriginals.set(element, original);
  });
}

export default function ArabicInterface() {
  useEffect(() => {
    const apply = () => updateDocument((localStorage.getItem("falah_os_language") as "en" | "ar") || "en");
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("falah-language-change", apply);
    apply();
    return () => { observer.disconnect(); window.removeEventListener("falah-language-change", apply); };
  }, []);
  return null;
}
