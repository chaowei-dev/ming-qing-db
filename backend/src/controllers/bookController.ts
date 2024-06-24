import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBooks = async (req: Request, res: Response) => {
    try {
        const books = await prisma.book.findMany();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getBookById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const book = await prisma.book.findUnique({
            where: { id: Number(id) },
        });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addBook = async (req: Request, res: Response) => {
    const { title, author, version, source } = req.body;
    try {
        const newBook = await prisma.book.create({
            data: {
                title,
                author,
                version,
                source,
            },
        });
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateBook = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, author, version, source } = req.body;
    try {
        const updatedBook = await prisma.book.update({
            where: { id: Number(id) },
            data: { title, author, version, source },
        });
        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBook = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.book.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};