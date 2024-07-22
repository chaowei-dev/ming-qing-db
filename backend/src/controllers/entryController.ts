import e, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  addBookAndGetBookId,
  addEntryByRollId,
  addRollByBookIdAndGetRollId,
} from '../utils/addEntryList';

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

interface EntryWithBookAndRoll {
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

interface Book {
  id: number;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  roll: Roll[];
}

interface Roll {
  id: number;
  roll: string;
  roll_name: string;
  bookId: number;
  createdAt: Date;
  updatedAt: Date;
  entries: Entry[];
}

interface Entry {
  id: number;
  entry_name: string;
  rollId: number;
  createdAt: Date;
  updatedAt: Date;
}

const buildWhereClause = (searchParams: URLSearchParams) => {
  const globalKeyword = searchParams.get('globalKeyword') ?? '';
  const bookTitle = searchParams.get('bookTitle') ?? '';
  const rollName = searchParams.get('rollName') ?? '';
  const entryName = searchParams.get('entryName') ?? '';
  const authorName = searchParams.get('authorName') ?? '';

  let whereClause = {};

  // If global keyword is provided, replace other keywords with it
  if (globalKeyword) {
    (whereClause = {
      OR: [
        globalKeyword
          ? {
              roll: {
                book: {
                  title: {
                    contains: globalKeyword,
                    mode: 'insensitive', // Case insensitive
                  },
                },
              },
            }
          : {},
        globalKeyword
          ? {
              roll: {
                roll_name: {
                  contains: globalKeyword,
                  mode: 'insensitive',
                },
              },
            }
          : {},
        globalKeyword
          ? {
              entry_name: {
                contains: globalKeyword,
                mode: 'insensitive',
              },
            }
          : {},
        globalKeyword
          ? {
              roll: {
                book: {
                  author: {
                    contains: globalKeyword,
                    mode: 'insensitive',
                  },
                },
              },
            }
          : {},
      ],
    }),
      console.log(`Searching... globalKeyword:"${globalKeyword}"`);
  } else {
    whereClause = {
      AND: [
        bookTitle
          ? {
              roll: {
                book: {
                  title: {
                    contains: bookTitle,
                    mode: 'insensitive', // Case insensitive
                  },
                },
              },
            }
          : {},
        rollName
          ? {
              roll: {
                roll_name: {
                  contains: rollName,
                  mode: 'insensitive',
                },
              },
            }
          : {},
        entryName
          ? {
              entry_name: {
                contains: entryName,
                mode: 'insensitive',
              },
            }
          : {},
        authorName
          ? {
              roll: {
                book: {
                  author: {
                    contains: authorName,
                    mode: 'insensitive',
                  },
                },
              },
            }
          : {},
      ],
    };

    console.log(
      `Searching... bookTitle:"${bookTitle}", author:"${authorName}", rollName:"${rollName}", entryName:"${entryName}"`
    );
  }

  return whereClause;
};

// Get entry list with pagination, page size and keyword search
export const getEntries = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { size, page, keyword } = req.params;

  // Convert string parameters to numbers
  const intSize = parseInt(size);
  const intPage = parseInt(page);
  const offset = intSize * (intPage - 1);

  // Parse keyword string to object
  const searchParams = new URLSearchParams(keyword);
  const whereClause = buildWhereClause(searchParams);

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
                author: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip: offset,
      take: intSize,
      // Filter entries by keyword (if a item is empty, it will be ignored)
      where: whereClause,
    });

    // Flatten the results to match your desired output format
    const flatResults: EntryWithBookAndRoll[] = entries.map((entry: any) => ({
      id: entry.id,
      entry_name: entry.entry_name,
      roll: entry.roll.roll,
      roll_name: entry.roll.roll_name,
      rollId: entry.roll.id,
      title: entry.roll.book.title,
      author: entry.roll.book.author,
      bookId: entry.roll.book.id,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

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
  // Parse keyword string to object
  const { keyword } = req.params;
  const searchParams = new URLSearchParams(keyword);
  const whereClause = buildWhereClause(searchParams);

  // If global keyword is provided, replace other keywords with it

  try {
    const entriesCount = await prisma.entry.count({
      where: whereClause,
    });

    console.log(`Counting... entries with keyword: ${entriesCount}`);

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
    bookDetails.rolls.forEach((roll: Roll) => {
      roll.entries.forEach((entry: Entry) => {
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

// Add entry
export const addEntry = async (req: Request, res: Response): Promise<void> => {
  // Step 1: Parse the request body
  const { title, author, source, version, roll, rollName, entry } = req.body;

  try {
    // Step 2: Check book is exist or not by title, author, version, source
    // If not exist, create new book, then get book id
    // If exist, get book id
    const bookId = await addBookAndGetBookId(title, author, version, source);

    if (!bookId) {
      res.status(500).send('Failed to add book');
      return;
    }

    // Step 3: Check roll is exist or not by roll, rollName, bookId
    // If not exist, create new roll, then get roll id
    // If exist, get roll id
    const rollId = await addRollByBookIdAndGetRollId(roll, rollName, bookId);

    if (!rollId) {
      res.status(500).send('Failed to add roll');
      return;
    }

    // Step 4: Insert entry with rollId
    const entryName = await addEntryByRollId(entry, rollId);

    console.log(`Entry "${entryName}" added successfully`);

    res.status(201).send(`Entry "${entryName}" added successfully`);
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).send('Internal Server Error');
  }
};
