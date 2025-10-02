#!/usr/bin/env node
/**
 * Generate organized translation files from extraction report
 */

const fs = require('fs');
const path = require('path');

// Russian translations mapping (common phrases)
const russianMap = {
  // Common actions
  'שמור': 'Сохранить',
  'ביטול': 'Отмена',
  'מחק': 'Удалить',
  'ערוך': 'Редактировать',
  'הוסף': 'Добавить',
  'סגור': 'Закрыть',
  'חיפוש': 'Поиск',
  'סינון': 'Фильтр',
  'חזור': 'Назад',
  'שלח': 'Отправить',
  'אישור': 'Подтвердить',

  // Common nouns
  'אירועים': 'События',
  'משימות': 'Задачи',
  'בעיות': 'Проблемы',
  'פרוטוקולים': 'Протоколы',
  'ועדות': 'Комитеты',
  'משוב': 'Обратная связь',
  'הגדרות': 'Настройки',
  'דף הבית': 'Главная',
  'לוח שנה': 'Календарь',
  'כספים': 'Финансы',

  // Status
  'הצלחה': 'Успех',
  'שגיאה': 'Ошибка',
  'אזהרה': 'Предупреждение',
  'טוען': 'Загрузка',

  // Common phrases
  'בהצלחה': 'успешно',
  'נכשל': 'не удалось',
  'אין': 'нет',
  'כן': 'да',
  'לא': 'нет',
};

function translateToRussian(hebrewText) {
  // Check direct mapping
  if (russianMap[hebrewText]) {
    return russianMap[hebrewText];
  }

  // Check if it contains mapped words
  for (const [he, ru] of Object.entries(russianMap)) {
    if (hebrewText.includes(he)) {
      return hebrewText.replace(new RegExp(he, 'g'), ru);
    }
  }

  // Return placeholder for manual translation
  return `[RU: ${hebrewText}]`;
}

function generateKey(text, context, category) {
  // Remove special characters
  let key = text
    .replace(/[^\u0590-\u05FFa-zA-Z0-9\s]/g, '')
    .trim();

  // Common patterns
  if (text.includes('שגיאה')) return `error_${Math.random().toString(36).substr(2, 6)}`;
  if (text.includes('בהצלחה')) return `success_${Math.random().toString(36).substr(2, 6)}`;
  if (text.startsWith('הוסף') || text.startsWith('צור')) return `add_${Math.random().toString(36).substr(2, 6)}`;
  if (text.startsWith('ערוך')) return `edit_${Math.random().toString(36).substr(2, 6)}`;
  if (text.startsWith('מחק')) return `delete_${Math.random().toString(36).substr(2, 6)}`;

  // Generate from first few words
  const words = key.split(/\s+/).slice(0, 3);
  return words.join('_').substring(0, 40) + '_' + Math.random().toString(36).substr(2, 4);
}

function organizeTranslations(report) {
  const translations = {
    he: {},
    ru: {},
  };

  // Organize by category
  Object.entries(report.categories).forEach(([category, strings]) => {
    if (!translations.he[category]) {
      translations.he[category] = {};
      translations.ru[category] = {};
    }

    // Track seen texts to avoid duplicates
    const seen = new Set();

    strings.forEach(str => {
      // Skip duplicates within category
      if (seen.has(str.text)) return;
      seen.add(str.text);

      const key = generateKey(str.text, str.context, category);
      translations.he[category][key] = str.text;
      translations.ru[category][key] = translateToRussian(str.text);
    });
  });

  return translations;
}

function main() {
  console.log('📝 Generating translation files...\n');

  const reportPath = path.join(process.cwd(), 'translation-extraction-report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  const translations = organizeTranslations(report);

  // Save Hebrew translations
  const heFile = path.join(process.cwd(), 'messages/he-full.json');
  fs.writeFileSync(heFile, JSON.stringify(translations.he, null, 2));
  console.log(`✅ Hebrew translations: ${heFile}`);

  // Save Russian translations
  const ruFile = path.join(process.cwd(), 'messages/ru-full.json');
  fs.writeFileSync(ruFile, JSON.stringify(translations.ru, null, 2));
  console.log(`✅ Russian translations: ${ruFile}`);

  // Count keys
  const heKeys = Object.values(translations.he).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  const ruKeys = Object.values(translations.ru).reduce((sum, cat) => sum + Object.keys(cat).length, 0);

  console.log(`\n📊 Generated ${heKeys} Hebrew keys`);
  console.log(`📊 Generated ${ruKeys} Russian keys`);

  // Count auto-translated vs placeholders
  const autoTranslated = Object.values(translations.ru)
    .flatMap(cat => Object.values(cat))
    .filter(val => !val.startsWith('[RU:')).length;

  console.log(`\n✅ Auto-translated: ${autoTranslated} keys`);
  console.log(`⚠️  Need manual translation: ${ruKeys - autoTranslated} keys`);
}

main();
