"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, CalendarDays, Home, Mail, MessageCircle } from "lucide-react";
import {
  Booking,
  ContactSubmission,
  FaqAnalyticsEntry,
  ensureMockData,
  getBookings,
  getContacts,
  getFaqAnalytics,
} from "@/lib/local-data";

export default function AdminPage() {
  const [bookings] = useState<Booking[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    ensureMockData();
    return getBookings();
  });

  const [contacts] = useState<ContactSubmission[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    ensureMockData();
    return getContacts();
  });

  const [faqAnalytics] = useState<FaqAnalyticsEntry[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    ensureMockData();
    return getFaqAnalytics();
  });

  const upcomingBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}:00`).getTime();
      const bDate = new Date(`${b.date}T${b.time}:00`).getTime();
      return aDate - bDate;
    });
  }, [bookings]);

  const latestContacts = useMemo(() => {
    return [...contacts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [contacts]);

  const topQuestions = useMemo(() => {
    return [...faqAnalytics]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [faqAnalytics]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">Dashboard admin</p>
              <h1 className="mt-2 font-display text-4xl text-slate-900">Pilotage Lanceo</h1>
              <p className="mt-2 text-slate-600">Vue centralisee des reservations, contacts et questions FAQ.</p>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Home className="h-4 w-4" />
              Retour au site
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{upcomingBookings.length}</p>
            <p className="text-sm text-slate-500">Reservations enregistrees</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{latestContacts.length}</p>
            <p className="text-sm text-slate-500">Demandes de contact</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{faqAnalytics.length}</p>
            <p className="text-sm text-slate-500">Themes FAQ suivis</p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Prochains rendez-vous</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Horaire</th>
                  <th className="px-3 py-2 font-medium">Service</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-3 font-medium text-slate-900">{booking.name}</td>
                    <td className="px-3 py-3">
                      {format(parseISO(booking.date), "EEE d MMM", { locale: fr })}
                    </td>
                    <td className="px-3 py-3">{booking.time}</td>
                    <td className="px-3 py-3">{booking.service}</td>
                    <td className="px-3 py-3">{booking.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-slate-900">Demandes de contact</h2>
            </div>
            <div className="space-y-3">
              {latestContacts.map((contact) => (
                <div key={contact.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(contact.createdAt), "d MMM yyyy - HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{contact.email}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{contact.message}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900">FAQ analytics</h2>
            </div>
            <div className="space-y-3">
              {topQuestions.map((entry) => (
                <div key={entry.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">{entry.question}</p>
                  <p className="mt-2 text-xs text-slate-500">{entry.count} demandes</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
