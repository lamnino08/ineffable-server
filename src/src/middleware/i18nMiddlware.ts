// import { Request, Response, NextFunction } from "express";
// import i18n from "@/config/i18n/index";

// export const i18nMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const lang = req.headers["accept-language"]?.split(",")[0] || "en";
//   req.lang = lang; 
//   req.t = (key: string) => i18n.translate(lang, key); 
//   next();
// };

// // Cần thêm type vào Request để nhận `lang` và `t`.
// declare global {
//   namespace Express {
//     interface Request {
//       lang: string;
//       t: (key: string) => string;
//     }
//   }
// }
import { Request, Response, NextFunction } from "express";
import i18n from "@/config/i18n/index";
import { TranslationKeys } from "@/config/i18n/languageNest";

export const i18nMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const lang = req.headers["accept-language"]?.split(",")[0] || "en";

  req.lang = lang;
  req.t = (key: TranslationKeys) => i18n.translate(lang, key);

  next();
};

// Mở rộng type cho Express.Request
declare global {
  namespace Express {
    interface Request {
      lang: string;
      t: (key: TranslationKeys) => string;
    }
  }
}
