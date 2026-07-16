// src/services/chatService.ts
// Service to call the external AI API as per provided curl command.

export const chatService = {
  /**
   * Send a user message to the AI backend and return the assistant's reply.
   * @param message - The user's input text.
   * @returns Promise resolving to the assistant's response string.
   */
  sendMessage: async (message: string): Promise<string> => {
    const API_URL = 'http://localhost:8082/v1/messages';
    const API_KEY = 'freecc'; // as provided in the curl header

    const payload = {
      system: "Bạn là trợ lý AI. Luôn trả lời hoàn toàn bằng tiếng Việt. Chỉ sử dụng tiếng Anh khi người dùng yêu cầu hoặc khi phải giữ nguyên tên riêng, tên hàm hoặc đoạn mã.",
      model: "claude-sonnet-4-6",
      max_tokens: 10000,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If the server returns an error, throw with status text
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Assuming the API returns a structure similar to Anthropic's message API:
      // { id, type, role, content: [{ type: 'text', text: '...' }], ... }
      // We'll extract the first text block's text.
      if (Array.isArray(data.content)) {
        const textPart = data.content.find((part: any) => part.type === 'text');
        if (textPart && typeof textPart.text === 'string') {
          return textPart.text;
        }
      }
      // Fallback: if the response has a plain 'output' or 'text' field
      if (typeof data.output === 'string') return data.output;
      if (typeof data.text === 'string') return data.text;

      // If we can't parse, return a generic message
      return 'Không thể phân tích phản hồi từ máy chủ AI.';
    } catch (err) {
      console.error('Chat API error:', err);
      // Return a user‑friendly message; in production you might want to show a toast instead.
      return `Đã xảy ra lỗi khi kết nối tới dịch vụ AI: ${err instanceof Error ? err.message : String(err)}`;
    }
  },
};