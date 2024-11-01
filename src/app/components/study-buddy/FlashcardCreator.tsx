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
  const [deckName, setDeckName] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(5);
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
        body: JSON.stringify({ notes, cardCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate flashcards');
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

  const handleSaveDeck = () => {
    if (!deckName.trim()) {
      setError('Please enter a deck name');
      return;
    }
    onSaveDeck(deckName.trim(), flashcards);
    setDeckName('');
    setIsSaving(false);
    setError('');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="space-y-6">
      {!isStudyMode ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create Flashcards</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your study notes
              </label>
              <textarea
                className="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your study notes here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
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
                <span className="font-medium w-12 text-center">
                  {cardCount}
                </span>
              </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button
              onClick={generateFlashcards}
              disabled={isLoading}
              className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Studying: {initialDeck?.name}
          </h2>
          <button
            onClick={onExitStudy}
            className="btn"
          >
            <X className="h-4 w-4" /> Exit Study
          </button>
        </div>
      )}

      {flashcards.length > 0 && (
        <>
          <div className="card">
            <div 
              className="flashcard"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <p className="text-xl text-center">
                {isFlipped 
                  ? flashcards[currentCard].answer 
                  : flashcards[currentCard].question}
              </p>
            </div>
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="btn"
              >
                Flip Card
              </button>
              <div className="flex gap-2">
                <button
                  onClick={previousCard}
                  className="btn"
                >
                  Previous
                </button>
                <button 
                  onClick={nextCard}
                  className="btn btn-primary"
                >
                  Next ({currentCard + 1}/{flashcards.length})
                </button>
              </div>
            </div>
          </div>

          {!isStudyMode && (
            <div className="card bg-gray-50">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Deck Name
                  </label>
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Enter a name for your deck"
                    className="input"
                  />
                </div>
                <button
                  onClick={handleSaveDeck}
                  className="btn btn-secondary"
                  disabled={!deckName.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Deck
                </button>
              </div>
              {error && <p className="error-message mt-2">{error}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardCreator;