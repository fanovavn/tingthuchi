import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { TimelinePage } from "./components/TimelinePage";
import { PlaceholderPage } from "./components/PlaceholderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      {
        path: "giao-dich",
        Component: () => PlaceholderPage({ title: "Giao dịch" }),
      },
      {
        path: "tiet-kiem",
        Component: () => PlaceholderPage({ title: "Tiết kiệm" }),
      },
      {
        path: "danh-muc",
        Component: () => PlaceholderPage({ title: "Danh mục" }),
      },
      { path: "timeline", Component: TimelinePage },
      {
        path: "tong-ket-nam",
        Component: () => PlaceholderPage({ title: "Tổng Kết Năm" }),
      },
      {
        path: "cai-dat",
        Component: () => PlaceholderPage({ title: "Cài đặt" }),
      },
    ],
  },
]);
