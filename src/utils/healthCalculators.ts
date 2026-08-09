import { LabResults } from '../types/health';

export interface BmiResult {
  bmi: number;
  category: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

export interface MetricEvaluation {
  value?: number;
  status: 'normal' | 'borderline' | 'high' | 'critical' | 'low';
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  recommendation?: string;
}

export function calculateBMI(weightKg?: number, heightCm?: number): BmiResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }
  const heightMeters = heightCm / 100;
  const bmi = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'نحافة',
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
    };
  } else if (bmi < 25) {
    return {
      bmi,
      category: 'وزن طبيعي',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
    };
  } else if (bmi < 30) {
    return {
      bmi,
      category: 'زيادة وزن',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
    };
  } else if (bmi < 35) {
    return {
      bmi,
      category: 'سمنة درجة أولى',
      colorClass: 'text-orange-700 bg-orange-50 border-orange-200',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
    };
  } else {
    return {
      bmi,
      category: 'سمنة مفرطة',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
    };
  }
}

export function evaluateBloodPressure(sys?: number, dia?: number): MetricEvaluation | null {
  if (!sys && !dia) return null;
  const s = sys || 120;
  const d = dia || 80;

  if (s >= 180 || d >= 120) {
    return {
      status: 'critical',
      label: 'أزمة ارتفاع ضغط دم (خطر)',
      colorClass: 'text-rose-800 bg-rose-100 border-rose-400',
      bgClass: 'bg-rose-100',
      borderClass: 'border-rose-400',
      textClass: 'text-rose-800',
      recommendation: 'تنبيه: يحتاج تحويل فوري للطوارئ أو الباطنة',
    };
  } else if (s >= 140 || d >= 90) {
    return {
      status: 'high',
      label: 'مرتفع (المرحلة 2)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
      recommendation: 'ضغط مرتفع - يلزم تحويل أو متابعة باطنة',
    };
  } else if (s >= 130 || d >= 80) {
    return {
      status: 'borderline',
      label: 'ارتفاع طفيف (المرحلة 1)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
      recommendation: 'يحتاج إعادة قياس ومتابعة نمط الحياة',
    };
  } else if (s < 90 || d < 60) {
    return {
      status: 'low',
      label: 'منخفض',
      colorClass: 'text-sky-700 bg-sky-50 border-sky-300',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-300',
      textClass: 'text-sky-700',
    };
  } else {
    return {
      status: 'normal',
      label: 'طبيعي',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  }
}

export function evaluateTC(val?: number): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  if (val < 200) {
    return {
      value: val,
      status: 'normal',
      label: 'طبيعي (< 200)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val <= 239) {
    return {
      value: val,
      status: 'borderline',
      label: 'حدي (200 - 239)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  } else {
    return {
      value: val,
      status: 'high',
      label: 'مرتفع (≥ 240)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  }
}

export function evaluateTG(val?: number): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  if (val < 150) {
    return {
      value: val,
      status: 'normal',
      label: 'طبيعي (< 150)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val <= 199) {
    return {
      value: val,
      status: 'borderline',
      label: 'مرتفع حدي (150-199)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  } else {
    return {
      value: val,
      status: 'high',
      label: 'مرتفع جداً (≥ 200)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  }
}

export function evaluateHDL(val?: number, gender: 'ذكر' | 'أنثى' = 'ذكر'): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  const cutoff = gender === 'ذكر' ? 40 : 50;
  if (val >= cutoff) {
    return {
      value: val,
      status: 'normal',
      label: 'جيد (طبيعي)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else {
    return {
      value: val,
      status: 'high', // low HDL is a risk factor
      label: 'منخفض (عامل خطورة)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  }
}

export function evaluateLDL(val?: number): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  if (val < 100) {
    return {
      value: val,
      status: 'normal',
      label: 'مثالي (< 100)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val <= 159) {
    return {
      value: val,
      status: 'borderline',
      label: 'حدي (100-159)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  } else {
    return {
      value: val,
      status: 'high',
      label: 'مرتفع (≥ 160)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  }
}

export function evaluateGFR(val?: number): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  if (val >= 90) {
    return {
      value: val,
      status: 'normal',
      label: 'طبيعي (≥ 90)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val >= 60) {
    return {
      value: val,
      status: 'borderline',
      label: 'انخفاض طفيف (60-89)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  } else {
    return {
      value: val,
      status: 'high', // risk
      label: 'قصور وظائف كلى (< 60)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  }
}

export function evaluateCreatinine(val?: number): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  if (val >= 0.6 && val <= 1.2) {
    return {
      value: val,
      status: 'normal',
      label: 'طبيعي (0.6 - 1.2)',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val > 1.2) {
    return {
      value: val,
      status: 'high',
      label: 'مرتفع (> 1.2)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  } else {
    return {
      value: val,
      status: 'low',
      label: 'منخفض (< 0.6)',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  }
}

export function evaluateHgb(val?: number, gender: 'ذكر' | 'أنثى' = 'ذكر'): MetricEvaluation | null {
  if (val === undefined || val === null || isNaN(val)) return null;
  const minNormal = gender === 'ذكر' ? 13.0 : 12.0;
  const maxNormal = gender === 'ذكر' ? 17.5 : 15.5;

  if (val >= minNormal && val <= maxNormal) {
    return {
      value: val,
      status: 'normal',
      label: 'طبيعي',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-300',
      textClass: 'text-emerald-700',
    };
  } else if (val < minNormal) {
    return {
      value: val,
      status: 'high', // Anemia risk
      label: 'أنيميا (فقر دم)',
      colorClass: 'text-rose-700 bg-rose-50 border-rose-300',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-300',
      textClass: 'text-rose-700',
    };
  } else {
    return {
      value: val,
      status: 'borderline',
      label: 'ارتفاع هيموجلوبين',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-300',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      textClass: 'text-amber-700',
    };
  }
}
