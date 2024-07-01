import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

type Role = 'USER' | 'ADMIN';

const createInitialUser = async (
  userName: string,
  userPass: string,
  userRole: Role
) => {
  prisma.user
    .create({
      data: {
        email: `${userName}@tku.edu`,
        password: bcrypt.hashSync(userPass, 10),
        role: userRole,
      },
    })
    .then(() => console.log(`"${userName}@tku.edu" user created`))
    .catch(() => console.log(`"${userName}@tku.edu" user already exists`));
};

createInitialUser('admin', '287255', 'ADMIN');
createInitialUser('user', '287255', 'USER');

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'USER', // Default role is USER if not specified
      },
    });
    // res.status(201).json(newUser);，

    // return user name and role
    res.status(201).json({ email: newUser.email, role: newUser.role });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Return token
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
