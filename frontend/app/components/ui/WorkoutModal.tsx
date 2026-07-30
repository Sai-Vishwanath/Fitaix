'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Check, Timer, Trophy, Play, Flame, Activity, Plus, Trash2 } from 'lucide-react';

import { useFitAIDispatch, useFitAIState } from '../../lib/FitAIContext';
import type { ExerciseLog } from '../../lib/types';

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function estimateCaloriesBurned(durationSeconds: number, setsCompleted: number): number {
  const minutes = durationSeconds / 60;
  return Math.round(minutes * 9 + setsCompleted * 15);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export function WorkoutModal({ 
  isOpen, 
  onClose,
  initialWorkoutName,
  initialExercises,
  mode = 'workout'
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialWorkoutName?: string;
  initialExercises?: ExerciseLog[];
  mode?: 'workout' | 'recovery';
}) {
  const dispatch = useFitAIDispatch();
  const { recovery } = useFitAIState();

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [workoutName, setWorkoutName] = useState(initialWorkoutName || 'Custom Workout');
  const [workoutTime, setWorkoutTime] = useState(0);

  // Dynamic Exercises List
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);

  const hasSyncedRef = useRef(false);

  const totalSets = useMemo(() => {
    return exercises.reduce((acc, ex) => acc + (Number(ex.sets) || 0), 0);
  }, [exercises]);

  // Total workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isFinished) {
      interval = setInterval(() => setWorkoutTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished]);

  // Reset local modal state when closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsStarted(false);
        setIsFinished(false);
        setWorkoutTime(0);
        setWorkoutName(initialWorkoutName || 'Custom Workout');
        setExercises([]);
        hasSyncedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setWorkoutName(initialWorkoutName || 'Custom Workout');
      if (initialExercises && initialExercises.length > 0) {
        setExercises(initialExercises.map(ex => ({ ...ex, id: generateId() })));
      } else if (exercises.length === 0) {
        setExercises([{ id: generateId(), name: '', sets: 3, reps: 10, weight: 0 }]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addExercise = () => {
    setExercises((prev) => [...prev, { id: generateId(), name: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof ExerciseLog, value: string | number) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleFinishWorkout = () => {
    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      
      const completedCount = totalSets; // We assume they completed what they logged
      const validExercises = exercises.filter((ex) => ex.name.trim() !== '');
      
      // Simple logic to extract muscles based on names (rough heuristic)
      const allText = validExercises.map(e => e.name.toLowerCase()).join(' ');
      const muscles = new Set<string>();
      if (allText.includes('squat') || allText.includes('leg') || allText.includes('lunge')) muscles.add('Quads');
      if (allText.includes('deadlift') || allText.includes('ham') || allText.includes('bridge')) muscles.add('Hamstrings');
      if (allText.includes('bench') || allText.includes('chest') || allText.includes('press') || allText.includes('pushup') || allText.includes('push-up')) muscles.add('Chest');
      if (allText.includes('pull') || allText.includes('row') || allText.includes('back') || allText.includes('lat')) muscles.add('Back');
      if (allText.includes('curl') || allText.includes('bicep')) muscles.add('Biceps');
      if (allText.includes('tri') || allText.includes('extension') || allText.includes('dip')) muscles.add('Triceps');
      if (allText.includes('shoulder') || allText.includes('overhead') || allText.includes('lateral') || allText.includes('raise')) muscles.add('Shoulders');
      if (allText.includes('plank') || allText.includes('crunch') || allText.includes('core') || allText.includes('abs') || allText.includes('situp')) muscles.add('Abs');
      if (allText.includes('calf') || allText.includes('calves')) muscles.add('Calves');
      if (allText.includes('glute') || allText.includes('hip thrust')) muscles.add('Glutes');
      
      // If none match, default to a general muscle to ensure the UI reacts
      if (muscles.size === 0) muscles.add('Core');

      dispatch({
        type: 'COMPLETE_WORKOUT',
        payload: {
          name: workoutName,
          type: 'custom',
          durationSeconds: workoutTime,
          setsCompleted: completedCount,
          totalSets,
          caloriesBurned: estimateCaloriesBurned(workoutTime, completedCount),
          muscleGroups: Array.from(muscles),
          exercises: validExercises,
        },
      });
    }

    setIsFinished(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-md bg-background sm:rounded-3xl rounded-t-3xl border-t sm:border border-border shadow-2xl flex flex-col overflow-hidden animate-slide-up">

        {/* ─── MODAL HEADER ─── */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <div>
            <h2 className="text-[18px] font-extrabold text-text-primary">
              {isFinished ? (mode === 'recovery' ? 'Recovery Complete!' : 'Workout Complete!') : isStarted ? (mode === 'recovery' ? 'Active Recovery' : 'Active Workout') : (mode === 'recovery' ? 'Start Recovery' : 'Start Workout')}
            </h2>
            {isStarted && !isFinished && (
              <p className="text-[12px] font-bold text-brand-purple flex items-center gap-1 mt-0.5">
                <Timer size={12} /> {formatTime(workoutTime)} elapsed
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-card-inset flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── SCROLLABLE CONTENT ─── */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-5">

          {/* STATE 1: PRE-WORKOUT */}
          {!isStarted && !isFinished && (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6 mt-10">
              <div className="w-20 h-20 rounded-full bg-brand-purple/15 flex items-center justify-center text-brand-purple">
                <Flame size={40} />
              </div>
              <div>
                <input 
                  type="text" 
                  value={workoutName} 
                  onChange={(e) => setWorkoutName(e.target.value)} 
                  className="text-2xl font-extrabold text-text-primary mb-2 bg-transparent border-b border-dashed border-border text-center focus:outline-none focus:border-brand-purple"
                />
                <p className="text-text-secondary text-sm px-4">
                  {mode === 'recovery' 
                    ? 'Follow this guided mobility flow to restore your muscles, improve flexibility, and reduce fatigue.' 
                    : 'Log your exercises, sets, reps, and weights to give your AI Coach accurate progression data.'}
                </p>
              </div>

              <button
                onClick={() => setIsStarted(true)}
                className="w-full py-4 mt-8 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-extrabold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-brand-glow"
              >
                <Play size={20} fill="currentColor" /> {mode === 'recovery' ? 'Start Flow' : 'Start Session'}
              </button>
            </div>
          )}

          {/* STATE 2: ACTIVE WORKOUT */}
          {isStarted && !isFinished && (
            <div className="space-y-6 pb-20">

              <div className="flex items-center justify-between">
                 <input 
                  type="text" 
                  value={workoutName} 
                  onChange={(e) => setWorkoutName(e.target.value)} 
                  className="text-lg font-extrabold text-text-primary bg-transparent border-b border-dashed border-border focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-card border border-border rounded-3xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-brand-purple uppercase">Exercise {index + 1}</span>
                      <button onClick={() => removeExercise(exercise.id)} className="text-status-red/70 hover:text-status-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Exercise Name (e.g., Squat)"
                      value={exercise.name}
                      onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                      className="w-full bg-card-inset text-text-primary text-[15px] font-bold p-3 rounded-xl focus:outline-none focus:border-brand-purple border border-transparent transition-colors"
                    />

                    <div className="flex gap-2">
                      <div className="flex-1 bg-card-inset rounded-xl p-2 flex flex-col items-center">
                        <span className="text-[10px] text-text-secondary font-bold uppercase mb-1">Sets</span>
                        <input
                          type="number"
                          value={exercise.sets || ''}
                          onChange={(e) => updateExercise(exercise.id, 'sets', Number(e.target.value))}
                          className="w-full bg-transparent text-center text-text-primary font-extrabold text-[15px] focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 bg-card-inset rounded-xl p-2 flex flex-col items-center">
                        <span className="text-[10px] text-text-secondary font-bold uppercase mb-1">Reps</span>
                        <input
                          type="number"
                          value={exercise.reps || ''}
                          onChange={(e) => updateExercise(exercise.id, 'reps', Number(e.target.value))}
                          className="w-full bg-transparent text-center text-text-primary font-extrabold text-[15px] focus:outline-none"
                        />
                      </div>
                      {mode === 'workout' && (
                        <div className="flex-1 bg-card-inset rounded-xl p-2 flex flex-col items-center">
                          <span className="text-[10px] text-text-secondary font-bold uppercase mb-1">LBS</span>
                          <input
                            type="number"
                            value={exercise.weight || ''}
                            onChange={(e) => updateExercise(exercise.id, 'weight', Number(e.target.value))}
                            className="w-full bg-transparent text-center text-text-primary font-extrabold text-[15px] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addExercise}
                  className="w-full border border-dashed border-brand-purple/40 rounded-2xl py-3.5 text-[13px] font-bold text-brand-purple flex items-center justify-center gap-2 hover:bg-brand-purple/5 transition-colors"
                >
                  <Plus size={16} /> Add Exercise
                </button>
              </div>

            </div>
          )}

          {/* STATE 3: POST-WORKOUT SUMMARY */}
          {isFinished && (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6 mt-10 animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full animate-pulse-dot" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center text-white shadow-brand-glow">
                  <Trophy size={48} />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-extrabold text-text-primary mb-2">Crushed it.</h3>
                <p className="text-text-secondary text-sm">Workout data synced to AI memory.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center">
                  <Timer size={20} className="text-brand-purple mb-2" />
                  <p className="text-text-primary font-extrabold text-xl">{formatTime(workoutTime)}</p>
                  <p className="text-text-secondary text-[10px] uppercase font-bold mt-1">Duration</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border flex flex-col items-center">
                  <Activity size={20} className="text-brand-cyan mb-2" />
                  <p className="text-text-primary font-extrabold text-xl">{totalSets}</p>
                  <p className="text-text-secondary text-[10px] uppercase font-bold mt-1">Sets Done</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── BOTTOM ACTION BAR ─── */}
        {isStarted && (
          <div className="p-5 bg-background border-t border-border mt-auto">
            {!isFinished ? (
              <button
                onClick={handleFinishWorkout}
                className="w-full py-4 rounded-2xl bg-status-green/10 text-status-green border border-status-green/30 font-extrabold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Check size={20} /> Finish Workout
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-card-inset text-text-primary font-extrabold text-lg transition-transform active:scale-95"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutModal;
