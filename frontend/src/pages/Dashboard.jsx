import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadPage from "../components/UploadPage";
import SearchPage from "../components/SearchPage";
import StoragePage from "../components/StoragePage";
import MetricsPage from "../components/MetricsPage";

export default function Dashboard({ role, logout }) {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        logout={logout}
      />

      {/* CONTENT */}
      {activeTab === "upload" && role === "internal" && <UploadPage />}
      {activeTab === "search" && <SearchPage role = {role} />}
      {activeTab === "storage" && role === "internal" && <StoragePage />}
      {activeTab === "metrics" && <MetricsPage />}
    </div>
  );
}