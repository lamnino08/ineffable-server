import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    console.log("Login require");
     res.status(401).json({ error: "Token is required" }); 
     return;
  }

  try {
    const decoded : any = jwt.verify(token, process.env.JWT_SECRET!);

    const currentTime = Math.floor(Date.now() / 1000); 
    if (decoded.exp && decoded.exp < currentTime) {
      res.status(401).json({ error: "Token has expired" });
      return;
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
};

export const AdminCheck = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; 

  if (!token) {
    console.log("Login require");
     res.status(401).json({ error: "Token is required" }); 
     return;
  }

  try {
    const decoded : any = jwt.verify(token, process.env.JWT_SECRET!);

    const currentTime = Math.floor(Date.now() / 1000); 
    if (decoded.exp && decoded.exp < currentTime) {
      res.status(401).json({ error: "Token has expired" });
      return;
    }

    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Forbidden. Admin access only." });
      return;
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
};

export const optionalToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Authorization header

  if (!token) {
    return next();
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const currentTime = Math.floor(Date.now() / 1000); 
    if (decoded.exp && decoded.exp < currentTime) {
      console.warn("Token has expired, proceeding without user data");
      return next(); 
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
  } catch (err) {
    console.error("Token verification failed, proceeding without user data:", err);
  }

  next();
};


