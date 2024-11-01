'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Brain, BookOpen, Calendar, Save } from 'lucide-react';
import FlashcardCreator from './study-buddy/FlashcardCreator';
import SavedDecks from './study-buddy/SavedDecks';
import { Deck, Flashcard, TabProps } from './study-buddy/types';

const Tab: React.FC<TabProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
      ${isActive 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StudyBuddy = () => {
    const [activeTab, setActiveTab] = useState('flashcards');
    const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
    const [currentStudyDeck, setCurrentStudyDeck] = useState<Deck | null>(null);
  
    useEffect(() => {
      const loadedDecks = localStorage.getItem('flashcard-decks');
      if (loadedDecks) {
        setSavedDecks(JSON.parse(loadedDecks));
      }
    }, []);
  
    const handleSaveDeck = (name: string, flashcards: Flashcard[]) => {
      const newDeck: Deck = {
        name,
        flashcards,
        createdAt: new Date().toISOString(),
      };
  
      const updatedDecks = [...savedDecks, newDeck];
      setSavedDecks(updatedDecks);
      localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));
    };
  
    const handleLoadDeck = (deck: Deck) => {
      setCurrentStudyDeck(deck);
      setActiveTab('flashcards');
    };
  
    const handleDeleteDeck = (deckToDelete: Deck) => {
      const updatedDecks = savedDecks.filter(deck => deck.name !== deckToDelete.name);
      setSavedDecks(updatedDecks);
      localStorage.setItem('flashcard-decks', JSON.stringify(updatedDecks));
      if (currentStudyDeck?.name === deckToDelete.name) {
        setCurrentStudyDeck(null);
      }
    };
  
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-black">Study Buddy</h1>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
              onExitStudy={() => setCurrentStudyDeck(null)}
            />
          )}
  
          {activeTab === 'saved' && (
            <SavedDecks
              decks={savedDecks}
              onLoadDeck={handleLoadDeck}
              onDeleteDeck={handleDeleteDeck}
            />
          )}
  
          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-black">
                Progress tracking features coming soon...
              </p>
            </div>
          )}
  
          {activeTab === 'materials' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-black">
                Study materials features coming soon...
              </p>
            </div>
          )}
  
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-black">
                Study schedule features coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default StudyBuddy;