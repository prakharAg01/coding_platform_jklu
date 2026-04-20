import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, PlusCircle, Search, Filter } from "lucide-react";
import { Context } from "../main";
import MainLayout from "../layout/MainLayout";
import { fetchMyContests } from "../api/contestApi";

const STATUS_CONFIG = {
  live: { label: "Live", color: "bg-green-500/10 text-green-400 border-green-500/30", icon: "" },
  upcoming: { label: "Upcoming", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: "" },
  ended: { label: "Ended", color: "bg-red-500/10 text-red-400 border-red-500/30", icon: "" },
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-400 border-gray-500/30", icon: "" },
};

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
  { value: "draft", label: "Draft" },
];

export default function TADashboard() {
  const { user } = useContext(Context);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadContests = async () => {
      try {
        const data = await fetchMyContests();
        setContests(data);
      } catch (err) {
        console.error("Failed to load contests:", err);
      } finally {
        setLoading(false);
      }
    };
    loadContests();
  }, []);

  const getContestStatus = (contest) => {
    if (contest.is_active === false) {
      return "draft";
    }
    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);

    if (!contest.start_time) {
      return "draft";
    } else if (now < start) {
      return "upcoming";
    } else if (now >= start && now <= end) {
      return "live";
    } else {
      return "ended";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr || dateStr === "TBD") return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredContests = contests.filter((contest) => {
    const matchesSearch = contest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getContestStatus(contest);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <LayoutDashboard className="text-brand-yellow" size={28} />
              TA Dashboard
            </h1>
            <p className="text-sm text-muted mt-1">Manage contests where you have Creator or Moderator permissions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-bg-light border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all group"
            >
              <User size={18} className="text-muted group-hover:text-white transition-colors" />
              Switch to User Dashboard
            </Link>
            <Link
              to="/create-contest"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-bg-dark hover:opacity-90 transition-all shadow-lg"
            >
              <PlusCircle size={18} />
              Create Contest
            </Link>
          </div>
        </div>

        <div className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search contests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-dark border border-white/10 rounded-lg text-white placeholder-muted focus:outline-none focus:border-brand-yellow transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-bg-dark border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-yellow transition-colors appearance-none cursor-pointer"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value} className="bg-bg-dark">
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-8 h-8 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
              <p className="text-sm text-muted mt-4">Loading your contests...</p>
            </div>
          ) : filteredContests.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard size={32} className="text-muted" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {contests.length === 0 ? "No contests yet" : "No matching contests"}
              </h3>
              <p className="text-sm text-muted max-w-md">
                {contests.length === 0
                  ? "You haven't created or moderated any contests. Click Create Contest above to set up your first assessment."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Contest Name</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-center">Participants</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider">Start Date & Time</th>
                    <th className="px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredContests.map((contest) => {
                    const status = getContestStatus(contest);
                    const statusConfig = STATUS_CONFIG[status];
                    return (
                      <tr key={contest._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">{contest.name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-muted">
                            {contest.isOwner ? "Creator" : "Moderator"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm text-muted">
                            {contest.participants?.length || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white">
                            {formatDateTime(contest.start_time)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/manage-contest/${contest._id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand-yellow hover:underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </MainLayout>
  );
}