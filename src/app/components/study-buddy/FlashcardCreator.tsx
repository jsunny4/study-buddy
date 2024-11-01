'use client';

import React, { useState, useEffect } from 'react';
import { Flashcard, Deck } from './types';
import { Save, X } from 'lucide-react';

// Props interface for the FlashcardCreator component
interface FlashcardCreatorProps {
  onSaveDeck: (name: string, cards: Flashcard[]) => void;  // Function to save a deck
  initialDeck?: Deck | null;                               // Optional deck for study mode
  onExitStudy: () => void;                                // Function to exit study mode
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({ 
  onSaveDeck,
  initialDeck,
  onExitStudy
}) => {
  // State management using React hooks
  const [notes, setNotes] = useState<string>('');              // Study notes input
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);  // Array of generated flashcards
  const [currentCard, setCurrentCard] = useState<number>(0);    // Index of current card
  const [isFlipped, setIsFlipped] = useState<boolean>(false);   // Card flip state
  const [isLoading, setIsLoading] = useState<boolean>(false);   // Loading state for API calls
  const [error, setError] = useState<string>('');              // Error message state
  const [deckName, setDeckName] = useState<string>('');        // Name for saving deck
  const [cardCount, setCardCount] = useState<number>(5);       // Number of cards to generate
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false); // Study mode toggle
  const [isSaving, setIsSaving] = useState<boolean>(false);    // Saving state

  // Effect to handle initialization of study mode
  useEffect(() => {
    if (initialDeck) {
      // If initialDeck is provided, enter study mode
      setFlashcards(initialDeck.flashcards);
      setIsStudyMode(true);
      setCurrentCard(0);
      setIsFlipped(false);
    } else {
      // Reset to creation mode
      setIsStudyMode(false);
      setFlashcards([]);
    }
  }, [initialDeck]);

  // Function to generate flashcards using AI
  const generateFlashcards = async () => {
    // Input validation
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
      // API call to generate flashcards
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes, cardCount }),
      });

      const data = await response.json();

      // Error handling
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate flashcards');
      }

      // Add unique IDs to generated cards
      const cardsWithIds = data.flashcards.map((card: Omit<Flashcard, 'id'>) => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9)
      }));

      // Update state with new cards
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

  // Function to handle saving a deck
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

  // Navigation functions for flashcards
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
      {/* Conditional rendering based on study mode */}
      {!isStudyMode ? (
        // Flashcard Creation Interface
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Create Flashcards</h2>
          <div className="space-y-4">
            {/* Notes input section */}
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
            {/* Card count selector */}
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
            {/* Error display */}
            {error && <p className="error-message">{error}</p>}
            {/* Generate button */}
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
        // Study Mode Header
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

      {/* Flashcard Display */}
      {flashcards.length > 0 && (
        <>
          <div className="card">
            {/* Flashcard with flip functionality */}
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
            {/* Navigation controls */}
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

          {/* Deck Saving Interface */}
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