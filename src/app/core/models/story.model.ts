export interface StoryHighlight {
  id: string;
  start: number;
  end: number;
  text: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  highlights: StoryHighlight[];
  createdAt: string;
  updatedAt: string;
}
