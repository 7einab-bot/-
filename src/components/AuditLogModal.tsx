import React from 'react';
import { AuditLogItem } from '../types/health';
import { useLanguage } from '../context/LanguageContext';
import { History, Shield, Clock, FileText } from 'lucide-react';

interface AuditLogModalProps {
  logs: AuditLogItem[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs }) => {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col gap-5 pb-12">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {t('auditLogTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('auditLogSubtitle')}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold">
          {logs.length} {t('documentedActions')}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">{t('timeAndDate')}</th>
                <th className="p-3.5">{t('userName')}</th>
                <th className="p-3.5">{t('userRoleHeader')}</th>
                <th className="p-3.5">{t('actionHeader')}</th>
                <th className="p-3.5">{t('citizenNameSerial')}</th>
                <th className="p-3.5">{t('operationDetails')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    {t('noAuditLogsFound')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {log.userName}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                          log.action === 'إنشاء'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                            : log.action === 'تحديث'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                            : log.action === 'تصدير'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                            : log.action === 'حذف'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-blue-900 dark:text-blue-300">
                      {log.patientName}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
