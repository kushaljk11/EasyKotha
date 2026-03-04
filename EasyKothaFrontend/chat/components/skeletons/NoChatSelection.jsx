import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-16 bg-gray-50/30">
      <div className="max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Icon Display */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
            <div
              className="relative w-24 h-24 rounded-3xl bg-linear-to-tr from-blue-600 to-blue-400 flex items-center
             justify-center shadow-xl shadow-blue-100 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500"
            >
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            {/* Decorative particles */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-blue-50 rounded-full animate-bounce delay-75"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Start a Conversation
          </h2>
          <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-70 mx-auto">
            Choose a contact from the side menu to begin messaging
          </p>
        </div>

        {/* Action hint */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          Waiting for you
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
