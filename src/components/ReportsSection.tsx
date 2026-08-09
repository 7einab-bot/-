import React, { useState } from 'react';
import { PatientRecord, CustomReportPreset, RiskLevel, Gender } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import {
  FileSpreadsheet,
  Printer,
  Send,
  Bookmark,
  Filter,
  Plus,
  Trash2,
  Check,
  Sparkles,
  RotateCcw,
  Search,
  HeartPulse,
  Activity,
  Sliders,
  X,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { exportToFormattedExcel } from '../utils/exportUtils';

interface ReportsSectionProps {
  records: PatientRecord[];
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({ records }) => {
  const { t, language } = useLanguage();

  // Active Report View Type
  const [reportType, setReportType] = useState<
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'byUnit'
    | 'byDoctor'
    | 'byGender'
    | 'byAge'
    | 'byDiseases'
    | 'byReferrals'
  >('daily');

  // Filter States
  const [selectedUnit, setSelectedUnit] = useState<string>('جميع الوحدات');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  // Active Preset State
  const [activePreset, setActivePreset] = useState<CustomReportPreset | null>(null);

  // Custom Preset Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  // User Saved Presets from localStorage
  const [userPresets, setUserPresets] = useState<CustomReportPreset[]>(() => {
    try {
      const saved = localStorage.getItem('seha_100m_custom_report_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Failed to load saved report presets', e);
    }
    return [];
  });

  // Built-in Default Presets
  const defaultPresets: CustomReportPreset[] = [
    {
      id: 'preset-hypertension-monthly',
      name: t('presetHypertensionMonthly'),
      description: 'حصر مرضى ضغط الدم المسجلين خلال الشهر الحالي',
      reportType: 'monthly',
      healthUnit: 'جميع الوحدات',
      condition: 'hypertension',
      riskLevel: 'all',
      gender: 'all',
      timeframe: 'monthly',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-urgent-referrals',
      name: t('presetUrgentReferrals'),
      description: 'حصر الحالات عالية الخطورة المحولة عاجلاً للمستشفيات',
      reportType: 'byReferrals',
      healthUnit: 'جميع الوحدات',
      condition: 'all',
      riskLevel: 'يحتاج تحويل',
      gender: 'all',
      timeframe: 'all',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-diabetes-heart',
      name: t('presetDiabetesHeart'),
      description: 'حصر حالات السكري وأمراض القلب للرعاية التخصصية',
      reportType: 'monthly',
      healthUnit: 'جميع الوحدات',
      condition: 'diabetes',
      riskLevel: 'all',
      gender: 'all',
      timeframe: 'monthly',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-doctor-productivity',
      name: t('presetDoctorProductivityMonthly'),
      description: 'تقييم أداء وإنتاجية الأطباء الفاحصين الشهرية',
      reportType: 'byDoctor',
      healthUnit: 'جميع الوحدات',
      condition: 'all',
      riskLevel: 'all',
      gender: 'all',
      timeframe: 'monthly',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const allPresets = [...defaultPresets, ...userPresets];

  // Helper date timeframe filter
  const isWithinTimeframe = (dateStr: string, timeframe: string) => {
    if (timeframe === 'all' || !dateStr) return true;
    const recordDate = new Date(dateStr);
    const now = new Date();
    if (isNaN(recordDate.getTime())) return true;

    if (timeframe === 'monthly') {
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeframe === 'weekly') {
      const diffTime = Math.abs(now.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (timeframe === 'yearly') {
      return recordDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Calculate matching count for preset badges
  const countMatchingRecords = (preset: CustomReportPreset) => {
    return records.filter((r) => {
      if (preset.healthUnit !== 'جميع الوحدات' && r.healthUnit !== preset.healthUnit)
        return false;
      if (
        preset.condition !== 'all' &&
        !r.medicalHistory[preset.condition as keyof typeof r.medicalHistory]
      )
        return false;
      if (preset.riskLevel !== 'all' && r.riskAssessment !== preset.riskLevel)
        return false;
      if (preset.gender !== 'all' && r.gender !== preset.gender) return false;
      if (!isWithinTimeframe(r.registrationDate, preset.timeframe)) return false;
      return true;
    }).length;
  };

  // Health Units List
  const healthUnitsList = Array.from(new Set(records.map((r) => r.healthUnit)));

  // Filter Active Records based on current filters
  const activeRecords = records.filter((r) => {
    if (selectedUnit !== 'جميع الوحدات' && r.healthUnit !== selectedUnit)
      return false;
    if (
      selectedCondition !== 'all' &&
      !r.medicalHistory[selectedCondition as keyof typeof r.medicalHistory]
    )
      return false;
    if (selectedRisk !== 'all' && r.riskAssessment !== selectedRisk) return false;
    if (selectedGender !== 'all' && r.gender !== selectedGender) return false;
    if (!isWithinTimeframe(r.registrationDate, selectedTimeframe)) return false;
    return true;
  });

  // Age group distribution
  const ageGroups = {
    [t('ageGroupYouth')]: activeRecords.filter((r) => r.age < 30).length,
    [t('ageGroupAdults')]: activeRecords.filter((r) => r.age >= 30 && r.age < 50).length,
    [t('ageGroupSeniors')]: activeRecords.filter((r) => r.age >= 50 && r.age < 65).length,
    [t('ageGroupElderly')]: activeRecords.filter((r) => r.age >= 65).length,
  };

  // Referral breakdown
  const referralTally: Record<string, number> = {
    [t('ophthalmology')]: 0,
    [t('dentistry')]: 0,
    [t('internalMedicine')]: 0,
    [t('orthopedics')]: 0,
    [t('physiotherapy')]: 0,
    [t('psychiatry')]: 0,
    [t('otherDisease')]: 0,
  };

  activeRecords.forEach((r) => {
    (r.referralDestinations || []).forEach((dest) => {
      if (referralTally[dest] !== undefined) {
        referralTally[dest]++;
      }
    });
  });

  // Doctor breakdown
  const doctorTally: Record<string, number> = {};
  activeRecords.forEach((r) => {
    const doc = r.medicalTeam.doctor || '-';
    doctorTally[doc] = (doctorTally[doc] || 0) + 1;
  });

  // Unit breakdown
  const unitTally: Record<string, { total: number; highRisk: number; normal: number }> = {};
  records.forEach((r) => {
    if (!unitTally[r.healthUnit]) {
      unitTally[r.healthUnit] = { total: 0, highRisk: 0, normal: 0 };
    }
    unitTally[r.healthUnit].total++;
    if (r.riskAssessment === 'يحتاج تحويل') unitTally[r.healthUnit].highRisk++;
    else if (r.riskAssessment === 'طبيعي') unitTally[r.healthUnit].normal++;
  });

  // Disease prevalence breakdown
  const diseasePrevalence = {
    [t('hypertension')]: activeRecords.filter((r) => r.medicalHistory.hypertension).length,
    [t('diabetes')]: activeRecords.filter((r) => r.medicalHistory.diabetes).length,
    [t('heartDisease')]: activeRecords.filter((r) => r.medicalHistory.heartDisease).length,
    [t('kidneyDisease')]: activeRecords.filter((r) => r.medicalHistory.kidneyDisease).length,
    [t('liverDisease')]: activeRecords.filter((r) => r.medicalHistory.liverDisease).length,
    [t('stroke')]: activeRecords.filter((r) => r.medicalHistory.stroke).length,
    [t('visionLoss')]: activeRecords.filter((r) => r.medicalHistory.visionLoss).length,
    [t('hearingLoss')]: activeRecords.filter((r) => r.medicalHistory.hearingLoss).length,
    [t('osteoporosis')]: activeRecords.filter((r) => r.medicalHistory.osteoporosis).length,
    [t('depression')]: activeRecords.filter((r) => r.medicalHistory.depression).length,
  };

  // Apply Preset Handler
  const handleApplyPreset = (preset: CustomReportPreset) => {
    setActivePreset(preset);
    setReportType(preset.reportType);
    setSelectedUnit(preset.healthUnit);
    setSelectedCondition(preset.condition);
    setSelectedRisk(preset.riskLevel);
    setSelectedGender(preset.gender);
    setSelectedTimeframe(preset.timeframe);
  };

  // Clear Preset / Filters Handler
  const handleClearPreset = () => {
    setActivePreset(null);
    setSelectedCondition('all');
    setSelectedRisk('all');
    setSelectedGender('all');
    setSelectedTimeframe('all');
    setSelectedUnit('جميع الوحدات');
  };

  // Save New Custom Preset Handler
  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: CustomReportPreset = {
      id: `preset-user-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDescription.trim() || undefined,
      reportType,
      healthUnit: selectedUnit,
      condition: selectedCondition as any,
      riskLevel: selectedRisk as any,
      gender: selectedGender as any,
      timeframe: selectedTimeframe as any,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updatedUserPresets = [newPreset, ...userPresets];
    setUserPresets(updatedUserPresets);
    try {
      localStorage.setItem(
        'seha_100m_custom_report_presets',
        JSON.stringify(updatedUserPresets)
      );
    } catch (err) {
      console.error('Failed to save preset to localStorage', err);
    }

    setActivePreset(newPreset);
    setIsSaveModalOpen(false);
    setNewPresetName('');
    setNewPresetDescription('');
  };

  // Delete User Preset Handler
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('deletePresetConfirm'))) {
      const updated = userPresets.filter((p) => p.id !== id);
      setUserPresets(updated);
      try {
        localStorage.setItem(
          'seha_100m_custom_report_presets',
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error('Failed to delete preset', err);
      }
      if (activePreset?.id === id) {
        handleClearPreset();
      }
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getConditionLabel = (condKey: string) => {
    switch (condKey) {
      case 'hypertension':
        return t('hypertension');
      case 'diabetes':
        return t('diabetes');
      case 'heartDisease':
        return t('heartDisease');
      case 'kidneyDisease':
        return t('kidneyDisease');
      case 'liverDisease':
        return t('liverDisease');
      case 'stroke':
        return t('stroke');
      case 'visionLoss':
        return t('visionLoss');
      case 'hearingLoss':
        return t('hearingLoss');
      default:
        return t('allConditions');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Directorate Report Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t('officialReportHeader')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('officialReportSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              exportToFormattedExcel(activeRecords, `تقرير_المديرية_${reportType}.xls`)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReport')}</span>
          </button>
        </div>
      </div>

      {/* Quick Custom Report Filters / Presets Toolbar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-700/50 rounded-xl text-blue-200 border border-blue-500/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{t('savedPresets')}</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-600/60 rounded-md text-blue-100 font-bold">
                  {allPresets.length} {t('customFiltersTitle')}
                </span>
              </h3>
              <p className="text-[11px] text-blue-200/80 font-medium">
                نقرة واحدة لتطبيق وتوليد التقارير المخصصة والكرورة للمتابعة الميدانية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t('saveCurrentFilterAsPreset')}</span>
          </button>
        </div>

        {/* Presets Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allPresets.map((preset) => {
            const isSelected = activePreset?.id === preset.id;
            const count = countMatchingRecords(preset);

            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-white text-blue-950 border-white shadow-lg shadow-black/20 font-black'
                    : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-blue-600' : 'bg-emerald-400'
                  }`}
                />

                <span>{preset.name}</span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {count}
                </span>

                {!preset.isDefault && (
                  <button
                    onClick={(e) => handleDeletePreset(preset.id, e)}
                    className="opacity-60 hover:opacity-100 p-0.5 text-rose-300 hover:text-rose-100 transition-opacity cursor-pointer"
                    title={t('deletePresetConfirm')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Custom Filter Status Banner (If preset or custom filter active) */}
      {(activePreset ||
        selectedCondition !== 'all' ||
        selectedRisk !== 'all' ||
        selectedGender !== 'all' ||
        selectedTimeframe !== 'all' ||
        selectedUnit !== 'جميع الوحدات') && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <span>{t('activeFilterLabel')}</span>
                <span className="bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                  {activePreset ? activePreset.name : 'فلتر مخصص'}
                </span>
              </span>
              <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px] mt-0.5">
                الوحدة: {selectedUnit === 'جميع الوحدات' ? t('allUnits') : selectedUnit} •
                المرض: {getConditionLabel(selectedCondition)} • الخطورة:{' '}
                {selectedRisk === 'all'
                  ? t('allRiskLevels')
                  : selectedRisk === 'يحتاج تحويل'
                  ? t('referralRisk')
                  : selectedRisk === 'يحتاج متابعة'
                  ? t('followupRisk')
                  : t('normalRisk')}{' '}
                • الإطار:{' '}
                {selectedTimeframe === 'monthly'
                  ? t('timeframeCurrentMonth')
                  : selectedTimeframe === 'weekly'
                  ? t('timeframeCurrentWeek')
                  : selectedTimeframe === 'yearly'
                  ? t('timeframeCurrentYear')
                  : t('timeframeAll')}
              </span>
            </div>
          </div>

          <button
            onClick={handleClearPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('clearActiveFilter')}</span>
          </button>
        </div>
      )}

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        {/* Report Format Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'daily', label: t('dailyReport') },
            { id: 'weekly', label: t('weeklyReport') },
            { id: 'monthly', label: t('monthlyReport') },
            { id: 'yearly', label: t('yearlyReport') },
            { id: 'byUnit', label: t('unitDistribution') },
            { id: 'byDoctor', label: t('doctorProductivity') },
            { id: 'byGender', label: t('byGenderTab') },
            { id: 'byAge', label: t('ageGroupsTab') },
            { id: 'byDiseases', label: 'توزيع الأمراض' },
            { id: 'byReferrals', label: t('referralsTab') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                reportType === tab.id
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Detailed Secondary Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Health Unit Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500">
              {t('filterByUnitLabel')}
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="جميع الوحدات">{t('allUnits')}</option>
              {healthUnitsList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500">
              {t('filterCondition')}
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">{t('allConditions')}</option>
              <option value="hypertension">{t('hypertension')}</option>
              <option value="diabetes">{t('diabetes')}</option>
              <option value="heartDisease">{t('heartDisease')}</option>
              <option value="kidneyDisease">{t('kidneyDisease')}</option>
              <option value="liverDisease">{t('liverDisease')}</option>
              <option value="stroke">{t('stroke')}</option>
              <option value="visionLoss">{t('visionLoss')}</option>
              <option value="hearingLoss">{t('hearingLoss')}</option>
            </select>
          </div>

          {/* Risk Level Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500">
              {t('filterRiskLevel')}
            </label>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">{t('allRiskLevels')}</option>
              <option value="طبيعي">{t('normalRisk')}</option>
              <option value="يحتاج متابعة">{t('followupRisk')}</option>
              <option value="يحتاج تحويل">{t('referralRisk')}</option>
            </select>
          </div>

          {/* Gender Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500">
              {t('filterGender')}
            </label>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">{t('allGenders')}</option>
              <option value="ذكر">{t('male')}</option>
              <option value="أنثى">{t('female')}</option>
            </select>
          </div>

          {/* Timeframe Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-500">
              {t('filterTimeframe')}
            </label>
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setActivePreset(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">{t('timeframeAll')}</option>
              <option value="monthly">{t('timeframeCurrentMonth')}</option>
              <option value="weekly">{t('timeframeCurrentWeek')}</option>
              <option value="yearly">{t('timeframeCurrentYear')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Official Report View */}
      <div className="print-area bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        {/* Ministry Official Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-4">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">
              {t('officialHeaderGov')}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('officialHeaderDirectorate')}
            </span>
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
              {t('officialHeaderInitiative')}
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-500">
              {t('reportGeneratedDate')}:
            </span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              {t('selectedUnitLabel')}:{' '}
              {selectedUnit === 'جميع الوحدات' ? t('allUnits') : selectedUnit}
            </span>
          </div>
        </div>

        {/* Dynamic Section Content based on Report Type */}
        {reportType === 'byAge' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {t('ageGroupDistributionHeading')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(ageGroups).map(([group, count]) => (
                <div
                  key={group}
                  className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {group}
                  </span>
                  <span className="text-2xl font-black text-blue-900 dark:text-blue-300 mt-2">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {t('registeredCitizen')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'byDiseases' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              معدل انتشار الأمراض المزمنة بين الحالات المفلترة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(diseasePrevalence).map(([disease, count]) => (
                <div
                  key={disease}
                  className="bg-blue-50/50 dark:bg-slate-800/80 p-3 rounded-xl border border-blue-100 dark:border-slate-700 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {disease}
                  </span>
                  <span className="text-2xl font-black text-blue-800 dark:text-blue-400 mt-1">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-400">حالة مؤكدة</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'byReferrals' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {t('referralsDistributionHeading')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(referralTally).map(([dest, count]) => (
                <div
                  key={dest}
                  className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-900 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    {dest}
                  </span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">
                    {count}
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    {t('referredCasesCount')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'byDoctor' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {t('doctorProductivityHeading')}
            </h3>
            <table className="w-full text-right text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">{t('doctorNameCol')}</th>
                  <th className="p-3">{t('examinedCasesCountCol')}</th>
                  <th className="p-3">{t('productivityPercentCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {Object.entries(doctorTally).map(([doc, count]) => (
                  <tr key={doc}>
                    <td className="p-3 font-bold">{doc}</td>
                    <td className="p-3 font-bold text-blue-800 dark:text-blue-300">
                      {count}
                    </td>
                    <td className="p-3">
                      {Math.round((count / (activeRecords.length || 1)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'byUnit' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {t('unitComparisonHeading')}
            </h3>
            <table className="w-full text-right text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">{t('healthUnit')}</th>
                  <th className="p-3">{t('totalCases')}</th>
                  <th className="p-3">{t('normalCasesCol')}</th>
                  <th className="p-3">{t('referredHospitalCasesCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {Object.entries(unitTally).map(([unit, stat]) => (
                  <tr key={unit}>
                    <td className="p-3 font-bold">{unit}</td>
                    <td className="p-3 font-bold text-blue-800 dark:text-blue-300">
                      {stat.total}
                    </td>
                    <td className="p-3 text-emerald-700 dark:text-emerald-400">
                      {stat.normal}
                    </td>
                    <td className="p-3 text-rose-700 dark:text-rose-400 font-bold">
                      {stat.highRisk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Records Listing Table for standard reports */}
        {(reportType === 'daily' ||
          reportType === 'weekly' ||
          reportType === 'monthly' ||
          reportType === 'yearly' ||
          reportType === 'byGender') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                {t('approvedCasesLog')} ({t('totalCases')}:{' '}
                <span className="text-blue-700 dark:text-blue-400">
                  {activeRecords.length}
                </span>
                )
              </h3>
            </div>

            <table className="w-full text-right text-[11px] border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2 border dark:border-slate-800">#</th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('nationalId')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('fullNameQuad')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('ageCalculated')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">{t('gender')}</th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('healthUnit')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('hypertension')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">{t('diabetes')}</th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('riskAssessment')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('referralDestination')}
                  </th>
                  <th className="p-2 border dark:border-slate-800">
                    {t('registrationDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {activeRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="p-8 text-center text-slate-400 font-bold"
                    >
                      لا توجد حالات مسجلة تنطبق عليها شروط التقرير أو الفلتر النشط.
                    </td>
                  </tr>
                ) : (
                  activeRecords.map((r, index) => (
                    <tr key={r.id}>
                      <td className="p-2 border dark:border-slate-800 text-center font-bold">
                        {index + 1}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-mono font-bold">
                        {r.nationalId}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-bold">
                        {r.fullName}
                      </td>
                      <td className="p-2 border dark:border-slate-800 text-center">
                        {r.age}
                      </td>
                      <td className="p-2 border dark:border-slate-800 text-center">
                        {r.gender === 'ذكر' ? t('male') : t('female')}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-medium">
                        {r.healthUnit}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-mono text-center">
                        {r.labs.systolicBP || '-'}/{r.labs.diastolicBP || '-'}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-mono text-center">
                        {r.labs.bloodGlucose || '-'}
                      </td>
                      <td
                        className={`p-2 border dark:border-slate-800 font-bold text-center ${
                          r.riskAssessment === 'يحتاج تحويل'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : r.riskAssessment === 'يحتاج متابعة'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {r.riskAssessment === 'يحتاج تحويل'
                          ? t('referralRisk')
                          : r.riskAssessment === 'يحتاج متابعة'
                          ? t('followupRisk')
                          : t('normalRisk')}
                      </td>
                      <td className="p-2 border dark:border-slate-800">
                        {(r.referralDestinations || []).join('، ') || '-'}
                      </td>
                      <td className="p-2 border dark:border-slate-800 font-mono text-center">
                        {r.registrationDate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Footer */}
        <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-300 dark:border-slate-800 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
          <div className="flex flex-col gap-8">
            <span>{t('dataEntryOfficer')}</span>
            <span className="font-normal text-slate-500">{t('signatureField')}</span>
          </div>

          <div className="flex flex-col gap-8">
            <span>{t('initiativeCoordinator')}</span>
            <span className="font-normal text-slate-500">{t('signatureField')}</span>
          </div>

          <div className="flex flex-col gap-8">
            <span>{t('healthDirectorAndStamp')}</span>
            <span className="font-normal text-slate-500">{t('signatureField')}</span>
          </div>
        </div>
      </div>

      {/* Save Custom Report Filter Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {t('saveCurrentFilterAsPreset')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    حفظ خيارات الفلترة الحالية لاسترجاعها بنقرة واحدة في أي وقت
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePresetSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('presetName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('presetNamePlaceholder')}
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  وصف مختصر (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: حصر مرضى ضغط الدم لإرساله شهرياً للمديرية"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Current Active Criteria Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1 text-[11px]">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  الشروط المحفوظة في هذا القالب:
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 font-medium">
                  <li>الوحدة: {selectedUnit}</li>
                  <li>المرض / الحالة: {getConditionLabel(selectedCondition)}</li>
                  <li>تصنيف الخطورة: {selectedRisk}</li>
                  <li>النوع: {selectedGender === 'all' ? t('allGenders') : selectedGender}</li>
                  <li>الإطار الزمني: {selectedTimeframe}</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  {t('cancelPresetBtn')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('savePresetBtn')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
