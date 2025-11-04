export default function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
          isUser ? "bg-brand-200 text-zinc-900" : "bg-zinc-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
