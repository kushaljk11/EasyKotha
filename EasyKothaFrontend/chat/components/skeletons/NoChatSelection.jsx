import { FaArrowLeft, FaComments } from "react-icons/fa";

const NoChatSelected = ({ onBack, backLabel = "Back" }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#f4f7fb_40%,#eef3f8_100%)] p-8 sm:p-12">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200/80 bg-white/90 px-8 py-10 text-center shadow-xl shadow-slate-200/60 animate-in fade-in zoom-in duration-500">
        <div className="mb-5 flex justify-center">
          <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#19545c] text-white shadow-lg shadow-[#19545c]/25">
            <FaComments className="text-2xl" />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-[#9ad3db]" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Start a Conversation</h2>
          <p className="mx-auto max-w-sm text-base font-medium leading-relaxed text-slate-500">
            Choose a contact from the left panel to begin chatting instantly.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#19545c]" />
            Waiting For You
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-[#19545c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154b52]"
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
