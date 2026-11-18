
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Globe,
  History,
  KeyRound,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Trash2,
  Copy,
  Check,
  Activity,
  Code2,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Menu,
  X,
  Clock3,
  CircleCheck,
  AlertCircle,
  Sparkles,
  Terminal,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import { scrapeWebsite } from "./api/scraper";
import { getHistory } from "./api/history";
import { generateApiKey } from "./api/apiKeys";

/* --------------------------------------------------
   SMALL REUSABLE COMPONENTS
-------------------------------------------------- */

function IconBox({ icon: Icon, color = "green", size = "md" }) {
  const colors = {
    green: "bg-green-soft text-green",
    purple: "bg-purple-soft text-purple",
    blue: "bg-blue-soft text-blue",
  };

  const sizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${
        colors[color]
      } ${sizes[size]}`}
    >
      <Icon size={size === "sm" ? 17 : 20} />
    </div>
  );
}

function PageHeading({ title, description, children }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="mb-4 rounded-2xl bg-blue-soft p-4 text-blue">
        <Icon size={27} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const success = ["success", "completed", "successful"].includes(
    String(status || "").toLowerCase()
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        success
          ? "bg-green-soft text-green"
          : "bg-purple-soft text-purple"
      }`}
    >
      {success ? <CircleCheck size={13} /> : <Clock3 size={13} />}
      {status || "Unknown"}
    </span>
  );
}

function LoadingSpinner() {
  return <RefreshCw className="animate-spin" size={17} />;
}

/* --------------------------------------------------
   PROTECTED ROUTE
-------------------------------------------------- */

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* --------------------------------------------------
   MAIN APPLICATION LAYOUT
-------------------------------------------------- */

