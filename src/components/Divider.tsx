export default function Divider({ light = false }: { light?: boolean }) {
  const color = light ? "text-cream-100" : "text-gold-500";
  return (
    <div className={`flex items-center justify-center gap-3 ${color}`}>
      <span className="h-px w-16 bg-current opacity-40" />
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2c1.5 2.5 1 5-1 6.5C13 9 15 8 16 6c.5 3-1.5 5-4 5.5 2.5.5 4.5 2.5 4 5.5-1-2-3-3-5-2.5 2 1.5 2.5 4 1 6.5-1.5-2.5-4-2.5-6 0 1.5-2.5 1-5-1-6.5-2-.5-4 .5-5 2.5-.5-3 1.5-5 4-5.5C6.5 11 4.5 9 5 6c1 2 3 3 5 2.5-2-1.5-2.5-4-1-6.5C10.5 4.5 10.5 4.5 12 2z" opacity="0.5" />
      </svg>
      <span className="h-px w-16 bg-current opacity-40" />
    </div>
  );
}
