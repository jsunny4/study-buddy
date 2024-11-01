'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Brain, BookOpen, Calendar, Save } from 'lucide-react';
import FlashcardCreator from './study-buddy/FlashcardCreator';
import SavedDecks from './study-buddy/SavedDecks';
import { Deck, Flashcard, TabProps } from './study-buddy/types';

const Tab: React.FC<TabProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`tab ${isActive ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StudyBuddy = () => {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [currentStudyDeck, setCurrentStudyDeck] = useState<Deck | null>(null);

  // Load saved decks from localStorage on component mount
  useEffect(() => {
    const loadedDecks = localStorage.getItem('flashcard-decks');
    if (loadedDecks) {
      try {
        setSavedDecks(JSON.parse(loadedDecks));
      } catch (error) {
        console.error('Error loading saved decks:', error);
      }
    }
  }, []);

  // Save deck handler
  const handleSaveDeck = (name: string, flashcards: Flashcard[]) => {
    // Check for duplicate names
    if (savedDecks.some(deck => deck.name === name)) {
      alert('A deck with this name already exists. Please choose a different name.');
      return;
    }

    const newDeck: Deck = {
      name,
      flashcards,
      createdAt: new Date().toISOString(),
    };

    const updatedDecks = [...savedDecks, newDeck];
    setSavedDecks(updatedDecks);
    localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));
    setActiveTab('saved'); // Switch to saved decks tab after saving
  };

  // Load deck for studying
  const handleLoadDeck = (deck: Deck) => {
    setCurrentStudyDeck(deck);
    setActiveTab('flashcards');
  };

  // Delete deck handler
  const handleDeleteDeck = (deckToDelete: Deck) => {
    // Add confirmation
    if (!confirm(`Are you sure you want to delete "${deckToDelete.name}"?`)) {
      return;
    }

    const updatedDecks = savedDecks.filter(deck => deck.name !== deckToDelete.name);
    setSavedDecks(updatedDecks);
    localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));
    
    // Clear current study deck if it's the one being deleted
    if (currentStudyDeck?.name === deckToDelete.name) {
      setCurrentStudyDeck(null);
    }
  };

  // Update deck handler
  const handleUpdateDeck = (updatedDeck: Deck) => {
    const updatedDecks = savedDecks.map(deck => 
      deck.name === updatedDeck.name ? updatedDeck : deck
    );
    setSavedDecks(updatedDecks);
    localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));

    // Update current study deck if it's the one being edited
    if (currentStudyDeck?.name === updatedDeck.name) {
      setCurrentStudyDeck(updatedDeck);
    }
  };

  // Exit study mode handler
  const handleExitStudy = () => {
    setCurrentStudyDeck(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="logo-container mb-8">
        <h1 className="logo-text">Study Buddy</h1>
      </div>
      
      <div className="tab-container">
        <Tab
          icon={<Brain className="h-4 w-4" />}
          label="Flashcards"
          value="flashcards"
          isActive={activeTab === 'flashcards'}
          onClick={() => setActiveTab('flashcards')}
        />
        <Tab
          icon={<Save className="h-4 w-4" />}
          label="Saved Decks"
          value="saved"
          isActive={activeTab === 'saved'}
          onClick={() => setActiveTab('saved')}
        />
        <Tab
          icon={<BarChart className="h-4 w-4" />}
          label="Progress"
          value="progress"
          isActive={activeTab === 'progress'}
          onClick={() => setActiveTab('progress')}
        />
        <Tab
          icon={<BookOpen className="h-4 w-4" />}
          label="Materials"
          value="materials"
          isActive={activeTab === 'materials'}
          onClick={() => setActiveTab('materials')}
        />
        <Tab
          icon={<Calendar className="h-4 w-4" />}
          label="Schedule"
          value="schedule"
          isActive={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        />
      </div>

      <div className="mt-6">
        {activeTab === 'flashcards' && (
          <FlashcardCreator 
            onSaveDeck={handleSaveDeck}
            initialDeck={currentStudyDeck}
            onExitStudy={handleExitStudy}
          />
        )}

        {activeTab === 'saved' && (
          <SavedDecks
            decks={savedDecks}
            onLoadDeck={handleLoadDeck}
            onDeleteDeck={handleDeleteDeck}
            onUpdateDeck={handleUpdateDeck}
          />
        )}

        {activeTab === 'progress' && (
          <div className="card">
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-lg">
                Progress tracking features coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="card">
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-lg">
                Study materials features coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="card">
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-lg">
                Study schedule features coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyBuddy;