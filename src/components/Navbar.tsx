import React from 'react';
import { UserRole } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import {
  Activity,
  UserCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Moon,
  Sun,
  Shield,
  FileText,
  Search,
  PlusCircle,
  BarChart3,
  History,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'form' | 'dashboard' | 'search' | 'reports' | 'audit';
  setCurrentTab: (tab: 'form' | 'dashboard' | 'search' | 'reports' | 'audit') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingSyncCount: number;
  onSyncNow: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onNewPatient: () => void;
  todayCount: number;
  targetCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  isOffline,
  setIsOffline,
  pendingSyncCount,
  onSyncNow,
  darkMode,
  setDarkMode,
  onNewPatient,
  todayCount,
  targetCount = 100,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const completionPercentage = Math.min(Math.round((todayCount / targetCount) * 100), 100);

  const roleTranslationMap: Record<UserRole, string> = {
    'مدير النظام': t('roleSystemAdmin'),
    'منسق الإدارة الصحية': t('roleDirectorateCoordinator'),
    'منسق الوحدة': t('roleUnitCoordinator'),
    'إدخال بيانات': t('roleDataEntry'),
    'قارئ فقط': t('roleReadOnly'),
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm transition-colors dark:bg-slate-900 dark:border-slate-800">
      {/* Top Ministry Banner */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="w-11 h-11 bg-blue-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-200 dark:shadow-none border border-blue-600">
            100
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-blue-950 dark:text-blue-200 leading-tight">
                {t('initiativeTitle')}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-md border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                {t('republicBadge')}
              </span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {t('systemSubtitle')}
            </p>
          </div>
        </div>

        {/* Right Section: Language Switcher, Sync status, Role Selector & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
            title={t('languageLabel')}
          >
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-extrabold">
              {language === 'ar' ? 'English 🇺🇸' : 'العربية 🇪🇬'}
            </span>
          </button>

          {/* Offline / Online Toggle button */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
            }`}
            title={t('toggleOfflineTitle')}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">{t('offlineMode')}</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">{t('connectedHQ')}</span>
              </>
            )}
          </button>

          {/* Sync Button if pending */}
          {pendingSyncCount > 0 && (
            <button
              onClick={onSyncNow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{t('syncNow')} ({pendingSyncCount})</span>
            </button>
          )}

          {/* Role Switcher for permissions testing */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Shield className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="مدير النظام">{t('roleSystemAdmin')}</option>
              <option value="منسق الإدارة الصحية">{t('roleDirectorateCoordinator')}</option>
              <option value="منسق الوحدة">{t('roleUnitCoordinator')}</option>
              <option value="إدخال بيانات">{t('roleDataEntry')}</option>
              <option value="قارئ فقط">{t('roleReadOnly')}</option>
            </select>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={t('toggleDarkMode')}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border-2 border-white dark:border-slate-700 shadow-sm">
              {language === 'ar' ? 'أ.م' : 'A.M'}
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {t('doctorName')}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('healthUnitName')} • {roleTranslationMap[userRole] || userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <div className="px-4 sm:px-6 py-2 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* Action Button: Register New Patient */}
          <button
            onClick={() => {
              onNewPatient();
              setCurrentTab('form');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('newPatient')}</span>
          </button>

          {/* Tabs */}
          <button
            onClick={() => setCurrentTab('form')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'form'
                ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('inputScreen')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('dashboard')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('search')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'search'
                ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t('searchAndRecords')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'reports'
                ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t('reportsAndExport')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'audit'
                ? 'bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t('auditLog')}</span>
          </button>
        </div>

        {/* Daily Target Progress Counter */}
        <div className="hidden md:flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col text-right">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
              <span>{t('todayGoal')}: {todayCount} / {targetCount}</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-36 bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
