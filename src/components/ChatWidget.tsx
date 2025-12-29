"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import Image from "next/image";

type Position = { x: number; y: number };

export default function ChatWidget() {
  const iconSize = 56;
  const chatWidth = 320;
  const chatHeight = 400;
  const lightBg = "#fffbea";
  const brandColor = "#25D366";

  const quickOptions = [
    "I have a problem with Registeration",
    "I have a problem with check status",
    "It's not verifying me",
  ];

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);

  // Start at bottom-right
  useEffect(() => {
    setPosition({
      x: window.innerWidth - iconSize - 20,
      y: window.innerHeight - iconSize - 20,
    });
  }, []);

  const clamp = (x: number, y: number) => ({
    x: Math.min(Math.max(0, x), window.innerWidth - iconSize),
    y: Math.min(Math.max(0, y), window.innerHeight - iconSize),
  });

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition(clamp(e.clientX - offset.x, e.clientY - offset.y));
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const t = e.touches[0];
      setPosition(clamp(t.clientX - offset.x, t.clientY - offset.y));
    };
    const handleTouchEnd = () => setIsDragging(false);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, offset]);

  const chatPosition = () => {
    let top = position.y - chatHeight;
    let left = position.x - chatWidth + iconSize;
    if (left < 0) left = 0;
    if (top < 0) top = position.y + iconSize;
    if (left + chatWidth > window.innerWidth) left = window.innerWidth - chatWidth;
    if (top + chatHeight > window.innerHeight) top = window.innerHeight - chatHeight;
    return { top, left };
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const whatsappNumber = "2348124106198";
    const baseUrl = `https://wa.me/${whatsappNumber}`;

    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, text]);
      setTyping(false);
      setMessage("");
      window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, "_blank");
    }, 800);
  };

  return (
    <div
      className="fixed z-50 select-none "
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {open && (
        <div
          className="absolute w-80 h-[350px] bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden transition-transform duration-300  dark:bg-[#0E0E1D] dark:text-[#0E0E1D]"
          style={{
            top: chatPosition().top - position.y,
            left: chatPosition().left - position.x,
            borderTop: `3px solid ${brandColor}`,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-[#85C061] text-white p-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/gcftLogo.svg"
                alt="Agent"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover bg-white border-2 border-white"
              />
              <h4 className="text-sm font-semibold">GCFT Support Team</h4>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Chat body */}
          <div className="p-4 h-56 overflow-y-auto text-sm space-y-3 bg-gray-50 flex flex-col">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-lg bg-white shadow-sm self-start"
              >
                {msg}
              </div>
            ))}

            {typing && (
              <div
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm items-center gap-2"
                style={{ backgroundColor: lightBg }}
              >
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </div>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
            )}

            {!messages.length && !typing && (
              <p
                className="text-gray-700 px-3 py-2 rounded-lg inline-block shadow-sm"
                style={{ backgroundColor: lightBg }}
              >
                👋 Shalom! How can we assist you with your registration?
              </p>
            )}

            {/* Quick options */}
            {!typing && (
              <div className="flex flex-col items-start gap-2 mt-2">
                {quickOptions.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(option)}
                    className="text-gray-800 px-4 py-2 rounded-2xl text-left w-auto max-w-[90%] shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: lightBg, border: `1px solid ${brandColor}` }}
                  >
                    💬 {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-t-green-400 p-3 flex gap-2 bg-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-green-500 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-800"
            />
            <button
              onClick={() => sendMessage(message)}
              className="bg-[#85C061] text-white px-4 py-2 rounded-full shadow-sm focus:ring-1 focus:ring-blue-800 hover:bg-green-400"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Chat icon */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full flex items-center justify-center text-white shadow-lg transition hover:scale-105"
        style={{
          backgroundColor: brandColor,
          width: iconSize,
          height: iconSize,
        }}
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
