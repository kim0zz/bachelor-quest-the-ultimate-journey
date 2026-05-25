// Edytuj treści tutaj — wszystko trzymane w jednym miejscu.

export type QuestType = "quiz" | "challenge" | "risk" | "final" | "minigame" | "start";
export type MinigameType = "shotPour";
export type PourResult = "success" | "under" | "over";

export interface BartenderDialogue {
  bartenderName: string;
  introLine: string;
  options: {
    label: string;
    outcomeLine: string;
    bonusPoints?: number;
  }[];
}

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
  icon?: string;
  pointsForSuccess: number;
  rewardText: string;
  penaltyText: string;
  question?: string;
  answers?: string[];
  correctAnswerIndex?: number;
  challengeText?: string;
  timeLimitSeconds?: number;
  introText?: string;
  penaltyShots?: number;
  teamShotOnSuccess?: boolean;
  finalText?: string;
  postQuestSecretUnderBar?: PostQuestSecretUnderBar;
  minigameType?: MinigameType;
  targetMin?: number;
  targetMax?: number;
  fillSpeed?: number;
  successTitle?: string;
  underTitle?: string;
  overTitle?: string;
  underPenaltyText?: string;
  overPenaltyText?: string;
  bartenderDialogue?: BartenderDialogue;
}

export function evaluatePourLevel(
  level: number,
  targetMin: number,
  targetMax: number,
): PourResult {
  if (level >= targetMin && level <= targetMax) return "success";
  if (level < targetMin) return "under";
  return "over";
}

export function isShotPourLocation(loc: Location): boolean {
  return loc.type === "minigame" && loc.minigameType === "shotPour";
}

export interface Verdict {
  minPoints: number;
  title: string;
  subtitle: string;
}

export const GROOM = {
  nickname: "Lama",
  genitive: "Lamy",
  accusative: "Lamę",
  dative: "Lamie",
  instrumental: "Lamą",
  avatarUrl: "/assets/groom-avatar.png",
} as const;

export const GROOM_NAME = GROOM.nickname;
export const GROOM_AVATAR_URL = GROOM.avatarUrl;

export const VERDICTS: Verdict[] = [
  {
    minPoints: 0,
    title: "Lama: jeszcze kawaler mentalnie",
    subtitle: "Lama wymaga aktualizacji przed ślubem.",
  },
  {
    minPoints: 20,
    title: "Lama: materiał na męża",
    subtitle: "Wersja beta, ale stabilna.",
  },
  {
    minPoints: 40,
    title: "Lama gotowy do ślubu",
    subtitle: "Certyfikowany Mąż Level Pro.",
  },
  {
    minPoints: 60,
    title: "Lama: legenda małżeństwa",
    subtitle: "Proszę polać ekipie.",
  },
];

export const BAR_IDS = ["hans", "male-piwko"] as const;

