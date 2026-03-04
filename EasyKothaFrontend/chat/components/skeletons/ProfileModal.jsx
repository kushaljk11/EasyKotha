import { X, Mail, Calendar, MapPin } from "lucide-react";

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" onClick={onClose}>
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background Accent */}
        <div className="relative h-24 bg-[#19545c]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-10 -mt-12">
          {/* Profile Image */}
          <div className="relative inline-block mb-6">
            <img
              src={user.profileImage || "/avatar.png"}
              alt={user.name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg shadow-black/10"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
          </div>

          {/* User Info */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">{user.name}</h3>
            <span className="inline-block px-3 py-1 bg-[#19545c]/10 text-[#19545c] rounded-lg text-[10px] font-semibold uppercase tracking-wider">
              {user.role || "User"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 group transition-colors hover:border-[#19545c]/30">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Mail className="w-5 h-5 text-[#19545c]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-slate-700 font-bold truncate">{user.email || "Not provided"}</p>
              </div>
            </div>

            {user.city && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 group transition-colors hover:border-[#19545c]/30">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-[#19545c]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-slate-700 font-bold">{user.city}{user.district ? `, ${user.district}` : ""}</p>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 group transition-colors hover:border-[#19545c]/30">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-[#19545c]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Member Since</p>
                  <p className="text-slate-700 font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-4 bg-[#19545c] text-white font-semibold uppercase tracking-widest rounded-2xl hover:bg-[#154e54] transition-all shadow-lg shadow-[#19545c]/20"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
