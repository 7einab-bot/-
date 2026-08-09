import { PatientRecord } from '../types/health';

export function exportToCsv(records: PatientRecord[], filename = 'مبادرة_100_مليون_صحة_سجل_الحالات.csv') {
  const headers = [
    'المسلسل',
    'الرقم القومي',
    'الاسم رباعي',
    'السن',
    'النوع',
    'الهاتف',
    'نوع الإقامة',
    'مكان الخدمة',
    'الوحدة الصحية',
    'عامل الخطورة',
    'الضغط الانقباضي',
    'الضغط الانبساطي',
    'السكر',
    'الكوليسترول TC',
    'الثلاثي TG',
    'HDL',
    'LDL',
    'Creatinine',
    'GFR',
    'Hemoglobin',
    'جهات الإحالة',
    'تاريخ التسجيل',
  ];

  const rows = records.map((r) => [
    `"${r.serialNumber}"`,
    `"${r.nationalId}"`,
    `"${r.fullName}"`,
    r.age,
    `"${r.gender}"`,
    `"${r.phone}"`,
    `"${r.residencyType}"`,
    `"${r.serviceLocation}"`,
    `"${r.healthUnit}"`,
    `"${r.riskAssessment}"`,
    r.labs.systolicBP || '',
    r.labs.diastolicBP || '',
    r.labs.bloodGlucose || '',
    r.labs.tc || '',
    r.labs.tg || '',
    r.labs.hdl || '',
    r.labs.ldl || '',
    r.labs.cr || '',
    r.labs.gfr || '',
    r.labs.hgb || '',
    `"${(r.referralDestinations || []).join('، ')}"`,
    `"${r.registrationDate}"`,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Arabic text in Excel
    headers.join(',') +
    '\n' +
    rows.map((e) => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToFormattedExcel(records: PatientRecord[], filename = 'تقرير_مبادرة_100_مليون_صحة.xls') {
  // Generate HTML table spreadsheet with Ministry header that opens directly in Microsoft Excel
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Cairo, Arial, sans-serif; direction: rtl; }
        table { border-collapse: collapse; width: 100%; direction: rtl; }
        th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; text-align: center; }
        td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 13px; }
        .header-title { font-size: 18px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 15px; }
        .high-risk { background-color: #ffe4e6; color: #9f1239; font-weight: bold; }
        .followup { background-color: #fef3c7; color: #92400e; }
        .normal { background-color: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="header-title">وزارة الصحة والسكان - مبادرة 100 مليون صحة<br/>سجل تسليم وتفريغ الحالات اليومية للإدارة الصحية</div>
      <table>
        <thead>
          <tr>
            <th>المسلسل</th>
            <th>الرقم القومي</th>
            <th>الاسم رباعي</th>
            <th>السن</th>
            <th>النوع</th>
            <th>الهاتف</th>
            <th>الإقامة</th>
            <th>الوحدة الصحية</th>
            <th>الضغط</th>
            <th>السكر</th>
            <th>TC</th>
            <th>TG</th>
            <th>HDL</th>
            <th>LDL</th>
            <th>CR</th>
            <th>GFR</th>
            <th>Hgb</th>
            <th>تقييم الخطورة</th>
            <th>جهات الإحالة</th>
            <th>الطبيب الفاحص</th>
            <th>تاريخ التسجيل</th>
          </tr>
        </thead>
        <tbody>
  `;

  records.forEach((r) => {
    let riskClass = 'normal';
    if (r.riskAssessment === 'يحتاج تحويل') riskClass = 'high-risk';
    else if (r.riskAssessment === 'يحتاج متابعة') riskClass = 'followup';

    html += `
      <tr>
        <td>${r.serialNumber}</td>
        <td style="mso-number-format:'\\@';">${r.nationalId}</td>
        <td>${r.fullName}</td>
        <td>${r.age}</td>
        <td>${r.gender}</td>
        <td style="mso-number-format:'\\@';">${r.phone}</td>
        <td>${r.residencyType}</td>
        <td>${r.healthUnit}</td>
        <td>${r.labs.systolicBP || '-'}/${r.labs.diastolicBP || '-'}</td>
        <td>${r.labs.bloodGlucose || '-'}</td>
        <td>${r.labs.tc || '-'}</td>
        <td>${r.labs.tg || '-'}</td>
        <td>${r.labs.hdl || '-'}</td>
        <td>${r.labs.ldl || '-'}</td>
        <td>${r.labs.cr || '-'}</td>
        <td>${r.labs.gfr || '-'}</td>
        <td>${r.labs.hgb || '-'}</td>
        <td class="${riskClass}">${r.riskAssessment}</td>
        <td>${(r.referralDestinations || []).join('، ') || 'لا يوجد'}</td>
        <td>${r.medicalTeam.doctor}</td>
        <td>${r.registrationDate}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
