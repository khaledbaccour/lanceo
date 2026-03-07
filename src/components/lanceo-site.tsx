"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  PenSquare,
  PhoneCall,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import {
  Booking,
  ContactSubmission,
  getAvailableDaysInTwoWeeks,
  getBookings,
  saveBooking,
  saveContact,
  trackFaqQuestion,
  ensureMockData,
  TIME_SLOTS,
} from "@/lib/local-data";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type Locale = "fr" | "es" | "en";

type Props = {
  locale?: string;
};

type Content = {
  navItems: Array<{ label: string; id: string }>;
  localeLabel: string;
  localeLinks: Array<{ code: Locale; label: string }>;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroCardTitle: string;
  heroMetrics: Array<{ label: string; value: string; tone: string }>;
  stats: Array<{ label: string; value: number; suffix: string }>;
  servicesEyebrow: string;
  servicesTitle: string;
  serviceCards: Array<{ title: string; description: string; icon: typeof Rocket }>;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutPoints: Array<{ title: string; description: string; icon: typeof ShieldCheck }>;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonials: Array<{ name: string; role: string; text: string; initials: string; stars: number }>;
  bookingEyebrow: string;
  bookingTitle: string;
  bookingWeekLabel: string;
  bookingSlotsHint: string;
  bookingLiveHint: string;
  bookingFormTitle: string;
  bookingName: string;
  bookingEmail: string;
  bookingPhone: string;
  bookingNamePlaceholder: string;
  bookingEmailPlaceholder: string;
  bookingPhonePlaceholder: string;
  bookingButton: string;
  bookingErrors: {
    missingSlot: string;
    missingFields: string;
  };
  faqEyebrow: string;
  faqTitle: string;
  faqAssistantLabel: string;
  faqAssistantBadge: string;
  faqInputPlaceholder: string;
  faqButton: string;
  faqLoading: string;
  faqIntro: string;
  faqQuestions: string[];
  faqFallback: string;
  contactEyebrow: string;
  contactTitle: string;
  contactDescription: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
  contactName: string;
  contactEmailLabel: string;
  contactMessage: string;
  contactNamePlaceholder: string;
  contactEmailPlaceholder: string;
  contactMessagePlaceholder: string;
  contactButton: string;
  contactSuccess: string;
  footerDescription: string;
  footerRights: string;
};

