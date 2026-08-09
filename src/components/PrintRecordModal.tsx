import React from 'react';
import { PatientRecord } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface PrintRecordModalProps {
  record: PatientRecord | null;
  onClose: () => void;
}

export const PrintRecordModal: React.FC<PrintRecordModalProps> = ({ record, onClose }) => {
  const { t } = useLanguage();
  if (!record) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
        {/* Modal Top Actions Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              {t('printRecordPreviewTitle')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printOfficialForm')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Printable Sheet Container */}
        <div className="p-8 print-area bg-white text-slate-900 font-['Cairo',sans-serif]">
          {/* Paper Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-base font-black">{t('officialHeaderGov')}</h1>
              <h2 className="text-xs font-bold text-slate-700">{t('officialHeaderDirectorate')}</h2>
              <h3 className="text-sm font-extrabold text-blue-900 mt-1">
                {t('officialHeaderInitiative')} - {t('patientExamForm')}
              </h3>
            </div>

            <div className="flex flex-col text-left border p-2 border-slate-300 rounded text-xs font-bold">
              <span>{t('serialNumber')}: #{record.serialNumber}</span>
              <span>{t('dateFromTo')}: {record.registrationDate}</span>
              <span>{t('healthUnit')}: {record.healthUnit}</span>
            </div>
          </div>

          {/* Section 1: البيانات الأساسية */}
          <div className="mb-6">
            <h4 className="bg-slate-200 p-1.5 font-extrabold text-xs mb-2 text-slate-900 border-r-4 border-blue-800">
              {t('sectionBasicData')}
            </h4>
            <table className="w-full text-right text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200 w-28">{t('fullNameQuad')}:</td>
                  <td className="p-2 font-bold text-sm text-blue-950">{record.fullName}</td>
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200 w-28">{t('nationalId')}:</td>
                  <td className="p-2 font-mono font-bold">{record.nationalId}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200">{t('ageCalculated')} & {t('gender')}:</td>
                  <td className="p-2 font-bold">{record.age} • {record.gender === 'ذكر' ? t('male') : t('female')}</td>
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200">{t('phoneNumber')}:</td>
                  <td className="p-2 font-mono">{record.phone}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200">{t('healthUnit')} & {t('serviceLocation')}:</td>
                  <td className="p-2 font-bold">{record.healthUnit} - {record.serviceLocation}</td>
                  <td className="p-2 font-bold bg-slate-50 border-l border-slate-200">{t('residencyType')} & {t('villageStreet')}:</td>
                  <td className="p-2">{record.residencyType === 'حضر' ? t('urban') : t('rural')} • {record.village || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: التاريخ المرضي */}
          <div className="mb-6">
            <h4 className="bg-slate-200 p-1.5 font-extrabold text-xs mb-2 text-slate-900 border-r-4 border-emerald-700">
              {t('sectionMedicalHistory')}
            </h4>
            <div className="grid grid-cols-4 gap-2 text-xs border border-slate-300 p-3">
              <div>[ {record.medicalHistory.hypertension ? '✔' : '  '} ] {t('hypertension')}</div>
              <div>[ {record.medicalHistory.diabetes ? '✔' : '  '} ] {t('diabetes')}</div>
              <div>[ {record.medicalHistory.heartDisease ? '✔' : '  '} ] {t('heartDisease')}</div>
              <div>[ {record.medicalHistory.stroke ? '✔' : '  '} ] {t('stroke')}</div>
              <div>[ {record.medicalHistory.liverDisease ? '✔' : '  '} ] {t('liverDisease')}</div>
              <div>[ {record.medicalHistory.kidneyDisease ? '✔' : '  '} ] {t('kidneyDisease')}</div>
              <div>[ {record.medicalHistory.chestDisease ? '✔' : '  '} ] {t('chestDisease')}</div>
              <div>[ {record.medicalHistory.osteoporosis ? '✔' : '  '} ] {t('osteoporosis')}</div>
              <div>[ {record.medicalHistory.hearingLoss ? '✔' : '  '} ] {t('hearingLoss')}</div>
              <div>[ {record.medicalHistory.visionLoss ? '✔' : '  '} ] {t('visionLoss')}</div>
              <div>[ {record.medicalHistory.memoryDisorder ? '✔' : '  '} ] {t('memoryDisorders')}</div>
              <div>[ {record.medicalHistory.depression ? '✔' : '  '} ] {t('depression')}</div>
            </div>
          </div>

          {/* Section 3: القياسات والتحاليل */}
          <div className="mb-6">
            <h4 className="bg-slate-200 p-1.5 font-extrabold text-xs mb-2 text-slate-900 border-r-4 border-rose-700">
              {t('sectionLabs')}
            </h4>
            <table className="w-full text-center text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border">{t('hypertension')}</th>
                  <th className="p-2 border">{t('diabetes')}</th>
                  <th className="p-2 border">TC</th>
                  <th className="p-2 border">TG</th>
                  <th className="p-2 border">HDL</th>
                  <th className="p-2 border">LDL</th>
                  <th className="p-2 border">GFR</th>
                  <th className="p-2 border">CR</th>
                  <th className="p-2 border">Hgb</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-mono font-bold">
                    {record.labs.systolicBP || '-'}/{record.labs.diastolicBP || '-'}
                  </td>
                  <td className="p-2 border font-mono">{record.labs.bloodGlucose || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.tc || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.tg || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.hdl || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.ldl || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.gfr || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.cr || '-'}</td>
                  <td className="p-2 border font-mono">{record.labs.hgb || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: التقييم والإحالة */}
          <div className="mb-6">
            <h4 className="bg-slate-200 p-1.5 font-extrabold text-xs mb-2 text-slate-900 border-r-4 border-amber-600">
              {t('sectionRiskAssessment')}
            </h4>
            <div className="border border-slate-300 p-3 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold">
                <span>
                  {t('riskAssessment')}:{' '}
                  <strong className="text-blue-900">
                    {record.riskAssessment === 'يحتاج تحويل'
                      ? t('referralRisk')
                      : record.riskAssessment === 'يحتاج متابعة'
                      ? t('followupRisk')
                      : t('normalRisk')}
                  </strong>
                </span>
                <span>{t('referralDate')}: {record.referralDate || '-'}</span>
              </div>
              <div>
                <strong>{t('referralDestination')}:</strong>{' '}
                {(record.referralDestinations || []).join('، ') || '-'}
              </div>
              {record.referralReason && (
                <div>
                  <strong>{t('referralReason')}:</strong> {record.referralReason}
                </div>
              )}
            </div>
          </div>

          {/* Section 5: الفريق الطبي والتوقيعات */}
          <div className="pt-6 border-t border-slate-400">
            <div className="grid grid-cols-3 gap-4 text-center text-xs font-bold">
              <div>
                <p>{t('examiningDoctor')}: {record.medicalTeam.doctor}</p>
                <p className="mt-8 font-normal">{t('signatureField')}</p>
              </div>
              <div>
                <p>{t('assistingNurse')}: {record.medicalTeam.nurse}</p>
                <p className="mt-8 font-normal">{t('signatureField')}</p>
              </div>
              <div>
                <p>{t('labTech')}: {record.medicalTeam.labTech}</p>
                <p className="mt-8 font-normal">{t('healthDirectorAndStamp')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
