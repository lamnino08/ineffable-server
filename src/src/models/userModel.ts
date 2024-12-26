import { User } from '../types/models/User';
import connection from '../config/database/db';
import { RowDataPacket } from 'mysql2';

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email_hash = ?';
    connection.query(query, [email], (err, results: RowDataPacket[]) => { // Type 'results' as RowDataPacket[]
      if (err) return reject(err);
      if (results.length === 0) return resolve(null); // No user found
      resolve(results[0] as User); // Return the first matching user
    });
  });
};

export const getUserById = async (id: number): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    connection.query(query, [id], (err, results: RowDataPacket[]) => { // Type 'results' as RowDataPacket[]
      if (err) return reject(err);
      if (results.length === 0) return resolve(null); // No user found
      resolve(results[0] as User); // Return the first matching user
    });
  });
};

export const createUser = async (user: User): Promise<void> => {
  const { username, email_hash, password_hash, role = 'user' } = user;
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users (username, email_hash, password_hash, role) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, email_hash, password_hash, role], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
