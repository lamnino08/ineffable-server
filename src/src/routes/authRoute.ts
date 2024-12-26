import { Router, Request, Response } from 'express';
import { handleSignUp, handleLogin, validateToken } from '../controllers/authController';
import { validate, signUpSchema, loginSchema } from "@/validation/authValidation";

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: This endpoint allows users to sign up by providing a username, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/signup', validate(signUpSchema), async (req: Request, res: Response) => {
  await handleSignUp(req, res); // Ensure async handler is properly awaited
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     description: This endpoint allows users to log in by providing an email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful and returns a token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  await handleLogin(req, res); // Ensure async handler is properly awaited
});

/**
 * @swagger
 * /auth/validate:
 *   post:
 *     summary: Validate a user's token
 *     description: This endpoint validates a JWT token and returns user information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token to validate
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Token is valid and returns user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Token is invalid or expired
 *       404:
 *         description: User not found
 */
router.post('/validate', async (req: Request, res: Response) => {
  await validateToken(req, res); // Ensure async handler is properly awaited
});


export default router;
