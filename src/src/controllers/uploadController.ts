import { Request, Response } from "express";
import fileHelper, { File } from "@/helpers/firebaseHelper";

/**
 * ✅ Upload file lên Firebase Storage theo loại (game, user, category, mechanic).
 * @route POST /upload/:type/:id
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    const { type, id } = req.params;

    // ✅ Kiểm tra loại file hợp lệ
    const validTypes = ["game", "user", "category", "mechanic"];
    if (!validTypes.includes(type)) {
      res.status(400).json({ success: false, message: "Invalid upload type" });
      return;
    }

    const file: File = req.file as File;
    const filePath = await fileHelper.uploadFileToDirectory(file, type, id);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      filePath,
    });
  } catch (error) {
    console.error("Error uploading file:", (error as Error).message);
    res.status(500).json({ success: false, message: "Failed to upload file" });
  }
};


export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filePath } = req.body; 
  
      if (!filePath) {
        res.status(400).json({ success: false, message: "No file path provided" });
        return;
      }
  
      await fileHelper.deleteFile(filePath);
  
      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting file:", (error as Error).message);
      res.status(500).json({ success: false, message: "Failed to delete file" });
    }
  };
