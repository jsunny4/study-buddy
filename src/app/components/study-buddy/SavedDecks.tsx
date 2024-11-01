'use client';

import React from 'react';
import { Deck } from './types';
import { BookOpen, Trash } from 'lucide-react';

interface SavedDecksProps {
  decks: Deck[];
  onLoadDeck: (deck: Deck) => void;
  onDeleteDeck: (deck: Deck) => void;
}

const SavedDecks: React.FC<SavedDecksProps> = ({ 
  decks, 
  onLoadDeck, 
  onDeleteDeck
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Saved Decks</h2>
      {decks.length === 0 ? (
        <p className="text-center text-gray-500">No saved decks yet</p>
      ) : (
        <div className="space-y-4">
          {decks.map((deck) => (
            <div 
              key={deck.name}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium text-black">{deck.name}</h3>
                <p className="text-sm text-gray-500">
                  {deck.flashcards.length} cards • Created {new Date(deck.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onLoadDeck(deck)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Study
                </button>
                <button
                  onClick={() => onDeleteDeck(deck)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedDecks;