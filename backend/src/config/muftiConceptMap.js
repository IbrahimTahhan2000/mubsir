/**
 * Ported verbatim from the original Django app:
 * asl_project/recognition/templates/recognition/mufti.html (inline JS conceptMap)
 *
 * This is the current MUBSIR prototype's answer -> visual gesture mapping.
 * It is explicitly a prototype (see docs/migration-notes.md and the
 * `prototype: true` flag returned by /api/mufti/visualize) — a real
 * sign-language generation system is expected to replace this later without
 * requiring a frontend rewrite, since the response shape stays the same.
 */
export const MUFTI_CONCEPT_MAP = [
  { label: "نعم", keywords: ["نعم"], icon: "👍" },
  { label: "يجوز", keywords: ["يجوز", "جائز"], icon: "👌" },
  { label: "الحاج", keywords: ["الحاج", "حاج"], icon: "🤲" },
  { label: "جمع", keywords: ["جمع", "الجمع"], icon: "🤝" },
  { label: "الصلاة", keywords: ["صلاة", "الصلاة", "صلاتي"], icon: "🤲" },
  { label: "الظهر", keywords: ["الظهر", "ظهر"], icon: "☝️" },
  { label: "العصر", keywords: ["العصر", "عصر"], icon: "✋" },
  { label: "عرفة", keywords: ["عرفة"], icon: "🖐️" },
  { label: "التحلل الأصغر", keywords: ["التحلل الأصغر"], icon: "🤏" },
  { label: "محظورات الإحرام", keywords: ["محظورات الإحرام", "محظورات"], icon: "✋" },
  { label: "الحلق", keywords: ["الحلق"], icon: "🫳" },
  { label: "التقصير", keywords: ["التقصير"], icon: "🤏" },
  { label: "التحلل الأكبر", keywords: ["التحلل الأكبر"], icon: "👐" },
  { label: "استكمال الأعمال", keywords: ["استكمال الأعمال", "استكمال"], icon: "🤲" },
  { label: "أركان", keywords: ["أركان"], icon: "☝️" },
  { label: "العمرة", keywords: ["العمرة"], icon: "🤲" },
  { label: "الإحرام", keywords: ["الإحرام"], icon: "✋" },
  { label: "الطواف", keywords: ["الطواف"], icon: "👋" },
  { label: "السعي", keywords: ["السعي"], icon: "🫱" },
  { label: "الصفا", keywords: ["الصفا"], icon: "🖐️" },
  { label: "المروة", keywords: ["المروة"], icon: "🫲" },
];
