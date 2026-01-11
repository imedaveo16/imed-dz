import { EmergencyType } from './types';

export type Language = 'ar' | 'fr';

export const translations = {
  ar: {
    // Header
    republic: "الجمهورية الجزائرية الديمقراطية الشعبية",
    ministry: "وزارة الداخليـــة و الجماعـــات المحليـــة و النقــــــل",
    directorate: "المديرية العامة للحماية المدنية",
    appName: "Najda DZ",
    appSubtitle: "خدمة التبليغ عن الطوارئ",
    
    // Emergency Types (Labels displayed to user)
    [EmergencyType.FIRE]: { label: "حريق", subLabel: "حرائق الغابات، المنازل..." },
    [EmergencyType.ACCIDENT]: { label: "حادث مرور", subLabel: "تصادم، انقلاب، دهس..." },
    [EmergencyType.MEDICAL]: { label: "إسعاف طبي", subLabel: "مرض مفاجئ، إصابات..." },
    [EmergencyType.RESCUE]: { label: "إنقاذ", subLabel: "غرق، سقوط، انهيار..." },
    
    // Form Headings
    typeTitle: "نوع الحالة",
    locationTitle: "الموقع",
    phoneTitle: "رقم هاتف المُبلغ",
    descTitle: "وصف الحالة",
    mediaTitle: "مرفقات",
    optional: "(اختياري)",
    
    // Inputs & Placeholders
    phonePlaceholder: "0550 00 00 00",
    phoneHelp: "نحتاج رقمك للاتصال بك وتأكيد الحالة قبل إرسال الوحدات",
    descPlaceholder: "أضف تفاصيل أخرى تساعدنا (مثلاً: عدد المصابين، طابق البناية، علامات مميزة للمكان...)",
    
    // Validation Errors
    errPhone: "يرجى إدخال رقم هاتف جزائري صحيح",
    errType: "يرجى اختيار نوع الحالة",
    errLocation: "يرجى تحديد الموقع على الخريطة",
    
    // Map Picker
    mapInstruction: "اضغط على الخريطة لتحديد الموقع بدقة",
    useCurrentLoc: "استخدام موقعي الحالي (GPS)",
    useDefaultLoc: "استخدام موقع افتراضي (الجزائر)",
    manualSel: "تحديد يدوي على الخريطة",
    gpsFailed: "تعذر تحديد الموقع تلقائياً. يرجى التحديد يدوياً.",
    locLocated: "تم تحديد الموقع",
    updateLoc: "تحديث الموقع (GPS)",
    mapError: "تعذر تحميل الخريطة",
    mapErrorDesc: "لا يدعم جهازك عرض الخريطة، لكن يمكنك إرسال موقعك الحالي.",
    
    // Media
    audioLabel: "رسالة صوتية",
    audioRec: "تسجيل...",
    audioInstruction: "اضغط الميكروفون لتسجيل وصف للحالة",
    audioPlay: "تسجيل صوتي",
    photosLabel: "صور من الموقع",
    camera: "تصوير",
    gallery: "ألبوم",
    
    // Actions
    submit: "إرسال البلاغ",
    submitAnother: "تقديم بلاغ آخر",
    
    // Success
    successTitle: "تم استلام البلاغ!",
    successMsg: "تم إرسال بلاغك بنجاح، المساعدة في الطريق.",
    successCall: "سيتم الاتصال بك على الرقم",
    successConfirm: "لتأكيد التفاصيل.",
    
    // Errors
    unknownError: "حدث خطأ غير معروف.",
    dbError: "نوع الحالة المختار غير مقبول في النظام.",
    submitError: "عذراً، حدث خطأ أثناء إرسال البلاغ.",
    
    // Footer
    footerRights: "المديرية العامة للحماية المدنية © 2026"
  },
  fr: {
    // Header
    republic: "République Algérienne Démocratique et Populaire",
    ministry: "Ministère de l'Intérieur, des Collectivités Locales et de l'Aménagement du Territoire",
    directorate: "Direction Générale de la Protection Civile",
    appName: "Najda DZ",
    appSubtitle: "Service de signalement d'urgence",
    
    // Emergency Types
    [EmergencyType.FIRE]: { label: "Incendie", subLabel: "Feux de forêt, maisons..." },
    [EmergencyType.ACCIDENT]: { label: "Accident", subLabel: "Collision, dérapage..." },
    [EmergencyType.MEDICAL]: { label: "Urgence Médicale", subLabel: "Maladie soudaine, blessures..." },
    [EmergencyType.RESCUE]: { label: "Sauvetage", subLabel: "Noyade, chute, effondrement..." },
    
    // Form Headings
    typeTitle: "Type d'urgence",
    locationTitle: "Localisation",
    phoneTitle: "Numéro de téléphone",
    descTitle: "Description",
    mediaTitle: "Pièces jointes",
    optional: "(Optionnel)",
    
    // Inputs & Placeholders
    phonePlaceholder: "0550 00 00 00",
    phoneHelp: "Nous avons besoin de votre numéro pour confirmer l'urgence.",
    descPlaceholder: "Ajoutez des détails (ex: nombre de victimes, étage, repères...)",
    
    // Validation Errors
    errPhone: "Veuillez entrer un numéro algérien valide",
    errType: "Veuillez sélectionner le type d'urgence",
    errLocation: "Veuillez indiquer le lieu sur la carte",
    
    // Map Picker
    mapInstruction: "Appuyez sur la carte pour préciser le lieu",
    useCurrentLoc: "Ma position actuelle (GPS)",
    useDefaultLoc: "Position par défaut (Alger)",
    manualSel: "Sélection manuelle",
    gpsFailed: "Échec de la géolocalisation. Veuillez sélectionner manuellement.",
    locLocated: "Position définie",
    updateLoc: "Mettre à jour (GPS)",
    mapError: "Erreur de chargement de la carte",
    mapErrorDesc: "Votre appareil ne supporte pas la carte, mais vous pouvez envoyer votre position.",
    
    // Media
    audioLabel: "Message vocal",
    audioRec: "Enregistrement...",
    audioInstruction: "Appuyez pour enregistrer une description",
    audioPlay: "Note vocale",
    photosLabel: "Photos du lieu",
    camera: "Caméra",
    gallery: "Galerie",
    
    // Actions
    submit: "Envoyer le signalement",
    submitAnother: "Nouveau signalement",
    
    // Success
    successTitle: "Signalement reçu !",
    successMsg: "Votre rapport a été envoyé avec succès. Les secours sont en route.",
    successCall: "Nous vous appellerons au",
    successConfirm: "pour confirmer les détails.",
    
    // Errors
    unknownError: "Une erreur inconnue est survenue.",
    dbError: "Le type d'urgence sélectionné n'est pas valide.",
    submitError: "Désolé, une erreur est survenue lors de l'envoi.",
    
    // Footer
    footerRights: "Direction Générale de la Protection Civile © 2026"
  }
};