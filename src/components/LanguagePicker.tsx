import logoBT from "../assets/logo-bt.png";
import { copy, useLang } from "../lib/language";

export function LanguagePicker() {
  const { setLang, needsPick, ready } = useLang();
  if (!ready || !needsPick) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-8 shadow-2xl shadow-sky-200/40">
        <div className="mb-6 flex justify-center">
          <img src={logoBT} alt="Basictrick" className="h-16 w-16 object-contain" />
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900">{copy.en.pickTitle}</h2>
        <p className="mt-2 text-center text-sm text-slate-500">{copy.en.pickSub}</p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setLang("en")}
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[0.99]"
          >
            {copy.en.pickEn}
          </button>
          <button
            type="button"
            onClick={() => setLang("bn")}
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            className="w-full rounded-2xl border border-sky-200 bg-sky-50/80 px-6 py-4 text-sm font-semibold text-slate-900 transition hover:scale-[1.01] active:scale-[0.99]"
          >
            {copy.bn.pickBn}
          </button>
        </div>
      </div>
    </div>
  );
}
