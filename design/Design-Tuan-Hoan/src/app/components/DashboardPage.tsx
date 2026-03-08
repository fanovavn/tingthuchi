import { TrendingUp, TrendingDown, ArrowLeftRight, RefreshCw } from "lucide-react";

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + " đ";
}

export function DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Dashboard</h1>
          <p className="text-gray-400" style={{ fontSize: "14px" }}>
            Tổng quan tài chính của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Tổng Thu Nhập</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="text-green-600" style={{ fontSize: "22px", fontWeight: 600 }}>
            {formatCurrency(28584308)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>Tổng số tiền thu được</span>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Tổng Chi Tiêu</span>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="text-red-500" style={{ fontSize: "22px", fontWeight: 600 }}>
            {formatCurrency(17602792)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>Tổng số tiền đã chi</span>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Chênh Lệch</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="text-blue-600" style={{ fontSize: "22px", fontWeight: 600 }}>
            {formatCurrency(10981516)}
          </div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>57 giao dịch</span>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500" style={{ fontSize: "13px" }}>Chỉ Số Dư Dả</span>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div className="text-green-600" style={{ fontSize: "22px", fontWeight: 600 }}>38.4%</div>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>38.4% thu nhập</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-400 text-center py-12" style={{ fontSize: "14px" }}>
          Chọn "Timeline Tháng" ở menu bên trái để xem timeline tài chính gia đình.
        </p>
      </div>
    </div>
  );
}