function DashboardLayout() {
  const { username, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDark = resolvedTheme === "dark";

  const navigation = [
    {
      label: "Workspace",
      items: [
        {
          name: "Overview",
          path: "/",
          icon: LayoutDashboard,
          color: "green",
        },
        {
          name: "Scrape Website",
          path: "/scrape",
          icon: Globe,
          color: "purple",
        },
        {
          name: "History",
          path: "/history",
          icon: History,
          color: "blue",
        },
      ],
    },
    {
      label: "Developer",
      items: [
        {
          name: "API Keys",
          path: "/keys",
          icon: KeyRound,
          color: "purple",
        },
        {
          name: "Settings",
          path: "/settings",
          icon: Settings,
          color: "blue",
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-surface transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[78px] items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green to-blue text-white shadow-lg shadow-green/20">
              <Code2 size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Ash<span className="text-green">parse</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
                Web intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          {navigation.map((group) => (
            <div key={group.label} className="mb-8">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-muted-foreground">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Promo card */}
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-green via-blue to-purple p-4 text-white">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[12px] border-white/10" />
            <Sparkles size={22} className="mb-3" />
            <h3 className="font-bold">Build smarter</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              Extract website data and turn it into useful information.
            </p>
            <button
              onClick={() => navigate("/scrape")}
              className="mt-4 flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur hover:bg-white/30"
            >
              Start scraping <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* User area */}
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-alt p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple to-blue text-sm font-bold text-white">
              {(username || "U").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {username || "User"}
              </p>
              <p className="text-xs text-muted-foreground">Ashparse account</p>
            </div>

            <div className="h-2 w-2 rounded-full bg-green" />
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-purple transition hover:bg-purple-soft"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-border bg-surface/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-sm font-semibold">Welcome back!</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Your web data workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-green-soft px-3 py-1.5 text-xs font-semibold text-green sm:flex">
              <span className="h-2 w-2 rounded-full bg-green" />
              System ready
            </div>

            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="rounded-xl border border-border bg-surface-alt p-2.5 transition hover:border-blue hover:text-blue"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple to-blue text-sm font-bold text-white">
              {(username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 sm:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/scrape" element={<ScrapePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/keys" element={<KeysPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   DASHBOARD PAGE
-------------------------------------------------- */

function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getHistory();
      const data = response.data || response;

      setHistory(data.history || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const total = history.length;

  const completed = history.filter((item) =>
    ["success", "completed", "successful"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  const stats = [
    {
      title: "Total requests",
      value: total,
      icon: Globe,
      color: "green",
      note: "All recorded scrape jobs",
    },
    {
      title: "Successful jobs",
      value: completed,
      icon: CircleCheck,
      color: "blue",
      note: "Successfully completed",
    },
    {
      title: "Success rate",
      value: total ? `${Math.round((completed / total) * 100)}%` : "0%",
      icon: Activity,
      color: "purple",
      note: "Based on your history",
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeading
        title="Dashboard"
        description="Monitor your scraping activity and manage your workspace."
      >
        <button onClick={loadDashboard} className="secondary-button">
          <RefreshCw size={16} />
          Refresh
        </button>
      </PageHeading>

      <div className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-green via-blue to-purple p-6 text-white shadow-lg shadow-blue/10 sm:p-8">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute right-32 top-20 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative max-w-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles size={14} />
            Your scraping workspace
          </div>

          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Turn websites into data.
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85">
            Extract structured information from websites using simple CSS
            selectors. Your data workspace starts here.
          </p>

          <NavLink
            to="/scrape"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#247c68] shadow-lg transition hover:-translate-y-0.5"
          >
            <Globe size={16} />
            Start scraping
            <ArrowUpRight size={16} />
          </NavLink>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="card-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <p className="mt-3 text-3xl font-extrabold tracking-tight">
                  {loading ? "—" : stat.value}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.note}
                </p>
              </div>

              <IconBox icon={stat.icon} color={stat.color} size="lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="font-bold">Recent activity</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Your latest scraping requests
              </p>
            </div>

            <NavLink
              to="/history"
              className="flex items-center gap-1 text-xs font-bold text-blue hover:underline"
            >
              View all <ChevronRight size={15} />
            </NavLink>
          </div>

          {error ? (
            <div className="p-5 text-sm text-red-500">{error}</div>
          ) : loading ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <LoadingSpinner />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity yet"
              description="Your successful scraping requests will appear here."
            />
          ) : (
            <div className="divide-y divide-border">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 transition hover:bg-surface-alt sm:px-5"
                >
                  <IconBox icon={Globe} color="blue" size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.url}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card-surface p-5">
          <div className="mb-5 flex items-center gap-3">
            <IconBox icon={Zap} color="purple" />
            <div>
              <h3 className="font-bold">Quick actions</h3>
              <p className="text-xs text-muted-foreground">
                Jump into your workspace
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <NavLink
              to="/scrape"
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition hover:border-green hover:bg-green-soft/40"
            >
              <IconBox icon={Globe} color="green" size="sm" />
              <div className="flex-1">
                <p className="text-sm font-bold">Scrape a website</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Extract data using CSS selectors
                </p>
              </div>
              <ArrowUpRight size={17} className="text-green" />
            </NavLink>

            <NavLink
              to="/history"
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition hover:border-blue hover:bg-blue-soft/40"
            >
              <IconBox icon={History} color="blue" size="sm" />
              <div className="flex-1">
                <p className="text-sm font-bold">View history</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review previous scraping jobs
                </p>
              </div>
              <ArrowUpRight size={17} className="text-blue" />
            </NavLink>

            <NavLink
              to="/keys"
              className="flex items-center gap-3 rounded-xl border border-border p-4 transition hover:border-purple hover:bg-purple-soft/40"
            >
              <IconBox icon={KeyRound} color="purple" size="sm" />
              <div className="flex-1">
                <p className="text-sm font-bold">Generate API key</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a key for API access
                </p>
              </div>
              <ArrowUpRight size={17} className="text-purple" />
            </NavLink>
          </div>

          <div className="mt-5 rounded-xl bg-blue-soft p-4 dark:bg-blue-soft">
            <div className="flex items-center gap-2 text-blue">
              <ShieldCheck size={17} />
              <span className="text-sm font-bold">Secure workspace</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Your scraping endpoints require authentication. Keep your API
              keys private.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   SCRAPE WEBSITE PAGE
-------------------------------------------------- */

function ScrapePage() {
  const [url, setUrl] = useState("");
  const [selectors, setSelectors] = useState([
    { id: 1, name: "title", selector: "title" },
    { id: 2, name: "heading", selector: "h1" },
  ]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const updateSelector = (id, field, value) => {
    setSelectors((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addSelector = () => {
    setSelectors((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        selector: "",
      },
    ]);
  };

  const removeSelector = (id) => {
    setSelectors((current) => current.filter((item) => item.id !== id));
  };

  const handleScrape = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    const selectorObject = {};

    for (const item of selectors) {
      if (!item.name.trim() || !item.selector.trim()) {
        setError("Please fill in every selector name and CSS selector.");
        return;
      }

      selectorObject[item.name.trim()] = item.selector.trim();
    }

    if (Object.keys(selectorObject).length === 0) {
      setError("Add at least one CSS selector.");
      return;
    }

    try {
      setLoading(true);

      const response = await scrapeWebsite({
        url: url.trim(),
        selectors: selectorObject,
      });

      setResult(response.data || response);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Scraping failed. Please check the URL and selectors."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResults = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(result, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy results to clipboard.");
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeading
        title="Scrape website"
        description="Enter a website URL and define the CSS selectors for the data you need."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <IconBox icon={Globe} color="green" />
            <div>
              <h2 className="font-bold">New scraping request</h2>
              <p className="text-xs text-muted-foreground">
                Configure your extraction
              </p>
            </div>
          </div>

          <form onSubmit={handleScrape} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Website URL
              </label>

              <div className="relative">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder=""
                  className="input-field pl-10"
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Enter a public website URL starting with https:// or http://
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold">
                    CSS selectors
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Give each selector a name
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSelector}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-soft px-3 py-2 text-xs font-bold text-purple transition hover:brightness-95"
                >
                  <Plus size={15} />
                  Add selector
                </button>
              </div>

              <div className="space-y-3">
                {selectors.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-surface-alt p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">
                        SELECTOR {index + 1}
                      </span>

                      {selectors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSelector(item.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                          title="Remove selector"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          Result name
                        </label>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateSelector(item.id, "name", e.target.value)
                          }
                          placeholder="heading"
                          className="input-field text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                          CSS selector
                        </label>
                        <input
                          value={item.selector}
                          onChange={(e) =>
                            updateSelector(
                              item.id,
                              "selector",
                              e.target.value
                            )
                          }
                          placeholder="h1"
                          className="input-field font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full py-3"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Scraping website...
                </>
              ) : (
                <>
                  <Zap size={17} />
                  Start scraping
                </>
              )}
            </button>
          </form>
        </section>

        {/* Result panel */}
        <section className="card-surface min-h-[390px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <IconBox icon={Terminal} color="blue" size="sm" />
              <div>
                <h2 className="font-bold">Response preview</h2>
                <p className="text-xs text-muted-foreground">
                  Your extracted data
                </p>
              </div>
            </div>

            {result && (
              <button
                onClick={copyResults}
                className="secondary-button px-3 py-2 text-xs"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {result ? (
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-soft p-3 text-sm font-semibold text-green">
                <CircleCheck size={17} />
                Scraping response received
              </div>

              <pre className="max-h-[480px] overflow-auto rounded-xl bg-[#111827] p-4 text-xs leading-6 text-[#b8f5d5]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : (
            <EmptyState
              icon={Code2}
              title="Waiting for response"
              description="Your extracted website data will appear here after you start scraping."
            />
          )}
        </section>
      </div>

      <div className="mt-5 rounded-2xl border border-blue/20 bg-blue-soft/60 p-5 dark:bg-blue-soft/30">
        <div className="flex items-start gap-3">
          <IconBox icon={Sparkles} color="blue" size="sm" />
          <div>
            <h3 className="text-sm font-bold">Quick CSS selector guide</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Use <code className="font-bold">h1</code> for headings,{" "}
              <code className="font-bold">p</code> for paragraphs,{" "}
              <code className="font-bold">.price</code> for a class, and{" "}
              <code className="font-bold">#title</code> for an ID. Ashparse
              extracts text content from matching elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   HISTORY PAGE
-------------------------------------------------- */

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getHistory();
      const data = response.data || response;

      setHistory(data.history || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Could not load scraping history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const copyResults = async () => {
    if (!selectedJob) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(selectedJob.results || {}, null, 2)
      );

      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy results to clipboard.");
    }
  };

  const successfulJobs = history.filter((item) =>
    ["success", "completed", "successful"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="animate-fade-up">
      <PageHeading
        title="Scraping history"
        description="Review your previous scraping requests and their results."
      >
        <button onClick={loadHistory} className="secondary-button">
          <RefreshCw size={16} />
          Refresh
        </button>
      </PageHeading>

      {/* Statistics */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="card-surface flex items-center gap-4 p-5">
          <IconBox icon={History} color="blue" />
          <div>
            <p className="text-xs text-muted-foreground">Total jobs</p>
            <p className="mt-1 text-2xl font-extrabold">
              {loading ? "—" : history.length}
            </p>
          </div>
        </div>

        <div className="card-surface flex items-center gap-4 p-5">
          <IconBox icon={CircleCheck} color="green" />
          <div>
            <p className="text-xs text-muted-foreground">
              Successful jobs
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              {loading ? "—" : successfulJobs}
            </p>
          </div>
        </div>
      </div>

      {/* History table */}
      <section className="card-surface overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-bold">All requests</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your recorded scraping activity
          </p>
        </div>

        {error && (
          <div className="p-5 text-sm text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-14 text-muted-foreground">
            <LoadingSpinner />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No scraping history"
            description="When you successfully scrape a website, the request will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-surface-alt text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Website</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Job ID</th>
                  <th className="px-5 py-4 font-semibold">Results</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {history.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="max-w-[280px] px-5 py-4">
                      <div className="flex items-center gap-2">
                        <IconBox icon={Globe} color="blue" size="sm" />
                        <span className="truncate font-medium">
                          {item.url}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      #{item.id}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelectedJob(item);
                          setCopied(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-soft px-3 py-2 text-xs font-bold text-blue transition hover:brightness-95"
                      >
                        <Eye size={14} />
                        View Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Results Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-result-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="min-w-0">
                <h2
                  id="history-result-title"
                  className="font-bold"
                >
                  Scraping Results
                </h2>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {selectedJob.url}
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close results"
              >
                <X size={20} />
              </button>
            </div>

            {/* Job details */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="font-semibold">
                Job #{selectedJob.id}
              </span>

              <StatusBadge status={selectedJob.status} />

              <span>
                {selectedJob.created_at
                  ? new Date(selectedJob.created_at).toLocaleString()
                  : "Date unavailable"}
              </span>
            </div>

            {/* Results content */}
            <div className="max-h-[60vh] overflow-y-auto p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">
                    Extracted data
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Original results saved from this scraping job
                  </p>
                </div>

                <button
                  onClick={copyResults}
                  className="secondary-button px-3 py-2 text-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              </div>

              <pre className="overflow-auto rounded-xl bg-[#111827] p-4 text-xs leading-6 text-[#b8f5d5]">
                {JSON.stringify(selectedJob.results || {}, null, 2)}
              </pre>

              {/* Selectors */}
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold">
                  CSS Selectors used
                </h3>

                <pre className="overflow-auto rounded-xl bg-surface-alt p-4 text-xs leading-6 text-foreground">
                  {JSON.stringify(
                    selectedJob.selectors || {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end border-t border-border p-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="secondary-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   API KEYS PAGE
-------------------------------------------------- */

function KeysPage() {
  const [apiKey, setApiKey] = useState("");
  const [keyName, setKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setApiKey("");

      const response = await generateApiKey({
        name: keyName.trim() || "My API Key",
      });

      const data = response.data || response;

      if (data.api_key) {
        setApiKey(data.api_key);
      } else {
        setError(data.message || "The API key was not returned.");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Could not generate API key."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy API key.");
    }
  };

  return (
    <div className="animate-fade-up">
      <PageHeading
        title="API keys"
        description="Generate an API key to authenticate your external requests."
      />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_0.85fr]">
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <IconBox icon={KeyRound} color="purple" />
            <div>
              <h2 className="font-bold">Generate new API key</h2>
              <p className="text-xs text-muted-foreground">
                Create a key for your application
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                API key name
              </label>

              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="My application"
                className="input-field"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Give your key a name so you can identify its purpose.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full py-3"
            >
              {loading ? (
                <>
                  <LoadingSpinner /> Generating...
                </>
              ) : (
                <>
                  <Plus size={17} /> Generate API key
                </>
              )}
            </button>
          </form>

          {apiKey && (
            <div className="mt-6 rounded-xl border border-green/30 bg-green-soft p-4">
              <div className="mb-3 flex items-center gap-2 text-green">
                <CircleCheck size={18} />
                <p className="text-sm font-bold">API key generated</p>
              </div>

              <p className="mb-2 text-xs text-muted-foreground">
                Copy and save this key now. It may not be shown again.
              </p>

              <div className="flex items-center gap-2 rounded-lg border border-green/20 bg-surface p-2">
                <code className="min-w-0 flex-1 break-all text-xs">
                  {apiKey}
                </code>

                <button
                  onClick={copyKey}
                  className="shrink-0 rounded-lg bg-green px-3 py-2 text-white"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <IconBox icon={ShieldCheck} color="blue" />
            <div>
              <h2 className="font-bold">API key security</h2>
              <p className="text-xs text-muted-foreground">
                Keep your credentials protected
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-blue-soft p-4">
              <p className="font-bold text-blue">Keep your key private</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Never share your API key publicly or upload it to a public
                repository.
              </p>
            </div>

            <div className="rounded-xl bg-purple-soft p-4">
              <p className="font-bold text-purple">Use authentication</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Send your key using the X-API-Key request header when using
                API-key authentication.
              </p>
            </div>

            <div className="rounded-xl bg-green-soft p-4">
              <p className="font-bold text-green">Save it safely</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your generated key is displayed once. Store it somewhere
                secure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   SETTINGS PAGE
-------------------------------------------------- */

function SettingsPage() {
  const { username, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [showAccountInfo, setShowAccountInfo] = useState(true);

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Bright workspace",
      icon: Sun,
      color: "green",
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark workspace",
      icon: Moon,
      color: "purple",
    },
    {
      value: "system",
      label: "System",
      description: "Follow device settings",
      icon: Eye,
      color: "blue",
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeading
        title="Settings"
        description="Manage your account and customize your Ashparse experience."
      />

      <div className="max-w-3xl space-y-5">
        {/* Appearance */}
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <IconBox icon={Sun} color="purple" />
            <div>
              <h2 className="font-bold">Appearance</h2>
              <p className="text-xs text-muted-foreground">
                Choose how Ashparse looks
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const selected = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-green bg-green-soft"
                      : "border-border bg-surface-alt hover:border-blue"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <IconBox
                      icon={Icon}
                      color={option.color}
                      size="sm"
                    />
                    {selected && (
                      <Check size={17} className="text-green" />
                    )}
                  </div>

                  <p className="text-sm font-bold">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Account */}
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBox icon={Settings} color="blue" />
              <div>
                <h2 className="font-bold">Account information</h2>
                <p className="text-xs text-muted-foreground">
                  Your current account details
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAccountInfo(!showAccountInfo)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              {showAccountInfo ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {showAccountInfo && (
            <div className="rounded-xl bg-surface-alt p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Username
              </p>
              <p className="mt-1 text-sm font-semibold">
                {username || "Not available"}
              </p>

              <div className="my-4 border-t border-border" />

              <p className="text-xs font-medium text-muted-foreground">
                Current theme
              </p>
              <p className="mt-1 text-sm font-semibold capitalize">
                {theme || resolvedTheme || "System"}
              </p>
            </div>
          )}
        </section>

        {/* About */}
        <section className="card-surface p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconBox icon={Code2} color="green" />
            <div>
              <h2 className="font-bold">About Ashparse</h2>
              <p className="text-xs text-muted-foreground">
                Your web data extraction workspace
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-alt p-4">
            <div>
              <p className="text-sm font-bold">Ashparse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Django REST Framework + React
              </p>
            </div>
            <span className="rounded-full bg-green-soft px-3 py-1 text-xs font-bold text-green">
              Project
            </span>
          </div>
        </section>

        {/* Logout */}
        <section className="card-surface flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-bold">Sign out</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign out of your current Ashparse session.
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   APP ROUTES
-------------------------------------------------- */

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
