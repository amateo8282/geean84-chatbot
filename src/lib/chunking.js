const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 50;

export function chunkText(text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) {
  if (!text || text.trim().length === 0) return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= chunkSize) {
      chunks.push(paragraph);
    } else {
      const sentences = paragraph
        .split(/(?<=[.!?。！？\n])\s*/)
        .filter((s) => s.trim().length > 0);

      let currentChunk = '';

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length + 1 > chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + ' ' + sentence;
        } else {
          currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
        }
      }

      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
    }
  }

  const mergedChunks = [];
  for (const chunk of chunks) {
    if (mergedChunks.length > 0 && chunk.length < 50 && mergedChunks[mergedChunks.length - 1].length + chunk.length < chunkSize) {
      mergedChunks[mergedChunks.length - 1] += '\n' + chunk;
    } else {
      mergedChunks.push(chunk);
    }
  }

  return mergedChunks;
}
