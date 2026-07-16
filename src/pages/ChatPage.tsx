import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/FormControls";
import { useToast } from "../contexts/ToastContext";
import { chatService } from "../services/chatService";
import { TypewriterText } from "../components/ui/TypewriterText";

export const ChatPage: React.FC = () => {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    [],
  );
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const botReply = await chatService.sendMessage(input);
      setMessages((prev) => [...prev, { text: botReply, isUser: false }]);
    } catch (err) {
      console.error("Chat error:", err);
      addToast("Không thể kết nối tới dịch vụ chat", "error");
      // Optionally rollback user message? We'll keep it and show error.
      setMessages((prev) => [
        ...prev,
        { text: "Xin lỗi, có lỗi xảy ra. Thử lại sau.", isUser: false },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Trò chuyện với AI</h1>

      <div className="h-[60vh] overflow-y-auto mb-4 border border-gray-700 rounded-lg p-4 bg-gray-900">
        {messages.map((msg, idx) => {
          const isLatestBotMsg = !msg.isUser && idx === messages.length - 1;

          return (
            <div
              key={idx}
              className={`mb-2 max-w-[80%] ${msg.isUser ? "ml-auto" : "mr-auto"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${msg.isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-white"}`}
              >
                {isLatestBotMsg ? (
                  <TypewriterText text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={sendMessage} variant="primary">
          Gửi
        </Button>
      </div>
    </div>
  );
};

// Helper hook for mutable array state (optional, but we can just use useState with setter)
// Simpler: just use useState with spread as above.
// We'll keep the above.
