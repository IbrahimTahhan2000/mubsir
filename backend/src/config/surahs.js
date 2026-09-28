/**
 * Ported verbatim from the original Django app:
 * asl_project/recognition/views_al_fatiha.py and views_al_kawthar.py
 *
 * Each sequence is the exact ordered list of ASL.pt letter-class labels the
 * pilgrim must fingerspell, and the exact Arabic verse text it produces.
 * Do not invent or reorder these — they are the product's real content.
 */

const AL_FATIHA_SEQUENCES = [
  {
    sequence: [
      "al", "haa", "meem", "dal", "laam", "laam", "ha", "ra", "bb",
      "al", "ain", "aleff", "laam", "meem", "ya", "nun",
    ],
    phrase: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
    order: 0,
  },
  {
    sequence: ["al", "ra", "haa", "meem", "aleff", "al", "ra", "haa", "ya", "meem"],
    phrase: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
    order: 1,
  },
  {
    sequence: [
      "meem", "aleff", "laam", "kaaf", "ya", "waw", "meem",
      "al", "dal", "ya", "nun",
    ],
    phrase: "مَٰلِكِ يَوۡمِ ٱلدِّينِ",
    order: 2,
  },
  {
    sequence: [
      "aleff", "ya", "aleff", "kaaf", "nun", "ain", "bb", "dal", "waw",
      "aleff", "ya", "aleff", "kaaf", "nun", "seen", "ta", "ain", "ya", "nun",
    ],
    phrase: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ",
    order: 3,
  },
  {
    sequence: [
      "aleff", "ha", "dal", "nun", "aleff", "al", "saad", "ra", "aleff",
      "taa", "al", "meem", "seen", "ta", "gaaf", "ya", "meem",
    ],
    phrase: "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ",
    order: 4,
  },
  {
    sequence: [
      "saad", "ra", "aleff", "taa", "al", "thal", "ya", "nun",
      "aleff", "nun", "ain", "meem", "ta",
      "ain", "laam", "ya", "ha", "meem",
      "ghain", "ya", "ra",
      "al", "meem", "ghain", "dhad", "waw", "bb",
      "ain", "laam", "ya", "ha", "meem",
      "waw", "laam", "aleff",
      "al", "dhad", "aleff", "laam", "ya", "nun",
    ],
    phrase: "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ",
    order: 5,
  },
];

const AL_KAWTHAR_SEQUENCES = [
  {
    sequence: [
      "aleff", "nun", "aleff", "aleff", "ain", "taa", "ya", "nun",
      "aleff", "kaaf", "al", "kaaf", "waw", "thaa", "ra",
    ],
    phrase: "إِنَّآ أَعۡطَيۡنَٰكَ ٱلۡكَوۡثَرَ",
    order: 0,
  },
  {
    sequence: ["fa", "saad", "laam", "laam", "ra", "bb", "kaaf", "waw", "aleff", "nun", "haa", "ra"],
    phrase: "فَصَلِّ لِرَبِّكَ وَٱنۡحَرۡ",
    order: 1,
  },
  {
    sequence: [
      "aleff", "nun", "sheen", "aleff", "nun", "aleff", "kaaf", "ha",
      "waw", "al", "aleff", "bb", "ta", "ra",
    ],
    phrase: "إِنَّ شَانِئَكَ هُوَ ٱلۡأَبۡتَرُ",
    order: 2,
  },
];

export const SURAHS = {
  "al-fatiha": {
    id: "al-fatiha",
    title: "سورة الفاتحة",
    sequences: AL_FATIHA_SEQUENCES,
  },
  "al-kawthar": {
    id: "al-kawthar",
    title: "سورة الكوثر",
    sequences: AL_KAWTHAR_SEQUENCES,
  },
};

export const SURAH_IDS = Object.keys(SURAHS);

// Original Django surah views used no debounce at all (a single frame above
// 0.80 confidence instantly advanced the sequence index). Phase 14 of the
// migration plan explicitly permits adding a light, documented stability
// improvement here as long as it doesn't change the model or the final
// sequence outcome — only how many consistent frames are required before a
// letter counts. Kept intentionally small (2) so fingerspelling still feels
// responsive, unlike the pilgrim path's slower 4-frame/cooldown gate, which
// exists for a different purpose (debouncing a *trigger*, not a fast
// letter-by-letter spelling flow).
export const SURAH_MIN_CONFIDENCE = 0.8;
export const SURAH_STABLE_FRAMES = 2;
