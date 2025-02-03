import { promises as fs } from "fs";
import path from "path";

export interface File {
  originalname: string;
  buffer?: Buffer;
  path?: string;
}

const fileHelper = {
  /**
   * Uploads a file to the specified directory in the public folder.
   * @param {File} file - The file to upload.
   * @param {string} subDirectory - Subdirectory to upload the file.
   * @return {Promise<string>} - The public path of the uploaded file.
   */
  uploadFileToDirectory: async (file: File, subDirectory: string, id: string): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.originalname}`;
      const uploadPath = path.resolve("public", subDirectory, id, fileName);

      // Ensure the directory exists
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });

      // Get file content from buffer or path
      const fileContent = file.buffer
        ? file.buffer
        : file.path
          ? await fs.readFile(file.path)
          : null;

      if (!fileContent) {
        throw new Error("No valid file content to upload");
      }

      // Write file to disk
      await fs.writeFile(uploadPath, fileContent);

      return `/public/${subDirectory}/${id}/${fileName}`;
    } catch (error) {
      console.error(`Error uploading file to /${subDirectory}:`, error);
      throw new Error("Failed to upload file");
    }
  },

  deleteFile: async (fileLink: string): Promise<void> => {
    try {
      const filePath = path.resolve("public", fileLink.replace(/^\/public\//, "")); 
      await fs.unlink(filePath);

      console.log(`Deleted file: ${fileLink}`);
    } catch (error) {
      console.error(`Failed to delete file: ${(error as Error).message}`);
    }
  },
};

export default fileHelper;
