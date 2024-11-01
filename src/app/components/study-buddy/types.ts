export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Deck {
  name: string;
  flashcards: Flashcard[];
  createdAt: string;
}

export interface TabProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}