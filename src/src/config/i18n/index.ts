// import fs from "fs";
// import path from "path";

// type Translations = { [key: string]: string };

// export class I18n {
//   private translations: Record<string, Translations> = {};

//   constructor() {
//     this.loadTranslations();
//   }

//   private loadTranslations() {
//     const languagesDir = path.join(__dirname, "languages");
//     const files = fs.readdirSync(languagesDir);

//     files.forEach((file) => {
//       const langCode = path.basename(file, ".json");
//       const filePath = path.join(languagesDir, file);
//       const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
//       this.translations[langCode] = content;
//     });
//   }

//   translate(lang: string, key: string): string {
//     return this.translations[lang]?.[key] || key;
//   }
// }

// const i18n = new I18n();
// export default i18n;
