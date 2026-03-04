import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 px-6 w-full bg-white border-t border-gray-100">
      {imagePreview && (
        <div className="mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border-2 border-blue-500 shadow-md transition-transform group-hover:scale-105"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white shadow-lg
              flex items-center justify-center hover:bg-red-600 transition-colors border-2 border-white"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-400 font-medium">Image selected</div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-1.5 border border-gray-100 focus-within:border-[#19545c] focus-within:ring-2 focus-within:ring-[#19545c]/10 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent py-2.5 outline-none text-[15px] text-gray-700 placeholder:text-gray-400"
            placeholder="Type your message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`p-2 rounded-xl transition-all duration-200
                     ${imagePreview ? "text-[#19545c] bg-[#19545c]/10" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
          >
            <Image size={22} />
          </button>
        </div>

        <button
          type="submit"
          className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-300 transform active:scale-95
            ${(!text.trim() && !imagePreview) 
              ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
              : "bg-[#19545c] text-white hover:bg-[#154e54] shadow-[#19545c]/20 hover:rotate-6 hover:scale-105"}`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} className={text.trim() || imagePreview ? "ml-0.5" : ""} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
