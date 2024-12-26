import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: 'Token is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded as { id: string; email: string; role: string };;
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const CheckAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ error: 'User information is missing. Please log in.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }

  next();
};
