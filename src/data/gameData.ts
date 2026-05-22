// Edytuj treści tutaj — wszystko trzymane w jednym miejscu.

export type QuestType = "quiz" | "challenge" | "secret" | "final";

export interface Location {
  id: string;
  name: string;
  shortName: string;
  description: string;
  x: number; // % na mapie
  y: number; // % na mapie
  type: QuestType;
  locked: boolean;
  isSecret: boolean;
  pointsForSuccess: number;
  rewardText: string;
  penaltyText: string;
  // quiz
  question?: string;
  answers?: string[];
  correctAnswerIndex?: number;
  // challenge
  challengeText?: string;
  // secret
  secretText?: string;
  // final
  finalText?: string;
}

export interface Verdict {
  minPoints: number;
  title: string;
  subtitle: string;
}

export const GROOM_NAME = "Pan Młody";
export const GROOM_AVATAR_URL: string | null = null; // podmień na URL zdjęcia, jeśli chcesz

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
    id: "bar",
    name: "Bar Początkowy",
    shortName: "Bar",
    description: "Tam, gdzie wszystko się zaczęło.",
    x: 12,
    y: 70,
    type: "quiz",
    locked: false,
    isSecret: false,
    pointsForSuccess: 10,
    rewardText: "+10 MĄŻ POINTS",
    penaltyText: "PAN MŁODY PIJE",
    question: "Co pan młody powiedział po trzecim drinku?",
    answers: [
      "„Kocham was wszystkich!”",
      "„Jeszcze jeden i wracam.”",
      "„Ona jest tą jedyną.”",
      "„Gdzie jest mój telefon?”",
    ],
    correctAnswerIndex: 2,
  },
  {
    id: "flat",
    name: "Mieszkanie Legend",
    shortName: "Flat",
    description: "Stara kawalerka, nowe historie.",
    x: 30,
    y: 40,
    type: "challenge",
    locked: true,
    isSecret: false,
    pointsForSuccess: 15,
    rewardText: "+15 MĄŻ POINTS",
    penaltyText: "PAN MŁODY PIJE SHOTA",
    challengeText:
      "Zadzwoń do mamy i powiedz: „Mamo, jutro robię pranie.” bez śmiechu.",
  },
  {
    id: "przypal",
    name: "Strefa Przypału",
    shortName: "Przypał",
    description: "Tu się rodzą wszystkie złe pomysły.",
    x: 50,
    y: 65,
    type: "quiz",
    locked: true,
    isSecret: false,
    pointsForSuccess: 10,
    rewardText: "+10 MĄŻ POINTS",
    penaltyText: "WSZYSCY PIJĄ",
    question: "Jaki jest najbezpieczniejszy tekst po kłótni?",
    answers: [
      "„Masz rację, kochanie.”",
      "„Spokojnie, ogarnij się.”",
      "„Twoja matka tak mówiła.”",
      "„Wracam za godzinę.”",
    ],
    correctAnswerIndex: 0,
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
    isSecret: false,
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
    id: "kebab",
    name: "Tajemniczy Kebab",
    shortName: "???",
    description: "Coś tu pachnie sekretem.",
    x: 42,
    y: 18,
    type: "secret",
    locked: false,
    isSecret: true,
    pointsForSuccess: 25,
    rewardText: "SEKRET ODKRYTY! +25 PUNKTÓW",
    penaltyText: "",
    secretText:
      "Znalazłeś sekretny kebab życia. WSZYSCY PIJĄ za zdrowie pana młodego!",
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
    isSecret: false,
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
    isSecret: false,
    pointsForSuccess: 0,
    rewardText: "WERDYKT KOŃCOWY",
    penaltyText: "",
    finalText: "Czas na ostateczny werdykt!",
  },
];

// Kolejność odblokowywania (gracz musi przejść w tej kolejności, sekrety są zawsze dostępne).
export const UNLOCK_ORDER: string[] = [
  "bar",
  "flat",
  "przypal",
  "narzeczona",
  "urzad",
  "wesele",
];
