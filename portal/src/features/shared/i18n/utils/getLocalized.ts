export type SupportedLanguage = 'en' | 'am' | 'om';

export type MultilingualValue =
  | string
  | {
      eng?: string;
      amh?: string;
      oro?: string;
      en?: string;
      am?: string;
      om?: string;
      [key: string]: any;
    }
  | null
  | undefined;

/**
 * Defensively extracts localized text from either a multilingual object
 * (e.g. { eng: 'Birth Certificate', amh: 'የልደት ምስክር ወረቀት', oro: 'Waraqaa Ragaa Dhalootaa' })
 * or a raw string, with fallbacks to avoid runtime crashes.
 */
export function getLocalizedText(
  value: MultilingualValue,
  lang: SupportedLanguage = 'en',
  fallback: string = ''
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    // Map supported language code to primary and secondary object keys
    const langKey = lang === 'en' ? 'eng' : lang === 'am' ? 'amh' : 'oro';
    const altKey = lang === 'en' ? 'en' : lang === 'am' ? 'am' : 'om';

    // 1. Direct match for selected language
    if (value[langKey] !== undefined && value[langKey] !== null) {
      if (typeof value[langKey] === 'string' && value[langKey].trim()) {
        return value[langKey].trim();
      }
      if (typeof value[langKey] === 'object') {
        const nested = getLocalizedText(value[langKey], lang, '');
        if (nested) return nested;
      }
    }
    if (value[altKey] !== undefined && value[altKey] !== null) {
      if (typeof value[altKey] === 'string' && value[altKey].trim()) {
        return value[altKey].trim();
      }
      if (typeof value[altKey] === 'object') {
        const nested = getLocalizedText(value[altKey], lang, '');
        if (nested) return nested;
      }
    }

    // 2. Direct match for backend entity property suffixes (_amh, _oro)
    if (lang === 'am') {
      const amCandidate =
        value.name_amh ||
        value.title_amh ||
        value.description_amh ||
        value.feedback_content_amh ||
        value.content_amh ||
        value.response_amh;
      if (typeof amCandidate === 'string' && amCandidate.trim()) return amCandidate.trim();
    } else if (lang === 'om') {
      const omCandidate =
        value.name_oro ||
        value.title_oro ||
        value.description_oro ||
        value.feedback_content_oro ||
        value.content_oro ||
        value.response_oro;
      if (typeof omCandidate === 'string' && omCandidate.trim()) return omCandidate.trim();
    }

    // 3. Fallback to English
    if (value.eng !== undefined && value.eng !== null) {
      if (typeof value.eng === 'string' && value.eng.trim()) {
        return value.eng.trim();
      }
      if (typeof value.eng === 'object') {
        const nested = getLocalizedText(value.eng, lang, '');
        if (nested) return nested;
      }
    }
    if (value.en !== undefined && value.en !== null) {
      if (typeof value.en === 'string' && value.en.trim()) {
        return value.en.trim();
      }
      if (typeof value.en === 'object') {
        const nested = getLocalizedText(value.en, lang, '');
        if (nested) return nested;
      }
    }

    // 4. Fallback to common entity English fields
    const enEntityField =
      value.name ||
      value.title ||
      value.description ||
      value.feedback_content ||
      value.content ||
      value.response;
    if (enEntityField !== undefined && enEntityField !== null) {
      if (typeof enEntityField === 'string' && enEntityField.trim()) return enEntityField.trim();
      if (typeof enEntityField === 'object') {
        const nested = getLocalizedText(enEntityField, lang, '');
        if (nested) return nested;
      }
    }

    // 5. Fallback to any non-empty string in the object
    for (const key of Object.keys(value)) {
      const candidate = value[key];
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return fallback;
}

