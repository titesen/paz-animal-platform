/** @file CMS Repository - Placeholder */
import { eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findNewsById(newsId: string) {
  const result = await db
    .select()
    .from(schema.news)
    .where(eq(schema.news.newsId, newsId))
    .limit(1);
  return result[0] || null;
}
