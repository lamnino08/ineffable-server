import { Request, Response } from "express";
import fileHelper, { File } from "@/helpers/firebaseHelper";

export const uploadFileGame = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }
    const gameId : string =  req.params.gameId;

    const file: File = req.file as File;
    const filePath = await fileHelper.uploadFileToDirectory(file, "game", gameId);

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

export const uploadFileUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }
    const userId : string =  req.params.userId;

    const file: File = req.file as File;
    const filePath = await fileHelper.uploadFileToDirectory(file, "user", userId);

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

export const uploadFileCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }
    const categoryId : string =  req.params.categoryId;

    const file: File = req.file as File;
    const filePath = await fileHelper.uploadFileToDirectory(file, "category", categoryId);

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
