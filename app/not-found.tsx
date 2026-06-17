import { NotFoundContent } from "@/components/errors/not-found-content";
import { defaultLocale } from "@/lib/i18n";

export default function NotFound() {
  return <NotFoundContent locale={defaultLocale} variant="public" />;
}
