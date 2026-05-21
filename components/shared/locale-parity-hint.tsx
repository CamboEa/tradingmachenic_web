export function LocaleParityHint({
 enFilled,
 kmFilled,
 label = "Khmer translation missing",
}: {
 enFilled: boolean;
 kmFilled: boolean;
 label?: string;
}) {
 if (!enFilled || kmFilled) return null;
 return (
 <p className="mt-1 text-xs font-medium text-amber-700" role="status">
 {label}
 </p>
 );
}
