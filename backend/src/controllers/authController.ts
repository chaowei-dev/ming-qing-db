import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Create a new user on init
prisma.user
  .create({
    data: {
      email: 'admin@tku.edu',
      password: bcrypt.hashSync('287255', 10),
      role: 'ADMIN',
    },
  })
  .then(() => console.log('Admin user created'))
  .catch(() => console.log('Admin user already exists'));

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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