export const LOCATIONS: Location[] = [
  {
    id: "konopa",
    name: "KONOPA",
    shortName: "Start",
    description:
      "Lama budzi się na Konopie. Człowiek odpowiedzialny napiłby się wody i przemyślał życie. Lama ma na dziś inne plany.",
    x: 6,
    y: 60,
    type: "start",
    locked: false,
    icon: "🏠",
    pointsForSuccess: 0,
    rewardText: "",
    penaltyText: "",
  },
  {
    id: "hans",
    name: "HANS",
    shortName: "Hans",
    description:
      "Klasyczny punkt kontrolny. Kamil już wie, że to się źle skończy.",
    x: 22,
    y: 35,
    type: "quiz",
    locked: false,
    icon: "🎂",
    pointsForSuccess: 10,
    rewardText:
      "No proszę. Jednak coś zostało między jednym wyjściem 'na chwilę' a drugim. Hans docenia, ja jestem zaskoczony.",
    penaltyText:
      "Lama, ty tu masz więcej godzin niż część obsługi, a nie pamiętasz takich rzeczy? To już nie jest luka w pamięci, to styl życia.",
    question: "Kiedy Hans ma urodziny?",
    answers: ["8 maja", "29 lutego", "20 sierpnia", "20 kwietnia"],
    correctAnswerIndex: 0,
    bartenderDialogue: {
      bartenderName: "Kamil",
      introLine:
        "O proszę, Lama. Człowiek, który tyle razy mówił, że wychodzi tylko na jedno, że Hans powinien mieć to na paragonie jako stałą pozycję. Co dziś gramy?",
      options: [
        {
          label: "Dzisiaj spokojnie, Kamil.",
          outcomeLine:
            "Jasne. Ostatnio też było spokojnie, tylko krzesło pamięta to inaczej.",
        },
        {
          label: "Lej, bo ślub blisko.",
          outcomeLine:
            "No i to jest język odpowiedzialnego przyszłego męża. Tragiczny, ale szczery.",
          bonusPoints: 5,
        },
        {
          label: "Daj chwilę, muszę wejść w tryb Hansa.",
          outcomeLine:
            "Tryb Hansa? Lama, ty tu nie wchodzisz w tryb. Ty się tu logujesz automatycznie.",
        },
      ],
    },
  },
  {
    id: "male-piwko",
    name: "MAŁE PIWKO",
    shortName: "MP",
    description:
      "Świątynia kapselków, decyzji i powrotów bez pamięci.",
    x: 22,
    y: 80,
    type: "quiz",
    locked: false,
    icon: "🍺",
    pointsForSuccess: 10,
    rewardText:
      "Okej, szacun. Lama nie pamięta połowy powrotów do domu, ale ścianę przy kiblu ma zapisaną w sercu. To jest lokalny patriotyzm.",
    penaltyText:
      "Nie no, Lama. Tyle wizyt, tyle spojrzeń w ścianę kontemplacji, a ty nie wiesz? Za takie braki edukacyjne się pije.",
    question: "Ile jest kapselków na ścianie przy kiblu w MP?",
    answers: ["1337", "420", "od chuja", "997"],
    correctAnswerIndex: 2,
    bartenderDialogue: {
      bartenderName: "Kony",
      introLine:
        "No proszę, Lama w Małym Piwku. Człowiek, który nie wchodzi do baru — on się tu po prostu materializuje przy ladzie. Co robimy?",
      options: [
        {
          label: "Kony, ja znam to miejsce jak własną kieszeń.",
          outcomeLine:
            "To dobrze, bo kieszenie zwykle masz puste po wizycie tutaj. Sprawdzimy znajomość terenu.",
        },
        {
          label: "Najpierw piwko, potem pytania.",
          outcomeLine:
            "Klasyka Lamy: najpierw utrudnić sobie zadanie, potem udawać, że tak miało być.",
          bonusPoints: 5,
        },
        {
          label: "Tylko na chwilę.",
          outcomeLine:
            "To zdanie powinno być wyryte nad wejściem. Nikt nigdy nie wyszedł po chwili, zwłaszcza ty.",
        },
      ],
    },
  },
  {
    id: "pekin-bar",
    name: "PEKIN BAR",
    shortName: "PEKIN",
    description:
      "Legenda gastronomii. Opcja dla ludzi, którzy nie pogodzili się z rzeczywistością.",
    x: 34,
    y: 36,
    type: "start",
    locked: false,
    icon: "🥡",
    pointsForSuccess: 0,
    rewardText: "",
    penaltyText: "",
  },
  {
    id: "gofer-przy-latarni",
    name: "GOFER PRZY LATARNI",
    shortName: "GOFER",
    description:
      "Bezpieczna przystań po barach. Ada, cukier i klasyczne zamówienie Lamy.",
    x: 34,
    y: 58,
    type: "quiz",
    locked: true,
    icon: "🧇",
    pointsForSuccess: 10,
    rewardText: "No widzisz, pamiętasz. Klasyk Lamy zatwierdzony. +10 Mąż Points!",
    penaltyText:
      "Okej, spokojnie. Zdarza się. Ale klasyczne zamówienie trzeba będzie odświeżyć. Lama pije.",
    question: "Jaki smak lodów Lama zawsze bierze do gofra?",
    answers: ["Wanilia", "Słony karmel", "Sex on the bitch", "Pistacja"],
    correctAnswerIndex: 2,
    bartenderDialogue: {
      bartenderName: "Ada",
      introLine:
        "O, Lama! Dobrze cię widzieć. Jak się trzymasz? Wyglądasz, jakby dzień już zdążył trochę przyspieszyć.",
      options: [
        {
          label: "Ada, ratuj. Muszę coś zjeść.",
          outcomeLine:
            "Jasne, spokojnie. Zaraz coś ogarniemy. Najpierw oddychaj, potem będziemy podejmować decyzje.",
        },
        {
          label: "Jest dobrze, kontroluję sytuację.",
          outcomeLine:
            "To dobrze. Ale i tak dam ci coś słodkiego, bo czasem nawet bohaterowie potrzebują gofra.",
        },
        {
          label: "Pytasz ogólnie czy o dziewczyny?",
          outcomeLine:
            "O wszystko. Ale zacznijmy od gofra, bo na rozmowy o dziewczynach trzeba mieć energię.",
        },
      ],
    },
  },
  {
    id: "bitwy",
    name: "BITWY",
    shortName: "BITWY",
    description:
      "Melina, kuchnia, salon i decyzje, których nikt nie podpisuje nazwiskiem.",
    x: 48,
    y: 48,
    type: "challenge",
    locked: true,
    icon: "🏚️",
    pointsForSuccess: 10,
    rewardText: "Salon uznał nalanie. Lama jeszcze funkcjonuje. +10 Mąż Points.",
    penaltyText: "BITWY nie wybacza braku kontroli. Lama pije.",
    targetMin: 80,
    targetMax: 95,
    fillSpeed: 45,
    introText:
      "Na BITWY nie pytają, czy pijesz. Pytają, czy potrafisz nalać.",
    successTitle: "SZOT NALANY",
    underTitle: "NIEDOLANE!",
    overTitle: "PRZELANE!",
    underPenaltyText: "BITWY nie wybacza braku kontroli. Lama pije.",
    overPenaltyText: "BITWY nie wybacza braku kontroli. Lama pije.",
  },
  {
    id: "drewniak",
    name: "DREWNIAK",
    shortName: "DREWNIAK",
    description:
      "Kolejny etap wyprawy Lamy. Szczegóły dopiszemy później.",
    x: 58,
    y: 38,
    type: "quiz",
    locked: true,
    icon: "🪵",
    pointsForSuccess: 5,
    rewardText: "Jakoś poszło. +5 Mąż Points.",
    penaltyText: "Drewniak nie wybacza. Lama pije.",
    question: "DREWNIAK — placeholder. Co robimy?",
    answers: [
      "Idziemy dalej",
      "Udajemy, że był plan",
      "Szukamy szota",
      "Wszystkie powyższe",
    ],
    correctAnswerIndex: 3,
  },
  {
    id: "dzialka",
    name: "DZIAŁKA",
    shortName: "DZIAŁKA",
    description: "Etap działkowy. Jeszcze do rozpisania.",
    x: 68,
    y: 52,
    type: "quiz",
    locked: true,
    icon: "🌲",
    pointsForSuccess: 5,
    rewardText: "Działka zaliczona. +5 Mąż Points.",
    penaltyText: "Działka domaga się shota. Lama pije.",
    question: "DZIAŁKA — placeholder. Co dalej?",
    answers: [
      "Grill",
      "Ognisko",
      "Shot z flaszki",
      "Wszystko naraz",
    ],
    correctAnswerIndex: 3,
  },
  {
    id: "paryz",
    name: "PARYŻ",
    shortName: "PARYŻ",
    description: "Tu później wrzucimy High Risk.",
    x: 78,
    y: 36,
    type: "quiz",
    locked: true,
    icon: "🗼",
    pointsForSuccess: 5,
    rewardText: "Paryż podbity. +5 Mąż Points.",
    penaltyText: "Paryż rozczarowany. Lama pije.",
    question: "PARYŻ — placeholder. Jak się tu znaleźliśmy?",
    answers: [
      "Nikt nie wie",
      "Lama tak chciał",
      "GPS się zgubił",
      "Los zdecydował",
    ],
    correctAnswerIndex: 1,
  },
  {
    id: "risk-narzeczona",
    name: "High Risk: Test Narzeczonej",
    shortName: "HIGH RISK",
    description: "Wysokie ryzyko, wysoka nagroda.",
    x: 75,
    y: 14,
    type: "risk",
    locked: false,
    pointsForSuccess: 25,
    penaltyShots: 1,
    timeLimitSeconds: 10,
    teamShotOnSuccess: true,
    introText:
      "Masz 10 sekund. Dobra odpowiedź daje +25 Mąż Points. Zła odpowiedź albo brak odpowiedzi = shot.",
    question: 'Narzeczona mówi: „Rób co chcesz\u201D. Co robisz?',
    answers: [
      "Robię co chcę",
      "Pytam, co naprawdę ma na myśli",
      "Udaje, że nie słyszałem",
      "Zamawiam kebaba",
    ],
    correctAnswerIndex: 1,
    rewardText: "Instynkt męża aktywowany. +25 Mąż Points!",
    penaltyText: "Błąd krytyczny. Lama pije.",
  },
  {
    id: "dom-zgon",
    name: "DOM-ZGON",
    shortName: "ZGON",
    description: "Finałowa lokacja. Tu kończy się wyprawa.",
    x: 90,
    y: 30,
    type: "final",
    locked: true,
    icon: "💀",
    pointsForSuccess: 0,
    rewardText: "WERDYKT KOŃCOWY",
    penaltyText: "",
    finalText: "Czas na ostateczny werdykt!",
  },
];

