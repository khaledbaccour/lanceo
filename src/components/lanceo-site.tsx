"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { fr } from "date-fns/locale";
import {
  Booking,
  COMMON_FAQ_QUESTIONS,
  getAvailableDaysInTwoWeeks,
  getBookings,
  saveBooking,
  saveContact,
  TIME_SLOTS,
  trackFaqQuestion,
  ensureMockData,
} from "@/lib/local-data";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const navItems = [
  { label: "Services", id: "services" },
  { label: "A propos", id: "a-propos" },
  { label: "Temoignages", id: "temoignages" },
  { label: "Reservation", id: "reservation" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

const serviceCards = [
  {
    title: "Site premium pret a vendre",
    description:
      "Une vitrine haut de gamme pour coachs, consultants et experts locaux avec design de confiance.",
    icon: Rocket,
  },
  {
    title: "Reservation integree",
    description:
      "Vos visiteurs bloquent un creneau en quelques clics. Gain de temps immediat et planning plus fiable.",
    icon: CalendarDays,
  },
  {
    title: "Assistant FAQ intelligent",
    description:
      "Un assistant IA repond 24h/24 aux questions frequentes et rassure les prospects avant contact.",
    icon: Bot,
  },
  {
    title: "Conversion orientee business",
    description:
      "Chaque section est pensee pour capter des leads: preuve sociale, offres claires, appel a l'action.",
    icon: BarChart3,
  },
];

const testimonials = [
  {
    name: "Claire Vial",
    role: "Coach executive - Lyon",
    text: "En 10 jours j'ai un site qui inspire confiance. Mes demandes de rendez-vous ont double le premier mois.",
    initials: "CV",
    stars: 5,
  },
  {
    name: "Nicolas Aubry",
    role: "Consultant RH - Nantes",
    text: "Le template fait tres pro, meme sans equipe marketing. J'ai enfin une presence web a mon niveau.",
    initials: "NA",
    stars: 5,
  },
  {
    name: "Sabrina Colin",
    role: "Salon beaute - Bordeaux",
    text: "Le module de reservation est simple pour mes clientes. Je passe moins de temps au telephone.",
    initials: "SC",
    stars: 5,
  },
  {
    name: "Yanis Morel",
    role: "Artisan renovation - Lille",
    text: "Design premium, contenu clair, et suivi des leads pratique. C'est exactement ce qu'il me fallait.",
    initials: "YM",
    stars: 5,
  },
];

const stats = [
  { label: "Taux de conversion moyen", value: 38, suffix: "%" },
  { label: "Temps de mise en ligne", value: 7, suffix: " jours" },
  { label: "Templates vendables", value: 120, suffix: "+" },
];

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

export function LanceoSite() {
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
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", phone: "" });
  const [bookingError, setBookingError] = useState("");
  const [contactDone, setContactDone] = useState(false);
  const [faqInput, setFaqInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Bonjour, je suis l'assistant Lanceo. Posez votre question sur les services, les delais ou la reservation.",
    },
  ]);

  const days = useMemo(() => getAvailableDaysInTwoWeeks(), []);
  const weekDays = selectedWeek === 1 ? days.slice(0, 7) : days.slice(7, 14);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const usedSlots = useMemo(() => {
    const slots = new Set<string>();
    bookings
      .filter((booking) => booking.date === selectedDate)
      .forEach((booking) => slots.add(booking.time));
    return slots;
  }, [bookings, selectedDate]);

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
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "Reponse indisponible.");
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "" }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Je n'ai pas pu recuperer la reponse pour le moment. Merci de reformuler ou de nous contacter directement.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setBookingError("Selectionnez une date et un horaire avant de confirmer.");
      return;
    }

    const { name, email, phone } = bookingForm;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setBookingError("Merci de remplir nom, email et telephone.");
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
      service: "Session decouverte Lanceo",
      createdAt: new Date().toISOString(),
    };

    saveBooking(booking);
    setBookings((prev) => [...prev, booking]);
    router.push(`/booking/${id}`);
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

    saveContact({
      id: `ct-${Date.now()}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });

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
            className="font-display text-2xl tracking-tight text-slate-900"
          >
            Lanceo
          </button>

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="transition hover:text-blue-600"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToSection("reservation")}
              className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-lg shadow-orange-300 transition hover:bg-orange-600"
            >
              Prendre rendez-vous
            </button>
          </div>

          <button
            type="button"
            className="rounded-full border border-slate-300 p-2 text-slate-700 lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border-t border-slate-200 bg-slate-50 px-4 py-4 lg:hidden"
            >
              <div className="mx-auto flex max-w-6xl flex-col gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="rounded-xl px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-blue-50"
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
          )}
        </AnimatePresence>
      </header>

      <main>
        <section id="hero" className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Template pro pour independants ambitieux
            </p>
            <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Lancez votre presence en ligne en quelques minutes
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Lanceo est un site professionnel cle en main pour artisans, coaches, restaurants et consultants qui veulent paraitre etablis des la premiere visite.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToSection("services")}
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Decouvrir
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("reservation")}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Prendre rendez-vous
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Performance locale</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Leads qualifies / mois</p>
                  <p className="text-3xl font-semibold text-slate-900">+42%</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Taux de prise de rendez-vous</p>
                  <p className="text-3xl font-semibold text-blue-700">x2,1</p>
                </div>
                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-700">Temps admin gagne / semaine</p>
                  <p className="text-3xl font-semibold text-orange-700">6h</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-3 sm:px-6">
          {stats.map((item) => (
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Services</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">Tout ce qu&apos;une petite entreprise attend d&apos;un vrai site professionnel</h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {serviceCards.map((service, index) => (
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
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">A propos</p>
            <h2 className="mt-4 font-display text-3xl text-slate-900 sm:text-4xl">Une vitrine en ligne qui inspire la confiance des la premiere seconde</h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
              Lanceo est ne d&apos;un constat simple: les independants francais ont une expertise forte mais un site souvent trop basique. Notre mission est de leur livrer une presence web premium, claire et orientee conversion, sans complexite technique.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <ShieldCheck className="h-6 w-6 text-slate-800" />
                <p className="mt-3 font-semibold text-slate-900">Image de confiance</p>
                <p className="mt-2 text-sm text-slate-600">Design premium et structure claire pour rassurer des le premier scroll.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <BadgeCheck className="h-6 w-6 text-slate-800" />
                <p className="mt-3 font-semibold text-slate-900">Methode prete a vendre</p>
                <p className="mt-2 text-sm text-slate-600">Sections prouvees: services, preuves sociales, reservations, capture de leads.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <PenSquare className="h-6 w-6 text-slate-800" />
                <p className="mt-3 font-semibold text-slate-900">Personnalisation rapide</p>
                <p className="mt-2 text-sm text-slate-600">Textes, couleurs et offres adaptables en quelques minutes selon votre activite.</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="temoignages" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Temoignages</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">Ils ont transforme leur image avec Lanceo</h2>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setActiveTestimonial((current) => (current - 1 + testimonials.length) % testimonials.length)}
                className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:bg-white"
                aria-label="Temoignage precedent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTestimonial((current) => (current + 1) % testimonials.length)}
                className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:bg-white"
                aria-label="Temoignage suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.article
                key={testimonials[activeTestimonial].name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-1 text-orange-500">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 max-w-3xl text-2xl leading-relaxed text-slate-900">
                  <span aria-hidden>&ldquo;</span>
                  {testimonials[activeTestimonial].text}
                  <span aria-hidden>&rdquo;</span>
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>

        <section id="reservation" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Reservation</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 sm:text-4xl">Bloquez un appel decouverte en 60 secondes</h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedWeek(1)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedWeek === 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Semaine 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWeek(2)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedWeek === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Semaine 2
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlot("");
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        selectedDate === day
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {format(parseISO(day), "EEEE d MMMM", { locale: fr })}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Disponibilites mises a jour en direct</p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const disabled = selectedDate ? usedSlots.has(slot) : true;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          selectedSlot === slot
                            ? "bg-slate-900 text-white"
                            : disabled
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-slate-100 text-slate-700 hover:bg-blue-100"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-name">
                  Nom complet
                </label>
                <input
                  id="booking-name"
                  value={bookingForm.name}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder="Ex: Pauline Durand"
                />

                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-email">
                  Email professionnel
                </label>
                <input
                  id="booking-email"
                  type="email"
                  value={bookingForm.email}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder="nom@entreprise.fr"
                />

                <label className="block text-sm font-medium text-slate-700" htmlFor="booking-phone">
                  Telephone
                </label>
                <input
                  id="booking-phone"
                  value={bookingForm.phone}
                  onChange={(event) => setBookingForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                  placeholder="06 00 00 00 00"
                />

                {bookingError ? <p className="text-sm font-medium text-rose-600">{bookingError}</p> : null}

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Confirmer le rendez-vous
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">FAQ</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Questions frequentes</h2>
              <div className="mt-6 space-y-2">
                {COMMON_FAQ_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => askFaq(question)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Assistant IA</p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Gemini actif</span>
              </div>

              <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "assistant"
                        ? "mr-8 bg-slate-100 text-slate-700"
                        : "ml-8 bg-blue-600 text-white"
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
                  Votre question
                </label>
                <input
                  id="faq-input"
                  value={faqInput}
                  onChange={(event) => setFaqInput(event.target.value)}
                  placeholder="Ex: Est-ce que ce site peut etre adapte a un cabinet dentaire ?"
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chatLoading ? "Reponse..." : "Envoyer"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Contact</p>
              <h2 className="mt-3 font-display text-3xl text-slate-900">Parlons de votre projet</h2>
              <p className="mt-3 text-slate-600">
                Laissez-nous vos coordonnees et votre besoin. Nous revenons vers vous sous 24h avec un plan clair.
              </p>

              <div className="mt-7 space-y-4 text-sm text-slate-700">
                <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-blue-600" /> 18 rue de la Republique, 69002 Lyon</p>
                <p className="flex items-center gap-3"><PhoneCall className="h-4 w-4 text-blue-600" /> 04 28 29 30 31</p>
                <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-blue-600" /> bonjour@lanceo.fr</p>
                <p className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-blue-600" /> Lun - Ven: 09:00 - 18:30</p>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-name">
                Nom
              </label>
              <input
                id="contact-name"
                name="name"
                className="mb-4 min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder="Votre nom"
                required
              />

              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                className="mb-4 min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder="vous@entreprise.fr"
                required
              />

              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-blue-600 transition focus:ring-2"
                placeholder="Expliquez votre activite et votre objectif"
                required
              />

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Envoyer ma demande
              </button>
              {contactDone ? <p className="mt-3 text-sm font-medium text-emerald-700">Merci, votre demande a bien ete enregistree.</p> : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-2xl text-slate-900">Lanceo</p>
            <p className="text-sm text-slate-500">Template professionnel cle en main pour TPE et independants.</p>
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
          © {new Date().getFullYear()} Lanceo. Tous droits reserves.
        </p>
      </footer>
    </div>
  );
}
