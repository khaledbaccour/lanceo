"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CalendarDays,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  PhoneCall,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Booking,
  ContactSubmission,
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

type Props = {
  locale?: string;
};

export function LanceoSite({ locale = "fr" }: Props) {
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

  const navItems = [
    { label: locale === "es" ? "Servicios" : locale === "en" ? "Services" : "Services", id: "services" },
    { label: locale === "es" ? "Nosotros" : locale === "en" ? "About" : "A propos", id: "a-propos" },
    { label: locale === "es" ? "Testimonios" : locale === "en" ? "Testimonials" : "Temoignages", id: "temoignages" },
    { label: locale === "es" ? "Reservar" : locale === "en" ? "Booking" : "Reservation", id: "reservation" },
    { label: locale === "es" ? "Preguntas" : locale === "en" ? "FAQ" : "FAQ", id: "faq" },
    { label: locale === "es" ? "Contacto" : locale === "en" ? "Contact" : "Contact", id: "contact" },
  ];

  const serviceCards = [
    {
      title: locale === "es" ? "Sitio premium listo" : locale === "en" ? "Premium site ready" : "Site premium pret a vendre",
      description:
        locale === "es"
          ? "Una vitrina de alta gama para coaches y consultores."
          : locale === "en"
          ? "A high-end showcase for coaches and consultants."
          : "Une vitrine haut de gamme pour coachs et consultants.",
      icon: Rocket,
    },
    {
      title: locale === "es" ? "Reserva integrada" : locale === "en" ? "Built-in booking" : "Reservation integree",
      description:
        locale === "es"
          ? "Tus visitantes reservan en pocos clics."
          : locale === "en"
          ? "Your visitors book in just a few clicks."
          : "Vos visiteurs reservent en quelques clics.",
      icon: CalendarDays,
    },
    {
      title: locale === "es" ? "Asistente FAQ IA" : locale === "en" ? "AI FAQ assistant" : "Assistant FAQ intelligent",
      description:
        locale === "es"
          ? "Un asistente IA responde 24/7."
          : locale === "en"
          ? "An AI assistant answers 24/7."
          : "Un assistant IA repond 24h/24.",
      icon: Bot,
    },
    {
      title:
        locale === "es"
          ? "Conversion de negocios"
          : locale === "en"
          ? "Business conversion"
          : "Conversion orientee business",
      description:
        locale === "es"
          ? "Cada seccion diseñada para captar leads."
          : locale === "en"
          ? "Every section designed to capture leads."
          : "Chaque section pensee pour capter des leads.",
      icon: BarChart3,
    },
  ];

  const testimonials = [
    {
      name: "Claire Vial",
      role: locale === "es" ? "Coach - Lyon" : locale === "en" ? "Coach - Lyon" : "Coach executive - Lyon",
      text: locale === "es"
          ? "En 10 dias tengo un sitio que inspira confianza."
          : locale === "en"
          ? "In 10 days I have a site that inspires trust."
          : "En 10 jours j'ai un site qui inspire confiance.",
      initials: "CV",
      stars: 5,
    },
    {
      name: "Nicolas Aubry",
      text: locale === "es"
          ? "El template hace muy profesional."
          : locale === "en"
          ? "The template looks very professional."
          : "Le template fait tres pro.",
      initials: "NA",
      stars: 5,
    },
    {
      name: "Sabrina Colin",
      role: locale === "es" ? "Consultora - Paris" : locale === "en" ? "Consultant - Paris" : "Consultante - Paris",
      text: locale === "es"
          ? "Mi presencia web finalmente esta a mi nivel."
          : locale === "en"
          ? "My web presence is finally at my level."
          : "Ma presence web est enfin a mon niveau.",
      initials: "SC",
      stars: 5,
    },
  ];

  const footerLinks = {
    company: locale === "es" ? "Empresa" : locale === "en" ? "Company" : "Entreprise",
    legal: locale === "es" ? "Legal" : locale === "en" ? "Legal" : "Mentions legales",
    privacy: locale === "es" ? "Privacidad" : locale === "en" ? "Privacy" : "Confidentialite",
    terms: locale === "es" ? "Terminos" : locale === "en" ? "Terms" : "CGV",
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const availableDays = useMemo(() => getAvailableDaysInTwoWeeks(), [selectedWeek]);

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !bookingForm.name || !bookingForm.email) {
      setBookingError("Veuillez remplir tous les champs");
      return;
    }
    try {
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        date: selectedDate,
        time: selectedSlot,
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        service: "default",
        createdAt: new Date().toISOString(),
      };
      await saveBooking(newBooking);
      setBookings([...bookings, { date: selectedDate, time: selectedSlot, ...bookingForm } as Booking]);
      setBookingForm({ name: "", email: "", phone: "" });
      setSelectedDate("");
      setSelectedSlot("");
      setBookingError("");
    } catch (err) {
      setBookingError("Erreur lors de la reservation");
    }
  };

  const handleContact = async (e: FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newContact: ContactSubmission = {
      id: `ct-${Date.now()}`,
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      message: formData.get("message")?.toString() || "",
      createdAt: new Date().toISOString(),
    };
    await saveContact(newContact);
    setContactDone(true);
  };

  const handleFaqSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!faqInput.trim()) return;
    const userMessage = faqInput;
    setChatMessages([...chatMessages, { role: "user", content: userMessage }]);
    setChatLoading(true);
    try {
      const matchedFaq = COMMON_FAQ_QUESTIONS.find((faq) =>
        userMessage.toLowerCase().includes(faq.toLowerCase())
      );
      await trackFaqQuestion(userMessage);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: matchedFaq
              ? matchedFaq
              : locale === "es"
              ? "Lo siento, no encontré una respuesta a su pregunta. No dude en contactarme directamente."
              : locale === "en"
              ? "Sorry, I couldn't find an answer to your question. Feel free to contact me directly."
              : "Je suis désolé, je n'ai pas trouvé de réponse à votre question. N'hésitez pas à me contacter directement.",
          },
        ]);
        setChatLoading(false);
      }, 1000);
    } catch {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                Lanceo
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200"
            >
              <div className="space-y-1 px-4 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="block w-full text-left py-2 text-slate-600 hover:text-slate-900"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="hero" className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 mb-8">
                <Sparkles className="h-4 w-4 text-amber-600" />
                {locale === "es" ? "Template profesional premium" : locale === "en" ? "Premium professional template" : "Template professionnel premium"}
              </span>
              <h1
                className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {locale === "es" ? "Sitio web profesional todo en uno" : locale === "en" ? "All-in-one professional website" : "Site professionnel cle en main"}
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                {locale === "es"
                  ? "Template premium con reserva integrada, asistente de FAQ con IA y panel de admin para independientes."
                  : locale === "en"
                  ? "Premium template with built-in booking, AI FAQ assistant and admin dashboard for independents."
                  : "Template premium avec reservation integree, assistant FAQ IA et dashboard admin pour independants."}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => scrollTo("reservation")}
                  className="rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  {locale === "es" ? "Comenzar ahora" : locale === "en" ? "Get started" : "Commencer maintenant"}
                  <ArrowRight className="ml-2 h-4 w-4 inline" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              {locale === "es" ? "Servicios" : locale === "en" ? "Services" : "Services"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                  <card.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-slate-600 text-sm">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="reservation" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              {locale === "es" ? "Reserva" : locale === "en" ? "Booking" : "Reservation"}
            </h2>
            <p className="mt-4 text-slate-600">
              {locale === "es" ? "Selecciona una fecha y hora" : locale === "en" ? "Select a date and time" : "Selectionnez une date et un horaire"}
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="flex gap-2 mb-6">
              {[1, 2].map((week) => (
                <button
                  key={week}
                  onClick={() => setSelectedWeek(week as 1 | 2)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedWeek === week ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {locale === "es" ? `Semana ${week}` : locale === "en" ? `Week ${week}` : `Semaine ${week}`}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {availableDays.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDate === day
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <div className="text-xs opacity-70">{format(parseISO(day), "EEE", { locale: fr })}</div>
                  <div>{format(parseISO(day), "d MMM", { locale: fr })}</div>
                </button>
              ))}
            </div>
            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {locale === "es" ? "Selecciona un horario" : locale === "en" ? "Select a time slot" : "Selectionnez un horaire"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedSlot === slot
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedSlot && (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {locale === "es" ? "Nombre completo" : locale === "en" ? "Full name" : "Nom complet"}
                  </label>
                  <input
                    type="text"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {locale === "es" ? "Telefono" : locale === "en" ? "Phone" : "Telephone"}
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                {bookingError && <p className="text-red-600 text-sm">{bookingError}</p>}
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  {locale === "es" ? "Confirmar reserva" : locale === "en" ? "Confirm booking" : "Confirmer la reservation"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              FAQ
            </h2>
            <p className="mt-4 text-slate-600">
              {locale === "es" ? "Preguntale a nuestro asistente IA" : locale === "en" ? "Ask our AI assistant" : "Posez vos questions a notre assistant IA"}
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 max-h-80 overflow-y-auto">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="text-left">
                  <div className="inline-block bg-slate-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleFaqSubmit} className="flex gap-2">
              <input
                type="text"
                value={faqInput}
                onChange={(e) => setFaqInput(e.target.value)}
                placeholder={locale === "es" ? "Escribe tu pregunta..." : locale === "en" ? "Type your question..." : "Posez votre question..."}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              {locale === "es" ? "Testimonios" : locale === "en" ? "Testimonials" : "Temoignages"}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                {testimonials.map((t, idx) => (
                  <button
                    key={t.name}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                      activeTestimonial === idx
                        ? "bg-slate-900 text-white scale-110"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t.initials}
                  </button>
                ))}
              </div>
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-slate-700 mb-4">"{testimonials[activeTestimonial].text}"</p>
                <p className="font-semibold text-slate-900">{testimonials[activeTestimonial].name}</p>
                <p className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-semibold mb-6" style={{ fontFamily: "var(--font-display)" }}>
                {locale === "es" ? "Contacto" : locale === "en" ? "Contact" : "Contact"}
              </h2>
              <p className="text-slate-300 mb-8">
                {locale === "es"
                  ? "Estamos aqui para ayudarte. Contactanos para cualquier pregunta."
                  : locale === "en"
                  ? "We're here to help. Contact us with any questions."
                  : "Nous sommes la pour vous aider. Contactez-nous pour toute question."}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <span>contact@lanceo.fr</span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-5 w-5 text-slate-400" />
                  <span>+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <span>Paris, France</span>
                </div>
              </div>
            </div>
            <div>
              {contactDone ? (
                <div className="bg-green-900/50 rounded-xl p-6 text-center">
                  <BadgeCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-lg">
                    {locale === "es" ? "Mensaje enviado!" : locale === "en" ? "Message sent!" : "Message envoye!"}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder={locale === "es" ? "Nombre" : locale === "en" ? "Name" : "Nom"}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                  <textarea
                    name="message"
                    rows={4}
                    placeholder={locale === "es" ? "Mensaje" : locale === "en" ? "Message" : "Message"}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-white text-slate-900 py-3 px-6 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                  >
                    {locale === "es" ? "Enviar" : locale === "en" ? "Send" : "Envoyer"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                Lanceo
              </span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                {footerLinks.company}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {footerLinks.privacy}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {footerLinks.terms}
              </a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <p className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
            © {new Date().getFullYear()} Lanceo. {locale === "es" ? "Todos los derechos reservados." : locale === "en" ? "All rights reserved." : "Tous droits reserves."}
          </p>
        </div>
      </footer>
    </div>
  );
}