/** Linear unlock order AFTER bar+food section is resolved. */
export const UNLOCK_ORDER: string[] = [
  "gofer-przy-latarni",
  "bitwy",
  "drewniak",
  "dzialka",
  "paryz",
  "dom-zgon",
];

/** Explicit map path connections for the fork layout. */
export const MAP_CONNECTIONS: [string, string][] = [
  ["konopa", "hans"],
  ["konopa", "male-piwko"],
  ["hans", "pekin-bar"],
  ["hans", "gofer-przy-latarni"],
  ["male-piwko", "pekin-bar"],
  ["male-piwko", "gofer-przy-latarni"],
  ["pekin-bar", "gofer-przy-latarni"],
  ["gofer-przy-latarni", "bitwy"],
  ["bitwy", "drewniak"],
  ["drewniak", "dzialka"],
  ["dzialka", "paryz"],
  ["dzialka", "risk-narzeczona"],
  ["paryz", "dom-zgon"],
];

export const MALE_PIWKO_ID = "male-piwko";

export const BALANCE_PERIOD_MS = 2500;
export const BALANCE_TARGET_MIN = 35;
export const BALANCE_TARGET_MAX = 65;
export const BALANCE_POINTS = 10;

export function getBalancePosition(startTime: number): number {
  const elapsed = Date.now() - startTime;
  const t = (elapsed % BALANCE_PERIOD_MS) / BALANCE_PERIOD_MS;
  return t < 0.5 ? t * 200 : 200 - t * 200;
}

export function getSecretUnderBarConfig(
  loc: Location | null | undefined,
): PostQuestSecretUnderBar | null {
  const cfg = loc?.postQuestSecretUnderBar;
  return cfg?.enabled ? cfg : null;
}
