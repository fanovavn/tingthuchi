import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Trash2,
  User,
} from "lucide-react";

type Person = "Tý" | "Mèo";

interface TimelineItem {
  id: string;
  day: number;
  content: string;
  amount: number;
  type: "income" | "expense";
  person: Person;
}

const initialItems: TimelineItem[] = [
  { id: "1", day: 1, content: "Nhận lương tháng", amount: 28584308, type: "income", person: "Tý" },
  { id: "2", day: 1, content: "Tiền thuê nhà", amount: 5000000, type: "expense", person: "Tý" },
  { id: "3", day: 5, content: "Tiền điện", amount: 492000, type: "expense", person: "Mèo" },
  { id: "4", day: 5, content: "Tiền nước", amount: 150000, type: "expense", person: "Mèo" },
  { id: "5", day: 7, content: "Tiền internet", amount: 250000, type: "expense", person: "Tý" },
  { id: "6", day: 10, content: "Đóng bảo hiểm", amount: 1200000, type: "expense", person: "Tý" },
  { id: "7", day: 10, content: "Tiền học phí con", amount: 3500000, type: "expense", person: "Mèo" },
  { id: "8", day: 15, content: "Nhận lương thưởng", amount: 5000000, type: "income", person: "Mèo" },
  { id: "9", day: 15, content: "Trả nợ vay ngân hàng", amount: 2800000, type: "expense", person: "Tý" },
  { id: "10", day: 20, content: "Tiền gửi tiết kiệm", amount: 5000000, type: "expense", person: "Tý" },
  { id: "11", day: 25, content: "Mua sắm gia đình", amount: 2000000, type: "expense", person: "Mèo" },
  { id: "12", day: 28, content: "Chi phí xăng xe", amount: 800000, type: "expense", person: "Tý" },
];

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

function shortAmount(amount: number): string {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
  return amount.toString();
}

