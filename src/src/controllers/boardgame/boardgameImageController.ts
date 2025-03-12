import { Request, Response } from "express";
import {
  addImage,
  deleteImage,
  getImagesByGameId,
  updateStatus,
  getImageById
} from "@/models/boardgame/boardgameImageModel";
import { checkOwnerBoardgame, getBoardgameOwner } from "@/services/redis/boardgame";
import { setImageOwner, getImageOwner, deleteImageOwner } from "@/services/redis/image";
import { ImageStatus } from "@/types/models/Boardgame";
import fileHelper from "@/helpers/firebaseHelper";

export const AddImage = async (req: Request, res: Response) => {
  const gameId = req.params.gameId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return;
  }

  try {
    const userId = req.user.id;
    // console.log(req.body);
    const { images } = req.body;

    let status: ImageStatus = "pending";
    if (await checkOwnerBoardgame(Number(gameId), userId)) {
      status = "public";
    }

    images.map(async (image: { url: string }) => {
      const imageId = await addImage(Number(gameId), userId, image.url, status);
      setImageOwner(imageId, Number(gameId), userId);
    });

    res.status(201).json({
      success: true,
      message: req.t("boardgame.image.add.success"),
    });
  } catch (err) {
    console.error("Error adding image to boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const GetImagesByGameId = async (req: Request, res: Response) => {
  const gameId = req.params.gameId;

  try {
    const images = await getImagesByGameId(Number(gameId));

    res.status(200).json({
      success: true,
      message: req.t("boardgame.image.get.success"),
      data: images,
    });
  } catch (err) {
    console.error("Error retrieving images by game ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UpdateImageStatus = async (req: Request, res: Response) => {
  const imageId = req.params.imageId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return;
  }

  try {
    const userId = req.user.id;

    const imageOwnerInfo = await getImageOwner(imageId);

    if (!imageOwnerInfo) {
      res.status(404).json({ error: "Image not found." });
      return;
    }

    const { boardgameId, userId: imageOwnerId } = imageOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && imageOwnerId !== userId) {
      res.status(403).json({ error: "Forbidden. You don't have permission to update this image." });
      return;
    }

    res.status(200).json({
      success: true,
      message: req.t("boardgame.image.update.success"),
    });

    const currentStatus = (await getImageById(Number(imageId)))?.status;
    const newStatus: ImageStatus = currentStatus === "public" ? "hide" : "public";

    await updateStatus(Number(imageId), newStatus);

  } catch (err) {
    console.error("Error updating image status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const DeleteImage = async (req: Request, res: Response) => {
  const imageId = req.params.imageId;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized. Please log in to perform this action." });
    return;
  }

  try {
    const userId = req.user.id;

    const imageOwnerInfo = await getImageOwner(imageId);

    if (!imageOwnerInfo) {
      res.status(404).json({ error: "Image not found." });
      return;
    }

    const { boardgameId, userId: imageOwnerId } = imageOwnerInfo;
    const boardgameOwnerId = await getBoardgameOwner(boardgameId);

    if (!boardgameOwnerId) {
      res.status(404).json({ error: "Boardgame not found." });
      return;
    }

    const isBoardgameOwner = boardgameOwnerId === userId;

    if (!isBoardgameOwner && imageOwnerId !== userId) {
      res.status(403).json({ error: "Forbidden. You don't have permission to delete this image." });
      return;
    }
    const image = await getImageById(Number(imageId));
    if (image) {
      fileHelper.deleteFile(image.image_url);
    }
    

    await deleteImage(Number(imageId));
    await deleteImageOwner(imageId);

    res.status(200).json({
      success: true,
      message: req.t("boardgame.image.delete.success"),
    });
  } catch (err) {
    console.error("Error deleting image from boardgame:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
