type HeaderProps = {
  view: "workout" | "progress";
  onToggleView: () => void;
};

export function Header({ view, onToggleView }: HeaderProps) {
  const isProgress = view === "progress";

  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-blue-500/5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold text-white">
          JT
        </div>
        <div className="leading-tight text-white">
          <p className="text-[11px] uppercase tracking-[0.22em] text-blue-300/80">
            Programa de força
          </p>
          <h1 className="text-xl font-semibold">Janz Força Tracker</h1>
        </div>
      </div>

      <button
        onClick={onToggleView}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] hover:shadow-blue-400/40 active:scale-95"
        type="button"
      >
        {isProgress ? "Voltar para treino" : "Ver progresso"}
      </button>
    </header>
  );
}

export default Header;
