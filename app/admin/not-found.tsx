import { NotFoundContent } from "@/components/errors/not-found-content";
import { defaultLocale } from "@/lib/i18n";

export default async function AdminNotFound() {
  return <NotFoundContent locale={defaultLocale} variant="admin" />;
}
