import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PatientRecord,
  MedicalHistory,
  LabResults,
  Examinations,
  MedicalTeam,
  RiskLevel,
  ReferralDestination,
  UserRole,
} from '../types/health';
import { parseEgyptianNationalId } from '../utils/nationalIdParser';
import {
  calculateBMI,
  evaluateBloodPressure,
  evaluateTC,
  evaluateTG,
  evaluateHDL,
  evaluateLDL,
  evaluateGFR,
  evaluateCreatinine,
  evaluateHgb,
} from '../utils/healthCalculators';
import {
  AlertCircle,
  CheckCircle2,
  Save,
  Printer,
  FileSpreadsheet,
  Heart,
  Activity,
  User,
  UserCheck,
  Stethoscope,
  Eye,
  Calendar,
  AlertTriangle,
  Info,
  Check,
  Building2,
  ClipboardList,
} from 'lucide-react';

interface RegistrationFormProps {
  existingRecord?: PatientRecord | null;
  onSaveRecord: (record: PatientRecord) => void;
  onPrintRecord: (record: PatientRecord) => void;
  existingNationalIds: string[];
  userRole: UserRole;
  currentUnit: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  existingRecord,
  onSaveRecord,
  onPrintRecord,
  existingNationalIds,
  userRole,
  currentUnit,
}) => {
  const { t, language } = useLanguage();
  // Serial number generation logic
  const [serialNumber, setSerialNumber] = useState<string>(
    existingRecord?.serialNumber || `2026-AD-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const [nationalId, setNationalId] = useState<string>(existingRecord?.nationalId || '');
  const [fullName, setFullName] = useState<string>(existingRecord?.fullName || '');
  const [phone, setPhone] = useState<string>(existingRecord?.phone || '');
  const [residencyType, setResidencyType] = useState<'حضر' | 'ريف'>(
    existingRecord?.residencyType || 'حضر'
  );
  const [serviceLocation, setServiceLocation] = useState<string>(
    existingRecord?.serviceLocation || 'إدارة 6 أكتوبر الصحية'
  );
  const [healthUnit, setHealthUnit] = useState<string>(
    existingRecord?.healthUnit || currentUnit || 'وحدة الأمل الصحية'
  );
  const [village, setVillage] = useState<string>(existingRecord?.village || '');
  const [age, setAge] = useState<number>(existingRecord?.age || 0);
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>(existingRecord?.gender || 'ذكر');
  const [birthDate, setBirthDate] = useState<string>(existingRecord?.birthDate || '');
  const [governorate, setGovernorate] = useState<string>('');

  // Auto parsing feedback
  const [nidError, setNidError] = useState<string | null>(null);
  const [nidSuccess, setNidSuccess] = useState<string | null>(null);

  // Medical History State
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>(
    existingRecord?.medicalHistory || {
      hypertension: false,
      diabetes: false,
      heartDisease: false,
      stroke: false,
      liverDisease: false,
      kidneyDisease: false,
      chestDisease: false,
      osteoporosis: false,
      hearingLoss: false,
      visionLoss: false,
      memoryDisorder: false,
      depression: false,
      recurrentFalls: false,
      incontinence: false,
      malnutrition: false,
      other: false,
      otherNotes: '',
    }
  );

  // Lab Results State
  const [labs, setLabs] = useState<LabResults>(
    existingRecord?.labs || {
      tc: undefined,
      tg: undefined,
      hdl: undefined,
      ldl: undefined,
      gfr: undefined,
      cr: undefined,
      hgb: undefined,
      systolicBP: undefined,
      diastolicBP: undefined,
      bloodGlucose: undefined,
      weightKg: undefined,
      heightCm: undefined,
    }
  );

  // Risk Assessment State
  const [riskAssessment, setRiskAssessment] = useState<RiskLevel>(
    existingRecord?.riskAssessment || 'طبيعي'
  );

  // Referral Destinations State
  const [referralDestinations, setReferralDestinations] = useState<ReferralDestination[]>(
    existingRecord?.referralDestinations || []
  );
  const [referralReason, setReferralReason] = useState<string>(
    existingRecord?.referralReason || ''
  );
  const [referralDate, setReferralDate] = useState<string>(
    existingRecord?.referralDate || new Date().toISOString().split('T')[0]
  );

  // Examinations State
  const [examinations, setExaminations] = useState<Examinations>(
    existingRecord?.examinations || {
      eyeRight: 'تم',
      eyeLeft: 'تم',
      teethUpper: 'تم',
      teethLower: 'تم',
      psychological: 'تم',
      motor: 'تم',
    }
  );

  // Medical Team State
  const [medicalTeam, setMedicalTeam] = useState<MedicalTeam>(
    existingRecord?.medicalTeam || {
      doctor: 'د. خالد عبدالغفار',
      nurse: 'أ/ سميرة محمد',
      labTech: 'أ/ أحمد فتحي',
      healthEducator: 'أ/ شيماء خليل',
    }
  );

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Parse National ID on change
  useEffect(() => {
    if (!nationalId) {
      setNidError(null);
      setNidSuccess(null);
      return;
    }

    // Check duplicate (except if editing existing record)
    if (
      !existingRecord &&
      existingNationalIds.includes(nationalId.trim())
    ) {
      setNidError('⚠️ هذا الرقم القومي مسجل بالفعل في السجل اليومي!');
      setNidSuccess(null);
      return;
    }

    const parsed = parseEgyptianNationalId(nationalId);

    if (parsed.isValid) {
      setNidError(null);
      setAge(parsed.age || 0);
      setGender(parsed.gender || 'ذكر');
      setBirthDate(parsed.birthDate || '');
      setGovernorate(parsed.governorate || '');
      setNidSuccess(
        `تم استخراج البيانات: تاريخ الميلاد ${parsed.formattedBirthDate} • العمر ${parsed.age} سنة • ${parsed.gender} • ${parsed.governorate}`
      );
    } else {
      setNidError(parsed.error || 'الرقم القومي غير مكتمل');
      setNidSuccess(null);
    }
  }, [nationalId, existingRecord, existingNationalIds]);

  // Auto-Suggest Risk Level when Labs or Diseases are critical
  useEffect(() => {
    const bpEval = evaluateBloodPressure(labs.systolicBP, labs.diastolicBP);
    const tcEval = evaluateTC(labs.tc);
    const crEval = evaluateCreatinine(labs.cr);
    const gfrEval = evaluateGFR(labs.gfr);

    const hasChronicDisease =
      medicalHistory.hypertension ||
      medicalHistory.diabetes ||
      medicalHistory.heartDisease ||
      medicalHistory.stroke ||
      medicalHistory.kidneyDisease;

    if (
      bpEval?.status === 'critical' ||
      bpEval?.status === 'high' ||
      tcEval?.status === 'high' ||
      crEval?.status === 'high' ||
      gfrEval?.status === 'high' ||
      referralDestinations.length > 0
    ) {
      setRiskAssessment('يحتاج تحويل');
    } else if (
      bpEval?.status === 'borderline' ||
      tcEval?.status === 'borderline' ||
      hasChronicDisease ||
      medicalHistory.other
    ) {
      setRiskAssessment('يحتاج متابعة');
    }
  }, [labs, medicalHistory, referralDestinations]);

  // Toggle Referral Checkbox
  const toggleReferral = (dest: ReferralDestination) => {
    if (referralDestinations.includes(dest)) {
      setReferralDestinations(referralDestinations.filter((d) => d !== dest));
    } else {
      setReferralDestinations([...referralDestinations, dest]);
    }
  };

  // Toggle Medical History Checkbox
  const toggleHistory = (key: keyof MedicalHistory) => {
    if (key === 'otherNotes') return;
    setMedicalHistory({
      ...medicalHistory,
      [key]: !medicalHistory[key],
    });
  };

  // Evaluated indicators for live visual badge display
  const bmiRes = calculateBMI(labs.weightKg, labs.heightCm);
  const bpEval = evaluateBloodPressure(labs.systolicBP, labs.diastolicBP);
  const tcEval = evaluateTC(labs.tc);
  const tgEval = evaluateTG(labs.tg);
  const hdlEval = evaluateHDL(labs.hdl, gender);
  const ldlEval = evaluateLDL(labs.ldl);
  const gfrEval = evaluateGFR(labs.gfr);
  const crEval = evaluateCreatinine(labs.cr);
  const hgbEval = evaluateHgb(labs.hgb, gender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === 'قارئ فقط') {
      alert('حسابك مخصص للقراءة فقط، ليس لديك صلاحية حفظ الحالات.');
      return;
    }

    if (!nationalId || nationalId.length !== 14) {
      alert('الرجاء أدخل رقم قومي صحيح مكون من 14 رقم.');
      return;
    }

    if (!fullName.trim()) {
      alert('الرجاء إدخال الاسم الرباعي.');
      return;
    }

    const recordToSave: PatientRecord = {
      id: existingRecord?.id || `rec-${Date.now()}`,
      serialNumber,
      nationalId,
      fullName,
      phone,
      residencyType,
      serviceLocation,
      healthUnit,
      village,
      age,
      birthDate,
      gender,
      registrationDate: existingRecord?.registrationDate || new Date().toISOString().split('T')[0],
      medicalHistory,
      labs,
      riskAssessment,
      referralDestinations,
      referralReason,
      referralDate,
      examinations,
      medicalTeam,
      syncStatus: 'pending',
      createdById: 'usr-1',
      createdByName: 'د. أحمد محمود',
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRecord(recordToSave);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-12">
      {/* Toast Save Alert */}
      {isSavedAlert && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم حفظ بيانات الحالة بنجاح وتوليد السجل المعتمد!</span>
        </div>
      )}

      {/* Top Banner Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-xl flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              استمارة الفحص الطبي الشامل للمواطن
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              مسلسل السجل اليدوي:{' '}
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
                #{serialNumber}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {existingRecord && (
            <button
              type="button"
              onClick={() => onPrintRecord(existingRecord)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السجل الورقي</span>
            </button>
          )}

          <button
            type="submit"
            disabled={userRole === 'قارئ فقط'}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات الحالة</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: البيانات الأساسية */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="w-1.5 h-6 bg-blue-700 rounded-full"></div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            {t('section1Title')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* المسلسل */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('serialNumber')}
            </label>
            <input
              type="text"
              readOnly
              value={serialNumber}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-blue-800 dark:text-blue-300 cursor-not-allowed"
            />
          </div>

          {/* الرقم القومي */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex justify-between">
              <span>{t('nationalId')}</span>
            </label>
            <input
              type="text"
              maxLength={14}
              required
              placeholder="29501010102568"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* رقم التليفون */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('phoneNumber')}
            </label>
            <input
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* نوع الإقامة */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {t('residencyType')}
            </label>
            <div className="grid grid-cols-2 gap-2 h-10">
              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  residencyType === 'حضر'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="residency"
                  checked={residencyType === 'حضر'}
                  onChange={() => setResidencyType('حضر')}
                  className="hidden"
                />
                <span>{t('urban')}</span>
              </label>

              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  residencyType === 'ريف'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="residency"
                  checked={residencyType === 'ريف'}
                  onChange={() => setResidencyType('ريف')}
                  className="hidden"
                />
                <span>{t('rural')}</span>
              </label>
            </div>
          </div>

          {/* مكان تقديم الخدمة */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              مكان تقديم الخدمة (الإدارة)
            </label>
            <input
              type="text"
              value={serviceLocation}
              onChange={(e) => setServiceLocation(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* الوحدة الصحية */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              الوحدة الصحية
            </label>
            <input
              type="text"
              value={healthUnit}
              onChange={(e) => setHealthUnit(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* الاسم رباعي */}
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              الاسم رباعي
            </label>
            <input
              type="text"
              required
              placeholder="أدخل اسم المواطن كاملاً رباعياً..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* السن (محسوب تلقائياً) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              السن (يحسب تلقائياً)
            </label>
            <input
              type="text"
              readOnly
              value={age ? `${age} عام` : 'يولد من القومي'}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-not-allowed"
            />
          </div>

          {/* النوع (ذكر / أنثى) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              النوع
            </label>
            <div className="grid grid-cols-2 gap-2 h-10">
              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  gender === 'ذكر'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'ذكر'}
                  onChange={() => setGender('ذكر')}
                  className="hidden"
                />
                <span>ذكر</span>
              </label>

              <label
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  gender === 'أنثى'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'أنثى'}
                  onChange={() => setGender('أنثى')}
                  className="hidden"
                />
                <span>أنثى</span>
              </label>
            </div>
          </div>

          {/* القرية / المنطقة */}
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              القرية / الحي / الشارع
            </label>
            <input
              type="text"
              placeholder="مثال: الحي السادس - مجاورة 4"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* NID Parse Live Status Banner */}
        {nidError && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{nidError}</span>
          </div>
        )}

        {nidSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{nidSuccess}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: التاريخ المرضي (Checkboxes) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              التاريخ المرضي والأمراض المزمنة (ضع علامة أمام كل بند ينطبق)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { key: 'hypertension', label: 'ضغط الدم المرتفع' },
            { key: 'diabetes', label: 'مرض السكري' },
            { key: 'heartDisease', label: 'أمراض القلب والشرايين' },
            { key: 'stroke', label: 'سكتة دماغية سابقة' },
            { key: 'liverDisease', label: 'أمراض الكبد' },
            { key: 'kidneyDisease', label: 'أمراض الكلى' },
            { key: 'chestDisease', label: 'أمراض الصدر والتنفس' },
            { key: 'osteoporosis', label: 'هشاشة العظام' },
            { key: 'hearingLoss', label: 'ضعف السمع' },
            { key: 'visionLoss', label: 'ضعف الإبصار' },
            { key: 'memoryDisorder', label: 'اضطرابات الذاكرة / الزهايمر' },
            { key: 'depression', label: 'الاكتئاب أو الاضطرابات النفسية' },
            { key: 'recurrentFalls', label: 'سقوط متكرر' },
            { key: 'incontinence', label: 'سلس بول' },
            { key: 'malnutrition', label: 'سوء تغذية / أنيميا' },
            { key: 'other', label: 'أخرى' },
          ].map((item) => {
            const isChecked = medicalHistory[item.key as keyof MedicalHistory] as boolean;
            return (
              <label
                key={item.key}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleHistory(item.key as keyof MedicalHistory)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>

        {/* Note if "أخرى" is checked */}
        {medicalHistory.other && (
          <div className="mt-4 flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              كتابة ملاحظة لأمراض أو ظروف صحية أخرى:
            </label>
            <input
              type="text"
              placeholder="اكتب التفاصيل والملاحظات الطبية هنا..."
              value={medicalHistory.otherNotes || ''}
              onChange={(e) =>
                setMedicalHistory({ ...medicalHistory, otherNotes: e.target.value })
              }
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* SECTION 3: التحاليل والقياسات الحيوية */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-600" />
              القياسات الحيوية والتحاليل المعملية (تتلوّن النتائج تلقائياً حسب المرجعية الطبية)
            </h3>
          </div>
        </div>

        {/* Top Physical measurements: Height, Weight, BP, Blood Glucose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Weight */}
          <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              الوزن (كجم)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="مثال: 78"
              value={labs.weightKg || ''}
              onChange={(e) =>
                setLabs({ ...labs, weightKg: parseFloat(e.target.value) || undefined })
              }
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              الطول (سم)
            </label>
            <input
              type="number"
              placeholder="مثال: 170"
              value={labs.heightCm || ''}
              onChange={(e) =>
                setLabs({ ...labs, heightCm: parseFloat(e.target.value) || undefined })
              }
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Computed BMI Badge */}
          <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              مؤشر كتلة الجسم (BMI)
            </label>
            {bmiRes ? (
              <div
                className={`p-2 rounded-lg text-center font-extrabold text-xs border ${bmiRes.colorClass}`}
              >
                {bmiRes.bmi} • {bmiRes.category}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-2 text-center">أدخل الوزن والطول لحسابه</div>
            )}
          </div>

          {/* Blood Glucose */}
          <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              قياس السكر (مجم/دسل)
            </label>
            <input
              type="number"
              placeholder="مثال: 125"
              value={labs.bloodGlucose || ''}
              onChange={(e) =>
                setLabs({ ...labs, bloodGlucose: parseFloat(e.target.value) || undefined })
              }
              className={`bg-white dark:bg-slate-900 border rounded-lg p-2 text-xs font-bold outline-none ${
                labs.bloodGlucose && labs.bloodGlucose >= 200
                  ? 'border-rose-400 text-rose-700 bg-rose-50'
                  : labs.bloodGlucose && labs.bloodGlucose >= 140
                  ? 'border-amber-400 text-amber-700 bg-amber-50'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
          </div>
        </div>

        {/* Blood Pressure Input */}
        <div className="mb-6 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ضغط الدم:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="الانقباضي (120)"
                  value={labs.systolicBP || ''}
                  onChange={(e) =>
                    setLabs({ ...labs, systolicBP: parseFloat(e.target.value) || undefined })
                  }
                  className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-center outline-none"
                />
                <span className="font-bold text-slate-400">/</span>
                <input
                  type="number"
                  placeholder="الانبساطي (80)"
                  value={labs.diastolicBP || ''}
                  onChange={(e) =>
                    setLabs({ ...labs, diastolicBP: parseFloat(e.target.value) || undefined })
                  }
                  className="w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-center outline-none"
                />
              </div>
            </div>

            {bpEval && (
              <div
                className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${bpEval.colorClass}`}
              >
                {bpEval.label} {bpEval.recommendation && `• ${bpEval.recommendation}`}
              </div>
            )}
          </div>
        </div>

        {/* Required Lab Fields Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* TC */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              TC (كوليسترول)
            </label>
            <input
              type="number"
              placeholder="< 200"
              value={labs.tc || ''}
              onChange={(e) =>
                setLabs({ ...labs, tc: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                tcEval ? tcEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {tcEval && <span className="text-[10px] font-bold text-slate-500">{tcEval.label}</span>}
          </div>

          {/* TG */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              TG (ثلاثي)
            </label>
            <input
              type="number"
              placeholder="< 150"
              value={labs.tg || ''}
              onChange={(e) =>
                setLabs({ ...labs, tg: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                tgEval ? tgEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {tgEval && <span className="text-[10px] font-bold text-slate-500">{tgEval.label}</span>}
          </div>

          {/* HDL */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              HDL (جيد)
            </label>
            <input
              type="number"
              placeholder="≥ 40"
              value={labs.hdl || ''}
              onChange={(e) =>
                setLabs({ ...labs, hdl: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                hdlEval ? hdlEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {hdlEval && <span className="text-[10px] font-bold text-slate-500">{hdlEval.label}</span>}
          </div>

          {/* LDL */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              LDL (ضار)
            </label>
            <input
              type="number"
              placeholder="< 100"
              value={labs.ldl || ''}
              onChange={(e) =>
                setLabs({ ...labs, ldl: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                ldlEval ? ldlEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {ldlEval && <span className="text-[10px] font-bold text-slate-500">{ldlEval.label}</span>}
          </div>

          {/* GFR */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              GFR (ترشيح)
            </label>
            <input
              type="number"
              placeholder="≥ 90"
              value={labs.gfr || ''}
              onChange={(e) =>
                setLabs({ ...labs, gfr: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                gfrEval ? gfrEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {gfrEval && <span className="text-[10px] font-bold text-slate-500">{gfrEval.label}</span>}
          </div>

          {/* CR */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              CR (كرياتينين)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="0.6 - 1.2"
              value={labs.cr || ''}
              onChange={(e) =>
                setLabs({ ...labs, cr: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                crEval ? crEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {crEval && <span className="text-[10px] font-bold text-slate-500">{crEval.label}</span>}
          </div>

          {/* Hgb */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Hgb (هيموجلوبين)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="12 - 17.5"
              value={labs.hgb || ''}
              onChange={(e) =>
                setLabs({ ...labs, hgb: parseFloat(e.target.value) || undefined })
              }
              className={`p-2.5 rounded-xl text-xs font-bold border outline-none ${
                hgbEval ? hgbEval.colorClass : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            />
            {hgbEval && <span className="text-[10px] font-bold text-slate-500">{hgbEval.label}</span>}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          ملاحظة: تلوين الحقول يتم تلقائياً بالمعايير الرسمية (الأخضر: طبيعي، الأصفر: حدي/متابعة، الأحمر: مرتفع أو خطورة).
        </p>
      </div>

      {/* SECTION 4 & 5: تقييم عوامل الخطورة + الإحالات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Assessment */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                تقييم عوامل الخطورة النهائي
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تصنيف حالة المواطن:
              </label>
              <select
                value={riskAssessment}
                onChange={(e) => setRiskAssessment(e.target.value as RiskLevel)}
                className={`p-3 rounded-xl text-sm font-extrabold border outline-none cursor-pointer ${
                  riskAssessment === 'يحتاج تحويل'
                    ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300'
                    : riskAssessment === 'يحتاج متابعة'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                }`}
              >
                <option value="طبيعي">طبيعي (لا توجد عوامل خطورة)</option>
                <option value="يحتاج متابعة">يحتاج متابعة بالوحدة الصحية</option>
                <option value="يحتاج تحويل">يحتاج تحويل للرعاية التخصصية / مستشفى</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            {riskAssessment === 'طبيعي' && '✔ المواطن في النطاق الطبيعي، يتم تسليمه الكارت الأخضر وموعد فحص المتابعة السنوي.'}
            {riskAssessment === 'يحتاج متابعة' && '⚠️ المواطن يحتاج متابعة دورية بالوحدة الصحية لتنظيم الضغط أو السكر.'}
            {riskAssessment === 'يحتاج تحويل' && '🚨 حالة تتطلب تحويل لمستشفى الإحالة مع طباعة جواب الإحالة المعتمد.'}
          </div>
        </div>

        {/* Referral Section (الإحالة) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              جهات الإحالة المتاحة (يمكن إحالة المواطن لأكثر من جهة)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            {(
              [
                'رمد',
                'أسنان',
                'باطنة',
                'عظام',
                'علاج طبيعي',
                'نفسية',
                'أخرى',
              ] as ReferralDestination[]
            ).map((dest) => {
              const selected = referralDestinations.includes(dest);
              return (
                <label
                  key={dest}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleReferral(dest)}
                    className="hidden"
                  />
                  <span>{dest}</span>
                </label>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                سبب الإحالة التفصيلي
              </label>
              <input
                type="text"
                placeholder="اكتب سبب وشكوى الإحالة لتوجيه الأخصائي..."
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                تاريخ الإحالة
              </label>
              <input
                type="date"
                value={referralDate}
                onChange={(e) => setReferralDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: الفحوصات الطبية المباشرة */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            فحوصات الوحدة الميدانية (تم / لم يتم)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* فحص النظر */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1">
              1. فحص النظر والإبصار
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">عين يمنى:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, eyeRight: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.eyeRight === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, eyeRight: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.eyeRight === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">عين يسرى:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, eyeLeft: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.eyeLeft === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, eyeLeft: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.eyeLeft === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>
          </div>

          {/* فحص الأسنان */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
            <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1">
              2. فحص الفم والأسنان
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">فك علوي:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, teethUpper: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.teethUpper === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, teethUpper: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.teethUpper === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">فك سفلي:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, teethLower: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.teethLower === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, teethLower: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.teethLower === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>
          </div>

          {/* التقييم النفسي */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1">
              3. التقييم النفسي والذاكرة
            </span>
            <div className="flex items-center justify-between my-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الحالة النفسية:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, psychological: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.psychological === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, psychological: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.psychological === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>
          </div>

          {/* التقييم الحركي */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 border-b border-slate-200 dark:border-slate-700 pb-1">
              4. التقييم الحركي والتوازن
            </span>
            <div className="flex items-center justify-between my-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">القدرة الحركية:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, motor: 'تم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.motor === 'تم'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  تم
                </button>
                <button
                  type="button"
                  onClick={() => setExaminations({ ...examinations, motor: 'لم يتم' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    examinations.motor === 'لم يتم'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  لم يتم
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: الفريق الطبي القائم بالتسجيل */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="w-1.5 h-6 bg-slate-700 rounded-full"></div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700" />
            بيانات الفريق الطبي القائم بالفحص والتسجيل
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* الطبيب */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              اسم الطبيب الفاحص *
            </label>
            <input
              type="text"
              required
              value={medicalTeam.doctor}
              onChange={(e) => setMedicalTeam({ ...medicalTeam, doctor: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* التمريض */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              التمريض المعاون *
            </label>
            <input
              type="text"
              required
              value={medicalTeam.nurse}
              onChange={(e) => setMedicalTeam({ ...medicalTeam, nurse: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* فني المعمل */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              فني المعمل *
            </label>
            <input
              type="text"
              required
              value={medicalTeam.labTech}
              onChange={(e) => setMedicalTeam({ ...medicalTeam, labTech: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* الرائد / المثقف الصحي */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              الرائد / المثقف الصحي (اختياري)
            </label>
            <input
              type="text"
              value={medicalTeam.healthEducator || ''}
              onChange={(e) =>
                setMedicalTeam({ ...medicalTeam, healthEducator: e.target.value })
              }
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={userRole === 'قارئ فقط'}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>حفظ واستخراج السجل الورقي</span>
        </button>
      </div>
    </form>
  );
};
