import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plane, Utensils, AlertTriangle, Coffee } from 'lucide-react';

interface Phrase {
  id: string;
  english: string;
  hindi: string;
  phonetic: string;
  category: string;
}

const CommunicationAssistant = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All', icon: Coffee },
    { id: 'travel', name: 'Travel', icon: Plane },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'emergency', name: 'Emergency', icon: AlertTriangle },
    { id: 'daily', name: 'Daily Use', icon: Coffee }
  ];

  const phrases: Phrase[] = [
    { id: '1', english: 'Hello, how are you?', hindi: 'नमस्ते, आप कैसे हैं?', phonetic: 'namaste, aap kaise hain?', category: 'daily' },
    { id: '2', english: 'Where is the nearest metro station?', hindi: 'सबसे नजदीकी मेट्रो स्टेशन कहाँ है?', phonetic: 'sabse nazdeeki metro station kahan hai?', category: 'travel' },
    { id: '3', english: 'I would like to order food', hindi: 'मैं खाना ऑर्डर करना चाहूंगा', phonetic: 'main khana order karna chahunga', category: 'food' },
    { id: '4', english: 'Please call a doctor', hindi: 'कृपया डॉक्टर को बुलाएं', phonetic: 'kripaya doctor ko bulayen', category: 'emergency' },
    { id: '5', english: 'How much does this cost?', hindi: 'इसकी कीमत क्या है?', phonetic: 'iski keemat kya hai?', category: 'daily' },
    { id: '6', english: 'Can you help me?', hindi: 'क्या आप मेरी मदद कर सकते हैं?', phonetic: 'kya aap meri madad kar sakte hain?', category: 'daily' },
    { id: '7', english: 'Where is the bathroom?', hindi: 'बाथरूम कहाँ है?', phonetic: 'bathroom kahan hai?', category: 'travel' },
    { id: '8', english: 'This is spicy', hindi: 'यह तीखा है', phonetic: 'yeh teekhaa hai', category: 'food' }
  ];

  const filteredPhrases = phrases.filter(phrase => {
    const matchesSearch = phrase.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         phrase.hindi.includes(searchQuery) ||
                         phrase.phonetic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="pt-12 pb-6 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Communication Assistant</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search phrases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-0 shadow-card bg-card"
          />
        </div>

        <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap flex items-center space-x-2 rounded-xl ${
                  selectedCategory === category.id ? 'bg-gradient-primary shadow-glow' : 'hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredPhrases.map((phrase) => (
            <Card key={phrase.id} className="p-6 shadow-card border-0">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">English</p>
                  <p className="text-foreground font-medium">{phrase.english}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Hindi</p>
                  <p className="text-foreground font-medium text-lg">{phrase.hindi}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pronunciation</p>
                  <p className="text-foreground italic">{phrase.phonetic}</p>
                </div>
                <div className="pt-2">
                  <Badge variant="secondary" className="capitalize">{phrase.category}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPhrases.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No phrases found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationAssistant;
