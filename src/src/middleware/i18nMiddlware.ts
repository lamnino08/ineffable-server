// import { Request, Response, NextFunction } from "express";
// import i18n from "@/config/i18n";

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
