// src/services/chatService.ts

export const chatService = {
  sendMessage: async (
    message: string,
    onChunk: (text: string) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    const API_URL =
      // "http://localhost:8082/v1/messages";
      "https://fc-manager-be.onrender.com/v1/messages";

    const API_KEY = "freecc";

    const payload = {
      system:
        "Bạn là trợ lý AI. Luôn trả lời hoàn toàn bằng tiếng Việt. Chỉ sử dụng tiếng Anh khi người dùng yêu cầu hoặc khi phải giữ nguyên tên riêng, tên hàm hoặc đoạn mã.",
      model: "claude-sonnet-4-6",
      stream: true,
      max_tokens: 10000,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `API Error ${response.status}: ${response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let answer = "";
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const dataLine = event
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (!dataLine) continue;

        const jsonString = dataLine
          .replace(/^data:\s*/, "")
          .trim();

        if (
          jsonString === "[DONE]" ||
          jsonString.length === 0
        ) {
          continue;
        }

        try {
          const json = JSON.parse(jsonString);

          switch (json.type) {
            case "content_block_delta":
              if (json.delta?.text) {
                answer += json.delta.text;
                onChunk(answer);
              }
              break;

            case "message_stop":
              return;

            default:
              break;
          }
        } catch (e) {
          console.warn("Cannot parse SSE:", jsonString);
        }
      }
    }
  },
};