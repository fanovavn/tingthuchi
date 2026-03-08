import { Construction } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
      <Construction className="w-12 h-12 mb-4 text-gray-300" />
      <h2 className="text-gray-500 mb-2">{title}</h2>
      <p style={{ fontSize: "14px" }}>Tính năng đang được phát triển</p>
    </div>
  );
}
