import { checkOwnerBoardgame } from "@/services/redis/boardgame";
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";


export const checkBoardgameOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("Login require");
        res.status(401).json({ error: "Token is required" });
        return;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            res.status(401).json({ error: "Token has expired" });
            return;
        }

        if (decoded.role !== "admin") {
            const gameId = req.params.gameId;
            const isOwner = await checkOwnerBoardgame(Number(gameId), decoded.id)
            if (!isOwner) {
                res.status(403).json({ error: "You do not have ownership of this boardgame" });
                return;
            }
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}