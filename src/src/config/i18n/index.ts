import fs from "fs";
import path from "path";

type Translations = { [key: string]: any };

export class I18n {
  private translations: Record<string, Translations> = {};

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const languagesDir = path.join(__dirname, "languages");
    const files = fs.readdirSync(languagesDir);

    files.forEach((file) => {
      const langCode = path.basename(file, ".json");
      const filePath = path.join(languagesDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        this.translations[langCode] = content;
      } catch (error) {
        console.error(`Failed to load translation file: ${file}`);
      }
    });
  }

  private getNestedValue(obj: any, key: string): string | undefined {
    return key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  translate(lang: string, key: string): string {
    const translation = this.getNestedValue(this.translations[lang], key);
    return translation || key; // Trả về từ khóa nếu không tìm thấy
  }
}

const i18n = new I18n();
export default i18n;
