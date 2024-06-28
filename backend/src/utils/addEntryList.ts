import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';
const cliProgress = require('cli-progress');

const prisma = new PrismaClient();

// Step 1: read the csv file
// Step 2: create the entry list with roll, roll_name, title, version, author
// Step 3: loop the list and insert the entry to the database
// Step 4: check the book is exist.
//         If not, insert the book (title, version, author) and get the book id.
//         If exist, get the book id.
// Step 5: check the roll is exist.
//         If not, insert the roll (roll, roll_name) with book_id and get the roll id.
//         If exist, get the roll id.
// Step 6: insert the entry with roll_id

interface Entry {
  title: string;
  author: string;
  version: string;
  roll: string;
  rollName: string;
  entry: string;
}

// add book and get book id
const addBook = async (title: string, author: string, version: string) => {
  try {
    // i: check book exist
    const existingBook = await prisma.book.findFirst({
      where: {
        title,
        author,
        version,
      },
    });

    if (existingBook) {
      return existingBook.id; // Return existing book id if found
    }

    // ii: if not existed, add book
    const source: string = '';
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        version,
        source,
      },
    });

    return newBook.id;
  } catch (error) {
    console.error('Failed to add book:', error);
    return null;
  }
};

// add roll with book id and get roll id
const addRoll = async (roll: string, roll_name: string, bookId: any) => {
  try {
    // i: check roll exist
    const existingRoll = await prisma.roll.findFirst({
      where: {
        roll,
        roll_name,
        bookId,
      },
    });

    if (existingRoll) {
      return existingRoll.id; // Return existing roll id if found
    }

    // ii: if not existed, add roll
    const newRoll = await prisma.roll.create({
      data: {
        roll,
        roll_name,
        bookId,
      },
    });
    return newRoll.id;
  } catch (error) {
    console.error('Failed to add roll:', error);
    return null;
  }
};
const addEntry = async (entry_name: string, rollId: any) => {
  try {
    const newEntry = await prisma.entry.create({
      data: {
        entry_name,
        rollId,
      },
    });
    return newEntry.entry_name;
  } catch (error) {
    console.error('Failed to add entry:', error);
    return null;
  }
};

// Step 1: read the csv file
// const csvFilePath = 'example.csv';
const csvFilePath = 'Entries.csv';

const parser = parse({
  columns: true, // Assumes the first row of the CSV are headers
  delimiter: ',', // Specifies the delimiter character
});

// Step 2: create the entry list with roll, roll_name, title, version, author
const entryList: Entry[] = []; // List to hold the records

console.log('Reading CSV file...');
createReadStream(csvFilePath)
  .pipe(parser)
  .on('data', async (record: Entry) => {
    entryList.push(record); // Add each record to the list
  })
  .on('end', async () => {
    console.log('CSV file has been read and parsed:');
    // console.log(entryList); // Output the list of records

    // Step 3: loop the list and insert the entry to the database
    // create a new progress bar instance and use shades_classic theme
    const bar1 = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );

    // start the progress bar with a total value of 100 and start value of 0
    bar1.start(entryList.length, 0);
    let count = 0;

    // Loop entryList
    for (const entry of entryList) {
      const {
        title,
        author,
        version,
        roll,
        rollName,
        entry: entryName,
      } = entry;
      // Step 4: check the book is exist.
      const bookId = await addBook(title, author, version);

      // Step 5: check the roll is exist.
      const rollId = await addRoll(roll, rollName, bookId);

      // Step 6: insert the entry with roll_id
      const newEntry = await addEntry(entryName, rollId);

      // Output the entry
      // console.log(`Added entry: ${newEntry}`);
      bar1.update(++count);
    }

    // stop the progress bar
    bar1.stop();
  })
  .on('error', async (error) => {
    console.error('Error reading CSV file:', error);
  });
