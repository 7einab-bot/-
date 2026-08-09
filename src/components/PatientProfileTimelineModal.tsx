import React, { useState } from 'react';
import { PatientRecord, VisitRecord, RiskLevel, LabResults, ReferralDestination } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Calendar,
  Activity,
  HeartPulse,
  UserCheck,
  Building2,
  FileText,
  Clock,
  Printer,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Send,
  Stethoscope,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  User,
  Phone,
  Droplets,
  Microscope,
} from 'lucide-react';

interface PatientProfileTimelineModalProps {
  patient: PatientRecord;
  onClose: () => void;
  onPrint: (patient: PatientRecord) => void;
  onAddVisit?: (patientId: string, newVisit: VisitRecord) => void;
}

export const PatientProfileTimelineModal: React.FC<PatientProfileTimelineModalProps> = ({
  patient,
  onClose,
  onPrint,
  onAddVisit,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'timeline' | 'info' | 'medicalHistory'>('timeline');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'referrals' | 'highRisk'>('all');
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);

  // New Visit Form States
  const [newVisitDate, setNewVisitDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newVisitType, setNewVisitType] = useState<VisitRecord['visitType']>(
    'متابعة دورية ضغط وسكر'
  );
  const [newDoctorName, setNewDoctorName] = useState<string>(
    patient.medicalTeam.doctor || 'د. أحمد محمود'
  );
  const [newSystolicBP, setNewSystolicBP] = useState<string>(
    patient.labs.systolicBP?.toString() || ''
  );
  const [newDiastolicBP, setNewDiastolicBP] = useState<string>(
    patient.labs.diastolicBP?.toString() || ''
  );
  const [newBloodGlucose, setNewBloodGlucose] = useState<string>(
    patient.labs.bloodGlucose?.toString() || ''
  );
  const [newTC, setNewTC] = useState<string>(patient.labs.tc?.toString() || '');
  const [newHgb, setNewHgb] = useState<string>(patient.labs.hgb?.toString() || '');
  const [newRisk, setNewRisk] = useState<RiskLevel>(patient.riskAssessment);
  const [newReferrals, setNewReferrals] = useState<ReferralDestination[]>(
    patient.referralDestinations || []
  );
  const [newReferralReason, setNewReferralReason] = useState<string>(
    patient.referralReason || ''
  );
  const [newNotes, setNewNotes] = useState<string>('');

  // Synthesize or collect all visits
  // Every patient has at least the initial registration visit
  const initialVisit: VisitRecord = {
    id: `visit-init-${patient.id}`,
    visitDate: patient.registrationDate,
    visitType: 'فحص شمول كبار السن',
    healthUnit: patient.healthUnit,
    doctorName: patient.medicalTeam.doctor || 'د. الفاحص المعتمد',
    nurseName: patient.medicalTeam.nurse,
    labs: patient.labs,
    riskAssessment: patient.riskAssessment,
    referralDestinations: patient.referralDestinations,
    referralReason: patient.referralReason,
    notes: 'الزيارة الميدانية الأولى لتسجيل الحالة بمبادرة 100 مليون صحة.',
  };

  // Default past visits for timeline demonstration if not present
  const demoPastVisits: VisitRecord[] = patient.visitHistory || [
    {
      id: `visit-past-1-${patient.id}`,
      visitDate: '2026-06-15',
      visitType: 'متابعة دورية ضغط وسكر',
      healthUnit: patient.healthUnit,
      doctorName: patient.medicalTeam.doctor || 'د. خالد عبدالغفار',
      labs: {
        systolicBP: Math.max(110, (patient.labs.systolicBP || 130) - 10),
        diastolicBP: Math.max(70, (patient.labs.diastolicBP || 85) - 5),
        bloodGlucose: Math.max(90, (patient.labs.bloodGlucose || 140) - 20),
        tc: patient.labs.tc,
        hgb: patient.labs.hgb,
      },
      riskAssessment: 'يحتاج متابعة',
      notes: 'متابعة دورية للاطمئنان على مستويات قياس ضغط الدم والسكر وصرف العلاج الشهري.',
    },
    {
      id: `visit-past-2-${patient.id}`,
      visitDate: '2026-04-10',
      visitType: 'إعادة فحص معملي',
      healthUnit: patient.healthUnit,
      doctorName: 'د. محمود توفيق',
      labs: {
        systolicBP: (patient.labs.systolicBP || 130) + 5,
        diastolicBP: (patient.labs.diastolicBP || 85) + 3,
        bloodGlucose: (patient.labs.bloodGlucose || 140) + 15,
        tc: 220,
        cr: 1.0,
      },
      riskAssessment: patient.riskAssessment,
      referralDestinations: patient.referralDestinations,
      referralReason: 'إجراء تحاليل وظائف كبد وكلى شاملة',
      notes: 'تمت توصية المواطن بالالتزام بالحمية الغذائية ومراجعة العيادة التخصصية بالمستشفى.',
    },
    initialVisit,
  ];

  const [allVisits, setAllVisits] = useState<VisitRecord[]>(demoPastVisits);

  // Sorting and Filtering
  const filteredVisits = allVisits
    .filter((v) => {
      if (filterType === 'referrals') return (v.referralDestinations || []).length > 0;
      if (filterType === 'highRisk') return v.riskAssessment === 'يحتاج تحويل';
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Calculate Vitals Progress
  const sortedByDate = [...allVisits].sort(
    (a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
  );
  const oldestVisit = sortedByDate[0];
  const newestVisit = sortedByDate[sortedByDate.length - 1];

  const initialSys = oldestVisit?.labs?.systolicBP || 0;
  const currentSys = newestVisit?.labs?.systolicBP || 0;
  const bpDiff = currentSys - initialSys;

  const initialGlucose = oldestVisit?.labs?.bloodGlucose || 0;
  const currentGlucose = newestVisit?.labs?.bloodGlucose || 0;
  const glucoseDiff = currentGlucose - initialGlucose;

  // Handle Adding New Visit
  const handleAddNewVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createdVisit: VisitRecord = {
      id: `visit-new-${Date.now()}`,
      visitDate: newVisitDate,
      visitType: newVisitType,
      healthUnit: patient.healthUnit,
      doctorName: newDoctorName,
      nurseName: patient.medicalTeam.nurse,
      labs: {
        systolicBP: newSystolicBP ? parseInt(newSystolicBP) : undefined,
        diastolicBP: newDiastolicBP ? parseInt(newDiastolicBP) : undefined,
        bloodGlucose: newBloodGlucose ? parseInt(newBloodGlucose) : undefined,
        tc: newTC ? parseInt(newTC) : undefined,
        hgb: newHgb ? parseFloat(newHgb) : undefined,
      },
      riskAssessment: newRisk,
      referralDestinations: newReferrals,
      referralReason: newReferralReason,
      notes: newNotes || 'زيارة متابعة مسجلة بملف المواطن',
    };

    const updated = [createdVisit, ...allVisits];
    setAllVisits(updated);

    if (onAddVisit) {
      onAddVisit(patient.id, createdVisit);
    }

    setIsAddVisitOpen(false);
    setNewNotes('');
  };

  const toggleReferralSelection = (dest: ReferralDestination) => {
    if (newReferrals.includes(dest)) {
      setNewReferrals(newReferrals.filter((d) => d !== dest));
    } else {
      setNewReferrals([...newReferrals, dest]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Banner & Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <UserCheck className="w-7 h-7" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {patient.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-900/80 text-blue-200 border border-blue-700/50">
                  #{patient.serialNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    patient.riskAssessment === 'يحتاج تحويل'
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-700/50'
                      : patient.riskAssessment === 'يحتاج متابعة'
                      ? 'bg-amber-900/80 text-amber-200 border border-amber-700/50'
                      : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700/50'
                  }`}
                >
                  {patient.riskAssessment === 'يحتاج تحويل'
                    ? t('referralRisk')
                    : patient.riskAssessment === 'يحتاج متابعة'
                    ? t('followupRisk')
                    : t('normalRisk')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-medium flex-wrap">
                <span>
                  {t('nationalId')}:{' '}
                  <strong className="font-mono text-white">{patient.nationalId}</strong>
                </span>
                <span>•</span>
                <span>
                  {patient.age} {t('yearsOld')} ({patient.gender === 'ذكر' ? t('male') : t('female')})
                </span>
                <span>•</span>
                <span>{patient.healthUnit}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(patient)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printOfficialForm')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title={t('closeProfile')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-6 pt-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-blue-700 dark:border-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('viewTimelineTab')}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-bold">
                {allVisits.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-blue-700 dark:border-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('patientBasicInfoTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('medicalHistory')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-black transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'medicalHistory'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-blue-700 dark:border-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>{t('medicalHistoryTab')}</span>
            </button>
          </div>

          {activeTab === 'timeline' && (
            <button
              onClick={() => setIsAddVisitOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer mb-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addVisitBtn')}</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-6">
              {/* Timeline Vitals & Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Visits Card */}
                <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t('totalVisitsRecorded')}
                    </span>
                    <span className="text-xl font-black text-blue-900 dark:text-blue-300">
                      {allVisits.length} {t('matchingCases')}
                    </span>
                  </div>
                </div>

                {/* Latest Visit Date */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t('latestVisitDate')}
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-900 dark:text-emerald-300">
                      {newestVisit?.visitDate || patient.registrationDate}
                    </span>
                  </div>
                </div>

                {/* Blood Pressure Progress */}
                <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-100 dark:border-amber-900 flex items-center gap-3">
                  <div className="p-3 bg-amber-600 text-white rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t('trendBP')}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-black text-amber-900 dark:text-amber-300 text-sm">
                      <span>
                        {currentSys ? `${currentSys} mmHg` : '-'}
                      </span>
                      {bpDiff !== 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold flex items-center ${
                            bpDiff < 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {bpDiff < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {Math.abs(bpDiff)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blood Glucose Progress */}
                <div className="bg-rose-50/70 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900 flex items-center gap-3">
                  <div className="p-3 bg-rose-600 text-white rounded-xl">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {t('trendGlucose')}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-black text-rose-900 dark:text-rose-300 text-sm">
                      <span>
                        {currentGlucose ? `${currentGlucose} mg/dL` : '-'}
                      </span>
                      {glucoseDiff !== 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold flex items-center ${
                            glucoseDiff < 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {glucoseDiff < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {Math.abs(glucoseDiff)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar: Sorting & Filtering Timeline */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-300">
                    تصفية الأحداث:
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'all', label: 'جميع الزيارات' },
                      { id: 'referrals', label: 'زيارات مع إحالات' },
                      { id: 'highRisk', label: 'حالات عالية الخطورة' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterType(f.id as any)}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          filterType === f.id
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">الترتيب الزمني:</span>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-700 dark:text-blue-400 font-extrabold hover:bg-slate-100 cursor-pointer"
                  >
                    {sortOrder === 'desc' ? 'الأحدث أولاً ↓' : 'الأقدم أولاً ↑'}
                  </button>
                </div>
              </div>

              {/* TIMELINE VERTICAL LIST */}
              <div className="relative border-r-2 border-blue-200 dark:border-blue-900 pr-6 mr-3 space-y-8">
                {filteredVisits.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 font-bold text-xs">
                    {t('noVisitsFound')}
                  </div>
                ) : (
                  filteredVisits.map((visit, index) => (
                    <div key={visit.id} className="relative group">
                      {/* Timeline Dot Icon */}
                      <div className="absolute -right-[35px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 flex items-center justify-center text-blue-700 dark:text-blue-400 shadow-md">
                        {visit.riskAssessment === 'يحتاج تحويل' ? (
                          <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        )}
                      </div>

                      {/* Timeline Card */}
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                        {/* Visit Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-extrabold text-xs">
                              {visit.visitType}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              {visit.visitDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 ${
                                visit.riskAssessment === 'يحتاج تحويل'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : visit.riskAssessment === 'يحتاج متابعة'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {visit.riskAssessment === 'يحتاج تحويل' && (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                              {visit.riskAssessment === 'طبيعي' && (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {visit.riskAssessment === 'يحتاج تحويل'
                                  ? t('referralRisk')
                                  : visit.riskAssessment === 'يحتاج متابعة'
                                  ? t('followupRisk')
                                  : t('normalRisk')}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Visit Vitals & Labs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium block">
                              {t('hypertension')}:
                            </span>
                            <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                              {visit.labs?.systolicBP || '-'}/{visit.labs?.diastolicBP || '-'}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium block">
                              {t('diabetes')}:
                            </span>
                            <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                              {visit.labs?.bloodGlucose || '-'} mg/dL
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium block">
                              الكوليسترول (TC):
                            </span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {visit.labs?.tc || '-'} mg/dL
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-500 dark:text-slate-400 font-medium block">
                              الهيموجلوبين (Hgb):
                            </span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {visit.labs?.hgb || '-'} g/dL
                            </span>
                          </div>
                        </div>

                        {/* Referral Details if available */}
                        {(visit.referralDestinations || []).length > 0 && (
                          <div className="bg-rose-50/80 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 flex flex-col gap-1.5 text-xs">
                            <div className="flex items-center gap-2 font-black text-rose-900 dark:text-rose-300">
                              <Send className="w-4 h-4 text-rose-600" />
                              <span>{t('referralDetailsTimeline')}:</span>
                              <span className="bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 px-2.5 py-0.5 rounded-lg text-[11px]">
                                {visit.referralDestinations.join('، ')}
                              </span>
                            </div>
                            {visit.referralReason && (
                              <p className="text-rose-800 dark:text-rose-300/90 font-medium">
                                <strong>سبب الإحالة:</strong> {visit.referralReason}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Visit Notes & Attending Doctor */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                          <p className="font-medium italic text-slate-700 dark:text-slate-300">
                            "{visit.notes || 'لا توجد ملاحظات إضافية مدونة.'}"
                          </p>
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{visit.doctorName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL & DEMOGRAPHIC INFO */}
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-blue-700" />
                <span>{t('patientBasicInfoTab')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('fullNameQuad')}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {patient.fullName}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('nationalId')}</span>
                  <span className="text-sm font-mono font-black text-blue-900 dark:text-blue-300">
                    {patient.nationalId}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('phoneNumber')}</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                    {patient.phone}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('ageCalculated')} & {t('gender')}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {patient.age} {t('yearsOld')} • {patient.gender === 'ذكر' ? t('male') : t('female')}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('residencyType')} & {t('villageStreet')}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {patient.residencyType === 'حضر' ? t('urban') : t('rural')} • {patient.village || '-'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-bold">{t('healthUnit')}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {patient.healthUnit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL HISTORY & CHRONIC CONDITIONS */}
          {activeTab === 'medicalHistory' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm border-b pb-3 flex items-center gap-2 border-slate-100 dark:border-slate-800">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>{t('sectionMedicalHistory')}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {[
                  { key: 'hypertension', label: t('hypertension') },
                  { key: 'diabetes', label: t('diabetes') },
                  { key: 'heartDisease', label: t('heartDisease') },
                  { key: 'stroke', label: t('stroke') },
                  { key: 'liverDisease', label: t('liverDisease') },
                  { key: 'kidneyDisease', label: t('kidneyDisease') },
                  { key: 'chestDisease', label: t('chestDisease') },
                  { key: 'osteoporosis', label: t('osteoporosis') },
                  { key: 'hearingLoss', label: t('hearingLoss') },
                  { key: 'visionLoss', label: t('visionLoss') },
                  { key: 'memoryDisorder', label: t('memoryDisorders') },
                  { key: 'depression', label: t('depression') },
                ].map((item) => {
                  const hasCondition =
                    patient.medicalHistory[
                      item.key as keyof typeof patient.medicalHistory
                    ];

                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border flex items-center justify-between font-bold ${
                        hasCondition
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-sm font-bold">
                        {hasCondition ? '✔ مصاب' : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            سجل المبادرة المعتمد • رمز الملف: #{patient.id}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            {t('closeProfile')}
          </button>
        </div>
      </div>

      {/* QUICK ADD NEW VISIT MODAL / DRAWER */}
      {isAddVisitOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {t('addVisitBtn')} ({patient.fullName})
                </h3>
              </div>
              <button
                onClick={() => setIsAddVisitOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewVisitSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    تاريخ الزيانة / الفحص
                  </label>
                  <input
                    type="date"
                    required
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    نوع الزيانة
                  </label>
                  <select
                    value={newVisitType}
                    onChange={(e) => setNewVisitType(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold outline-none cursor-pointer"
                  >
                    <option value="متابعة دورية ضغط وسكر">متابعة دورية ضغط وسكر</option>
                    <option value="فحص شمول كبار السن">فحص شمول كبار السن</option>
                    <option value="إعادة فحص معملي">إعادة فحص معملي</option>
                    <option value="تحويل عاجل للمستشفى">تحويل عاجل للمستشفى</option>
                    <option value="استشارة طبية">استشارة طبية</option>
                  </select>
                </div>
              </div>

              {/* Vitals Inputs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">الضغط الانقباضي</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newSystolicBP}
                    onChange={(e) => setNewSystolicBP(e.target.value)}
                    className="bg-white dark:bg-slate-800 border rounded-lg p-1.5 font-mono text-center outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">الضغط الانبساطي</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={newDiastolicBP}
                    onChange={(e) => setNewDiastolicBP(e.target.value)}
                    className="bg-white dark:bg-slate-800 border rounded-lg p-1.5 font-mono text-center outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-600">السكر (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="110"
                    value={newBloodGlucose}
                    onChange={(e) => setNewBloodGlucose(e.target.value)}
                    className="bg-white dark:bg-slate-800 border rounded-lg p-1.5 font-mono text-center outline-none"
                  />
                </div>
              </div>

              {/* Risk Assessment & Doctor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    تقييم الخطورة
                  </label>
                  <select
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold outline-none cursor-pointer"
                  >
                    <option value="طبيعي">{t('normalRisk')}</option>
                    <option value="يحتاج متابعة">{t('followupRisk')}</option>
                    <option value="يحتاج تحويل">{t('referralRisk')}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    اسم الطبيب الفاحص
                  </label>
                  <input
                    type="text"
                    required
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Referral Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  وجهات الإحالة (إن وجدت)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'رمد',
                    'أسنان',
                    'باطنة',
                    'عظام',
                    'علاج طبيعي',
                    'نفسية',
                    'أخرى',
                  ].map((dest) => {
                    const isSel = newReferrals.includes(dest as any);
                    return (
                      <button
                        type="button"
                        key={dest}
                        onClick={() => toggleReferralSelection(dest as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isSel
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {dest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visit Notes */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  ملاحظات ونتائج الزيارة
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب ملاحظات الفحص الدوري وتعديل الجرعات..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddVisitOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {t('cancelPresetBtn')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md transition-all cursor-pointer"
                >
                  حفظ الزيارة بملف المواطن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
