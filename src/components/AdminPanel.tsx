import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2, 
  Eye, 
  X, 
  Layers, 
  Calendar, 
  Cpu, 
  Database,
  Sparkles,
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Building,
  Mail,
  Phone,
  ArrowRight,
  Globe2,
  Lock,
  Activity,
  ShieldCheck,
  KeyRound,
  EyeOff,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { InquiryRecord, UserRecord, ExpertDomainId, LanguageCode } from '../types';
import { EXPERT_PROFILES } from '../data/expertDomains';
import { LANGUAGES } from '../data/languages';
import { UserSignupModal } from './UserSignupModal';

const DOMAIN_COLORS: Record<string, string> = {
  general: '#f59e0b',
  medical: '#10b981',
  coding: '#3b82f6',
  legal: '#6366f1',
  agriculture: '#84cc16',
  business: '#06b6d4',
  education: '#a855f7',
};

interface AdminPanelProps {
  onBackToWorkspace?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToWorkspace }) => {
  // Navigation tabs: 'users' (User data collection dashboard) vs 'inquiries' (Disk logs & engine metrics)
  const [activeTab, setActiveTab] = useState<'users' | 'inquiries'>('users');

  // Administrator Authorization State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('bharatconnect_admin_token_v1');
    } catch {
      return null;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // User Registry State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userStorageInfo, setUserStorageInfo] = useState({
    totalUsers: 0,
    diskUsageFormatted: '0.00 KB',
    csvPath: './data/users.csv',
    jsonPath: './data/users.json',
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userDomainFilter, setUserDomainFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [confirmingUserReset, setConfirmingUserReset] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [inquiryStorageInfo, setInquiryStorageInfo] = useState({
    storageType: 'Local Machine Hard Drive',
    csvPath: './data/inquiries.csv',
    jsonPath: './data/inquiries.json',
    totalInquiries: 0,
    diskUsageFormatted: '0.00 KB',
  });
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [selectedInquiryDomain, setSelectedInquiryDomain] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [confirmingInquiryReset, setConfirmingInquiryReset] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Verify Admin Passcode
  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    if (!passcodeInput.trim()) {
      setPasscodeError('Please enter the Administrator Passcode.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Invalid passcode. Access denied.');
      }

      sessionStorage.setItem('bharatconnect_admin_token_v1', data.token);
      setAdminToken(data.token);
      setPasscodeInput('');
      loadAllData(data.token);
    } catch (err: any) {
      setPasscodeError(err.message || 'Verification failed. Please check passcode.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('bharatconnect_admin_token_v1');
    } catch (e) {
      console.warn(e);
    }
    setAdminToken(null);
    setPasscodeInput('');
    setPasscodeError(null);
  };

  // Fetch users from server disk
  const fetchUsers = async (token?: string, silent = false) => {
    const key = token || adminToken;
    if (!key) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUserStorageInfo({
          totalUsers: data.totalUsers || (data.users ? data.users.length : 0),
          diskUsageFormatted: data.diskUsageFormatted || '0.00 KB',
          csvPath: data.csvPath || './data/users.csv',
          jsonPath: data.jsonPath || './data/users.json',
        });
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      if (!silent) console.warn('Failed to fetch user directory from server:', err);
    }
  };

  // Fetch inquiries from server disk
  const fetchInquiries = async (token?: string, silent = false) => {
    const key = token || adminToken;
    if (!key) return;
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setInquiryStorageInfo({
          storageType: data.storageType || 'Local Machine Hard Drive',
          csvPath: data.csvPath || './data/inquiries.csv',
          jsonPath: data.jsonPath || './data/inquiries.json',
          totalInquiries: data.totalInquiries || 0,
          diskUsageFormatted: data.diskUsageFormatted || '0 KB',
        });
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      if (!silent) console.warn('Failed to fetch local inquiries from server:', err);
    }
  };

  const loadAllData = async (token?: string) => {
    setIsLoading(true);
    await Promise.all([fetchUsers(token), fetchInquiries(token)]);
    setIsLoading(false);
  };

  // Auto-sync polling every 5 seconds when admin token is active
  useEffect(() => {
    if (adminToken) {
      loadAllData(adminToken);
      const interval = setInterval(() => {
        fetchUsers(adminToken, true);
        fetchInquiries(adminToken, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [adminToken]);

  // Export Users CSV
  const handleExportUsersCSV = () => {
    if (!adminToken) return;
    window.location.href = `/api/admin/export-users-csv?admin_key=${encodeURIComponent(adminToken)}`;
    setStatusMessage('Exporting registered users CSV file directly from hard drive...');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Export Inquiries CSV
  const handleExportInquiriesCSV = () => {
    if (!adminToken) return;
    window.location.href = `/api/admin/export-csv?admin_key=${encodeURIComponent(adminToken)}`;
    setStatusMessage('Downloading Excel-compatible CSV directly from your machine hard drive...');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Clear Users Log
  const handleClearUsers = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/clear-users', {
        method: 'POST',
        headers: { 'x-admin-key': adminToken },
      });
      if (res.ok) {
        fetchUsers(adminToken);
        setStatusMessage('User directory reset successfully on local disk.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      setStatusMessage('Error resetting user directory.');
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setConfirmingUserReset(false);
    }
  };

  // Clear Inquiries Log
  const handleClearInquiries = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: { 'x-admin-key': adminToken },
      });
      if (res.ok) {
        fetchInquiries(adminToken);
        setStatusMessage('Local inquiry records cleared from machine disk.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      setStatusMessage('Network error clearing records.');
      setTimeout(() => setStatusMessage(null), 3500);
    } finally {
      setConfirmingInquiryReset(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const q = userSearchQuery.toLowerCase();
    const matchesSearch = 
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.organization && u.organization.toLowerCase().includes(q)) ||
      (u.profession && u.profession.toLowerCase().includes(q));
    const matchesDomain = userDomainFilter === 'all' || u.primaryDomain === userDomainFilter;
    return matchesSearch && matchesDomain;
  });

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const q = inquirySearchQuery.toLowerCase();
    const matchesSearch = 
      (inq.prompt && inq.prompt.toLowerCase().includes(q)) ||
      (inq.responseSummary && inq.responseSummary.toLowerCase().includes(q)) ||
      (inq.id && inq.id.toLowerCase().includes(q));
    const matchesDomain = selectedInquiryDomain === 'all' || inq.expertDomain === selectedInquiryDomain;
    return matchesSearch && matchesDomain;
  });

  // User profession breakdown for chart
  const professionCounts = users.reduce((acc, u) => {
    const key = u.profession ? u.profession.split('/')[0].trim().slice(0, 18) : 'Professional';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const professionChartData = Object.entries(professionCounts).map(([name, count], index) => ({
    name,
    count,
    fill: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'][index % 6]
  }));

  // User domain breakdown
  const userDomainChartData = EXPERT_PROFILES.map(exp => ({
    name: exp.name.split(' ')[0],
    fullName: exp.name,
    count: users.filter(u => u.primaryDomain === exp.id).length,
    fill: DOMAIN_COLORS[exp.id] || '#64748b'
  }));

  // Inquiry domain breakdown
  const inquiryDomainChartData = EXPERT_PROFILES.map(exp => ({
    name: exp.name.split(' ')[0],
    fullName: exp.name,
    count: inquiries.filter(i => i.expertDomain === exp.id).length,
    fill: DOMAIN_COLORS[exp.id] || '#64748b'
  }));

  // =========================================================================
  // ACCESS CONTROL GATE: RESTRICTED TO AUTHORIZED ADMINISTRATORS
  // =========================================================================
  if (!adminToken) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 p-6 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Orion Administrative Console</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Restricted Access
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Lead Systems Architect • Shaikh M. Abrar
                  </p>
                </div>
              </div>

              <img src="/orion-logo.svg" alt="Orion Technologies" className="w-7 h-7 opacity-80" />
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">Administrative & Disk Storage Security Gate</p>
                  <p className="mt-1 text-amber-800">
                    This terminal manages confidential user registries, physical hard drive backups, real-time analytics, and data wipe utilities. Standard users only operate on the AI Workspace.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Administrator Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="admin-passcode-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Enter Administrator Passcode"
                    autoFocus
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Passcode: <code className="text-slate-800 font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-semibold">orion@2026</code></span>
                  <span className="text-slate-400">Orion Technologies</span>
                </div>
              </div>

              {passcodeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                {onBackToWorkspace && (
                  <button
                    type="button"
                    onClick={onBackToWorkspace}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Return to Workspace
                  </button>
                )}
                <button
                  id="submit-admin-unlock-btn"
                  type="submit"
                  disabled={isVerifying}
                  className={`py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${onBackToWorkspace ? 'w-1/2' : 'w-full'}`}
                >
                  {isVerifying ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-orange-400" />
                      <span>Authenticate & Unlock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-md">
                <HardDrive className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
                  <span>BharatConnectAI Data Operations & Local Vault</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Zero-Leakage Disk Storage
                  </span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Physical SSD/HDD Persistence</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync: {lastSyncTime}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">Lead: Shaikh M. Abrar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Navigation Switches */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
              <button
                id="admin-tab-users-btn"
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'users'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>User Signups ({users.length})</span>
              </button>
              <button
                id="admin-tab-inquiries-btn"
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'inquiries'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Inquiry Records ({inquiries.length})</span>
              </button>
            </div>

            {/* Lock Console Button */}
            <button
              id="admin-logout-btn"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              title="Lock Administrator Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Console</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USER REGISTRY & DATA COLLECTION DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Quick Actions Bar for Users */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">User Directory Actions:</span>
              <span className="text-xs text-slate-500 font-mono">data/users.csv</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="admin-register-user-btn"
                onClick={() => setIsSignupModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-orange-400" />
                <span>Register User Profile</span>
              </button>

              <button
                id="admin-export-users-csv-btn"
                onClick={handleExportUsersCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Users CSV</span>
              </button>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {confirmingUserReset ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-xl p-1">
                  <span className="text-xs font-bold text-rose-700 px-1">Reset users?</span>
                  <button
                    onClick={handleClearUsers}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmingUserReset(false)}
                    className="px-2 py-1 text-slate-600 hover:text-slate-900 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingUserReset(true)}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 transition-colors"
                  title="Reset user database"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Total Registered Users</span>
                <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-950">
                {userStorageInfo.totalUsers}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active local database records</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Verified Professionals</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-950">
                {users.filter(u => u.status === 'Verified').length || users.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Zero-knowledge verified identities
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Hard Drive Disk Footprint</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Database className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-950">
                {userStorageInfo.diskUsageFormatted}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate" title={userStorageInfo.csvPath}>
                {userStorageInfo.csvPath}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Lead Systems Architect</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-sm font-bold text-slate-950 truncate">
                Shaikh M. Abrar
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Orion Technologies Core
              </div>
            </div>
          </div>

          {/* Distribution Charts for Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: By Profession */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Users by Professional Discipline</h3>
                  <p className="text-xs text-slate-500">Demographic distribution across verified sectors</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {Object.keys(professionCounts).length} Categories
                </span>
              </div>
              <div className="h-56 w-full">
                {professionChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No users registered yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={professionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val} users`, 'Count']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: By Domain Focus */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Domain Interest Concentration</h3>
                  <p className="text-xs text-slate-500">Primary consultation specialization chosen</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  7 Disciplines
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userDomainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val} users`, 'Users']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {userDomainChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-slate-950">
                  Registered Users & Collected Profiles
                </h3>
                <span className="text-xs text-slate-500 font-normal">
                  ({filteredUsers.length} shown)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="admin-search-users-input"
                    type="text"
                    placeholder="Search by name, email, org..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-56 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Domain Filter Dropdown */}
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="admin-user-domain-filter"
                    value={userDomainFilter}
                    onChange={(e) => setUserDomainFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Domains</option>
                    {EXPERT_PROFILES.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Domain Focus</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No registered users matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const domainInfo = EXPERT_PROFILES.find((p) => p.id === u.primaryDomain);
                      const lang = LANGUAGES.find((l) => l.code === u.language) || LANGUAGES[0];
                      const initials = u.fullName ? u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-950">{u.fullName}</div>
                                <div className="text-[11px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium max-w-[160px] truncate">
                            {u.organization || 'Independent'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                            {u.profession}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              <span>⚡</span>
                              <span>{domainInfo?.name || u.primaryDomain}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {lang.nativeName} ({lang.name})
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{u.status || 'Verified'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors text-[11px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INQUIRY LOGS & SYSTEM DISK VAULT */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Quick Actions Bar for Inquiries */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inquiry Disk Stream:</span>
              <span className="text-xs text-slate-500 font-mono">data/inquiries.csv</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="admin-export-excel-btn"
                onClick={handleExportInquiriesCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                title="Download Excel-compatible CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Inquiries CSV</span>
              </button>

              <button
                onClick={fetchInquiries}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                title="Refresh logs from disk"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {confirmingInquiryReset ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-xl p-1">
                  <span className="text-xs font-bold text-rose-700 px-1">Reset all logs?</span>
                  <button
                    onClick={handleClearInquiries}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmingInquiryReset(false)}
                    className="px-2 py-1 text-slate-600 hover:text-slate-900 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingInquiryReset(true)}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 transition-colors"
                  title="Clear inquiry records"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Inquiries Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Storage Mechanism</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <HardDrive className="w-4 h-4" />
                </span>
              </div>
              <div className="text-base font-bold text-slate-950">Local Machine Disk</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero cloud leakages</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Total Inquiries Logged</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-950">{inquiryStorageInfo.totalInquiries}</div>
              <div className="text-[11px] text-slate-500 mt-1">Appended in real-time to CSV</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Disk Usage Size</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Database className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-950">{inquiryStorageInfo.diskUsageFormatted}</div>
              <div className="text-[11px] text-slate-500 mt-1 truncate" title={inquiryStorageInfo.csvPath}>
                {inquiryStorageInfo.csvPath}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                <span>Failover Resilience</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="text-base font-bold text-slate-950">Multi-Model Cascade</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Local offline kernel fallback active
              </div>
            </div>
          </div>

          {/* Inquiries Volume Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-950">Inquiry Breakdown by AI Expert Discipline</h3>
                <p className="text-xs text-slate-500">Live query volume captured across local machine sessions</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                7 Disciplines
              </span>
            </div>
            <div className="h-56 w-full">
              {inquiries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No inquiries logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inquiryDomainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val} inquiries`, 'Volume']} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {inquiryDomainChartData.map((entry, idx) => (
                        <Cell key={`inq-cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Inquiries Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-950">
                  Inquiry Records & Engine Traces
                </h3>
                <span className="text-xs text-slate-500 font-normal">
                  ({filteredInquiries.length} shown)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search queries..."
                    value={inquirySearchQuery}
                    onChange={(e) => setInquirySearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-56 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {inquirySearchQuery && (
                    <button
                      onClick={() => setInquirySearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedInquiryDomain}
                    onChange={(e) => setSelectedInquiryDomain(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Domains</option>
                    {EXPERT_PROFILES.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">User Query</th>
                    <th className="py-3 px-4">Model Engine</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No inquiries logged yet.
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((inq) => {
                      const domainInfo = EXPERT_PROFILES.find((p) => p.id === inq.expertDomain);
                      const lang = LANGUAGES.find((l) => l.code === inq.language) || LANGUAGES[0];

                      return (
                        <tr key={inq.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(inq.timestamp).toLocaleDateString()} {new Date(inq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {inq.userName ? (
                              <div>
                                <span className="font-semibold text-slate-900 block">{inq.userName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{inq.userEmail || inq.userId || ''}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Anonymous</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              <span>⚡</span>
                              <span>{domainInfo?.name || inq.expertDomain}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                            {lang.name}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-900 font-medium">
                            {inq.prompt}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              inq.isOffline 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {inq.isOffline ? 'Offline Kernel' : inq.modelUsed || 'Gemini Flash'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors text-[11px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{selectedUser.fullName}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Organization</span>
                  <span className="font-semibold text-slate-900">{selectedUser.organization || 'Independent Professional'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Designation / Role</span>
                  <span className="font-semibold text-slate-900">{selectedUser.profession}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Primary Discipline</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedUser.primaryDomain}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Preferred Language</span>
                  <span className="font-semibold text-slate-900 uppercase">{selectedUser.language}</span>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Phone</span>
                  <span className="font-semibold text-slate-900">{selectedUser.phone}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Platform Strategic Purpose</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedUser.purpose || 'Enterprise multi-domain consultation & decision support.'}
                </p>
              </div>

              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>Registration ID:</span>
                  <span className="text-orange-400">{selectedUser.id}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                  <span>Registered Timestamp:</span>
                  <span>{new Date(selectedUser.registrationDate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Stored on Local Disk Vault</span>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Detail Inspection Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <span>Inquiry Audit Record</span>
                  <span className="font-mono text-xs text-slate-500 font-normal">
                    ({selectedInquiry.id})
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Logged on {new Date(selectedInquiry.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {selectedInquiry.userName && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">Submitting User</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedInquiry.userName}</span>
                    <span className="text-[11px] text-slate-500 block font-mono">{selectedInquiry.userEmail}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                    Registered
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  User Inquiry Prompt
                </span>
                <div className="p-3 bg-slate-100 rounded-xl text-slate-950 font-medium leading-relaxed">
                  {selectedInquiry.prompt}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  AI Response Summary
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                  {selectedInquiry.responseSummary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Expert Domain</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedInquiry.expertDomain}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block font-bold uppercase">Storage Target</span>
                  <span className="font-semibold text-emerald-700">Local Machine (data/inquiries.csv)</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                100% Machine Hard Drive Data Continuity
              </span>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Signup Modal embedded in Admin */}
      <UserSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onUserRegistered={(newUser) => {
          fetchUsers();
          setStatusMessage(`Registered user "${newUser.fullName}" added to local disk vault.`);
        }}
        currentUser={null}
      />
    </div>
  );
};
