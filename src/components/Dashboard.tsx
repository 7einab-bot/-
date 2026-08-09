import React, { useState } from 'react';
import { PatientRecord } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import { PatientProfileTimelineModal } from './PatientProfileTimelineModal';
import {
  Users,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Share2,
  Activity,
  Building2,
  TrendingUp,
  Target,
  Award,
  ChevronLeft,
  FileText,
  Printer,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardProps {
  records: PatientRecord[];
  targetCount?: number;
  onPrintRecord?: (record: PatientRecord) => void;
  onSaveRecord?: (record: PatientRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  records,
  targetCount = 100,
  onPrintRecord,
  onSaveRecord,
}) => {
  const { t, language } = useLanguage();
  const [selectedPatientForTimeline, setSelectedPatientForTimeline] = useState<PatientRecord | null>(
    null
  );
  const totalCases = records.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCases = records.filter((r) => r.registrationDate === todayStr).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthCases = records.filter((r) => {
    const d = new Date(r.registrationDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const maleCount = records.filter((r) => r.gender === 'ذكر').length;
  const femaleCount = records.filter((r) => r.gender === 'أنثى').length;
  const referredCount = records.filter(
    (r) => r.riskAssessment === 'يحتاج تحويل' || (r.referralDestinations && r.referralDestinations.length > 0)
  ).length;

  // Disease prevalence tally
  const diseaseTally: Record<string, number> = {
    [t('hypertension')]: 0,
    [t('diabetes')]: 0,
    [t('heartDisease')]: 0,
    [t('kidneyDisease')]: 0,
    [t('liverDisease')]: 0,
    [t('osteoporosis')]: 0,
    [t('visionLoss')]: 0,
  };

  records.forEach((r) => {
    if (r.medicalHistory.hypertension) diseaseTally[t('hypertension')]++;
    if (r.medicalHistory.diabetes) diseaseTally[t('diabetes')]++;
    if (r.medicalHistory.heartDisease) diseaseTally[t('heartDisease')]++;
    if (r.medicalHistory.kidneyDisease) diseaseTally[t('kidneyDisease')]++;
    if (r.medicalHistory.liverDisease) diseaseTally[t('liverDisease')]++;
    if (r.medicalHistory.osteoporosis) diseaseTally[t('osteoporosis')]++;
    if (r.medicalHistory.visionLoss) diseaseTally[t('visionLoss')]++;
  });

  const sortedDiseases = Object.entries(diseaseTally).sort((a, b) => b[1] - a[1]);
  const topDisease = sortedDiseases[0]?.[0] || '-';

  // Unit tally
  const unitTally: Record<string, number> = {};
  records.forEach((r) => {
    unitTally[r.healthUnit] = (unitTally[r.healthUnit] || 0) + 1;
  });
  const sortedUnits = Object.entries(unitTally).sort((a, b) => b[1] - a[1]);
  const topUnit = sortedUnits[0]?.[0] || t('healthUnitName');

  const achievementPercent = Math.min(Math.round((todayCases / targetCount) * 100), 100);

  // Prepare chart data: Health Unit breakdown
  const unitChartData = Object.entries(unitTally).map(([unit, count]) => ({
    name: unit,
    [t('casesWord')]: count,
  }));

  // Prepare chart data: Daily Registration Trend
  const daysMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    daysMap[iso] = 0;
  }
  records.forEach((r) => {
    if (daysMap[r.registrationDate] !== undefined) {
      daysMap[r.registrationDate]++;
    }
  });

  const dailyTrendData = Object.entries(daysMap).map(([dateIso, count]) => {
    const d = new Date(dateIso);
    return {
      date: d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'numeric' }),
      [t('registrationsWord')]: count,
    };
  });

  // Monthly trend mock/real data
  const monthlyData = [
    { month: language === 'ar' ? 'مايو' : 'May', [t('casesWord')]: 450, [t('referredWord')]: 60 },
    { month: language === 'ar' ? 'يونيو' : 'June', [t('casesWord')]: 620, [t('referredWord')]: 85 },
    { month: language === 'ar' ? 'يوليو' : 'July', [t('casesWord')]: 780, [t('referredWord')]: 110 },
    { month: language === 'ar' ? 'أغسطس' : 'August', [t('casesWord')]: monthCases || 890, [t('referredWord')]: referredCount || 125 },
  ];

  // Disease Pie Data
  const diseasePieData = sortedDiseases.map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#1e3a8a', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#ec4899', '#0284c7'];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner KPI Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-blue-200 tracking-wider">
              {t('officialHeaderDirectorate')}
            </span>
            <h2 className="text-2xl font-black">{t('kpiDashboardTitle')}</h2>
            <p className="text-xs text-blue-100 max-w-xl font-medium mt-1">
              {t('kpiDashboardSubtitle')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-4">
            <Award className="w-8 h-8 text-amber-300" />
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 font-bold">{t('achievementRate')}</span>
              <span className="text-xl font-black text-white">{achievementPercent}%</span>
              <span className="text-[10px] text-emerald-300 font-bold">
                {todayCases} / {targetCount} {t('todayGoal')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Cases */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('totalCases')}</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCases}</span>
            <p className="text-[10px] text-slate-400 font-medium">{t('casesInDatabase')}</p>
          </div>
        </div>

        {/* Today Cases */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('todayCases')}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{todayCases}</span>
            <p className="text-[10px] text-slate-400 font-medium">{t('registeredToday')}</p>
          </div>
        </div>

        {/* Monthly Cases */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('monthlyCases')}</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{monthCases}</span>
            <p className="text-[10px] text-slate-400 font-medium">{t('inCurrentMonth')}</p>
          </div>
        </div>

        {/* Male / Female */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('genderRatio')}</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-extrabold">
            <span className="text-blue-700 dark:text-blue-400">👨 {maleCount} {t('males')}</span>
            <span className="text-rose-600 dark:text-rose-400">👩 {femaleCount} {t('females')}</span>
          </div>
        </div>

        {/* Referred Cases */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('referredCases')}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{referredCount}</span>
            <p className="text-[10px] text-slate-400 font-medium">{t('transferredSpecialized')}</p>
          </div>
        </div>

        {/* Top Unit & Disease */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold">{t('topCausesAndUnits')}</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            <p className="text-blue-700 dark:text-blue-300 truncate">🏥 {topUnit}</p>
            <p className="text-amber-700 dark:text-amber-300 truncate">🩺 {topDisease}</p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: Daily Trend & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registration Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              {t('dailyTrendChartTitle')}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{t('last7Days')}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={t('registrationsWord')}
                  stroke="#1e3a8a"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#1e3a8a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {t('monthlyTrendChartTitle')}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{t('year2026')}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey={t('casesWord')} fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey={t('referredWord')} fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Health Units breakdown & Disease Prevalence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Units Registration Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {t('unitComparisonChartTitle')}
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip />
                <Bar dataKey={t('casesWord')} fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Prevalence Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              {t('diseasePrevalenceChartTitle')}
            </h3>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseasePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {diseasePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT REGISTRATION & QUICK TIMELINE SECTION */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              أحدث الحالات والوصول السريع للسجل الزمني للملف الطبي
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            انقر على أي حالة لمشاهدة التسلسل الزمني الكامل للزيارات
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {records.slice(0, 6).map((rec) => (
            <div
              key={rec.id}
              onClick={() => setSelectedPatientForTimeline(rec)}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  {rec.fullName}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                  #{rec.serialNumber}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>الرقم القومي: {rec.nationalId}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    rec.riskAssessment === 'يحتاج تحويل'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.riskAssessment === 'يحتاج متابعة'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {rec.riskAssessment}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-400 font-bold">
                <span>عرض السجل الزمني والزيارات ←</span>
                <span className="text-slate-400 font-mono text-[10px]">{rec.registrationDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Profile Timeline Modal */}
      {selectedPatientForTimeline && (
        <PatientProfileTimelineModal
          patient={selectedPatientForTimeline}
          onClose={() => setSelectedPatientForTimeline(null)}
          onPrint={(rec) => {
            if (onPrintRecord) onPrintRecord(rec);
          }}
          onAddVisit={(patientId, newVisit) => {
            const existingHistory = selectedPatientForTimeline.visitHistory || [];
            const updatedPatient: PatientRecord = {
              ...selectedPatientForTimeline,
              visitHistory: [newVisit, ...existingHistory],
              labs: newVisit.labs,
              riskAssessment: newVisit.riskAssessment,
              referralDestinations:
                newVisit.referralDestinations || selectedPatientForTimeline.referralDestinations,
              referralReason:
                newVisit.referralReason || selectedPatientForTimeline.referralReason,
            };
            setSelectedPatientForTimeline(updatedPatient);
            if (onSaveRecord) {
              onSaveRecord(updatedPatient);
            }
          }}
        />
      )}
    </div>
  );
};
