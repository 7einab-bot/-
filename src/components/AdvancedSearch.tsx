import React, { useState } from 'react';
import { PatientRecord, UserRole, VisitRecord } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import { PatientProfileTimelineModal } from './PatientProfileTimelineModal';
import {
  Search,
  Filter,
  Eye,
  Printer,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Building2,
  User,
  Phone,
  RefreshCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Clock,
} from 'lucide-react';
import { exportToCsv, exportToFormattedExcel } from '../utils/exportUtils';

interface AdvancedSearchProps {
  records: PatientRecord[];
  onSelectRecord: (record: PatientRecord) => void;
  onPrintRecord: (record: PatientRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSaveRecord?: (record: PatientRecord) => void;
  userRole: UserRole;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  records,
  onSelectRecord,
  onPrintRecord,
  onDeleteRecord,
  onSaveRecord,
  userRole,
}) => {
  const { t } = useLanguage();
  const [selectedPatientForTimeline, setSelectedPatientForTimeline] = useState<PatientRecord | null>(
    null
  );
  const [searchNationalId, setSearchNationalId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchUnit, setSearchUnit] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [searchRisk, setSearchRisk] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reset filters
  const handleReset = () => {
    setSearchNationalId('');
    setSearchName('');
    setSearchPhone('');
    setSearchUnit('');
    setSearchVillage('');
    setSearchDoctor('');
    setSearchRisk('');
    setStartDate('');
    setEndDate('');
  };

  // Filter logic
  const filteredRecords = records.filter((r) => {
    if (searchNationalId && !r.nationalId.includes(searchNationalId.trim())) return false;
    if (searchName && !r.fullName.toLowerCase().includes(searchName.trim().toLowerCase()))
      return false;
    if (searchPhone && !r.phone.includes(searchPhone.trim())) return false;
    if (searchUnit && !r.healthUnit.toLowerCase().includes(searchUnit.trim().toLowerCase()))
      return false;
    if (
      searchVillage &&
      r.village &&
      !r.village.toLowerCase().includes(searchVillage.trim().toLowerCase())
    )
      return false;
    if (
      searchDoctor &&
      !r.medicalTeam.doctor.toLowerCase().includes(searchDoctor.trim().toLowerCase())
    )
      return false;
    if (searchRisk && r.riskAssessment !== searchRisk) return false;
    if (startDate && r.registrationDate < startDate) return false;
    if (endDate && r.registrationDate > endDate) return false;

    return true;
  });

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Filter Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-700 rounded-full"></div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-700" />
              {t('advancedSearchTitle')}
            </h3>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>{t('resetFilters')}</span>
          </button>
        </div>

        {/* Inputs Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* الرقم القومي */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('nationalId')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholderNationalId')}
              value={searchNationalId}
              onChange={(e) => setSearchNationalId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الاسم */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('patientName')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholderName')}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الهاتف */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('phoneNumber')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholderPhone')}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الوحدة الصحية */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('healthUnit')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholderUnit')}
              value={searchUnit}
              onChange={(e) => setSearchUnit(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* القرية / المنطقة */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('villageStreet')}
            </label>
            <input
              type="text"
              placeholder={t('villageStreet')}
              value={searchVillage}
              onChange={(e) => setSearchVillage(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الطبيب */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('examiningDoctor')}
            </label>
            <input
              type="text"
              placeholder={t('examiningDoctor')}
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* تقييم الخطورة */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('riskAssessment')}
            </label>
            <select
              value={searchRisk}
              onChange={(e) => setSearchRisk(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="">{t('allCategories')}</option>
              <option value="طبيعي">{t('normalRisk')}</option>
              <option value="يحتاج متابعة">{t('followupRisk')}</option>
              <option value="يحتاج تحويل">{t('referralRisk')}</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('dateFromTo')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[11px] font-mono outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-[11px] font-mono outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Header & Quick Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
            {t('searchResults')}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 rounded-xl text-xs font-extrabold">
            {filteredRecords.length} {t('matchingCases')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(filteredRecords)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('exportCsv')}</span>
          </button>

          <button
            onClick={() => exportToFormattedExcel(filteredRecords)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">{t('serialNumber')}</th>
                <th className="p-3.5">{t('nationalId')}</th>
                <th className="p-3.5">{t('fullNameQuad')}</th>
                <th className="p-3.5">{t('ageCalculated')}</th>
                <th className="p-3.5">{t('gender')}</th>
                <th className="p-3.5">{t('healthUnit')}</th>
                <th className="p-3.5">{t('hypertension')}</th>
                <th className="p-3.5">{t('diabetes')}</th>
                <th className="p-3.5">{t('riskAssessment')}</th>
                <th className="p-3.5">{t('referralDestination')}</th>
                <th className="p-3.5">{t('registrationDate')}</th>
                <th className="p-3.5 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 font-bold">
                    {t('noResultsFound')}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-blue-800 dark:text-blue-300">
                      #{r.serialNumber}
                    </td>
                    <td className="p-3.5 font-mono font-bold">{r.nationalId}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {r.fullName}
                    </td>
                    <td className="p-3.5">{r.age}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          r.gender === 'ذكر'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {r.gender === 'ذكر' ? t('male') : t('female')}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {r.healthUnit}
                    </td>
                    <td className="p-3.5 font-mono">
                      {r.labs.systolicBP || '-'}/{r.labs.diastolicBP || '-'}
                    </td>
                    <td className="p-3.5 font-mono">{r.labs.bloodGlucose || '-'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold inline-flex items-center gap-1 ${
                          r.riskAssessment === 'يحتاج تحويل'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : r.riskAssessment === 'يحتاج متابعة'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        }`}
                      >
                        {r.riskAssessment === 'يحتاج تحويل' && <XCircle className="w-3 h-3" />}
                        {r.riskAssessment === 'يحتاج متابعة' && <AlertTriangle className="w-3 h-3" />}
                        {r.riskAssessment === 'طبيعي' && <CheckCircle className="w-3 h-3" />}
                        <span>
                          {r.riskAssessment === 'يحتاج تحويل'
                            ? t('referralRisk')
                            : r.riskAssessment === 'يحتاج متابعة'
                            ? t('followupRisk')
                            : t('normalRisk')}
                        </span>
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-600 dark:text-slate-400">
                      {(r.referralDestinations || []).join('، ') || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{r.registrationDate}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Chronological Patient Profile & Timeline */}
                        <button
                          onClick={() => setSelectedPatientForTimeline(r)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                          title="عرض السجل الزمني والملف الشامل"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => onSelectRecord(r)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors cursor-pointer"
                          title="عرض وتعديل البيانات"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Print Record */}
                        <button
                          onClick={() => onPrintRecord(r)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="طباعة نموذج السجل المعتمد"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete Record if admin */}
                        {(userRole === 'مدير النظام' || userRole === 'منسق الإدارة الصحية') && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت أخصائي متأكد من حذف حالة المواطن ${r.fullName}؟`)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحالة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Timeline Modal */}
      {selectedPatientForTimeline && (
        <PatientProfileTimelineModal
          patient={selectedPatientForTimeline}
          onClose={() => setSelectedPatientForTimeline(null)}
          onPrint={onPrintRecord}
          onAddVisit={(patientId, newVisit) => {
            const existingHistory = selectedPatientForTimeline.visitHistory || [];
            const updatedPatient: PatientRecord = {
              ...selectedPatientForTimeline,
              visitHistory: [newVisit, ...existingHistory],
              labs: newVisit.labs,
              riskAssessment: newVisit.riskAssessment,
              referralDestinations: newVisit.referralDestinations || selectedPatientForTimeline.referralDestinations,
              referralReason: newVisit.referralReason || selectedPatientForTimeline.referralReason,
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
