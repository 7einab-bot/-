export type Gender = 'ذكر' | 'أنثى';
export type ResidencyType = 'حضر' | 'ريف';
export type RiskLevel = 'طبيعي' | 'يحتاج متابعة' | 'يحتاج تحويل';

export type ReferralDestination =
  | 'رمد'
  | 'أسنان'
  | 'باطنة'
  | 'عظام'
  | 'علاج طبيعي'
  | 'نفسية'
  | 'أخرى';

export type ExamStatus = 'تم' | 'لم يتم';

export type UserRole =
  | 'مدير النظام'
  | 'منسق الإدارة الصحية'
  | 'منسق الوحدة'
  | 'إدخال بيانات'
  | 'قارئ فقط';

export interface MedicalHistory {
  hypertension: boolean; // ضغط
  diabetes: boolean; // سكر
  heartDisease: boolean; // أمراض قلب
  stroke: boolean; // سكتة دماغية
  liverDisease: boolean; // أمراض كبد
  kidneyDisease: boolean; // أمراض كلى
  chestDisease: boolean; // أمراض صدر
  osteoporosis: boolean; // هشاشة عظام
  hearingLoss: boolean; // ضعف سمع
  visionLoss: boolean; // ضعف إبصار
  memoryDisorder: boolean; // اضطرابات الذاكرة
  depression: boolean; // اكتئاب
  recurrentFalls: boolean; // سقوط متكرر
  incontinence: boolean; // سلس بول
  malnutrition: boolean; // سوء تغذية
  other: boolean; // أخرى
  otherNotes?: string; // ملاحظة أخرى
}

export interface LabResults {
  tc?: number; // Total Cholesterol (mg/dL)
  tg?: number; // Triglycerides (mg/dL)
  hdl?: number; // High Density Lipoprotein (mg/dL)
  ldl?: number; // Low Density Lipoprotein (mg/dL)
  gfr?: number; // Glomerular Filtration Rate
  cr?: number; // Creatinine (mg/dL)
  hgb?: number; // Hemoglobin (g/dL)
  bloodGlucose?: number; // Random/Fasting Blood Glucose (mg/dL)
  systolicBP?: number; // الضغط الانقباضي
  diastolicBP?: number; // الضغط الانبساطي
  weightKg?: number; // الوزن
  heightCm?: number; // الطول
}

export interface Examinations {
  eyeRight: ExamStatus; // عين يمنى
  eyeLeft: ExamStatus; // عين يسرى
  teethUpper: ExamStatus; // فك علوي
  teethLower: ExamStatus; // فك سفلي
  psychological: ExamStatus; // التقييم النفسي
  motor: ExamStatus; // التقييم الحركي
}

export interface MedicalTeam {
  doctor: string; // الطبيب
  nurse: string; // التمريض
  labTech: string; // فني المعمل
  healthEducator?: string; // الرائد / المثقف الصحي (اختياري)
}

export interface VisitRecord {
  id: string;
  visitDate: string;
  visitType: 'فحص شمول كبار السن' | 'متابعة دورية ضغط وسكر' | 'إعادة فحص معملي' | 'تحويل عاجل للمستشفى' | 'استشارة طبية';
  healthUnit: string;
  doctorName: string;
  nurseName?: string;
  labs: LabResults;
  riskAssessment: RiskLevel;
  referralDestinations?: ReferralDestination[];
  referralReason?: string;
  notes?: string;
}

export interface PatientRecord {
  id: string; // Unique ID
  serialNumber: string; // المسلسل (e.g. 2026-AD-5590)
  nationalId: string; // الرقم القومي (14 رقم)
  fullName: string; // الاسم رباعي
  phone: string; // رقم التليفون
  residencyType: ResidencyType; // حضر / ريف
  serviceLocation: string; // مكان تقديم الخدمة
  healthUnit: string; // الوحدة الصحية
  village?: string; // القرية / المنطقة
  age: number; // السن
  birthDate: string; // تاريخ الميلاد
  gender: Gender; // النوع
  registrationDate: string; // تاريخ التسجيل
  
  medicalHistory: MedicalHistory;
  labs: LabResults;
  riskAssessment: RiskLevel;
  
  referralDestinations: ReferralDestination[];
  referralReason?: string;
  referralDate?: string;
  
  examinations: Examinations;
  medicalTeam: MedicalTeam;
  visitHistory?: VisitRecord[];
  
  syncStatus: 'synced' | 'pending';
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  recordId: string;
  patientName: string;
  action: 'إنشاء' | 'تحديث' | 'تصدير' | 'طباعة' | 'حذف';
  userRole: UserRole;
  userName: string;
  timestamp: string;
  details: string;
}

export interface CustomReportPreset {
  id: string;
  name: string;
  description?: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'byUnit' | 'byDoctor' | 'byGender' | 'byAge' | 'byDiseases' | 'byReferrals';
  healthUnit: string; // 'جميع الوحدات' or unit name
  condition: 'all' | 'hypertension' | 'diabetes' | 'heartDisease' | 'kidneyDisease' | 'liverDisease' | 'stroke' | 'visionLoss' | 'hearingLoss';
  riskLevel: 'all' | RiskLevel;
  gender: 'all' | Gender;
  timeframe: 'all' | 'monthly' | 'weekly' | 'yearly';
  isDefault?: boolean;
  createdAt: string;
}

