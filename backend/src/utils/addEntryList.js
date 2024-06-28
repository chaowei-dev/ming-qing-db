"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var csv_parse_1 = require("csv-parse");
var client_1 = require("@prisma/client");
var cliProgress = require('cli-progress');
var prisma = new client_1.PrismaClient();
// add book and get book id
var addBook = function (title, author, version) { return __awaiter(void 0, void 0, void 0, function () {
    var existingBook, source, newBook, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.book.findFirst({
                        where: {
                            title: title,
                            author: author,
                            version: version,
                        },
                    })];
            case 1:
                existingBook = _a.sent();
                if (existingBook) {
                    return [2 /*return*/, existingBook.id]; // Return existing book id if found
                }
                source = '';
                return [4 /*yield*/, prisma.book.create({
                        data: {
                            title: title,
                            author: author,
                            version: version,
                            source: source,
                        },
                    })];
            case 2:
                newBook = _a.sent();
                return [2 /*return*/, newBook.id];
            case 3:
                error_1 = _a.sent();
                console.error('Failed to add book:', error_1);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
// add roll with book id and get roll id
var addRoll = function (roll, roll_name, bookId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingRoll, newRoll, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.roll.findFirst({
                        where: {
                            roll: roll,
                            roll_name: roll_name,
                            bookId: bookId,
                        },
                    })];
            case 1:
                existingRoll = _a.sent();
                if (existingRoll) {
                    return [2 /*return*/, existingRoll.id]; // Return existing roll id if found
                }
                return [4 /*yield*/, prisma.roll.create({
                        data: {
                            roll: roll,
                            roll_name: roll_name,
                            bookId: bookId,
                        },
                    })];
            case 2:
                newRoll = _a.sent();
                return [2 /*return*/, newRoll.id];
            case 3:
                error_2 = _a.sent();
                console.error('Failed to add roll:', error_2);
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
var addEntry = function (entry_name, rollId) { return __awaiter(void 0, void 0, void 0, function () {
    var newEntry, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.entry.create({
                        data: {
                            entry_name: entry_name,
                            rollId: rollId,
                        },
                    })];
            case 1:
                newEntry = _a.sent();
                return [2 /*return*/, newEntry.entry_name];
            case 2:
                error_3 = _a.sent();
                console.error('Failed to add entry:', error_3);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Step 1: read the csv file
// const csvFilePath = 'example.csv';
var csvFilePath = 'Entries.csv';
var parser = (0, csv_parse_1.parse)({
    columns: true, // Assumes the first row of the CSV are headers
    delimiter: ',', // Specifies the delimiter character
});
// Step 2: create the entry list with roll, roll_name, title, version, author
var entryList = []; // List to hold the records
(0, fs_1.createReadStream)(csvFilePath)
    .pipe(parser)
    .on('data', function (record) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        entryList.push(record); // Add each record to the list
        return [2 /*return*/];
    });
}); })
    .on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
    var bar1, count, _i, entryList_1, entry, title, author, version, roll, rollName, entryName, bookId, rollId, newEntry;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('CSV file has been read and parsed:');
                bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                // start the progress bar with a total value of 100 and start value of 0
                bar1.start(entryList.length, 0);
                count = 0;
                _i = 0, entryList_1 = entryList;
                _a.label = 1;
            case 1:
                if (!(_i < entryList_1.length)) return [3 /*break*/, 6];
                entry = entryList_1[_i];
                title = entry.title, author = entry.author, version = entry.version, roll = entry.roll, rollName = entry.rollName, entryName = entry.entry;
                return [4 /*yield*/, addBook(title, author, version)];
            case 2:
                bookId = _a.sent();
                return [4 /*yield*/, addRoll(roll, rollName, bookId)];
            case 3:
                rollId = _a.sent();
                return [4 /*yield*/, addEntry(entryName, rollId)];
            case 4:
                newEntry = _a.sent();
                // Output the entry
                // console.log(`Added entry: ${newEntry}`);
                bar1.update(++count);
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6:
                // stop the progress bar
                bar1.stop();
                return [2 /*return*/];
        }
    });
}); })
    .on('error', function (error) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.error('Error reading CSV file:', error);
        return [2 /*return*/];
    });
}); });
