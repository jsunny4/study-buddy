'use client';

import React, { useState } from 'react';
import { Deck, Flashcard } from './types';
import { BookOpen, Trash, Edit, X, Plus, Save } from 'lucide-react';

// Props interface defining the component's required properties
interface SavedDecksProps {
  decks: Deck[];                           // Array of saved decks
  onLoadDeck: (deck: Deck) => void;        // Handler for loading a deck to study
  onDeleteDeck: (deck: Deck) => void;      // Handler for deleting a deck
  onUpdateDeck: (updatedDeck: Deck) => void; // Handler for updating a deck
}

const SavedDecks: React.FC<SavedDecksProps> = ({ 
  decks, 
  onLoadDeck, 
  onDeleteDeck,
  onUpdateDeck
}) => {
  // State management for deck editing
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);  // Currently editing deck ID
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);        // Deck being edited
  const [newCard, setNewCard] = useState({ question: '', answer: '' });     // New card form state
  const [error, setError] = useState<string>('');                           // Error message state

  // Start editing a deck
  const startEditing = (deck: Deck) => {
    setEditingDeckId(deck.name);
    // Create a deep copy of the deck with new IDs for the cards
    setEditingDeck({
      ...deck,
      flashcards: deck.flashcards.map(card => ({ 
        ...card, 
        id: Math.random().toString(36).substr(2, 9) 
      }))
    });
    setError('');
  };

  // Cancel editing with unsaved changes check
  const cancelEditing = () => {
    if (hasUnsavedChanges()) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    // Reset all editing state
    setEditingDeckId(null);
    setEditingDeck(null);
    setNewCard({ question: '', answer: '' });
    setError('');
  };

  // Check for unsaved changes
  const hasUnsavedChanges = () => {
    const originalDeck = decks.find(deck => deck.name === editingDeckId);
    if (!originalDeck || !editingDeck) return false;
    return JSON.stringify(originalDeck.flashcards) !== JSON.stringify(editingDeck.flashcards);
  };

  // Save changes to a deck
  const handleSaveChanges = () => {
    if (!editingDeck) return;

    // Validate cards
    const hasEmptyCards = editingDeck.flashcards.some(
      card => !card.question.trim() || !card.answer.trim()
    );

    if (hasEmptyCards) {
      setError('All cards must have both a question and an answer');
      return;
    }

    // Update deck and reset state
    onUpdateDeck(editingDeck);
    setEditingDeckId(null);
    setEditingDeck(null);
    setNewCard({ question: '', answer: '' });
    setError('');
  };

  // Add a new card to the deck being edited
  const addNewCard = () => {
    if (!editingDeck || !newCard.question.trim() || !newCard.answer.trim()) {
      setError('Please fill in both question and answer');
      return;
    }
    
    // Add new card with unique ID
    setEditingDeck({
      ...editingDeck,
      flashcards: [
        ...editingDeck.flashcards,
        {
          ...newCard,
          id: Math.random().toString(36).substr(2, 9)
        }
      ]
    });
    // Reset new card form
    setNewCard({ question: '', answer: '' });
    setError('');
  };

  // Remove a card with confirmation
  const removeCard = (cardId: string, cardQuestion: string) => {
    if (!editingDeck) return;

    const shouldDelete = confirm(
      `Are you sure you want to delete this flashcard?\n\nQuestion: ${cardQuestion}`
    );
    
    if (shouldDelete) {
      setEditingDeck({
        ...editingDeck,
        flashcards: editingDeck.flashcards.filter(card => card.id !== cardId)
      });
    }
  };

  // Update a card's content
  const updateCard = (cardId: string, field: 'question' | 'answer', value: string) => {
    if (!editingDeck) return;

    setEditingDeck({
      ...editingDeck,
      flashcards: editingDeck.flashcards.map(card =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Map through all decks */}
      {decks.map((deck) => (
        <div 
          key={deck.name}
          className="card"
        >
          {editingDeckId === deck.name ? (
            // Editing Mode UI
            <div className="space-y-6">
              {/* Header with save/cancel buttons */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Editing: {deck.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveChanges}
                    className="btn btn-primary flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="btn flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>

              {/* Add New Card Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add New Card</h4>
                <div className="grid gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={newCard.question}
                      onChange={e => setNewCard(prev => ({ 
                        ...prev, 
                        question: e.target.value 
                      }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter answer"
                      value={newCard.answer}
                      onChange={e => setNewCard(prev => ({ 
                        ...prev, 
                        answer: e.target.value 
                      }))}
                      className="input"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    onClick={addNewCard}
                    disabled={!newCard.question.trim() || !newCard.answer.trim()}
                    className="btn btn-secondary flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Card
                  </button>
                </div>
              </div>

              {/* Edit Existing Cards List */}
              <div className="space-y-4">
                <h4 className="font-medium">
                  Flashcards ({editingDeck?.flashcards.length})
                </h4>
                {editingDeck?.flashcards.map((card, index) => (
                  <div 
                    key={card.id}
                    className="bg-white border rounded-lg p-4 space-y-3"
                  >
                    {/* Card Question */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        value={card.question}
                        onChange={e => updateCard(card.id, 'question', e.target.value)}
                        className="input"
                      />
                    </div>
                    {/* Card Answer */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Answer {index + 1}
                      </label>
                      <input
                        type="text"
                        value={card.answer}
                        onChange={e => updateCard(card.id, 'answer', e.target.value)}
                        className="input"
                      />
                    </div>
                    {/* Remove Card Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeCard(card.id, card.question)}
                        className="btn btn-danger flex items-center gap-1"
                      >
                        <Trash className="h-4 w-4" />
                        Remove Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // View Mode UI
            <div>
              <div className="flex justify-between items-center">
                {/* Deck Info */}
                <div>
                  <h3 className="font-medium text-lg">{deck.name}</h3>
                  <p className="text-sm text-gray-500">
                    {deck.flashcards.length} cards • Created {new Date(deck.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoadDeck(deck)}
                    className="btn btn-primary flex items-center gap-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    Study
                  </button>
                  <button
                    onClick={() => startEditing(deck)}
                    className="btn btn-secondary flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(
                        `Are you sure you want to delete "${deck.name}"?\nThis will permanently delete all flashcards in this deck.`
                      )) {
                        onDeleteDeck(deck);
                      }
                    }}
                    className="btn btn-danger flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Empty State */}
      {decks.length === 0 && (
        <p className="text-center text-gray-500">No saved decks yet</p>
      )}
    </div>
  );
};

export default SavedDecks;