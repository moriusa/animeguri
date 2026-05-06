"use server";
import { revalidatePath } from "next/cache";

export async function clearCache() {
  revalidatePath("/");
  revalidatePath("/article/[id]", "page");
  revalidatePath("/search/[id]", "page");
}