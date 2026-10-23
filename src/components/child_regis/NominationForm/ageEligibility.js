export const MIN_AGE_YEARS = 6;
export const MAX_AGE_YEARS = 18;

export const OVER_AGE_MESSAGE =
  "आप 18 वर्ष से अधिक आयु के कारण इस फॉर्म को भरने के लिए पात्र नहीं हैं। कृपया घटना की तिथि (तारीख) में सुधार करें।";

export const UNDER_AGE_MESSAGE =
  "आप 6 वर्ष से कम आयु के कारण इस फॉर्म को भरने के लिए पात्र नहीं हैं। कृपया जन्म तिथि अथवा घटना की तिथि (तारीख) में सुधार करें।";

const getAgeAtIncident = (birthDate, actDate) => {
  if (!birthDate || !actDate) return null;
  const incident = new Date(actDate);
  const dob = new Date(birthDate);
  if (isNaN(incident.getTime()) || isNaN(dob.getTime())) return null;

  let years = incident.getFullYear() - dob.getFullYear();
  let months = incident.getMonth() - dob.getMonth();
  let days = incident.getDate() - dob.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(incident.getFullYear(), incident.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

export const isOverAgeAtIncident = (birthDate, actDate) => {
  const age = getAgeAtIncident(birthDate, actDate);
  if (!age) return false;
  return age.years > MAX_AGE_YEARS || (age.years === MAX_AGE_YEARS && (age.months > 0 || age.days > 0));
};

export const isUnderAgeAtIncident = (birthDate, actDate) => {
  const age = getAgeAtIncident(birthDate, actDate);
  if (!age) return false;
  return age.years < MIN_AGE_YEARS;
};

export const isAgeNotEligible = (birthDate, actDate) =>
  isOverAgeAtIncident(birthDate, actDate) || isUnderAgeAtIncident(birthDate, actDate);

export const getAgeIneligibilityMessage = (birthDate, actDate) => {
  if (isOverAgeAtIncident(birthDate, actDate)) return OVER_AGE_MESSAGE;
  if (isUnderAgeAtIncident(birthDate, actDate)) return UNDER_AGE_MESSAGE;
  return "";
};