const contentByLocale: Record<Locale, Content> = {
  fr: {
    navItems: [
      { label: "Services", id: "services" },
      { label: "A propos", id: "a-propos" },
      { label: "Temoignages", id: "temoignages" },
      { label: "Reservation", id: "reservation" },
      { label: "FAQ", id: "faq" },
      { label: "Contact", id: "contact" },
    ],
    localeLabel: "Langue",
    localeLinks: [
      { code: "fr", label: "FR" },
      { code: "en", label: "EN" },
      { code: "es", label: "ES" },
    ],
    heroBadge: "Template pro pour independants ambitieux",
    heroTitle: "Lancez votre presence en ligne en quelques minutes",
    heroDescription:
      "Lanceo est un site professionnel cle en main pour coachs, consultants, artisans et commerces locaux qui veulent inspirer confiance des la premiere visite.",
    heroPrimaryCta: "Decouvrir",
    heroSecondaryCta: "Prendre rendez-vous",
    heroCardTitle: "Performance locale",
    heroMetrics: [
      { label: "Leads qualifies / mois", value: "+42%", tone: "bg-slate-50 text-slate-900" },
      { label: "Taux de prise de rendez-vous", value: "x2,1", tone: "bg-blue-50 text-blue-700" },
      { label: "Temps admin gagne / semaine", value: "6h", tone: "bg-orange-50 text-orange-700" },
    ],
    stats: [
      { label: "Taux moyen de conversion", value: 38, suffix: "%" },
      { label: "Temps de mise en ligne", value: 7, suffix: " j" },
      { label: "Templates vendables", value: 120, suffix: "+" },
    ],
    servicesEyebrow: "Services",
    servicesTitle: "Tout ce qu'une petite entreprise attend d'un vrai site professionnel",
    serviceCards: [
      {
        title: "Site premium pret a vendre",
        description: "Une vitrine haut de gamme avec une promesse claire, une offre visible et un ton rassurant.",
        icon: Rocket,
      },
      {
        title: "Reservation integree",
        description: "Vos visiteurs reservent un rendez-vous en quelques clics, sans friction ni aller-retour.",
        icon: CalendarDays,
      },
      {
        title: "Assistant FAQ intelligent",
        description: "Un assistant IA repond aux questions recurrentes et rassure avant le premier contact.",
        icon: Bot,
      },
      {
        title: "Conversion orientee business",
        description: "Chaque section est pensee pour capter des leads et faire passer a l'action plus vite.",
        icon: BarChart3,
      },
    ],
    aboutEyebrow: "A propos",
    aboutTitle: "Une presence en ligne qui inspire confiance des les premieres secondes",
    aboutDescription:
      "Lanceo part d'une idee simple: beaucoup d'independants ont une vraie expertise, mais une image trop faible en ligne. Cette page restaure une presence premium, claire et orientee conversion sans complexite technique.",
    aboutPoints: [
      {
        title: "Image rassurante",
        description: "Une direction visuelle premium et une structure claire pour gagner la confiance des le premier scroll.",
        icon: ShieldCheck,
      },
      {
        title: "Methode prete a vendre",
        description: "Des sections qui prouvent, expliquent, rassurent et convertissent sans blabla inutile.",
        icon: BadgeCheck,
      },
      {
        title: "Personnalisation rapide",
        description: "Textes, couleurs et offres adaptables rapidement selon votre activite et votre marche local.",
        icon: PenSquare,
      },
    ],
    testimonialsEyebrow: "Temoignages",
    testimonialsTitle: "Ils ont retrouve une image premium avec Lanceo",
    testimonials: [
      {
        name: "Claire Vial",
        role: "Coach executive - Lyon",
        text: "En 10 jours j'avais un site qui inspire confiance. Mes demandes de rendez-vous ont grimpe des le premier mois.",
        initials: "CV",
        stars: 5,
      },
      {
        name: "Nicolas Aubry",
        role: "Consultant RH - Nantes",
        text: "Le template parait tres haut de gamme, meme sans equipe marketing. Enfin une presence web a mon niveau.",
        initials: "NA",
        stars: 5,
      },
      {
        name: "Sabrina Colin",
        role: "Consultante - Paris",
        text: "Le module de reservation fait gagner un temps enorme et la page donne tout de suite une impression de serieux.",
        initials: "SC",
        stars: 5,
      },
      {
        name: "Yanis Morel",
        role: "Artisan renovation - Lille",
        text: "Design premium, offre lisible, collecte de leads plus nette. C'est exactement le rendu que je cherchais.",
        initials: "YM",
        stars: 5,
      },
    ],
    bookingEyebrow: "Reservation",
    bookingTitle: "Reservez un appel decouverte en 60 secondes",
    bookingWeekLabel: "Semaine",
    bookingSlotsHint: "Choisissez un horaire disponible",
    bookingLiveHint: "Disponibilites mises a jour en direct",
    bookingFormTitle: "Vos coordonnees",
    bookingName: "Nom complet",
    bookingEmail: "Email professionnel",
    bookingPhone: "Telephone",
    bookingNamePlaceholder: "Ex.: Pauline Durand",
    bookingEmailPlaceholder: "contact@entreprise.fr",
    bookingPhonePlaceholder: "06 12 34 56 78",
    bookingButton: "Confirmer la reservation",
    bookingErrors: {
      missingSlot: "Selectionnez d'abord une date et un horaire.",
      missingFields: "Renseignez le nom, l'email et le telephone.",
    },
    faqEyebrow: "FAQ",
    faqTitle: "Questions frequentes",
    faqAssistantLabel: "Assistant IA",
    faqAssistantBadge: "Gemini actif",
    faqInputPlaceholder: "Ex.: Ce site peut-il etre adapte a mon activite ?",
    faqButton: "Envoyer",
    faqLoading: "Reponse...",
    faqIntro: "Bonjour, je suis l'assistant Lanceo. Posez votre question sur l'offre, les delais ou la reservation.",
    faqQuestions: [
      "Quels sont vos tarifs pour un site professionnel ?",
      "En combien de temps mon site peut-il etre en ligne ?",
      "Puis-je modifier le contenu apres livraison ?",
      "Proposez-vous aussi le referencement local ?",
      "Le formulaire de contact envoie-t-il les demandes directement ?",
      "Est-ce adapte pour un artisan ou un salon de beaute ?",
    ],
    faqFallback:
      "Je n'ai pas pu recuperer la reponse pour le moment. Reformulez votre question ou contactez-nous directement.",
    contactEyebrow: "Contact",
    contactTitle: "Parlons de votre projet",
    contactDescription:
      "Laissez vos coordonnees et votre besoin. Nous revenons avec une reponse claire sous 24 heures.",
    contactAddress: "12 rue des Entrepreneurs, 75010 Paris",
    contactPhone: "+33 1 23 45 67 89",
    contactEmail: "contact@lanceo.fr",
    contactHours: "Lun - Ven: 09:00 - 18:30",
    contactName: "Nom",
    contactEmailLabel: "Email",
    contactMessage: "Message",
    contactNamePlaceholder: "Votre nom",
    contactEmailPlaceholder: "contact@entreprise.fr",
    contactMessagePlaceholder: "Expliquez votre activite et votre objectif",
    contactButton: "Envoyer ma demande",
    contactSuccess: "Merci, votre demande a bien ete enregistree.",
    footerDescription: "Template professionnel cle en main pour TPE et independants.",
    footerRights: "Tous droits reserves.",
  },
  en: {
    navItems: [
      { label: "Services", id: "services" },
      { label: "About", id: "a-propos" },
      { label: "Testimonials", id: "temoignages" },
      { label: "Booking", id: "reservation" },
      { label: "FAQ", id: "faq" },
      { label: "Contact", id: "contact" },
    ],
    localeLabel: "Language",
    localeLinks: [
      { code: "fr", label: "FR" },
      { code: "en", label: "EN" },
      { code: "es", label: "ES" },
    ],
    heroBadge: "Pro template for ambitious independents",
    heroTitle: "Launch your online presence in just a few minutes",
    heroDescription:
      "Lanceo is a turnkey professional website for coaches, consultants, trades and local businesses that want to look established from the very first visit.",
    heroPrimaryCta: "Explore",
    heroSecondaryCta: "Book a call",
    heroCardTitle: "Local performance",
    heroMetrics: [
      { label: "Qualified leads / month", value: "+42%", tone: "bg-slate-50 text-slate-900" },
      { label: "Booking rate", value: "x2.1", tone: "bg-blue-50 text-blue-700" },
      { label: "Admin time saved / week", value: "6h", tone: "bg-orange-50 text-orange-700" },
    ],
    stats: [
      { label: "Average conversion rate", value: 38, suffix: "%" },
      { label: "Time to launch", value: 7, suffix: " d" },
      { label: "Sellable templates", value: 120, suffix: "+" },
    ],
    servicesEyebrow: "Services",
    servicesTitle: "Everything a small business expects from a real professional website",
    serviceCards: [
      {
        title: "Premium site ready to sell",
        description: "A high-end showcase with a clear promise, visible offer and a reassuring tone from the first fold.",
        icon: Rocket,
      },
      {
        title: "Built-in booking",
        description: "Visitors book a call in a few clicks, without friction and without back-and-forth.",
        icon: CalendarDays,
      },
      {
        title: "Smart FAQ assistant",
        description: "An AI assistant answers recurring questions and reduces hesitation before contact.",
        icon: Bot,
      },
      {
        title: "Business-focused conversion",
        description: "Every section is tuned to capture leads and move visitors toward action faster.",
        icon: BarChart3,
      },
    ],
    aboutEyebrow: "About",
    aboutTitle: "An online presence that builds trust in the first seconds",
    aboutDescription:
      "Lanceo starts from a simple idea: many independents have real expertise, but weak online positioning. This page restores a premium, clear and conversion-driven presence without technical complexity.",
    aboutPoints: [
      {
        title: "Trust-building image",
        description: "Premium visual direction and clean structure that create confidence from the first scroll.",
        icon: ShieldCheck,
      },
      {
        title: "Ready-to-sell method",
        description: "Sections that prove, explain, reassure and convert without unnecessary noise.",
        icon: BadgeCheck,
      },
      {
        title: "Fast customization",
        description: "Copy, offers and colors adapt quickly to your activity and local market.",
        icon: PenSquare,
      },
    ],
    testimonialsEyebrow: "Testimonials",
    testimonialsTitle: "They regained a premium image with Lanceo",
    testimonials: [
      {
        name: "Claire Vial",
        role: "Executive coach - Lyon",
        text: "In 10 days I had a site that felt instantly trustworthy. My meeting requests jumped in the first month.",
        initials: "CV",
        stars: 5,
      },
      {
        name: "Nicolas Aubry",
        role: "HR consultant - Nantes",
        text: "The template feels genuinely high-end, even without a marketing team. My web presence finally matches my work.",
        initials: "NA",
        stars: 5,
      },
      {
        name: "Sabrina Colin",
        role: "Consultant - Paris",
        text: "The booking module saves a lot of time and the page gives an immediate impression of credibility.",
        initials: "SC",
        stars: 5,
      },
      {
        name: "Yanis Morel",
        role: "Renovation contractor - Lille",
        text: "Premium design, clear offer and better lead capture. It is exactly the level of presentation I needed.",
        initials: "YM",
        stars: 5,
      },
    ],
    bookingEyebrow: "Booking",
    bookingTitle: "Book a discovery call in 60 seconds",
    bookingWeekLabel: "Week",
    bookingSlotsHint: "Choose an available time slot",
    bookingLiveHint: "Availability updated live",
    bookingFormTitle: "Your details",
    bookingName: "Full name",
    bookingEmail: "Business email",
    bookingPhone: "Phone",
    bookingNamePlaceholder: "Ex.: Paula Martin",
    bookingEmailPlaceholder: "contact@company.com",
    bookingPhonePlaceholder: "+44 7700 900123",
    bookingButton: "Confirm booking",
    bookingErrors: {
      missingSlot: "Select a date and time first.",
      missingFields: "Fill in your name, email and phone number.",
    },
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    faqAssistantLabel: "AI assistant",
    faqAssistantBadge: "Gemini live",
    faqInputPlaceholder: "Ex.: Can this site be adapted to my business?",
    faqButton: "Send",
    faqLoading: "Replying...",
    faqIntro: "Hello, I am the Lanceo assistant. Ask about the offer, timelines or booking.",
    faqQuestions: [
      "What pricing range do you offer for a professional website?",
      "How quickly can my site go live?",
      "Can I edit the content after delivery?",
      "Do you also help with local SEO?",
      "Does the contact form send requests directly?",
      "Is it suitable for a trade business or beauty studio?",
    ],
    faqFallback:
      "I could not retrieve the answer right now. Rephrase your question or contact us directly.",
    contactEyebrow: "Contact",
    contactTitle: "Let us talk about your project",
    contactDescription:
      "Share your details and your goal. We come back with a clear answer within 24 hours.",
    contactAddress: "12 Builder Street, London",
    contactPhone: "+44 20 7946 0123",
    contactEmail: "hello@lanceo.com",
    contactHours: "Mon - Fri: 09:00 - 18:30",
    contactName: "Name",
    contactEmailLabel: "Email",
    contactMessage: "Message",
    contactNamePlaceholder: "Your name",
    contactEmailPlaceholder: "contact@company.com",
    contactMessagePlaceholder: "Tell us about your activity and your goal",
    contactButton: "Send my request",
    contactSuccess: "Thanks, your request has been recorded.",
    footerDescription: "Turnkey professional template for small businesses and independents.",
    footerRights: "All rights reserved.",
  },
  es: {
    navItems: [
      { label: "Servicios", id: "services" },
      { label: "Nosotros", id: "a-propos" },
      { label: "Testimonios", id: "temoignages" },
      { label: "Reservas", id: "reservation" },
      { label: "FAQ", id: "faq" },
      { label: "Contacto", id: "contact" },
    ],
    localeLabel: "Idioma",
    localeLinks: [
      { code: "fr", label: "FR" },
      { code: "en", label: "EN" },
      { code: "es", label: "ES" },
    ],
    heroBadge: "Plantilla pro para autonomos ambiciosos",
    heroTitle: "Lanza tu presencia online en pocos minutos",
    heroDescription:
      "Lanceo es un sitio profesional llave en mano para coaches, consultores, artesanos y negocios locales que quieren inspirar confianza desde la primera visita.",
    heroPrimaryCta: "Descubrir",
    heroSecondaryCta: "Reservar una llamada",
    heroCardTitle: "Rendimiento local",
    heroMetrics: [
      { label: "Leads cualificados / mes", value: "+42%", tone: "bg-slate-50 text-slate-900" },
      { label: "Tasa de reserva", value: "x2,1", tone: "bg-blue-50 text-blue-700" },
      { label: "Tiempo administrativo ahorrado / semana", value: "6h", tone: "bg-orange-50 text-orange-700" },
    ],
    stats: [
      { label: "Tasa media de conversion", value: 38, suffix: "%" },
      { label: "Tiempo de puesta online", value: 7, suffix: " d" },
      { label: "Plantillas vendibles", value: 120, suffix: "+" },
    ],
    servicesEyebrow: "Servicios",
    servicesTitle: "Todo lo que una pequena empresa espera de un sitio profesional real",
    serviceCards: [
      {
        title: "Sitio premium listo para vender",
        description: "Una vitrina de alto nivel con promesa clara, oferta visible y un tono que transmite confianza.",
        icon: Rocket,
      },
      {
        title: "Reserva integrada",
        description: "Tus visitantes reservan una llamada en pocos clics, sin friccion ni idas y vueltas.",
        icon: CalendarDays,
      },
      {
        title: "Asistente FAQ inteligente",
        description: "Un asistente IA responde dudas frecuentes y reduce la friccion antes del primer contacto.",
        icon: Bot,
      },
      {
        title: "Conversion orientada a negocio",
        description: "Cada seccion esta pensada para captar leads y empujar hacia la accion mas rapido.",
        icon: BarChart3,
      },
    ],
    aboutEyebrow: "Nosotros",
    aboutTitle: "Una presencia online que inspira confianza desde los primeros segundos",
    aboutDescription:
      "Lanceo nace de una idea simple: muchos autonomos tienen experiencia real, pero una presencia digital demasiado debil. Esta pagina devuelve una imagen premium, clara y orientada a conversion sin complejidad tecnica.",
    aboutPoints: [
      {
        title: "Imagen de confianza",
        description: "Direccion visual premium y estructura clara para generar confianza desde el primer scroll.",
        icon: ShieldCheck,
      },
      {
        title: "Metodo listo para vender",
        description: "Secciones que prueban, explican, tranquilizan y convierten sin ruido innecesario.",
        icon: BadgeCheck,
      },
      {
        title: "Personalizacion rapida",
        description: "Textos, colores y ofertas adaptables rapidamente segun tu actividad y tu mercado local.",
        icon: PenSquare,
      },
    ],
    testimonialsEyebrow: "Testimonios",
    testimonialsTitle: "Recuperaron una imagen premium con Lanceo",
    testimonials: [
      {
        name: "Claire Vial",
        role: "Coach ejecutiva - Lyon",
        text: "En 10 dias tenia un sitio que transmite confianza. Mis solicitudes de reunion subieron desde el primer mes.",
        initials: "CV",
        stars: 5,
      },
      {
        name: "Nicolas Aubry",
        role: "Consultor RRHH - Nantes",
        text: "La plantilla se siente realmente premium, incluso sin equipo de marketing. Mi presencia web por fin esta a la altura.",
        initials: "NA",
        stars: 5,
      },
      {
        name: "Sabrina Colin",
        role: "Consultora - Paris",
        text: "El modulo de reserva ahorra mucho tiempo y la pagina transmite credibilidad de inmediato.",
        initials: "SC",
        stars: 5,
      },
      {
        name: "Yanis Morel",
        role: "Artesano reformas - Lille",
        text: "Diseno premium, oferta clara y mejor captacion de leads. Es exactamente el nivel de presentacion que necesitaba.",
        initials: "YM",
        stars: 5,
      },
    ],
    bookingEyebrow: "Reservas",
    bookingTitle: "Reserva una llamada de descubrimiento en 60 segundos",
    bookingWeekLabel: "Semana",
    bookingSlotsHint: "Elige una franja disponible",
    bookingLiveHint: "Disponibilidades actualizadas en directo",
    bookingFormTitle: "Tus datos",
    bookingName: "Nombre completo",
    bookingEmail: "Email profesional",
    bookingPhone: "Telefono",
    bookingNamePlaceholder: "Ej.: Paula Duran",
    bookingEmailPlaceholder: "contacto@empresa.com",
    bookingPhonePlaceholder: "612 00 00 00",
    bookingButton: "Confirmar la reserva",
    bookingErrors: {
      missingSlot: "Selecciona primero una fecha y una hora.",
      missingFields: "Rellena nombre, email y telefono.",
    },
    faqEyebrow: "FAQ",
    faqTitle: "Preguntas frecuentes",
    faqAssistantLabel: "Asistente IA",
    faqAssistantBadge: "Gemini activo",
    faqInputPlaceholder: "Ej.: Se puede adaptar este sitio a mi actividad?",
    faqButton: "Enviar",
    faqLoading: "Respuesta...",
    faqIntro: "Hola, soy el asistente de Lanceo. Haz tu pregunta sobre la oferta, los plazos o las reservas.",
    faqQuestions: [
      "Cual es el rango de precio para un sitio profesional?",
      "En cuanto tiempo puede estar online mi sitio?",
      "Puedo modificar el contenido despues de la entrega?",
      "Tambien ayudais con el SEO local?",
      "El formulario de contacto envia las solicitudes directamente?",
      "Es adecuado para un artesano o un salon de belleza?",
    ],
    faqFallback:
      "No he podido recuperar la respuesta por ahora. Reformula tu pregunta o contactanos directamente.",
    contactEyebrow: "Contacto",
    contactTitle: "Hablemos de tu proyecto",
    contactDescription:
      "Dejanos tus datos y tu objetivo. Te responderemos con una respuesta clara en menos de 24 horas.",
    contactAddress: "Calle de Alcala 95, Madrid",
    contactPhone: "+34 612 34 56 78",
    contactEmail: "hola@lanceo.es",
    contactHours: "Lun - Vie: 09:00 - 18:30",
    contactName: "Nombre",
    contactEmailLabel: "Email",
    contactMessage: "Mensaje",
    contactNamePlaceholder: "Tu nombre",
    contactEmailPlaceholder: "contacto@empresa.com",
    contactMessagePlaceholder: "Explica tu actividad y tu objetivo",
    contactButton: "Enviar mi solicitud",
    contactSuccess: "Gracias, tu solicitud se ha registrado correctamente.",
    footerDescription: "Plantilla profesional llave en mano para pymes y autonomos.",
    footerRights: "Todos los derechos reservados.",
  },
};

