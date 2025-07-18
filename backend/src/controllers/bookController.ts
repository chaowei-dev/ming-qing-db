import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ResultOfBook {
  title: string;
  author: string;
  version: string;
  source: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// /list/:size/:page/:keyword
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  const { size, page, keyword } = req.params;

  const intSize = parseInt(size);
  const intPage = parseInt(page);
  const offset = intSize * (intPage - 1);

  // Parse keyword string to object
  const searchParams = new URLSearchParams(keyword);
  const bookTitle = searchParams.get('bookTitle') ?? '';
  const bookAuthor = searchParams.get('bookAuthor') ?? '';
  const bookSource = searchParams.get('bookSource') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';

  // log
  console.log(`size: ${size}, page: ${page}, keyword: ${keyword}`);

  try {
    const books = await prisma.book.findMany({
      skip: offset,
      take: intSize,
      where: {
        AND: [
          bookTitle
            ? { title: { contains: bookTitle, mode: 'insensitive' } }
            : {},
          bookAuthor
            ? { author: { contains: bookAuthor, mode: 'insensitive' } }
            : {},
          bookSource
            ? { source: { contains: bookSource, mode: 'insensitive' } }
            : {},
          categoryId
            ? { categoryId: Number(categoryId) }
            : {},
        ],
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

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

export const getBookCount = async (req: Request, res: Response) => {
  const { keyword } = req.params;

  // Parse keyword string to object
  const searchParams = new URLSearchParams(keyword);
  const bookTitle = searchParams.get('bookTitle') ?? '';
  const bookAuthor = searchParams.get('bookAuthor') ?? '';
  const bookSource = searchParams.get('bookSource') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';

  try {
    const count = await prisma.book.count({
      where: {
        AND: [
          bookTitle
            ? { title: { contains: bookTitle, mode: 'insensitive' } }
            : {},
          bookAuthor
            ? { author: { contains: bookAuthor, mode: 'insensitive' } }
            : {},
          bookSource
            ? { source: { contains: bookSource, mode: 'insensitive' } }
            : {},
          categoryId
            ? { categoryId: Number(categoryId) }
            : {},
        ],
      },
    });
    res.json(count);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addBook = async (req: Request, res: Response) => {
  const { title, author, version, source, categoryName, remarks } = req.body;
  let categoryId = null;
  
  if (categoryName) {
    const category = await prisma.category.findFirst({
      where: {
        name: categoryName
      }
    });
    
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }
    
    categoryId = category.id;
  }
  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        version,
        source,
        categoryId,
        remarks,
      },
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, version, source, remarks } = req.body;
  try {
    const updatedBook = await prisma.book.update({
      where: { id: Number(id) },
      data: { title, author, version, source, remarks },
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
