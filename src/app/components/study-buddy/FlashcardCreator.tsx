'use client';

import React, { useState, useEffect } from 'react';
import { Flashcard, Deck } from './types';
import { Save, X } from 'lucide-react';

interface FlashcardCreatorProps {
  onSaveDeck: (name: string, cards: Flashcard[]) => void;
  initialDeck?: Deck | null;
  onExitStudy: () => void;
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({ 
  onSaveDeck,
  initialDeck,
  onExitStudy
}) => {
  const [notes, setNotes] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [deckName, setDeckName] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(5);
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);

  useEffect(() => {
    if (initialDeck) {
      setFlashcards(initialDeck.flashcards);
      setIsStudyMode(true);
      setCurrentCard(0);
      setIsFlipped(false);
    } else {
      setIsStudyMode(false);
      setFlashcards([]);
    }
  }, [initialDeck]);

  const generateFlashcards = async () => {
    if (!notes.trim()) {
      setError('Please enter some notes first');
      return;
    }

    if (cardCount < 5 || cardCount > 30) {
      setError('Please select between 5 and 30 flashcards');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notes,
          cardCount // Send the cardCount to the API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate flashcards');
      }

      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        throw new Error('Invalid response format');
      }

      const cardsWithIds = data.flashcards.map((card: Omit<Flashcard, 'id'>) => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9)
      }));

      setFlashcards(cardsWithIds);
      setCurrentCard(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const SaveDeckDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-black">Save Flashcard Deck</h3>
        <input
          type="text"
          value={deckName}
          onChange={e => setDeckName(e.target.value)}
          placeholder="Enter deck name"
          className="w-full p-2 border rounded-md mb-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setShowSaveDialog(false);
              setDeckName('');
              setError('');
            }}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 text-black"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!deckName.trim()) {
                setError('Please enter a deck name');
                return;
              }
              onSaveDeck(deckName, flashcards);
              setDeckName('');
              setShowSaveDialog(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isStudyMode ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Create Flashcards</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Enter your study notes
              </label>
              <textarea
                className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your study notes here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Number of flashcards to generate (5-30)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-black font-medium w-12 text-center">
                  {cardCount}
                </span>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={generateFlashcards}
                disabled={isLoading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </button>
              {flashcards.length > 0 && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save Deck
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            Studying: {initialDeck?.name}
          </h2>
          <button
            onClick={onExitStudy}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Exit Study
          </button>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="min-h-[200px] flex items-center justify-center p-6 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <p className="text-xl text-center text-black">
              {isFlipped 
                ? flashcards[currentCard].answer 
                : flashcards[currentCard].question}
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 text-black"
            >
              Flip Card
            </button>
            <div className="flex gap-2">
              <button
                onClick={previousCard}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-black"
              >
                Previous
              </button>
              <button 
                onClick={nextCard}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Next ({currentCard + 1}/{flashcards.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveDialog && <SaveDeckDialog />}
    </div>
  );
};

export default FlashcardCreator;