const personColors: Record<Person, { bg: string; text: string; border: string }> = {
  "Tý": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  "Mèo": { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
};

export function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    day: 1,
    content: "",
    amount: "",
    type: "expense" as "income" | "expense",
    person: "Tý" as Person,
  });

  const currentDay = new Date().getDate();
  const dotsBarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dotRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((day: number, el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(day, el);
    else cardRefs.current.delete(day);
  }, []);

  const setDotRef = useCallback((day: number, el: HTMLDivElement | null) => {
    if (el) dotRefs.current.set(day, el);
    else dotRefs.current.delete(day);
  }, []);

  // Scroll to a specific day (grid = scrollIntoView, dots = horizontal scroll)
  const scrollToDay = useCallback((day: number) => {
    const card = cardRefs.current.get(day);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      // Brief highlight effect
      card.classList.add("ring-4", "ring-indigo-300");
      setTimeout(() => card.classList.remove("ring-4", "ring-indigo-300"), 1200);
    }
    const dotsContainer = dotsBarRef.current;
    const dot = dotRefs.current.get(day);
    if (dotsContainer && dot) {
      const scrollLeft = dot.offsetLeft - dotsContainer.offsetWidth / 2 + dot.offsetWidth / 2;
      dotsContainer.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, []);

  // Auto-scroll to today on mount
  useEffect(() => {
    const timer = setTimeout(() => scrollToDay(currentDay), 200);
    return () => clearTimeout(timer);
  }, [currentDay, scrollToDay]);

  const totalIncome = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const totalExpense = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);

  // Per-person totals
  const tyTotal = items.filter((i) => i.person === "Tý").reduce((s, i) => s + (i.type === "expense" ? i.amount : -i.amount), 0);
  const meoTotal = items.filter((i) => i.person === "Mèo").reduce((s, i) => s + (i.type === "expense" ? i.amount : -i.amount), 0);

  // Group items by day
  const dayMap = new Map<number, TimelineItem[]>();
  items.forEach((item) => {
    const existing = dayMap.get(item.day) || [];
    existing.push(item);
    dayMap.set(item.day, existing);
  });

  const getDayTotals = (day: number) => {
    const dayItems = dayMap.get(day);
    if (!dayItems) return null;
    const inc = dayItems.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const exp = dayItems.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
    return { income: inc, expense: exp };
  };

  const handleAdd = () => {
    if (!newItem.content || !newItem.amount) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        day: newItem.day,
        content: newItem.content,
        amount: Number(newItem.amount),
        type: newItem.type,
        person: newItem.person,
      },
    ]);
    setNewItem({ day: 1, content: "", amount: "", type: "expense", person: "Tý" });
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Render a single day card (shared between all breakpoints)
  const renderDayCard = (day: number) => {
    const isToday = day === currentDay;
    const isPast = day < currentDay;
    const hasItems = dayMap.has(day);
    const dayItems = dayMap.get(day) || [];

    return (
      <div
        key={day}
        ref={(el) => setCardRef(day, el)}
        className={`rounded-xl border-2 flex flex-col transition-all ${
          isToday
            ? "border-indigo-400 bg-indigo-50/40"
            : isPast
              ? "border-gray-200 bg-gray-50/60"
              : hasItems
                ? "border-orange-200 bg-orange-50/30"
                : "border-gray-100 bg-white"
        }`}
        style={{ minHeight: "220px" }}
      >
        {/* Card header */}
        <div
          className={`flex flex-col items-center py-3 border-b ${
            isToday ? "border-indigo-200" : isPast ? "border-gray-200" : "border-gray-100"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isToday
                ? "bg-indigo-600 text-white ring-[3px] ring-indigo-200"
                : isPast
                  ? "bg-gray-300 text-white"
                  : hasItems
                    ? "bg-orange-400 text-white"
                    : "bg-gray-100 text-gray-400"
            }`}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {day}
          </div>
          <span
            className={`mt-1 ${
              isToday ? "text-indigo-600" : isPast ? "text-gray-400" : "text-gray-500"
            }`}
            style={{ fontSize: "10px", fontWeight: isToday ? 600 : 400 }}
          >
            {isToday ? "Hôm nay" : `Ngày ${day}`}
          </span>
        </div>

        {/* Items */}
        {hasItems && (
          <div className="flex-1 p-2 flex flex-col gap-2">
            {dayItems.map((item) => {
              const pc = personColors[item.person];
              return (
                <div
                  key={item.id}
                  className={`group rounded-lg p-2.5 border transition-all hover:shadow-sm ${
                    isToday
                      ? "border-indigo-200 bg-white/80"
                      : isPast
                        ? "border-gray-200 bg-white/60"
                        : "border-orange-100 bg-white/80"
                  }`}
                >
                  <div className="flex items-start gap-1.5 mb-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === "income" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {item.type === "income" ? (
                        <ArrowDownCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={isPast ? "text-gray-400" : "text-gray-800"}
                        style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.3 }}
                      >
                        {item.content}
                      </div>
                      <div className="text-gray-400" style={{ fontSize: "10px" }}>
                        {item.type === "income" ? "Thu nhập" : "Chi tiêu"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Person badge + amount */}
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}
                      style={{ fontSize: "9px", fontWeight: 500 }}
                    >
                      <User className="w-2.5 h-2.5" />
                      {item.person}
                    </span>
                    <span
                      className={`${
                        item.type === "income"
                          ? isPast ? "text-gray-400" : "text-green-600"
                          : isPast ? "text-gray-400" : "text-red-500"
                      }`}
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    >
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Tuần Hoàn Chi Tiêu</h1>
          <p className="text-gray-400" style={{ fontSize: "14px" }}>
            Theo dõi thu/chi định kỳ trong tháng (cố định 30 ngày)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
          style={{ fontSize: "14px" }}
        >
          <Plus className="w-4 h-4" />
          Thêm hạng mục
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Tổng Thu Dự Kiến</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="text-green-600" style={{ fontSize: "22px", fontWeight: 600 }}>
            {formatCurrency(totalIncome)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>
            {items.filter((i) => i.type === "income").length} khoản thu
          </span>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Tổng Chi Dự Kiến</span>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="text-red-500" style={{ fontSize: "22px", fontWeight: 600 }}>
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>
            {items.filter((i) => i.type === "expense").length} khoản chi
          </span>
        </div>
        <div className="bg-white rounded-xl border border-indigo-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Chênh Lệch</span>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div
            className={totalIncome - totalExpense >= 0 ? "text-indigo-600" : "text-red-500"}
            style={{ fontSize: "22px", fontWeight: 600 }}
          >
            {totalIncome - totalExpense >= 0 ? "+" : ""}
            {formatCurrency(totalIncome - totalExpense)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>Dư/thiếu cuối tháng</span>
        </div>
      </div>

      {/* Person Summary - compact inline */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white rounded-xl border border-gray-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-gray-500" style={{ fontSize: "13px" }}>Tý cần xử lý</span>
          <span className="text-blue-600" style={{ fontSize: "15px", fontWeight: 600 }}>
            {formatCurrency(items.filter((i) => i.person === "Tý" && i.type === "expense").reduce((s, i) => s + i.amount, 0))}
          </span>
        </div>
        <div className="w-px h-6 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-pink-600" />
          </div>
          <span className="text-gray-500" style={{ fontSize: "13px" }}>Mèo cần xử lý</span>
          <span className="text-pink-600" style={{ fontSize: "15px", fontWeight: 600 }}>
            {formatCurrency(items.filter((i) => i.person === "Mèo" && i.type === "expense").reduce((s, i) => s + i.amount, 0))}
          </span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
        <h3 className="mb-4">Timeline 30 ngày</h3>

        {/* Dots bar - clickable, horizontal scroll */}
        <div ref={dotsBarRef} className="flex gap-1 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => {
            const isToday = day === currentDay;
            const isPast = day < currentDay;
            const hasItems = dayMap.has(day);
            const totals = getDayTotals(day);
            return (
              <div
                key={day}
                ref={(el) => setDotRef(day, el)}
                className="flex flex-col items-center shrink-0 cursor-pointer"
                style={{ minWidth: "36px" }}
                onClick={() => scrollToDay(day)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                    isToday
                      ? "bg-indigo-600 text-white ring-[3px] ring-indigo-200"
                      : hasItems && isPast
                        ? "bg-gray-400 text-white"
                        : hasItems
                          ? "bg-orange-400 text-white"
                          : isPast
                            ? "bg-gray-200 text-gray-400"
                            : "bg-gray-100 text-gray-400"
                  }`}
                  style={{ fontSize: "11px", fontWeight: isToday ? 700 : 500 }}
                >
                  {day}
                </div>
                {totals && (
                  <div className="flex flex-col items-center mt-0.5">
                    {totals.income > 0 && (
                      <span className="text-green-500" style={{ fontSize: "8px", fontWeight: 600, lineHeight: 1.2 }}>
                        +{shortAmount(totals.income)}
                      </span>
                    )}
                    {totals.expense > 0 && (
                      <span className="text-red-400" style={{ fontSize: "8px", fontWeight: 600, lineHeight: 1.2 }}>
                        -{shortAmount(totals.expense)}
                      </span>
                    )}
                  </div>
                )}
                {!totals && <div style={{ height: "12px" }} />}
              </div>
            );
          })}
        </div>

        {/* Grid layout: 7 cols on xl, responsive wrap on smaller */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {days.map((day) => renderDayCard(day))}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3>Thêm hạng mục theo dõi</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {/* Type selector */}
              <div>
                <label className="block mb-2 text-gray-600" style={{ fontSize: "13px" }}>Loại</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewItem((p) => ({ ...p, type: "expense" }))}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                      newItem.type === "expense"
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                    style={{ fontSize: "13px" }}
                  >
                    Chi tiêu
                  </button>
                  <button
                    onClick={() => setNewItem((p) => ({ ...p, type: "income" }))}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                      newItem.type === "income"
                        ? "bg-green-50 border-green-200 text-green-600"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                    style={{ fontSize: "13px" }}
                  >
                    Thu nhập
                  </button>
                </div>
              </div>

              {/* Person selector */}
              <div>
                <label className="block mb-2 text-gray-600" style={{ fontSize: "13px" }}>Người xử lý</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewItem((p) => ({ ...p, person: "Tý" }))}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                      newItem.person === "Tý"
                        ? "bg-blue-50 border-blue-300 text-blue-600"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                    style={{ fontSize: "13px" }}
                  >
                    <User className="w-4 h-4" />
                    Tý
                  </button>
                  <button
                    onClick={() => setNewItem((p) => ({ ...p, person: "Mèo" }))}
                    className={`flex-1 py-2.5 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                      newItem.person === "Mèo"
                        ? "bg-pink-50 border-pink-300 text-pink-600"
                        : "bg-white border-gray-200 text-gray-500"
                    }`}
                    style={{ fontSize: "13px" }}
                  >
                    <User className="w-4 h-4" />
                    Mèo
                  </button>
                </div>
              </div>

              {/* Day */}
              <div>
                <label className="block mb-2 text-gray-600" style={{ fontSize: "13px" }}>Ngày trong tháng</label>
                <select
                  value={newItem.day}
                  onChange={(e) => setNewItem((p) => ({ ...p, day: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  style={{ fontSize: "14px" }}
                >
                  {days.map((d) => (
                    <option key={d} value={d}>Ngày {d}</option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block mb-2 text-gray-600" style={{ fontSize: "13px" }}>Nội dung</label>
                <input
                  type="text"
                  value={newItem.content}
                  onChange={(e) => setNewItem((p) => ({ ...p, content: e.target.value }))}
                  placeholder="VD: Tiền thuê nhà, Lương tháng..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  style={{ fontSize: "14px" }}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block mb-2 text-gray-600" style={{ fontSize: "13px" }}>Số tiền (VNĐ)</label>
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="VD: 5000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newItem.content || !newItem.amount}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ fontSize: "14px" }}
              >
                Thêm hạng mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}