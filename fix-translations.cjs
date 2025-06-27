const fs = require('fs');
const path = require('path');

// Get all .tsx and .ts files in client/src
function getAllFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files.push(name);
    }
  }
  return files;
}

const files = getAllFiles('client/src');

let updatedCount = 0;

for (const file of files) {
  // Skip the hook files themselves
  if (file.includes('use-language.tsx') || file.includes('use-db-translations.tsx')) {
    continue;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Replace import statements
  if (content.includes('import { useLanguage } from "@/hooks/use-language"')) {
    content = content.replace(
      'import { useLanguage } from "@/hooks/use-language"',
      'import { useDbTranslations } from "@/hooks/use-db-translations";\nimport { useLanguageContext } from "@/providers/LanguageProvider"'
    );
    modified = true;
  }
  
  // Replace hook usage patterns
  if (content.includes('const { t } = useLanguage()')) {
    content = content.replace('const { t } = useLanguage()', 'const { t } = useDbTranslations()');
    modified = true;
  }
  
  if (content.includes('const { t, language } = useLanguage()')) {
    content = content.replace(
      'const { t, language } = useLanguage()',
      'const { t } = useDbTranslations();\n  const { language } = useLanguageContext()'
    );
    modified = true;
  }
  
  if (content.includes('const { t, language, setLanguage } = useLanguage()')) {
    content = content.replace(
      'const { t, language, setLanguage } = useLanguage()',
      'const { t } = useDbTranslations();\n  const { language, setLanguage } = useLanguageContext()'
    );
    modified = true;
  }
  
  if (content.includes('const { language } = useLanguage()')) {
    content = content.replace(
      'const { language } = useLanguage()',
      'const { language } = useLanguageContext()'
    );
    modified = true;
  }
  
  if (content.includes('const { language, setLanguage } = useLanguage()')) {
    content = content.replace(
      'const { language, setLanguage } = useLanguage()',
      'const { language, setLanguage } = useLanguageContext()'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    updatedCount++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nTotal files updated: ${updatedCount}`);