import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ReusltOfBookDetails {
  title: string;
  book_id: number;
  entry_id: number;
  entry_name: string;
  roll_id: number;
  roll: string;
  roll_name: string;
}

interface Entry {
  id: number;
  entry_name: string;
  roll: string;
  bookId: number;
  rollId: number;
  roll_name: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// Get all entries
export const getEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log('Get all entries');

  try {
    const entries = await prisma.entry.findMany({
      select: {
        id: true,
        entry_name: true,
        roll: {
          select: {
            roll: true,
            roll_name: true,
            id: true,
            book: {
              select: {
                title: true,
                id: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Flattening the result to match your desired output format
    const flatResults: Entry[] = [];
    entries.forEach((entry) => {
      flatResults.push({
        id: entry.id,
        entry_name: entry.entry_name,
        roll: entry.roll.roll,
        roll_name: entry.roll.roll_name,
        rollId: entry.roll.id,
        title: entry.roll.book.title,
        bookId: entry.roll.book.id,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      });
    });


    res.json(flatResults);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Count entries
export const countEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  const keyword = req.params.keyword;

  console.log(`Count entries with keyword: ${keyword}`);

  try {
    const entriesCount = await prisma.entry.count();

    res.json(entriesCount);
  } catch (error) {
    console.error('Error counting entries:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get entries list by roll id and get roll list by book id
export const getBookWithDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const bookId = Number(req.params.bookId);

  console.log(`Get details for book with id: ${bookId}`);

  try {
    const bookDetails = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        rolls: {
          include: {
            entries: true,
          },
        },
      },
    });

    if (!bookDetails) {
      res.status(404).send('Book not found');
      return;
    }

    // Flattening the result to match your desired output format
    const flatResults: ReusltOfBookDetails[] = [];
    bookDetails.rolls.forEach((roll) => {
      roll.entries.forEach((entry) => {
        flatResults.push({
          title: bookDetails.title,
          book_id: bookDetails.id,
          entry_id: entry.id,
          entry_name: entry.entry_name,
          roll_id: roll.id,
          roll: roll.roll,
          roll_name: roll.roll_name,
        });
      });
    });

    res.json(flatResults);
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).send('Internal Server Error');
  }
};
