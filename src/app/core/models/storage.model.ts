export interface BlobRecord {
  id: string;
  data: Blob;
  mimeType: string;
  wordId: string;
  type: 'image' | 'audio-word' | 'audio-example';
  createdAt: string;
}
