export interface QuranVerseTransition {
  levelFrom: number;
  levelTo: number;
  verseText: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  reflectionAr: string;
}

export type ReciterId = 'alafasy' | 'husary';

export interface ReciterInfo {
  id: ReciterId;
  nameAr: string;
  titleAr: string;
}

export const RECITERS: Record<ReciterId, ReciterInfo> = {
  alafasy: {
    id: 'alafasy',
    nameAr: 'الشيخ مشاري راشد العفاسي',
    titleAr: 'تلاوة ندية خاشعة ومحبوبة للأطفال',
  },
  husary: {
    id: 'husary',
    nameAr: 'الشيخ محمود خليل الحصري',
    titleAr: 'المصحف المعلم (مخارج حروف واضحة جداً)',
  },
};

export const QURAN_VERSES_BETWEEN_LEVELS: QuranVerseTransition[] = [
  {
    levelFrom: 1,
    levelTo: 2,
    verseText: '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾',
    surahName: 'سورة طه',
    surahNumber: 20,
    ayahNumber: 114,
    reflectionAr: 'الله سبحانه يعلمنا أن ندعوه دائماً ليزيدنا علماً وفهماً ونوراً يا بطلة حور!',
  },
  {
    levelFrom: 2,
    levelTo: 3,
    verseText: '﴿ وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ ﴾',
    surahName: 'سورة التوبة',
    surahNumber: 9,
    ayahNumber: 105,
    reflectionAr: 'العمل الصالح والاجتهاد في التعلم يحبه الله ورسوله، وأنتِ مجتهدة ورائعة!',
  },
  {
    levelFrom: 3,
    levelTo: 4,
    verseText: '﴿ فَاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ ﴾',
    surahName: 'سورة يوسف',
    surahNumber: 12,
    ayahNumber: 64,
    reflectionAr: 'الله الحفيظ يحفظ حور وأهلها وقطتها اللطيفة في كل خطوة.',
  },
  {
    levelFrom: 4,
    levelTo: 5,
    verseText: '﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾',
    surahName: 'سورة الشرح',
    surahNumber: 94,
    ayahNumber: 5,
    reflectionAr: 'كل مسألة صعبة تصبح سهلة جداً بالصبر والمحاولة والمرح!',
  },
  {
    levelFrom: 5,
    levelTo: 6,
    verseText: '﴿ وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾',
    surahName: 'سورة البقرة',
    surahNumber: 2,
    ayahNumber: 195,
    reflectionAr: 'الإحسان إلى الحيوانات مثل قطة حور واللطف مع الجميع يدخلنا الجنة.',
  },
  {
    levelFrom: 6,
    levelTo: 7,
    verseText: '﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    surahName: 'سورة الفاتحة',
    surahNumber: 1,
    ayahNumber: 2,
    reflectionAr: 'نشكر الله ونحمده دائماً على نعمة العقل والذكاء والصحة الجميلة.',
  },
  {
    levelFrom: 7,
    levelTo: 8,
    verseText: '﴿ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا ﴾',
    surahName: 'سورة الإسراء',
    surahNumber: 17,
    ayahNumber: 24,
    reflectionAr: 'ندعو لبابا وماما الحبيبين بالرحمة والسعادة لأنهما يحبّان حور كثيراً.',
  },
  {
    levelFrom: 8,
    levelTo: 9,
    verseText: '﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾',
    surahName: 'سورة المائدة',
    surahNumber: 5,
    ayahNumber: 2,
    reflectionAr: 'التعاون ومساعدة الآخرين يجعلنا أقوياء ومحبوبين عند الله.',
  },
  {
    levelFrom: 9,
    levelTo: 10,
    verseText: '﴿ هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ ﴾',
    surahName: 'سورة الرحمن',
    surahNumber: 55,
    ayahNumber: 60,
    reflectionAr: 'من يعمل خيراً يجازيه الله خيراً أعظم وفرحاً كبيراً.',
  },
  {
    levelFrom: 10,
    levelTo: 11,
    verseText: '﴿ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا ﴾',
    surahName: 'سورة النساء',
    surahNumber: 4,
    ayahNumber: 113,
    reflectionAr: 'فضل الله علينا واسع وكبير في كل نعمة نراها ونعيشها.',
  },
  {
    levelFrom: 11,
    levelTo: 12,
    verseText: '﴿ فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ ﴾',
    surahName: 'سورة البقرة',
    surahNumber: 2,
    ayahNumber: 152,
    reflectionAr: 'نذكر الله بقلبنا ولساننا: سبحان الله، والحمد لله، ولا إله إلا الله.',
  },
  {
    levelFrom: 12,
    levelTo: 13,
    verseText: '﴿ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ﴾',
    surahName: 'سورة البقرة',
    surahNumber: 2,
    ayahNumber: 153,
    reflectionAr: 'الصبر سر النجاح في كل لعبة وفي كل درس جديد نتعلمه.',
  },
  {
    levelFrom: 13,
    levelTo: 14,
    verseText: '﴿ وَقُولُوا لِلنَّاسِ حُسْنًا ﴾',
    surahName: 'سورة البقرة',
    surahNumber: 2,
    ayahNumber: 83,
    reflectionAr: 'الكلمة الطيبة والابتسامة الحلوة صدقة جميلة يحبها الله.',
  },
  {
    levelFrom: 14,
    levelTo: 15,
    verseText: '﴿ وَاللَّهُ يُحِبُّ الصَّابِرِينَ ﴾',
    surahName: 'سورة آل عمران',
    surahNumber: 3,
    ayahNumber: 146,
    reflectionAr: 'حب الله هو الفوز الأكبر، والصابرون يدخلون الجنة بغير حساب.',
  },
  {
    levelFrom: 15,
    levelTo: 16,
    verseText: '﴿ سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا ﴾',
    surahName: 'سورة الطلاق',
    surahNumber: 65,
    ayahNumber: 7,
    reflectionAr: 'اليسر والفرج قريبان دائماً لكل من يتوكل على ربه الرحيم.',
  },
  {
    levelFrom: 16,
    levelTo: 17,
    verseText: '﴿ وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ ﴾',
    surahName: 'سورة النجم',
    surahNumber: 53,
    ayahNumber: 39,
    reflectionAr: 'سعيكِ وتعبكِ في حل المسائل يا حور يجعلكِ متفوقة وبطلة حقيقية!',
  },
  {
    levelFrom: 17,
    levelTo: 18,
    verseText: '﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾',
    surahName: 'سورة الطلاق',
    surahNumber: 65,
    ayahNumber: 3,
    reflectionAr: 'نقول دائماً: توكلت على الله، ولا حول ولا قوة إلا بالله العلي العظيم.',
  },
  {
    levelFrom: 18,
    levelTo: 19,
    verseText: '﴿ إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ ﴾',
    surahName: 'سورة الأعراف',
    surahNumber: 7,
    ayahNumber: 56,
    reflectionAr: 'رحمة الله تحيط بالبطلة حور وعائلتها وكل من يحسن ويفعل الخير.',
  },
  {
    levelFrom: 19,
    levelTo: 20,
    verseText: '﴿ وَآخِرُ دَعْوَاهُمْ أَنِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾',
    surahName: 'سورة يونس',
    surahNumber: 10,
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
    surahNumber: 20,
    ayahNumber: 114,
    reflectionAr: 'الله يعلمنا أن نطلب العلم دائماً ونفرح بالتعلم يا بطلة حور!',
  };
}

/**
 * Returns authentic, high-quality audio recitation URLs for famous reciters (EveryAyah CDN + Quran.com)
 */
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciter: ReciterId = 'alafasy'): string[] {
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  const code = `${s}${a}`;

  if (reciter === 'husary') {
    return [
      `https://everyayah.com/data/Husary_Muallim_128kbps/${code}.mp3`,
      `https://everyayah.com/data/Husary_128kbps/${code}.mp3`,
      `https://verses.quran.com/Husary/mp3/${code}.mp3`,
    ];
  }

  // Default: Sheikh Mishary Rashid Alafasy
  return [
    `https://everyayah.com/data/Alafasy_128kbps/${code}.mp3`,
    `https://verses.quran.com/Alafasy/mp3/${code}.mp3`,
    `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${code}.mp3`,
  ];
}
