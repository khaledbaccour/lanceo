import { LanceoSite } from "@/components/lanceo-site";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  return <LanceoSite locale={locale} />;
}
