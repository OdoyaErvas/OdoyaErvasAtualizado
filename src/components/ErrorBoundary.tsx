import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

type Props = { children: ReactNode; onReset?: () => void };
type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err?.message ?? "Erro inesperado." };
  }

  componentDidCatch(err: Error, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", err, info?.componentStack);
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, message: undefined });
  };

  hardReset = () => {
    // Limpa caches locais que podem estar corrompidos
    try {
      localStorage.removeItem("odoya_products_v1");
      localStorage.removeItem("odoya_vendas_v1");
      localStorage.removeItem("odoya_clientes_v1");
      localStorage.removeItem("odoya_interactions_v1");
    } catch {}
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen bg-cream-50 p-6">
        <div className="mx-auto mt-20 max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-deep/10 text-rose-deep">
            <AlertTriangle size={26} />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-semibold text-plum-800">Ops, algo deu errado</h2>
          <p className="mt-2 text-sm text-plum-900/65">
            Houve um erro ao carregar o painel. Isso costuma acontecer quando há dados antigos em cache. Use o botão abaixo para limpar e recarregar.
          </p>
          {this.state.message && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-plum-50 p-3 text-[0.7rem] text-plum-900/70">
              {this.state.message}
            </pre>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={this.hardReset}
              className="flex items-center gap-2 rounded-full bg-plum-700 px-5 py-2.5 text-sm text-cream-50 hover:bg-plum-800"
            >
              <RotateCcw size={15} /> Limpar cache e recarregar
            </button>
            <button
              onClick={this.reset}
              className="flex items-center gap-2 rounded-full border border-plum-200 px-5 py-2.5 text-sm text-plum-700 hover:bg-plum-50"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="flex items-center gap-2 rounded-full border border-plum-200 px-5 py-2.5 text-sm text-plum-700 hover:bg-plum-50"
            >
              <Home size={15} /> Ir ao site
            </a>
          </div>
        </div>
      </div>
    );
  }
}
