import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { log } from "./vite";
import { insertBookmarkSchema, insertSearchHistorySchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";
import { registerWordServiceRoutes, extractSimpleWordAnalysis } from "./word-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  const apiRouter = express.Router();
  
  // Get all surahs
  apiRouter.get("/surahs", async (_req: Request, res: Response) => {
    try {
      const surahs = await storage.getAllSurahs();
      res.json(surahs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surahs" });
    }
  });

  // Get a specific surah by number
  apiRouter.get("/surahs/:number", async (req: Request, res: Response) => {
    try {
      const surahNumber = parseInt(req.params.number);
      
      if (isNaN(surahNumber)) {
        return res.status(400).json({ message: "Invalid surah number" });
      }
      
      const surah = await storage.getSurahByNumber(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      res.json(surah);
    } catch (error) {
      res.status(500).json({ message: "Error fetching surah" });
    }
  });

  // Get verses for a specific surah
  apiRouter.get("/surahs/:number/verses", async (req: Request, res: Response) => {
    try {
      const surahNumber = parseInt(req.params.number);
      
      if (isNaN(surahNumber)) {
        return res.status(400).json({ message: "Invalid surah number" });
      }
      
      const surah = await storage.getSurahByNumber(surahNumber);
      
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      const verses = await storage.getVersesBySurah(surah.id);
      res.json(verses);
    } catch (error) {
      console.error("Error fetching verses:", error);
      // Return empty array to prevent UI from breaking
      res.status(200).json([]);
    }
  });

  // Get a specific verse by key (e.g., "2:255")
  apiRouter.get("/verses/:key", async (req: Request, res: Response) => {
    try {
      const verseKey = req.params.key;
      
      if (!verseKey.match(/^\d+:\d+$/)) {
        return res.status(400).json({ message: "Invalid verse key format. Should be surah:verse (e.g., 2:255)" });
      }
      
      const verse = await storage.getVerseByKey(verseKey);
      
      if (!verse) {
        return res.status(404).json({ message: "Verse not found" });
      }
      
      res.json(verse);
    } catch (error) {
      res.status(500).json({ message: "Error fetching verse" });
    }
  });

  // Search verses
  apiRouter.get("/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const language = req.query.language as 'arabic' | 'tajik' | 'both' || 'both';
      const surahId = req.query.surah ? parseInt(req.query.surah as string) : undefined;
      
      log(`Received search request: q=${query}, language=${language}, surahId=${surahId}`, "search");
      
      if (!query) {
        log("Search rejected: empty query", "search");
        return res.status(400).json({ 
          message: "Search query is required",
          success: false
        });
      }
      
      const results = await storage.searchVerses(query, language, surahId);
      log(`Search completed: found ${results.length} results`, "search");
      
      // If a user is logged in, save the search query to history
      if (req.query.userId) {
        const userId = parseInt(req.query.userId as string);
        await storage.addSearchHistory({ user_id: userId, query });
        log(`Search history saved for user ${userId}`, "search");
      }
      
      res.json(results);
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      log(`Search error: ${errorMessage}`, "search");
      console.error("Search error:", error);
      
      res.status(500).json({ 
        message: "Error searching verses", 
        error: errorMessage,
        success: false
      });
    }
  });

  // Get bookmarks for a user
  apiRouter.get("/bookmarks", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const bookmarks = await storage.getBookmarksByUser(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      // Default to empty array instead of error to avoid breaking the UI
      res.status(200).json([]);
    }
  });

  // Create a bookmark
  apiRouter.post("/bookmarks", async (req: Request, res: Response) => {
    try {
      console.log("Creating bookmark with data:", req.body);
      const validatedData = insertBookmarkSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const bookmark = await storage.createBookmark(validatedData);
      console.log("Created bookmark:", bookmark);
      res.status(201).json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating bookmark", error: error.message });
    }
  });

  // Delete a bookmark
  apiRouter.delete("/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const bookmarkId = parseInt(req.params.id);
      
      if (isNaN(bookmarkId)) {
        return res.status(400).json({ message: "Invalid bookmark ID" });
      }
      
      const result = await storage.deleteBookmark(bookmarkId);
      
      if (!result) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting bookmark" });
    }
  });

  // Get search history for a user
  apiRouter.get("/search-history", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const history = await storage.getSearchHistoryByUser(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Error fetching search history" });
    }
  });

  // API endpoint for word-by-word analysis
  apiRouter.get("/word-analysis/:surah/:verse", async (req: Request, res: Response) => {
    try {
      const surahNumber = parseInt(req.params.surah);
      const verseNumber = parseInt(req.params.verse);
      
      if (isNaN(surahNumber) || isNaN(verseNumber)) {
        return res.status(400).json({ message: "Invalid surah or verse number" });
      }
      
      log(`Getting word analysis for surah ${surahNumber}, verse ${verseNumber}`, "word-analysis");
      
      // Get the verse
      const verseKey = `${surahNumber}:${verseNumber}`;
      const verse = await storage.getVerseByKey(verseKey);
      
      if (!verse) {
        return res.status(404).json({ message: "Verse not found" });
      }

      // Access the Supabase database directly
      try {
        // Use the Database URL to connect
        const postgres = (await import('postgres')).default;
        const dbUrl = process.env.DATABASE_URL;
        
        if (!dbUrl) {
          throw new Error("DATABASE_URL environment variable is not set");
        }
        
        // Create a connection
        const sql = postgres(dbUrl);
        
        // Query the word_by_word table directly with the exact key format
        const wordByWordData = await sql`
          SELECT * FROM word_by_word 
          WHERE unique_key = ${verseKey}
          ORDER BY word_number ASC
        `;
        
        // Close the connection
        await sql.end();
        
        // Check if we found any data
        if (wordByWordData && wordByWordData.length > 0) {
          log(`Found ${wordByWordData.length} words in word_by_word table for ${verseKey}`, "word-analysis");
          
          // Format the data for API response
          const formattedData = wordByWordData.map(word => ({
            id: word.id,
            verse_id: verse.id,
            word_position: word.word_number,
            word_text: word.arabic,
            translation: word.farsi,
            transliteration: null,
            root: null,
            part_of_speech: null
          }));
          
          return res.json(formattedData);
        } else {
          log(`No word-by-word data found for verse ${verseKey}, using fallback`, "word-analysis");
        }
      } catch (error) {
        log(`Error accessing word_by_word table: ${error}`, "word-analysis");
      }
      
      // Fallback: Use specific hardcoded data for frequently accessed verses
      if (verseKey === '1:1') {
        const wordByWordData = [
          { id: 1, word_number: 1, arabic: "بِسۡمِ", farsi: "به نام" },
          { id: 2, word_number: 2, arabic: "ٱللَّهِ", farsi: "خداوند" },
          { id: 3, word_number: 3, arabic: "ٱلرَّحۡمَٰنِ", farsi: "بخشنده" },
          { id: 4, word_number: 4, arabic: "ٱلرَّحِيمِ", farsi: "مهربان" }
        ];
        
        const formattedData = wordByWordData.map(word => ({
          id: word.id,
          verse_id: verse.id,
          word_position: word.word_number,
          word_text: word.arabic,
          translation: word.farsi,
          transliteration: null,
          root: null,
          part_of_speech: null
        }));
        
        return res.json(formattedData);
      } else if (verseKey === '1:2') {
        const wordByWordData = [
          { id: 5, word_number: 1, arabic: "ٱلۡحَمۡدُ", farsi: "ستایش" },
          { id: 6, word_number: 2, arabic: "لِلَّهِ", farsi: "از آن خداست" },
          { id: 7, word_number: 3, arabic: "رَبِّ", farsi: "پروردگار" },
          { id: 8, word_number: 4, arabic: "ٱلۡعَٰلَمِينَ", farsi: "جهانیان" }
        ];
        
        const formattedData = wordByWordData.map(word => ({
          id: word.id,
          verse_id: verse.id,
          word_position: word.word_number,
          word_text: word.arabic,
          translation: word.farsi,
          transliteration: null,
          root: null,
          part_of_speech: null
        }));
        
        return res.json(formattedData);
      }
      
      // Final fallback: Split the Arabic text and use position-based placeholders
      log(`Creating fallback word-by-word analysis for verse ${verseKey}`, "word-analysis");
      
      // Split the Arabic text by spaces to get individual words
      const words = verse.arabic_text.split(/\s+/).filter(w => w.trim().length > 0);
      
      // Create a simple analysis with meaningful placeholders
      const simpleAnalysis = words.map((word, index) => ({
        id: null,
        verse_id: verse.id,
        word_position: index + 1,
        word_text: word,
        translation: "کلمه " + (index + 1), // "Word #" in Farsi as placeholder
        transliteration: null,
        root: null,
        part_of_speech: null
      }));
      
      return res.json(simpleAnalysis);
    } catch (error) {
      console.error("Error fetching word analysis:", error);
      res.status(500).json({ message: "Error fetching word analysis" });
    }
  });
  apiRouter.get("/tajweed/ayah/:reference", async (req: Request, res: Response) => {
    try {
      const reference = req.params.reference;
      const url = `https://api.alquran.cloud/ayah/${reference}/quran-tajweed`;
      
      log(`Fetching Tajweed ayah: ${reference}`, "tajweed");
      
      const response = await fetch(url);
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      log(`Error fetching Tajweed ayah: ${error}`, "tajweed");
      res.status(500).json({ message: "Error fetching Tajweed ayah", error: String(error) });
    }
  });

  // Proxy for Tajweed Surah API
  apiRouter.get("/tajweed/surah/:number", async (req: Request, res: Response) => {
    try {
      const surahNumber = req.params.number;
      const url = `https://api.alquran.cloud/surah/${surahNumber}/quran-tajweed`;
      
      log(`Fetching Tajweed surah: ${surahNumber}`, "tajweed");
      
      const response = await fetch(url);
      const data = await response.json();
      
      res.json(data);
    } catch (error) {
      log(`Error fetching Tajweed surah: ${error}`, "tajweed");
      res.status(500).json({ message: "Error fetching Tajweed surah", error: String(error) });
    }
  });
  
  // API endpoint to serve Quranic duas data
  apiRouter.get("/duas", async (_req: Request, res: Response) => {
    try {
      // Path to the JSON file is relative to the project root
      const fs = require('fs');
      const path = require('path');
      
      const duasFilePath = path.join(__dirname, '../attached_assets/quranic_duas.json');
      
      if (!fs.existsSync(duasFilePath)) {
        return res.status(404).json({ message: "Duas data file not found" });
      }
      
      const duasData = JSON.parse(fs.readFileSync(duasFilePath, 'utf8'));
      res.json(duasData);
    } catch (error) {
      console.error('Error loading duas data:', error);
      res.status(500).json({ message: "Failed to load duas data", error: String(error) });
    }
  });

  app.use("/api", apiRouter);
  
  // Register word analysis routes
  registerWordServiceRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
