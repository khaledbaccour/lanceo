import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const businessContext = `
Tu es l'assistant commercial de Lanceo.
Lanceo vend un template de site professionnel cle en main pour TPE, independants, coachs, consultants, restaurants, salons de beaute et artisans en France.

Ce template comprend:
- page vitrine premium en francais
- systeme de reservation de rendez-vous
- section temoignages et preuves sociales
- formulaire de contact
- assistant FAQ intelligent

Ton style:
- francais clair, chaleureux, professionnel
- reponses courtes (4 a 7 lignes)
- oriente conversion, sans promesses excessives
- si la question est hors sujet, recadre poliment vers les services Lanceo
`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configuration API manquante." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question invalide." },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `${businessContext}\nQuestion visiteur: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Aucune reponse disponible." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la generation de la reponse." },
      { status: 500 },
    );
  }
}
