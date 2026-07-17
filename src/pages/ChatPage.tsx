import React, { useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/FormControls";
import { useToast } from "../contexts/ToastContext";
import { chatService } from "../services/chatService";

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export const ChatPage: React.FC = () => {
  const { addToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const question = input;

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        text: question,
        isUser: true,
      },
      {
        text: "",
        isUser: false,
      },
    ]);

    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await chatService.sendMessage(
        question,
        (text) => {
          setMessages((prev) => {
            const arr = [...prev];
            arr[arr.length - 1] = {
              text,
              isUser: false,
            };
            return arr;
          });
        },
        controller.signal
      );
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);

        addToast("Không thể kết nối AI", "error");

        setMessages((prev) => {
          const arr = [...prev];
          arr[arr.length - 1] = {
            text: "Xin lỗi, đã xảy ra lỗi.",
            isUser: false,
          };
          return arr;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stopGenerate = () => {
    abortRef.current?.abort();
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold text-white mb-6">
        Trò chuyện với AI
      </h1>

      <div className="h-[60vh] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 whitespace-pre-wrap ${
                msg.isUser
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {msg.text}

              {!msg.isUser &&
                loading &&
                index === messages.length - 1 && (
                  <span className="animate-pulse">▋</span>
                )}
            </div>
          </div>
        ))}

      </div>

      <div className="mt-4 flex gap-2">

        <Input
          className="flex-1"
          value={input}
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />

        {!loading ? (
          <Button onClick={sendMessage}>
            Gửi
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={stopGenerate}
          >
            Dừng
          </Button>
        )}

      </div>

    </div>
  );
};