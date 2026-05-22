// Edytuj treści tutaj — wszystko trzymane w jednym miejscu.

export type QuestType = "quiz" | "challenge" | "risk" | "final";

export interface PostQuestSecretUnderBar {
  enabled: boolean;
  requiredShots: number;
  imageUrl: string;
  title: string;
  offerTitle: string;
  enterText: string;
  revealTitle: string;
  revealText: string;
  revealSubtext?: string;
}

export interface Location {
  id: string;
  name: string;
  shortName: string;
  description: string;
  x: number; // % na mapie
  y: number; // % na mapie
  type: QuestType;
  locked: boolean;
  /** Opcjonalna ikona na mapie (emoji). Bez tego — ikona z type. */
  icon?: string;
  pointsForSuccess: number;
  rewardText: string;
  penaltyText: string;
  // quiz / risk
  question?: string;
  answers?: string[];
  correctAnswerIndex?: number;
  // challenge
  challengeText?: string;
  // risk
  timeLimitSeconds?: number;
  introText?: string;
  penaltyShots?: number;
  teamShotOnSuccess?: boolean;
  // final
  finalText?: string;
  /** Opcjonalna pułapka po ukończeniu questu (np. MAŁE PIWKO). */
  postQuestSecretUnderBar?: PostQuestSecretUnderBar;
}

export interface Verdict {
  minPoints: number;
  title: string;
  subtitle: string;
}

export const GROOM_NAME = "Pan Młody";
export const GROOM_AVATAR_URL: string | null = null;

export const VERDICTS: Verdict[] = [
  {
    minPoints: 0,
    title: "Jeszcze kawaler mentalnie",
    subtitle: "Wymagana aktualizacja przed ślubem.",
  },
  {
    minPoints: 20,
    title: "Materiał na męża",
    subtitle: "Wersja beta, ale stabilna.",
  },
  {
    minPoints: 40,
    title: "Gotowy do ślubu",
    subtitle: "Certyfikowany Mąż Level Pro.",
  },
  {
    minPoints: 60,
    title: "Legenda małżeństwa",
    subtitle: "Proszę polać ekipie.",
  },
];

