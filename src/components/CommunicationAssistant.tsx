import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plane, Utensils, AlertTriangle, Coffee } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

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
    { id: '1', english: 'Hello, how are you?', hindi: 'Namaskara, neevu hegiddira?', phonetic: 'na-mas-kaa-ra, nee-vu he-gid-dee-ra?', category: 'daily' },
    { id: '2', english: 'Where is the nearest metro station?', hindi: 'Hattira metro station elli ide?', phonetic: 'hat-ti-ra metro station el-li i-de?', category: 'travel' },
    { id: '3', english: 'I would like to order food', hindi: 'Naanu oota order maadbeku', phonetic: 'naa-nu oo-ta order maad-be-ku', category: 'food' },
    { id: '4', english: 'Please call a doctor', hindi: 'Dayavittu doctor ge call maadi', phonetic: 'da-ya-vit-tu doctor ge call maa-di', category: 'emergency' },
    { id: '5', english: 'How much does this cost?', hindi: 'Idara bele eshtu?', phonetic: 'i-da-ra be-le esh-tu?', category: 'daily' },
    { id: '6', english: 'Can you help me?', hindi: 'Nanage sahaya maadtira?', phonetic: 'na-na-ge sa-haa-ya maad-tee-ra?', category: 'daily' },
    { id: '7', english: 'Where is the bathroom?', hindi: 'Bathroom elli ide?', phonetic: 'bathroom el-li i-de?', category: 'travel' },
    { id: '8', english: 'This is spicy', hindi: 'Idu khara ide', phonetic: 'i-du kha-ra i-de', category: 'food' },
    { id: '9', english: 'Thank you very much', hindi: 'Thumba dhanyavadagalu', phonetic: 'thum-ba dhan-ya-vaa-da-ga-lu', category: 'daily' },
    { id: '10', english: 'I need help, it is an emergency', hindi: 'Nanage sahaya beku, idu emergency', phonetic: 'na-na-ge sa-haa-ya be-ku, i-du emergency', category: 'emergency' },
    { id: '11', english: 'Please give me water', hindi: 'Dayavittu nanage neeru kodi', phonetic: 'da-ya-vit-tu na-na-ge nee-ru ko-di', category: 'food' },
    { id: '12', english: 'I am lost, can you guide me?', hindi: 'Naanu daari tappiddini, nanage help maadtira?', phonetic: 'naa-nu daa-ri tap-pid-di-ni, na-na-ge help maad-tee-ra?', category: 'travel' }
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
        <PageHeader title="Communication Assistant" className="mb-6" />
        
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
                  <p className="text-sm text-muted-foreground mb-1">Kannada (Transliteration)</p>
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
