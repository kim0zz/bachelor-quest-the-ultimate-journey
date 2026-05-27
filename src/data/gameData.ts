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
    title: "Lama przeżył, ale komisja ma pytania.",
    subtitle:
      "Dotarł do końca, co technicznie jest sukcesem. Styl pozostaje przedmiotem dochodzenia.",
  },
  {
    minPoints: 26,
    title: "Materiał na męża, wersja po aktualizacji.",
    subtitle:
      "System działa, choć czasem wymaga restartu, nawodnienia i nadzoru Marty.",
  },
  {
    minPoints: 51,
    title: "Lama gotowy do ślubu. Organizm mniej.",
    subtitle:
      "Decyzje bywały tragiczne, ale serce jest po właściwej stronie.",
  },
  {
    minPoints: 81,
    title: "Legenda wieczoru.",
    subtitle:
      "Marta, odbiór techniczny zaliczony. Prosimy nie pytać organizmu o opinię.",
  },
];

export const BAR_IDS = ["hans", "male-piwko"] as const;

export const LOCATIONS: Location[] = [
  {
    id: "konopa",
    name: "KONOPA",
    shortName: "Start",
    description:
      "Lama budzi się na KONOPA. Człowiek odpowiedzialny napiłby się wody i przemyślał życie. Lama ma na dziś inne plany.",
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
      "Kony kiwa z uznaniem. Ślepy i Kulawy rozpoznani. Lokalna mitologia Małego Piwka została zachowana.",
    penaltyText:
      "Kony patrzy z rozczarowaniem. Nie znać Ślepego i Kulawego w Małym Piwku to jak nie znać własnego PIN-u po trzecim piwie. Lama pije.",
    question: "Jaka legendarna para rezydentów Małego Piwka tworzyła lokalny duet specjalny?",
    answers: ["Ślepy i Kulawy", "Głuchy i Garbaty", "Krzywy i Bezzębny", "Łysy i Chromy"],
    correctAnswerIndex: 0,
    bartenderDialogue: {
      bartenderName: "Kony",
      introLine:
        "No proszę, Lama w Małym Piwku. Człowiek, który nie wchodzi do baru — on się tu po prostu materializuje przy ladzie. Co robimy?",
      options: [
        {
          label: "Kony, ja znam to miejsce jak własną kieszeń.",
          outcomeLine:
            "To dobrze, bo Małe Piwko ma własną mitologię. Sprawdzimy, czy znasz lokalne legendy.",
        },
        {
          label: "Najpierw duży Specjal, potem pytania.",
          outcomeLine:
            "Klasyka Lamy: najpierw utrudnić sobie zadanie, potem udawać, że to element strategii. Dobra, zaczynamy od lokalnych legend.",
          bonusPoints: 5,
        },
        {
          label: "Tylko na chwilę.",
          outcomeLine:
            "To zdanie powinno być wyryte nad wejściem. Ale zanim znikniesz w czasie i przestrzeni, szybki test z miejscowych legend.",
        },
      ],
    },
    postQuestSecretUnderBar: {
      enabled: true,
      requiredShots: 2,
      imageUrl: "/assets/groom-drunk-trap.jpg",
      title: "SEKRET POD BAREM",
      offerTitle: "Ktoś mówi, że pod barem w Małym Piwku jest coś, czego regulamin nie przewidział.",
      enterText: "Lama schyla się pod ladę. Dwa prawdziwe shoty — potem zobaczymy, czy to był dobry pomysł.",
      revealTitle: "PUŁAPKA!",
      revealText: "NAKURWIŁEŚ SIĘ NA DARMO",
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
      "Legendarna meliniarnia i centrum dowodzenia melanżem. Na BITWY nikt nie pytał, czy pijesz — pytali tylko, z kim i z czego.",
    x: 48,
    y: 48,
    type: "challenge",
    locked: true,
    icon: "🏚️",
    pointsForSuccess: 10,
    rewardText: "Pokój Bewicza uznał nalanie. Lama jeszcze funkcjonuje. +10 Mąż Points.",
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
      "Misja zaopatrzeniowa. Lama musi udowodnić, że potrafi kupić rzeczy potrzebne do dalszego niszczenia organizmu.",
    x: 58,
    y: 38,
    type: "quiz",
    locked: true,
    icon: "🛒",
    pointsForSuccess: 10,
    rewardText:
      "Lama wykazał się myśleniem strategicznym. Czteropak to dywersyfikacja, flacha to plan awaryjny. Tak działa odpowiedzialny logistyk weselny.",
    penaltyText:
      "DREWNIAK odmawia autoryzacji tych zakupów. To nie jest piknik, detoks ani rosół u babci. Lama pije za brak misji.",
    question: "Co Lama kupuje w DREWNIAKU przed działką?",
    answers: [
      "Czteropak Harnolda i flachę",
      "Płyn do spryskiwaczy i kabanosy",
      "Piwo zero",
      "Włoszczyznę",
    ],
    correctAnswerIndex: 0,
  },
  {
    id: "dzialka",
    name: "DZIAŁKA",
    shortName: "DZIAŁKA",
    description:
      "Naturalne środowisko Lamy. ROD, basen, grill, Bluetooth speaker i decyzje, których regulamin nie przewidział.",
    x: 68,
    y: 52,
    type: "challenge",
    locked: true,
    icon: "🏕️",
    pointsForSuccess: 0,
    rewardText: "",
    penaltyText: "",
  },
  {
    id: "paryz",
    name: "PARYŻ",
    shortName: "PARYŻ",
    description:
      "Ciemny las, zła decyzja i coraz mniej argumentów za tym, żeby tu zostać.",
    x: 78,
    y: 36,
    type: "challenge",
    locked: true,
    icon: "🌚",
    pointsForSuccess: 0,
    rewardText: "",
    penaltyText: "",
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
    name: "DOM / KONOPA",
    shortName: "DOM",
    description: "Autopilot, zygzak i finałowy audyt zniszczeń.",
    x: 90,
    y: 30,
    type: "final",
    locked: true,
    icon: "🏠",
    pointsForSuccess: 0,
    rewardText: "WERDYKT KOŃCOWY",
    penaltyText: "",
    finalText:
      "Lama dociera na KONOPA na autopilocie. Szedł zygzakiem, ale dotarł. W jego stanie to już logistyka klasy premium.",
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
  ["dzialka", "dom-zgon"],
  ["dzialka", "risk-narzeczona"],
  ["paryz", "dom-zgon"],
];

export const MALE_PIWKO_ID = "male-piwko";

export const BALANCE_PERIOD_MS = 2500;
export const BALANCE_TARGET_MIN = 42;
export const BALANCE_TARGET_MAX = 58;
export const BALANCE_POINTS = 10;

export const POST_BITWY_TRANSITION_TEXT =
  "BITWY powoli przechodzą z melanżu w oddział intensywnej drzemki. Ludzie leżą w pozycjach, których nie przewiduje anatomia. Lama patrzy na to wszystko i dochodzi do wniosku, że jest jeszcze niedopity. Melanż podobno kręci się dalej na działce, ale najpierw trzeba zrobić najważniejszą misję dorosłego człowieka: kupić alkohol w DREWNIAKU.";

export const HULAJNOGA_DURATION_MS = 7000;
export const HULAJNOGA_REQUIRED_CLICKS = 25;
export const HULAJNOGA_POINTS = 15;

export const DZIALKA_INTRO_PART1 =
  "Lama dociera na działkę. Swoje naturalne środowisko. Z daleka już słychać, że muzyka napierdala, ktoś drze pizdę, ktoś pluska się w basenie, a gdzieś w oddali działkowcy zaczynają przeczuwać, że regulamin ROD właśnie traci kontrolę nad sytuacją.";

export const DZIALKA_INTRO_PART2 =
  "To nie jest zwykła działka. To jest miejsce, gdzie grill, basen i Bluetooth speaker potrafią stworzyć problemy większe niż zebranie zarządu.";

export const DZIALKA_RANDOM_LINE =
  "Przelizalem kilku kolegów i nie żałuję tego";

export const DZIALKA_RAP = {
  narratorBefore:
    "Na działce jest już pełna pizda. Wszyscy śpiewają rap, jakby od tego zależała stabilność wszechświata. Z głośników leci Paktofonika. Lama chce wejść w wers, ale jest już na etapie, gdzie nie wiadomo, czy pamięta tekst, czy tylko pamięta emocje.",
  lyricFragment:
    "Balansem w naturze, równowagi korekta\nUnoszę się ponadto na specjalnych efektach\nCel, S, M, O, K na kartki biel",
  question: "Co Lama powinien zaśpiewać dalej?",
  answers: [
    "A, M, B, L, O, K, E, J, B, E, L",
    "A, N, B, L, O, K, E, J, B, E, R",
    "A, N, B, L, O, K, E, J, B, E, L",
    "A, N, B, L, O, G, E, J, B, E, L",
  ],
  correctAnswerIndex: 2,
  successNarrator:
    "Lama wchodzi czysto. Działka na moment milknie z szacunku, co samo w sobie jest wydarzeniem historycznym.",
  successFeedback:
    "Lama łapie podjarkę, wznosi toast i wszyscy oprócz Lamy walą shota.",
  failureNarrator:
    "Lama gubi wers i próbuje ratować sytuację pewnością siebie. Niestety pewność siebie nie rymuje się z Paktofoniką.",
  failureFeedback: "Lama pije za profanację klasyka.",
};

export const DZIALKA_FINAL_NARRATOR1 =
  "Po występie Lama jest już nakurwiony na poziomie, na którym człowiek zaczyna uznawać złe pomysły za logiczne rozwinięcie fabuły.";

export const DZIALKA_FINAL_NARRATOR2 =
  "Melanż na działce niby trwa, regulamin ROD niby jeszcze istnieje, ale przed Lamą pojawia się najważniejsze pytanie wieczoru: kończyć z godnością, czy odpalić tryb legendy?";

export const PARYZ_INTRO_1 =
  "PARYŻ. Nazwa brzmi romantycznie, ale w praktyce to ciemny las i bardzo dużo pytań bez odpowiedzi. Lama stoi między drzewami, odpala szluga i sam nie wie, na chuj tu przyszedł.";

export const PARYZ_INTRO_2 =
  "Jest ciemno, zimno, a jego organizm zaczyna wysyłać maile z wypowiedzeniem. Lama narzeka, że ma pizdę, ale oczywiście zamiast wracać, rozważa dalsze decyzje.";

export const PARYZ_VOMIT_TEXT =
  "Lama wali shota w lesie, bo najwyraźniej fabuła nie miała jeszcze dość. Po chwili organizm składa reklamację ustną i Lama się zrzygał.";

export const PRE_BITWY_ZUKER_INTRO =
  "Telefon Lamy zaczyna wibrować. Żuker dzwoni z BITWY.";

export const PRE_BITWY_ZUKER_LINE =
  "Lama, gdzie ty jesteś? Kiedy będziesz? Tu już się robi konkretnie.";

export const PRE_BITWY_NARRATOR =
  "Lama patrzy na telefon, patrzy na stan organizmu i podejmuje decyzję, którą historycy melanżu ocenią jako nieuniknioną. Czas na BITWY.";

export const PARYZ_SLEEP_TEXT =
  "Lama robi kolejny krok w stronę legendy i trzy kroki w stronę gleby. Po wszystkim zasypia na pół godziny jak nieautoryzowana aktualizacja systemu.";

export const PARYZ_WAKE_TEXT =
  "Lama budzi się w szoku. Przez chwilę nie wie, czy jest w Paryżu, lesie, czy w konsekwencjach własnych wyborów.";

export const PARYZ_ESCAPE_TRANSITION =
  "Lama uruchamia autopilota. Idzie zygzakiem, ale z jakiegoś powodu każdy zyg i każdy zak prowadzą go bliżej KONOPA.";

export const DOM_DIRECT_TRANSITION =
  "Lama odpala autopilota. Szedł zygzakiem, ale dotarł. W jego stanie to już logistyka klasy premium.";

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
