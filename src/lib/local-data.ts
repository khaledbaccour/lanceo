import { addDays, format } from "date-fns";

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  createdAt: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type FaqAnalyticsEntry = {
  question: string;
  count: number;
};

const BOOKING_KEY = "lanceo_bookings";
const CONTACT_KEY = "lanceo_contacts";
const FAQ_KEY = "lanceo_faq_analytics";

export const TIME_SLOTS = ["09:00", "10:30", "14:00", "16:00", "18:00"];

export const COMMON_FAQ_QUESTIONS = [
  "Quels sont vos tarifs pour la creation d'un site professionnel ?",
  "En combien de temps mon site peut-il etre en ligne ?",
  "Puis-je modifier le contenu moi-meme apres livraison ?",
  "Proposez-vous aussi le referencement local Google ?",
  "Le formulaire de contact envoie-t-il les demandes directement ?",
  "Est-ce adapte pour un artisan ou un salon de beaute ?",
];

const fallbackBookings = (): Booking[] => {
  const baseNames = [
    ["Camille Royer", "camille.royer@exemple.fr", "06 11 23 45 67"],
    ["Julien Mercier", "julien.mercier@exemple.fr", "06 82 45 19 34"],
    ["Sophie Lambert", "sophie.lambert@exemple.fr", "07 66 23 84 51"],
    ["Nicolas Perrin", "nicolas.perrin@exemple.fr", "06 72 90 14 38"],
    ["Lea Martin", "lea.martin@exemple.fr", "07 54 11 22 31"],
    ["Antoine Girard", "antoine.girard@exemple.fr", "06 43 32 15 04"],
    ["Claire Dubreuil", "claire.dubreuil@exemple.fr", "07 49 27 36 58"],
  ];

  return baseNames.map((entry, index) => {
    const appointmentDate = addDays(new Date(), index + 1);
    return {
      id: `bk-${index + 1}`,
      name: entry[0],
      email: entry[1],
      phone: entry[2],
      date: format(appointmentDate, "yyyy-MM-dd"),
      time: TIME_SLOTS[index % TIME_SLOTS.length],
      service: index % 2 === 0 ? "Session strategie" : "Audit express",
      createdAt: appointmentDate.toISOString(),
    };
  });
};

const fallbackContacts = (): ContactSubmission[] => [
  {
    id: "ct-1",
    name: "Marion Chevalier",
    email: "marion.chevalier@exemple.fr",
    message:
      "Bonjour, je souhaite un site vitrine pour mon cabinet de coaching et une reservation integree.",
    createdAt: addDays(new Date(), -2).toISOString(),
  },
  {
    id: "ct-2",
    name: "Romain Lemaire",
    email: "romain.lemaire@exemple.fr",
    message:
      "Je cherche un template premium pour mon restaurant avec menu, avis et formulaire de reservation.",
    createdAt: addDays(new Date(), -4).toISOString(),
  },
  {
    id: "ct-3",
    name: "Lucie Bernard",
    email: "lucie.bernard@exemple.fr",
    message:
      "Pouvez-vous adapter la charte a mon institut de beaute et connecter Google Business Profile ?",
    createdAt: addDays(new Date(), -5).toISOString(),
  },
  {
    id: "ct-4",
    name: "Mehdi Arnaud",
    email: "mehdi.arnaud@exemple.fr",
    message:
      "Je veux lancer une offre de consulting B2B rapidement avec prise de rendez-vous en ligne.",
    createdAt: addDays(new Date(), -6).toISOString(),
  },
  {
    id: "ct-5",
    name: "Anais Fontaine",
    email: "anais.fontaine@exemple.fr",
    message:
      "Merci de me rappeler pour une refonte complete de mon site actuel, orientee conversion.",
    createdAt: addDays(new Date(), -8).toISOString(),
  },
];

const fallbackFaq = (): FaqAnalyticsEntry[] => [
  { question: "Quel est le delai de livraison ?", count: 12 },
  { question: "Le site est-il adapte au mobile ?", count: 9 },
  { question: "Puis-je connecter mon nom de domaine ?", count: 7 },
  { question: "La reservation est-elle incluse ?", count: 6 },
  { question: "Proposez-vous une maintenance mensuelle ?", count: 5 },
];

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function ensureMockData(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.localStorage.getItem(BOOKING_KEY)) {
    window.localStorage.setItem(BOOKING_KEY, JSON.stringify(fallbackBookings()));
  }
  if (!window.localStorage.getItem(CONTACT_KEY)) {
    window.localStorage.setItem(CONTACT_KEY, JSON.stringify(fallbackContacts()));
  }
  if (!window.localStorage.getItem(FAQ_KEY)) {
    window.localStorage.setItem(FAQ_KEY, JSON.stringify(fallbackFaq()));
  }
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") {
    return [];
  }
  ensureMockData();
  return parseJSON<Booking[]>(window.localStorage.getItem(BOOKING_KEY), []);
}

export function saveBooking(booking: Booking): void {
  if (typeof window === "undefined") {
    return;
  }
  const bookings = getBookings();
  const updated = [...bookings, booking];
  window.localStorage.setItem(BOOKING_KEY, JSON.stringify(updated));
}

export function getContacts(): ContactSubmission[] {
  if (typeof window === "undefined") {
    return [];
  }
  ensureMockData();
  return parseJSON<ContactSubmission[]>(window.localStorage.getItem(CONTACT_KEY), []);
}

export function saveContact(contact: ContactSubmission): void {
  if (typeof window === "undefined") {
    return;
  }
  const contacts = getContacts();
  const updated = [contact, ...contacts];
  window.localStorage.setItem(CONTACT_KEY, JSON.stringify(updated));
}

export function getFaqAnalytics(): FaqAnalyticsEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  ensureMockData();
  return parseJSON<FaqAnalyticsEntry[]>(window.localStorage.getItem(FAQ_KEY), []);
}

export function trackFaqQuestion(question: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const normalized = question.trim();
  if (!normalized) {
    return;
  }

  const entries = getFaqAnalytics();
  const index = entries.findIndex(
    (entry) => entry.question.toLowerCase() === normalized.toLowerCase(),
  );

  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      count: entries[index].count + 1,
    };
  } else {
    entries.push({
      question: normalized,
      count: 1,
    });
  }

  const sorted = [...entries].sort((a, b) => b.count - a.count);
  window.localStorage.setItem(FAQ_KEY, JSON.stringify(sorted));
}

export function getAvailableDaysInTwoWeeks(): string[] {
  return Array.from({ length: 14 }, (_, index) =>
    format(addDays(new Date(), index), "yyyy-MM-dd"),
  );
}
