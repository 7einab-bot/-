import { Gender } from '../types/health';

export interface NationalIdParsed {
  isValid: boolean;
  nationalId: string;
  birthDate?: string; // YYYY-MM-DD
  formattedBirthDate?: string; // DD/MM/YYYY
  age?: number;
  gender?: Gender;
  governorate?: string;
  error?: string;
}

const EGYPTIAN_GOVERNORATES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية',
};

export function parseEgyptianNationalId(nid: string): NationalIdParsed {
  const cleanNid = nid.trim();

  if (!cleanNid) {
    return { isValid: false, nationalId: cleanNid, error: 'الرجاء إدخال الرقم القومي' };
  }

  if (!/^\d+$/.test(cleanNid)) {
    return { isValid: false, nationalId: cleanNid, error: 'الرقم القومي يجب أن يتكون من أرقام فقط' };
  }

  if (cleanNid.length !== 14) {
    return {
      isValid: false,
      nationalId: cleanNid,
      error: `الرقم القومي مكتمل بـ ${cleanNid.length} رقم (المطلوب 14 رقم)`,
    };
  }

  const centuryChar = cleanNid.charAt(0);
  if (centuryChar !== '2' && centuryChar !== '3') {
    return { isValid: false, nationalId: cleanNid, error: 'رمز القرن غير صحيح (يجب أن يبدأ بـ 2 أو 3)' };
  }

  const century = centuryChar === '2' ? '19' : '20';
  const yearStr = century + cleanNid.substring(1, 3);
  const monthStr = cleanNid.substring(3, 5);
  const dayStr = cleanNid.substring(5, 7);

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) {
    return { isValid: false, nationalId: cleanNid, error: 'الشهر غير صحيح في الرقم القومي' };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, nationalId: cleanNid, error: 'اليوم غير صحيح في الرقم القومي' };
  }

  const birthDateObj = new Date(year, month - 1, day);
  if (
    birthDateObj.getFullYear() !== year ||
    birthDateObj.getMonth() !== month - 1 ||
    birthDateObj.getDate() !== day
  ) {
    return { isValid: false, nationalId: cleanNid, error: 'تاريخ الميلاد المحسوب غير صحيح' };
  }

  // Calculate age
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - (month - 1);
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }

  if (age < 0 || age > 130) {
    return { isValid: false, nationalId: cleanNid, error: 'عمر غير منطقي ناتج من الرقم القومي' };
  }

  // Gender: 13th digit (index 12) -> odd = Male, even = Female
  const genderDigit = parseInt(cleanNid.charAt(12), 10);
  const gender: Gender = genderDigit % 2 === 1 ? 'ذكر' : 'أنثى';

  // Governorate
  const govCode = cleanNid.substring(7, 9);
  const governorate = EGYPTIAN_GOVERNORATES[govCode] || 'محافظة أخرى';

  const birthDateISO = `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
  const formattedBirthDate = `${dayStr.padStart(2, '0')}/${monthStr.padStart(2, '0')}/${yearStr}`;

  return {
    isValid: true,
    nationalId: cleanNid,
    birthDate: birthDateISO,
    formattedBirthDate,
    age,
    gender,
    governorate,
  };
}
