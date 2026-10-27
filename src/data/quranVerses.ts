export interface QuranVerseTransition {
  levelFrom: number;
  levelTo: number;
  verseText: string;
  surahName: string;
  ayahNumber: number;
  reflectionAr: string;
}

export const QURAN_VERSES_BETWEEN_LEVELS: QuranVerseTransition[] = [
  {
    levelFrom: 1,
    levelTo: 2,
    verseText: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',
    surahName: 'سورة طه',
    ayahNumber: 114,
    reflectionAr: 'الله سبحانه يعلمنا أن ندعوه دائماً ليزيدنا علماً وفهماً ونوراً يا بطلة حور!',
  },
  {
    levelFrom: 2,
    levelTo: 3,
    verseText: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ ﴾',
    surahName: 'سورة التوبة',
    ayahNumber: 105,
    reflectionAr: 'العمل الصالح والاجتهاد في التعلم يحبه الله ورسوله، وأنتِ مجتهدة ورائعة!',
  },
  {
    levelFrom: 3,
    levelTo: 4,
    verseText: '﴿ فَاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ ﴾',
    surahName: 'سورة يوسف',
    ayahNumber: 64,
    reflectionAr: 'الله الحفيظ يحفظ حور وأهلها وقطتها اللطيفة في كل خطوة.',
  },
  {
    levelFrom: 4,
    levelTo: 5,
    verseText: '﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾',
    surahName: 'سورة الشرح',
    ayahNumber: 5,
    reflectionAr: 'كل مسألة صعبة تصبح سهلة جداً بالصبر والمحاولة والمرح!',
  },
  {
    levelFrom: 5,
    levelTo: 6,
    verseText: '﴿ وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾',
    surahName: 'سورة البقرة',
    ayahNumber: 195,
    reflectionAr: 'الإحسان إلى الحيوانات مثل قطة حور واللطف مع الجميع يدخلنا الجنة.',
  },
  {
    levelFrom: 6,
    levelTo: 7,
    verseText: '﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    surahName: 'سورة الفاتحة',
    ayahNumber: 2,
    reflectionAr: 'نشكر الله ونحمده دائماً على نعمة العقل والذكاء والصحة الجميلة.',
  },
  {
    levelFrom: 7,
    levelTo: 8,
    verseText: '﴿ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا ﴾',
    surahName: 'سورة الإسراء',
    ayahNumber: 24,
    reflectionAr: 'ندعو لبابا وماما الحبيبين بالرحمة والسعادة لأنهما يحبّان حور كثيراً.',
  },
  {
    levelFrom: 8,
    levelTo: 9,
    verseText: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾',
    surahName: 'سورة المائدة',
    ayahNumber: 2,
    reflectionAr: 'التعاون ومساعدة الآخرين يجعلنا أقوياء ومحبوبين عند الله.',
  },
  {
    levelFrom: 9,
    levelTo: 10,
    verseText: '﴿ هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ ﴾',
    surahName: 'سورة الرحمن',
    ayahNumber: 60,
    reflectionAr: 'من يعمل خيراً يجازيه الله خيراً أعظم وفرحاً كبيراً.',
  },
  {
    levelFrom: 10,
    levelTo: 11,
    verseText: '﴿ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا ﴾',
    surahName: 'سورة النساء',
    ayahNumber: 113,
    reflectionAr: 'فضل الله علينا واسع وكبير في كل نعمة نراها ونعيشها.',
  },
  {
    levelFrom: 11,
    levelTo: 12,
    verseText: '﴿ فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ ﴾',
    surahName: 'سورة البقرة',
    ayahNumber: 152,
    reflectionAr: 'نذكر الله بقلبنا ولساننا: سبحان الله، والحمد لله، ولا إله إلا الله.',
  },
  {
    levelFrom: 12,
    levelTo: 13,
    verseText: '﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾',
    surahName: 'سورة البقرة',
    ayahNumber: 153,
    reflectionAr: 'الصبر سر النجاح في كل لعبة وفي كل درس جديد نتعلمه.',
  },
  {
    levelFrom: 13,
    levelTo: 14,
    verseText: '﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾',
    surahName: 'سورة البقرة',
    ayahNumber: 83,
    reflectionAr: 'الكلمة الطيبة والابتسامة الحلوة صدقة جميلة يحبها الله.',
  },
  {
    levelFrom: 14,
    levelTo: 15,
    verseText: '﴿ وَاللَّهُ يُحِبُّ الصَّابِرِينَ ﴾',
    surahName: 'سورة آل عمران',
    ayahNumber: 146,
    reflectionAr: 'حب الله هو الفوز الأكبر، والصابرون يدخلون الجنة بغير حساب.',
  },
  {
    levelFrom: 15,
    levelTo: 16,
    verseText: '﴿ سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا ﴾',
    surahName: 'سورة الطلاق',
    ayahNumber: 7,
    reflectionAr: 'اليسر والفرج قريبان دائماً لكل من يتوكل على ربه الرحيم.',
  },
  {
    levelFrom: 16,
    levelTo: 17,
    verseText: '﴿ وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ﴾',
    surahName: 'سورة النجم',
    ayahNumber: 39,
    reflectionAr: 'سعيكِ وتعبكِ في حل المسائل يا حور يجعلكِ متفوقة وبطلة حقيقية!',
  },
  {
    levelFrom: 17,
    levelTo: 18,
    verseText: '﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾',
    surahName: 'سورة الطلاق',
    ayahNumber: 3,
    reflectionAr: 'نقول دائماً: توكلت على الله، ولا حول ولا قوة إلا بالله العلي العظيم.',
  },
  {
    levelFrom: 18,
    levelTo: 19,
    verseText: '﴿ إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ ﴾',
    surahName: 'سورة الأعراف',
    ayahNumber: 56,
    reflectionAr: 'رحمة الله تحيط بالبطلة حور وعائلتها وكل من يحسن ويفعل الخير.',
  },
  {
    levelFrom: 19,
    levelTo: 20,
    verseText: '﴿ وَآخِرُ دَعْوَاهُمْ أَنِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    surahName: 'سورة يونس',
    ayahNumber: 10,
    reflectionAr: 'نصل إلى المرحلة الأخيرة الـ ٢٠ بقلب مليء بالحمد والشكر لله رب العالمين!',
  },
];

export function getVerseBetweenLevels(fromLevel: number, toLevel: number): QuranVerseTransition {
  const match = QURAN_VERSES_BETWEEN_LEVELS.find(
    (v) => v.levelFrom === fromLevel && v.levelTo === toLevel
  );
  if (match) return match;
  // Default fallback verse
  return {
    levelFrom: fromLevel,
    levelTo: toLevel,
    verseText: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',
    surahName: 'سورة طه',
    ayahNumber: 114,
    reflectionAr: 'الله يعلمنا أن نطلب العلم دائماً ونفرح بالتعلم يا بطلة حور!',
  };
}
