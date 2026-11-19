import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CloudAlert } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Eyebrow } from "@/components/atoms/Eyebrow";
import { CHUNK_RELOAD_KEY } from "@/constants/storage-keys";

const STALE_CHUNK =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i;

interface ImplProps {
  resetKey: string;
  children: ReactNode;
}

interface ImplState {
  error: Error | null;
}

class ErrorBoundaryImpl extends Component<ImplProps, ImplState> {
  state: ImplState = { error: null };

  static getDerivedStateFromError(error: Error): ImplState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Setelah deploy baru, chunk lama di cache bisa hilang: reload sekali per sesi tab.
    if (STALE_CHUNK.test(error.message)) {
      try {
        if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        // sessionStorage diblokir: tampilkan fallback saja.
      }
    }
    console.error("ErrorBoundary", error, info.componentStack);
  }

  componentDidUpdate(prevProps: ImplProps) {
    // Pindah halaman → coba render ulang tanpa remount seluruh app.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div
          role="alert"
          className="flex w-full max-w-md flex-col gap-4 rounded-card border border-border-strong bg-surface p-6"
        >
          <CloudAlert className="size-8 text-text-3" aria-hidden />
          <Eyebrow>Kesalahan</Eyebrow>
          <h1 className="font-serif text-3xl leading-tight text-text-strong">Terjadi kesalahan</h1>
          <p className="text-text-3">
            Bagian ini gagal ditampilkan. Coba lagi, atau muat ulang halaman kalau masih gagal.
          </p>
          <div className="mt-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => this.setState({ error: null })}>
              Coba lagi
            </Button>
            <Button onClick={() => window.location.reload()}>Muat ulang</Button>
          </div>
        </div>
      </div>
    );
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundaryImpl resetKey={pathname}>{children}</ErrorBoundaryImpl>;
}
