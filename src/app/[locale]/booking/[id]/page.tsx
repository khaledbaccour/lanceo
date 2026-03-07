"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import { CalendarCheck2, Download, House } from "lucide-react";
import { Booking, ensureMockData, getBookings } from "@/lib/local-data";

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function createCalendarFile(booking: Booking): string {
  const start = new Date(`${booking.date}T${booking.time}:00`);
  const end = new Date(start.getTime() + 45 * 60 * 1000);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lanceo//Booking//FR",
    "BEGIN:VEVENT",
    `UID:${booking.id}@lanceo.fr`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    "SUMMARY:Session decouverte Lanceo",
    "DESCRIPTION:Rendez-vous confirme via Lanceo.",
    "LOCATION:Visioconference",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string; locale: string }>();
  const locale = params.locale === "es" || params.locale === "en" ? params.locale : "fr";
  const dateLocale = locale === "es" ? es : locale === "en" ? enUS : fr;
  const booking = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    ensureMockData();
    const bookings = getBookings();
    return bookings.find((entry) => entry.id === params.id) ?? null;
  }, [params.id]);

  const formattedDate = useMemo(() => {
    if (!booking) {
      return "";
    }
    return format(parseISO(booking.date), locale === "en" ? "EEEE, MMMM d yyyy" : "EEEE d MMMM yyyy", {
      locale: dateLocale,
    });
  }, [booking, dateLocale, locale]);

  function downloadCalendar() {
    if (!booking) {
      return;
    }
    const content = createCalendarFile(booking);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rendez-vous-${booking.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CalendarCheck2 className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-4xl text-slate-900">Merci pour votre reservation</h1>
        <p className="mt-3 text-slate-600">
          Votre creneau est bien enregistre. Vous recevrez un email de rappel avec les informations de connexion.
        </p>

        {booking ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Numero de reservation</p>
            <p className="text-lg font-semibold text-slate-900">{booking.id}</p>

            <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="block text-slate-500">Nom</span>
                {booking.name}
              </p>
              <p>
                <span className="block text-slate-500">Email</span>
                {booking.email}
              </p>
              <p>
                <span className="block text-slate-500">Date</span>
                {formattedDate}
              </p>
              <p>
                <span className="block text-slate-500">Horaire</span>
                {booking.time}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Cette reservation est introuvable. Elle a peut-etre ete supprimee du stockage local.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={downloadCalendar}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            disabled={!booking}
          >
            <Download className="h-4 w-4" />
            Ajoute au calendrier
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <House className="h-4 w-4" />
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