export const LOCATIONS: Location[] = [
  {
    id: "hans",
    name: "HANS",
    shortName: "Hans",
    description: "Test pamięci o człowieku-instytucji.",
    x: 12,
    y: 70,
    type: "quiz",
    locked: false,
    icon: "🎂",
    pointsForSuccess: 10,
    rewardText: "Szacunek dla Hansa zachowany. +10 Mąż Points!",
    penaltyText: "Zapomnieć urodzin Hansa? Shot.",
    question: "Kiedy Hans ma urodziny?",
    answers: ["8 maja", "29 lutego", "20 sierpnia", "20 kwietnia"],
    correctAnswerIndex: 0,
  },
  {
    id: "dom-strachu",
    name: "DOM STRACHU",
    shortName: "Strach",
    description:
      "Halloweenowy test pamięci. Tu nie ma miejsca na zgadywanie.",
    x: 30,
    y: 40,
    type: "quiz",
    locked: true,
    icon: "👻",
    pointsForSuccess: 10,
    rewardText: "Cruella rozpoznana. +10 Mąż Points!",
    penaltyText: "Zła odpowiedź. Dom Strachu żąda shota.",
    question: "Za kogo była przebrana Marta na Halloween 2024?",
    answers: [
      "Złodziej z Simsów",
      "Rzeźnik",
      "Cruella",
      "Za cwela",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "male-piwko",
    name: "MAŁE PIWKO",
    shortName: "MP",
    description:
      "Legendarna lokacja startowa. Test wiedzy z terenu Małego Piwka.",
    x: 50,
    y: 65,
    type: "quiz",
    locked: true,
    icon: "🍺",
    pointsForSuccess: 10,
    rewardText: "Dobra pamięć terenowa. +10 Mąż Points!",
    penaltyText: "Nie znasz ściany kapselków? Pan młody pije.",
    question: "Ile jest kapselków na ścianie przy kiblu w MP?",
    answers: ["1337", "420", "od chuja", "997"],
    correctAnswerIndex: 2,
    postQuestSecretUnderBar: {
      enabled: true,
      requiredShots: 2,
      imageUrl: "/assets/groom-drunk-trap.jpg",
      title: "SEKRET POD BAREM",
      offerTitle:
        "CHCESZ IŚĆ DALEJ CZY ZOBACZYĆ SEKRET POD BAREM?",
      enterText: "Żeby zajrzeć pod bar, musisz wypić 2 shoty.",
      revealTitle: "PUŁAPKA!",
      revealText: "NAJEBAŁEŚ SIĘ NA DARMO",
      revealSubtext: "Sekret pod barem okazał się audytem trzeźwości.",
    },
  },
  {
    id: "narzeczona",
    name: "Test Narzeczonej",
    shortName: "Test",
    description: "Egzamin z wiedzy o przyszłej żonie.",
    x: 68,
    y: 35,
    type: "quiz",
    locked: true,
    pointsForSuccess: 20,
    rewardText: "+20 MĄŻ POINTS",
    penaltyText: "PAN MŁODY PIJE PODWÓJNEGO",
    question: "Co trzeba zrobić, żeby zdobyć +10 Mąż Points u narzeczonej?",
    answers: [
      "Pozmywać bez proszenia.",
      "Kupić kwiaty „tak po prostu”.",
      "Słuchać do końca.",
      "Wszystkie powyższe.",
    ],
    correctAnswerIndex: 3,
  },
  {
    id: "risk-narzeczona",
    name: "High Risk: Test Narzeczonej",
    shortName: "HIGH RISK",
    description: "Wysokie ryzyko, wysoka nagroda.",
    x: 42,
    y: 18,
    type: "risk",
    locked: false,
    pointsForSuccess: 25,
    penaltyShots: 1,
    timeLimitSeconds: 10,
    teamShotOnSuccess: true,
    introText:
      "Masz 10 sekund. Dobra odpowiedź daje +25 Mąż Points. Zła odpowiedź albo brak odpowiedzi = shot.",
    question: "Narzeczona mówi: „Rób co chcesz”. Co robisz?",
    answers: [
      "Robię co chcę",
      "Pytam, co naprawdę ma na myśli",
      "Udaje, że nie słyszałem",
      "Zamawiam kebaba",
    ],
    correctAnswerIndex: 1,
    rewardText: "Instynkt męża aktywowany. +25 Mąż Points!",
    penaltyText: "Błąd krytyczny. Pan młody pije.",
  },
  {
    id: "urzad",
    name: "Urząd Męża",
    shortName: "Urząd",
    description: "Tu się składa podpis pod resztą życia.",
    x: 80,
    y: 60,
    type: "challenge",
    locked: true,
    pointsForSuccess: 20,
    rewardText: "+20 MĄŻ POINTS",
    penaltyText: "PAN MŁODY PIJE SHOTA",
    challengeText:
      "Wygłoś 30-sekundową przysięgę miłości do kanapy. Z uczuciem.",
  },
  {
    id: "wesele",
    name: "Sala Weselna",
    shortName: "Finał",
    description: "Tu zapada werdykt.",
    x: 90,
    y: 25,
    type: "final",
    locked: true,
    pointsForSuccess: 0,
    rewardText: "WERDYKT KOŃCOWY",
    penaltyText: "",
    finalText: "Czas na ostateczny werdykt!",
  },
];

// Kolejność odblokowywania (gracz musi przejść w tej kolejności; risk-questy są zawsze dostępne).
export const UNLOCK_ORDER: string[] = [
  "hans",
  "dom-strachu",
  "male-piwko",
  "narzeczona",
  "urzad",
  "wesele",
];

export const MALE_PIWKO_ID = "male-piwko";

export function getSecretUnderBarConfig(
  loc: Location | null | undefined,
): PostQuestSecretUnderBar | null {
  const cfg = loc?.postQuestSecretUnderBar;
  return cfg?.enabled ? cfg : null;
}
