import { useState } from "react";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [role, setRole] = useState(null);

  const logout = () => {
    setRole(null);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-xl mx-auto mb-4"></div>

          <h1 className="text-3xl font-semibold mb-2">
            Secure Encrypted Search System
          </h1>

          <p className="text-gray-500">
            AES-256 Encryption • HMAC Trapdoors • SSE/PEKS Protocol
          </p>
        </div>

        {/* ROLE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          
          {/* INTERNAL CARD */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              Internal Analyst
            </h2>

            <p className="text-gray-500 text-sm mb-4">
              Full system access with decryption privileges
            </p>

            <ul className="text-sm space-y-2 mb-6">
              <li>• Upload encrypted documents</li>
              <li>• View encrypted storage</li>
              <li>• Search with decryption (SSE)</li>
              <li>• Access system metrics</li>
            </ul>

            <button
              onClick={() => setRole("internal")}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900"
            >
              Continue as Internal
            </button>
          </div>

          {/* EXTERNAL CARD */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              External Auditor
            </h2>

            <p className="text-gray-500 text-sm mb-4">
              Limited access with search-only capabilities
            </p>

            <ul className="text-sm space-y-2 mb-6">
              <li className="text-gray-400">
                • Upload encrypted documents
              </li>
              <li className="text-gray-400">
                • View encrypted storage
              </li>
              <li>• Search without decryption (PEKS)</li>
              <li>• Access limited metrics</li>
            </ul>

            <button
              onClick={() => setRole("external")}
              className="w-full border py-2 rounded-lg hover:bg-gray-100"
            >
              Continue as External
            </button>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <p className="text-xs text-gray-400 mt-10 text-center max-w-xl">
          Role-Based Access Control (RBAC) • Searchable Symmetric Encryption (SSE)
          • Public Key Encryption with Keyword Search (PEKS)
        </p>
      </div>
    );
  }

  return <Dashboard role={role} logout={logout} />;
}