'use client';

import { useState } from 'react';
import { X, Sparkles, Utensils, Check, AlertCircle } from 'lucide-react';

import type { MealItem } from '../../lib/types';

type AddMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
  onSave: (meal: Omit<MealItem, 'id' | 'logged' | 'swapped'>) => void;
};

const STOPWORDS = new Set([
  'and', 'with', 'a', 'an', 'the', 'of', 'on', 'in', 'some',
  'my', 'i', 'had', 'ate', 'have', 'just', 'for', 'cup', 'cups',
  'glass', 'bowl', 'plate', 'slice', 'slices', 'piece', 'pieces',
  'tbsp', 'tsp', 'ml', 'g', 'kg', 'oz', 'lb', 'lbs', 'tablespoon',
  'tablespoons', 'teaspoon', 'teaspoons', 'few', 'couple'
]);

function buildNameFromInput(input: string): string {
  const words = input
    .trim()
    .toLowerCase()
    .replace(/\b(\d+\/\d+|\d+\.?\d*|one|two|three|four|five|six|seven|eight|nine|ten)\b/g, '')
    .split(/[\s,&+]+/)
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length > 2 && !STOPWORDS.has(w));

  const seen = new Set<string>();
  const titleWords: string[] = [];
  for (const w of words) {
    if (seen.has(w)) continue;
    seen.add(w);
    titleWords.push(w.charAt(0).toUpperCase() + w.slice(1));
    if (titleWords.length === 4) break;
  }

  return titleWords.length > 0
    ? titleWords.join(' & ')
    : input.trim().charAt(0).toUpperCase() + input.trim().slice(1);
}

export function AddMealModal({ isOpen, onClose, defaultType = 'Snack', onSave }: AddMealModalProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const handleAiAnalyze = async () => {
    if (!aiPrompt) return;
    setIsAnalyzing(true);
    setIsSuccess(false);
    setErrorMsg('');

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          // 🟢 Enforce pure JSON mode for maximum speed and 0 parsing errors
          response_format: { type: "json_object" }, 
          messages: [
            { 
              role: "system", 
              content: "You are a nutritionist AI. Return ONLY a valid JSON object with keys: name (string), calories (number), protein (number), carbs (number), fats (number)." 
          },
          { role: "user", content: aiPrompt }
      ]
      })
      });

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      
      // Clean up any potential markdown the LLM might stubbornly include
      let rawContent = data.choices[0].message.content;
      rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const macros = JSON.parse(rawContent);
      
      setName(macros.name || buildNameFromInput(aiPrompt));
      setCalories(String(macros.calories || 0));
      setProtein(String(macros.protein || 0));
      setCarbs(String(macros.carbs || 0));
      setFats(String(macros.fats || 0));
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);

    } catch (error) {
      console.error("AI Analysis failed", error);
      // Dynamic Fallback if the API fails or key is missing
      const dynamicName = buildNameFromInput(aiPrompt);
      setName(dynamicName);
      
      // Rough generic fallback macros based on word count
      const wordCount = aiPrompt.trim().split(/\s+/).length;
      const baseCalories = Math.min(300 + wordCount * 25, 800);
      setCalories(String(baseCalories));
      setProtein(String(Math.round(baseCalories * 0.12 / 4)));
      setCarbs(String(Math.round(baseCalories * 0.50 / 4)));
      setFats(String(Math.round(baseCalories * 0.30 / 9)));
      
      setErrorMsg('API unavailable. Using estimated defaults.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    onSave({
      name: name || 'Custom Meal',
      type: defaultType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
    });
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFats(''); setAiPrompt('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-background sm:rounded-3xl rounded-t-3xl border-t sm:border border-border shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <h2 className="text-[18px] font-extrabold text-text-primary capitalize flex items-center gap-2">
            <Utensils size={18} /> Add {defaultType}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card-inset flex items-center justify-center text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex bg-card-inset rounded-xl p-1 border border-border">
            <button onClick={() => setMode('manual')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${mode === 'manual' ? 'bg-card text-text-primary shadow-sm' : 'text-text-secondary'}`}>Manual Entry</button>
            <button onClick={() => setMode('ai')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 ${mode === 'ai' ? 'bg-brand-purple text-white shadow-brand-glow' : 'text-text-secondary'}`}><Sparkles size={14} /> AI Generate</button>
          </div>

          {mode === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., 3 scrambled eggs with 2 potatoes..." className="w-full p-4 bg-card border border-border rounded-2xl text-text-primary text-sm focus:outline-none focus:border-brand-purple min-h-[100px] resize-none" />
              {errorMsg && <p className="text-status-amber text-xs flex items-center gap-1"><AlertCircle size={12}/> {errorMsg}</p>}
              <button onClick={handleAiAnalyze} disabled={!aiPrompt || isAnalyzing} className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-xl font-bold flex items-center justify-center gap-2">
                {isAnalyzing ? <span className="animate-pulse flex items-center gap-2"><Sparkles size={16} /> Connecting to Llama 3.1...</span> : isSuccess ? <span className="flex items-center gap-2"><Check size={16} /> Macros Extracted!</span> : <span className="flex items-center gap-2"><Sparkles size={16} /> Calculate Macros</span>}
              </button>
            </div>
          )}

          <div className={`space-y-4 transition-all duration-500 ${isSuccess ? 'ring-2 ring-brand-purple p-3 rounded-2xl bg-brand-purple/5' : ''}`}>
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase ml-2">Meal Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-card border border-border rounded-xl text-text-primary font-bold mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-text-secondary font-bold uppercase ml-2">Calories</label><input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full p-3.5 bg-card border border-border rounded-xl text-text-primary font-bold mt-1" /></div>
              <div><label className="text-[10px] text-brand-cyan font-bold uppercase ml-2">Protein (g)</label><input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full p-3.5 bg-card border border-border rounded-xl text-text-primary font-bold mt-1" /></div>
              <div><label className="text-[10px] text-brand-purple font-bold uppercase ml-2">Carbs (g)</label><input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full p-3.5 bg-card border border-border rounded-xl text-text-primary font-bold mt-1" /></div>
              <div><label className="text-[10px] text-status-amber font-bold uppercase ml-2">Fats (g)</label><input type="number" value={fats} onChange={(e) => setFats(e.target.value)} className="w-full p-3.5 bg-card border border-border rounded-xl text-text-primary font-bold mt-1" /></div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-card border-t border-border mt-auto">
          <button onClick={handleSave} disabled={!name || !calories} className="w-full py-4 rounded-2xl bg-status-green/10 text-status-green border border-status-green/30 font-extrabold text-lg transition-transform active:scale-95 disabled:opacity-50">Save Meal to Log</button>
        </div>
      </div>
    </div>
  );
}