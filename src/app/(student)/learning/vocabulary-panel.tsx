import { createClient } from "@/lib/supabase/server";
import { VocabRepository } from "@/lib/repositories/vocab.repository";
import { VocabularyClient } from "./vocabulary-client";

export async function VocabularyPanel({ userid }: { userid: string }) {
  const supabase = await createClient();
  const repo = new VocabRepository(supabase);

  const [allWords, savedWords, customCards] = await Promise.all([
    repo.findAllWords(),
    repo.findSavedByUser(userid),
    repo.findCustomCards(userid),
  ]);

  return (
    <VocabularyClient
      allWords={allWords}
      savedWordIds={savedWords.map((w) => w.wordid)}
      customCards={customCards}
    />
  );
}