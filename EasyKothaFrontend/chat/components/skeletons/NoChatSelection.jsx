import { FaArrowLeft } from "react-icons/fa";

const NoChatSelected = ({ onBack, backLabel = "Back" }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f7fb_40%,#eef3f8_100%)] p-8 font-semibold sm:p-12">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white/90 px-8 py-10 text-center shadow-xl shadow-slate-200/60 animate-in fade-in zoom-in duration-500">
        <div className="mb-5 flex justify-center">
          <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-green-800/10 text-white shadow-lg shadow-green-800/20">
            <img
              src="/EasyKothaColoured-02.png"
              alt="EasyKotha"
              className="h-12 w-12 object-contain"
            />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-green-700" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Start a Conversation</h2>
          <p className="mx-auto max-w-sm text-base font-semibold leading-relaxed text-slate-500">
            Choose a contact from the left panel to begin chatting instantly.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-800/15 bg-green-800/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-800" />
            Waiting For You
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154e54]"
          >
            <FaArrowLeft className="text-xs" />
            <span>{backLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
