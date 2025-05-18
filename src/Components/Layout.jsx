import Sidebar from "./Components/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ activePage, setActivePage }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
