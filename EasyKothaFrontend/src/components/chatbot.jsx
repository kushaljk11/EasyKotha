import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config/env";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required in EasyKothaFrontend/.env");
}

const API_URL = `${API_BASE_URL}/chat`;
const SESSION_ID = crypto.randomUUID();

const getGeminiResponse = async (message) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId: SESSION_ID }),
  });

  if (!res.ok) throw new Error("Server error");

  const data = await res.json();
  return data.reply;
};

const Avatar = ({ size = "w-9 h-9" }) => (
  <div className={`${size} rounded-full bg-green-800 ring-2 ring-green-300 flex items-center justify-center shadow-md shrink-0 overflow-hidden`}>
    <img src="/logo.png" alt="EasyKotha logo" className="w-[75%] h-[75%] object-contain" />
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-1 px-3 py-2 items-center">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></div>
  </div>
);

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hey there 👋\nHow can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: "user", text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const reply = await getGeminiResponse(text);

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: "Connection problem. Try again later.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-7 sm:right-7 z-9999 flex flex-col items-end gap-3 sm:gap-4">

      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-[380px] h-[min(540px,75vh)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-green-500 p-4 flex justify-between items-center">

            <div className="flex items-center gap-3">
              <Avatar size="w-10 h-10" />

              <div>
                <p className="text-white font-bold text-sm">Chatbot</p>
                <p className="text-white/70 text-xs">● Online</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex flex-col gap-4">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${
                  msg.from === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.from === "bot" && <Avatar />}

                <div
                  className={`max-w-[72%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap
                  ${
                    msg.from === "user"
                      ? "bg-green-600 text-white rounded-br-sm"
                      : "bg-white text-gray-700 shadow rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2 items-end">
                <Avatar />
                <div className="bg-white rounded-xl shadow">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message..."
              className="flex-1 border border-green-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            />

            <button
              onClick={send}
              disabled={!input.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center
              ${
                input.trim()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-200 text-green-400"
              }`}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-green-800 text-white shadow-lg flex items-center justify-center hover:scale-110 transition"
      >
        {open ? "×" : <Avatar size="w-8 h-8" />}
      </button>
    </div>
  );
}