function getDateLocale(locale: Locale) {
  if (locale === "es") {
    return es;
  }
  if (locale === "en") {
    return enUS;
  }
  return fr;
}

function scrollToSection(id: string): void {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function AnimatedStat({ value, suffix }: { value: number; suffix: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const steps = 30;
    const interval = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / steps, 1);
      setCurrent(Math.round(value * progress));
      if (progress === 1) {
        window.clearInterval(interval);
      }
    }, 35);

    return () => window.clearInterval(interval);
  }, [value]);

  return (
    <span className="text-4xl font-semibold text-slate-900 sm:text-5xl">
      {current}
      {suffix}
    </span>
  );
}

export function LanceoSite({ locale = "fr" }: Props) {
  const currentLocale: Locale = locale === "es" || locale === "en" ? locale : "fr";
  const copy = contentByLocale[currentLocale];
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    ensureMockData();
    return getBookings();
  });
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", phone: "" });
  const [bookingError, setBookingError] = useState("");
  const [contactDone, setContactDone] = useState(false);
  const [faqInput, setFaqInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: copy.faqIntro },
  ]);

  const dateLocale = useMemo(() => getDateLocale(currentLocale), [currentLocale]);
  const days = useMemo(() => getAvailableDaysInTwoWeeks(), []);
  const weekDays = useMemo(
    () => (selectedWeek === 1 ? days.slice(0, 7) : days.slice(7, 14)),
    [days, selectedWeek],
  );
  const usedSlots = useMemo(() => {
    const slots = new Set<string>();
    bookings.filter((booking) => booking.date === selectedDate).forEach((booking) => slots.add(booking.time));
    return slots;
  }, [bookings, selectedDate]);

  useEffect(() => {
    setChatMessages([{ role: "assistant", content: copy.faqIntro }]);
    setFaqInput("");
  }, [copy.faqIntro]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % copy.testimonials.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [copy.testimonials.length]);

  async function askFaq(question: string) {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setChatLoading(true);
    setFaqInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    trackFaqQuestion(trimmed);

    try {
      const response = await fetch(`/${currentLocale}/api/faq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed, locale: currentLocale }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "Answer unavailable.");
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "" }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: copy.faqFallback }]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDate || !selectedSlot) {
      setBookingError(copy.bookingErrors.missingSlot);
      return;
    }

    const { name, email, phone } = bookingForm;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setBookingError(copy.bookingErrors.missingFields);
      return;
    }

    const id = `bk-${Date.now()}`;
    const booking: Booking = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date: selectedDate,
      time: selectedSlot,
      service: "Lanceo discovery call",
      createdAt: new Date().toISOString(),
    };

    saveBooking(booking);
    setBookings((prev) => [...prev, booking]);
    router.push(`/${currentLocale}/booking/${id}`);
  }

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      return;
    }

    const submission: ContactSubmission = {
      id: `ct-${Date.now()}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    saveContact(submission);
    form.reset();
    setContactDone(true);
    window.setTimeout(() => setContactDone(false), 3500);
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-800">
      <div className="pointer-events-none absolute -top-36 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[28rem] h-[22rem] w-[22rem] rounded-full bg-orange-200/55 blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-white/70 bg-slate-50/85 backdrop-blur-lg">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => scrollToSection("hero")}
            className="font-display cursor-pointer text-2xl tracking-tight text-slate-900"
          >
            Lanceo
          </button>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-500">
              <span>{copy.localeLabel}</span>
              {copy.localeLinks.map((item) => (
                <Link
                  key={item.code}
                  href={`/${item.code}`}
                  className={`transition hover:text-blue-600 ${
                    item.code === currentLocale ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {copy.navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="cursor-pointer transition hover:text-blue-600"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection("reservation")}
              className="cursor-pointer rounded-full bg-orange-500 px-4 py-2 text-white shadow-lg shadow-orange-300 transition hover:bg-orange-600"
            >
              {copy.heroSecondaryCta}
            </button>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-full border border-slate-300 p-2 text-slate-700 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border-t border-slate-200 bg-slate-50 px-4 py-4 lg:hidden"
            >
              <div className="mx-auto flex max-w-6xl flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {copy.localeLinks.map((item) => (
                    <Link
                      key={item.code}
                      href={`/${item.code}`}
                      className={`font-semibold ${item.code === currentLocale ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                {copy.navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="cursor-pointer rounded-xl px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-blue-50"
                    onClick={() => {
                      scrollToSection(item.id);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main>
        <section
          id="hero"
          className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20"
        >
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              {copy.heroBadge}
            </p>
            <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{copy.heroDescription}</p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToSection("services")}
                className="cursor-pointer rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {copy.heroPrimaryCta}
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("reservation")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                {copy.heroSecondaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-blue-100">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.heroCardTitle}</p>
              <div className="mt-5 space-y-4">
                {copy.heroMetrics.map((metric) => (
                  <div key={metric.label} className={`rounded-2xl p-4 ${metric.tone}`}>
                    <p className="text-sm opacity-80">{metric.label}</p>
                    <p className="text-3xl font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-3 sm:px-6">
          {copy.stats.map((item) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <AnimatedStat value={item.value} suffix={item.suffix} />
              <p className="mt-2 text-sm text-slate-600">{item.label}</p>
            </motion.article>
          ))}
        </section>

        <section id="services" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.servicesEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">{copy.servicesTitle}</h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {copy.serviceCards.map((service, index) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <service.icon className="h-9 w-9 text-blue-600" />
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{service.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="a-propos" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.aboutEyebrow}</p>
            <h2 className="mt-4 font-display text-3xl text-slate-900 sm:text-4xl">{copy.aboutTitle}</h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">{copy.aboutDescription}</p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.aboutPoints.map((point) => (
                <div key={point.title} className="rounded-2xl bg-slate-50 p-5">
                  <point.icon className="h-6 w-6 text-slate-800" />
                  <p className="mt-3 font-semibold text-slate-900">{point.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{point.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="temoignages" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.testimonialsEyebrow}</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">{copy.testimonialsTitle}</h2>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial((current) =>
                    (current - 1 + copy.testimonials.length) % copy.testimonials.length,
                  )
                }
                className="cursor-pointer rounded-full border border-slate-300 p-2 text-slate-600 transition hover:bg-white"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTestimonial((current) => (current + 1) % copy.testimonials.length)}
                className="cursor-pointer rounded-full border border-slate-300 p-2 text-slate-600 transition hover:bg-white"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.article
                key={copy.testimonials[activeTestimonial].name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-1 text-orange-500">
                  {Array.from({ length: copy.testimonials[activeTestimonial].stars }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 max-w-3xl text-2xl leading-relaxed text-slate-900">
                  <span aria-hidden>&ldquo;</span>
                  {copy.testimonials[activeTestimonial].text}
                  <span aria-hidden>&rdquo;</span>
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {copy.testimonials[activeTestimonial].initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{copy.testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-slate-500">{copy.testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>

        <section id="reservation" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.bookingEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">{copy.bookingTitle}</h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-4 flex gap-3">
                  {[1, 2].map((week) => (
                    <button
                      key={week}
                      type="button"
                      onClick={() => setSelectedWeek(week as 1 | 2)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedWeek === week ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {copy.bookingWeekLabel} {week}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlot("");
                        setBookingError("");
                      }}
                      className={`cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                        selectedDate === day ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {format(parseISO(day), currentLocale === "en" ? "EEEE, MMMM d" : "EEEE d MMMM", {
                          locale: dateLocale,
                        })}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{copy.bookingLiveHint}</p>
                    </button>
                  ))}
                </div>

                <p className="mt-5 text-sm font-medium text-slate-600">{copy.bookingSlotsHint}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const disabled = selectedDate ? usedSlots.has(slot) : true;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setBookingError("");
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedSlot === slot
                            ? "cursor-pointer bg-slate-900 text-white"
                            : disabled
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "cursor-pointer bg-slate-100 text-slate-700 hover:bg-blue-100"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{copy.bookingFormTitle}</p>
                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-name">
                  {copy.bookingName}
                </label>
                <input
                  id="booking-name"
                  value={bookingForm.name}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder={copy.bookingNamePlaceholder}
                />

                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-email">
                  {copy.bookingEmail}
                </label>
                <input
                  id="booking-email"
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder={copy.bookingEmailPlaceholder}
                />

                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-phone">
                  {copy.bookingPhone}
                </label>
                <input
                  id="booking-phone"
                  value={bookingForm.phone}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder={copy.bookingPhonePlaceholder}
                />

                {bookingError ? <p className="text-sm font-medium text-rose-600">{bookingError}</p> : null}

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {copy.bookingButton}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.faqEyebrow}</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">{copy.faqTitle}</h2>
              <div className="mt-6 space-y-2">
                {copy.faqQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void askFaq(question)}
                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.faqAssistantLabel}</p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {copy.faqAssistantBadge}
                </span>
              </div>

              <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "assistant" ? "mr-8 bg-slate-100 text-slate-700" : "ml-8 bg-blue-600 text-white"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  void askFaq(faqInput);
                }}
              >
                <label className="sr-only" htmlFor="faq-input">
                  {copy.faqTitle}
                </label>
                <input
                  id="faq-input"
                  value={faqInput}
                  onChange={(event) => setFaqInput(event.target.value)}
                  placeholder={copy.faqInputPlaceholder}
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chatLoading ? copy.faqLoading : copy.faqButton}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{copy.contactEyebrow}</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">{copy.contactTitle}</h2>
              <p className="mt-3 text-slate-600">{copy.contactDescription}</p>

              <div className="mt-7 space-y-4 text-sm text-slate-700">
                <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-blue-600" /> {copy.contactAddress}</p>
                <p className="flex items-center gap-3"><PhoneCall className="h-4 w-4 text-blue-600" /> {copy.contactPhone}</p>
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-blue-600" /> {copy.contactEmail}</p>
                <p className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-blue-600" /> {copy.contactHours}</p>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-name">
                {copy.contactName}
              </label>
              <input
                id="contact-name"
                name="name"
                className="mb-4 min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder={copy.contactNamePlaceholder}
                required
              />

              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-email">
                {copy.contactEmailLabel}
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                className="mb-4 min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder={copy.contactEmailPlaceholder}
                required
              />

              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-message">
                {copy.contactMessage}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder={copy.contactMessagePlaceholder}
                required
              />

              <button
                type="submit"
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {copy.contactButton}
              </button>
              {contactDone ? <p className="mt-3 text-sm font-medium text-emerald-700">{copy.contactSuccess}</p> : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-2xl text-slate-900">Lanceo</p>
            <p className="text-sm text-slate-500">{copy.footerDescription}</p>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <a className="rounded-full border border-slate-200 p-2 transition hover:text-blue-600" href="#" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a className="rounded-full border border-slate-200 p-2 transition hover:text-blue-600" href="#" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a className="rounded-full border border-slate-200 p-2 transition hover:text-blue-600" href="#" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
        <p className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} Lanceo. {copy.footerRights}
        </p>
      </footer>
    </div>
  );
}
