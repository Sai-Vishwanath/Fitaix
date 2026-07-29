'use client';

export function WorkoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm p-6 bg-background rounded-3xl border border-border shadow-2xl">
        <h2 className="text-xl font-bold text-text-primary mb-2">Log a Workout</h2>
        <p className="text-sm text-text-secondary mb-6">What did you crush today?</p>
        
        <textarea
          placeholder="e.g., 45 mins of Push day, hit a new bench PR..."
          className="w-full h-32 p-4 bg-card-inset border border-border rounded-xl mb-6 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple resize-none"
        />

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-text-secondary/20 hover:bg-text-secondary/30 text-text-primary rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gradient-to-br from-brand-purple to-brand-pink text-white rounded-xl font-semibold transition-colors hover:scale-[1.02]"
          >
            Log It
          </button>
        </div>
      </div>
    </div>
  );
}