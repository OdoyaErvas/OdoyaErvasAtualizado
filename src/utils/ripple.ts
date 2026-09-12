/** Pequeno utilitário para criar efeitos ripple em botões primários. */
export function attachRipple(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--rx", `${x}%`);
  e.currentTarget.style.setProperty("--ry", `${y}%`);
}
