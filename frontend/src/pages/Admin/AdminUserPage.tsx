import { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus, getUserStats } from "../../services/adminApi";
import {
  Search,
  Users,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X
} from "lucide-react";
import { motion } from "framer-motion";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await getAllUsers({ page, size, search });
      if (res?.success) {
        const raw = res.data?.content || res.data?.users || res.data || [];
        const normalized = (raw || []).map((u: any) => ({
          ...u,
          id: u.id?.toString ? u.id.toString() : u.id,
          username: u.username || u.userName || u.name,
          email: u.email || u.mail,
          role: (u.role || (u.isAdmin ? 'ADMIN' : 'USER') || '').toString(),
          isActive: (u.isActive !== undefined && u.isActive !== null) ? u.isActive : (u.active !== undefined ? u.active : !!u.enabled || false)
        }));
        // Hide ADMIN users on the UI (they remain in the database)
        const visible = normalized.filter((u: any) => (u.role || '').toUpperCase() !== 'ADMIN');
        setUsers(visible);
      } else {
        setMsg(res?.message || "Failed to load");
      }
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const toggleActive = async (u: any) => {
    const newActive = !u.isActive;
    const res: any = await updateUserStatus(u.id, { isActive: newActive });
    if (res?.success) {
      setMsg("User status updated");
      // update local state quickly
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: newActive } : x));
    } else {
      setMsg(res?.message || "Failed to update status");
    }
    setTimeout(() => setMsg(null), 3000);
  };

  // Modal for user details/stats
  const [modalUser, setModalUser] = useState<any | null>(null);

  const showStats = async (u: any) => {
    try {
      const res: any = await getUserStats(u.id);
      if (res?.success) {
        const s = res.data || {};
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, _stats: s } : x));
        setModalUser({ ...u, _stats: s });
      } else {
        setModalUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setModalUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Monitor and manage user accounts</p>
        </div>
        <div className="relative">
          <input
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm">
          {msg}
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.username}</div>
                        <div className="text-xs text-gray-400">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                      {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => showStats(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        className={`p-2 rounded-lg transition-colors ${u.isActive
                            ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        title={u.isActive ? "Disable User" : "Enable User"}
                      >
                        {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-900">{page + 1}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {modalUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{modalUser.username}</h3>
                  <p className="text-sm text-gray-500">{modalUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setModalUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-2 text-green-700 font-medium text-sm">
                    <TrendingDown className="w-4 h-4" />
                    Deposits
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{modalUser._stats?.totalDeposits ?? 0} <span className="text-sm font-normal text-gray-500">USDT</span></div>
                  <div className="text-xs text-gray-500 mt-1">{modalUser._stats?.depositCount ?? 0} transactions</div>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-2 text-red-700 font-medium text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Withdrawals
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{modalUser._stats?.totalWithdrawals ?? 0} <span className="text-sm font-normal text-gray-500">USDT</span></div>
                  <div className="text-xs text-gray-500 mt-1">{modalUser._stats?.withdrawalCount ?? 0} transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;