import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Surahs table (chapters of the Quran)
export const surahs = pgTable("surahs", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  name_arabic: text("name_arabic").notNull(),
  name_tajik: text("name_tajik").notNull(),
  name_english: text("name_english").notNull(),
  revelation_type: text("revelation_type").notNull(), // 'Meccan' or 'Medinan'
  verses_count: integer("verses_count").notNull(),
  description: text("description"),
});

export const insertSurahSchema = createInsertSchema(surahs).omit({
  id: true,
});

export type InsertSurah = z.infer<typeof insertSurahSchema>;
export type Surah = typeof surahs.$inferSelect;

// Verses table (ayahs of the Quran)
export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  surah_id: integer("surah_id").notNull(),
  verse_number: integer("verse_number").notNull(),
  arabic_text: text("arabic_text").notNull(),
  tajik_text: text("tajik_text").notNull(),
  page: integer("page"),
  juz: integer("juz"),
  unique_key: text("unique_key").notNull().unique(), // Format: surah:verse (e.g., "2:255")
  // Additional columns from actual database
  transliteration: text("transliteration"), // Transliteration of Arabic text
  tafsir: text("tafsir"), // Tafsir/explanation of the verse
  tj_2: text("tj_2"), // Alternative Tajik translation
  tj_3: text("tj_3"), // Another Tajik translation
  farsi: text("farsi"), // Farsi translation
  russian: text("russian") // Russian translation
});

export const insertVerseSchema = createInsertSchema(verses).omit({
  id: true,
});

export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type Verse = typeof verses.$inferSelect;

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(), // Changed to text to support Supabase UUID
  verse_id: integer("verse_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  created_at: true,
}).extend({
  user_id: z.string(), // Explicitly set as string for Supabase UUID
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// Search history
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  query: text("query").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  created_at: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Word analysis table
export const wordAnalysis = pgTable("word_analysis", {
  id: serial("id").primaryKey(),
  verse_id: integer("verse_id").notNull(),
  word_position: integer("word_position").notNull(),
  word_text: text("word_text").notNull(),
  translation: text("translation"),
  transliteration: text("transliteration"),
  root: text("root"),
  part_of_speech: text("part_of_speech"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertWordAnalysisSchema = createInsertSchema(wordAnalysis).omit({
  id: true,
  created_at: true,
});

export type InsertWordAnalysis = z.infer<typeof insertWordAnalysisSchema>;
export type WordAnalysis = typeof wordAnalysis.$inferSelect;
