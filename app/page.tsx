'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';
import { PropertyType, StepLocation, StepGuestsAndType, StepBudget, StepAmenities, StepVibeAndRating } from '../components/QuizSteps';

export interface QuizAnswers {
  location: string;
  maxGuests: number;
  propertyType: PropertyType | null;
  minBudget: number;
  maxBudget: number;
  preferredAmenitySlugs: string[];
  preferredVibeSlugs: string[];
  minRating: number | null;
}

const TOTAL_STEPS = 5;

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  const [answers, setAnswers] = useState<QuizAnswers>({
    location: '',
    maxGuests: 2,
    propertyType: null,
    minBudget: 50,
    maxBudget: 300,
    preferredAmenitySlugs: [],
    preferredVibeSlugs: [],
    minRating: null,
  });

  const set = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const toggleList = (
    key: 'preferredAmenitySlugs' | 'preferredVibeSlugs',
    slug: string
  ) => {
    setAnswers((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug],
      };
    });
  };

  const canAdvance = (): boolean => {
    if (step === 1) return answers.location !== '';
    return true;
  };

  const navigate = (dir: 'forward' | 'back') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => (dir === 'forward' ? s + 1 : s - 1));
      setAnimating(false);
    }, 220);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      router.push(`/results?sessionId=${data.sessionId}`);
    } catch (err) {
      console.error('Quiz submission failed:', err);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const animClass = animating
    ? direction === 'forward' ? 'card-exit-left' : 'card-exit-right'
    : 'card-enter';

  return (
    <main className="quiz-root">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <header className="quiz-header">
        <h1 className="lodge-title">🧙 Lodge Wiz</h1>
        <p className="lodge-sub">Answer a few questions and we'll find your perfect stay</p>
      </header>

      <div className={`quiz-card ${animClass}`}>
        <div className="card-progress-bar">
          <div className="card-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="card-inner">
          <span className="step-counter">Step {step} of {TOTAL_STEPS}</span>

          {step === 1 && (
            <StepLocation
              value={answers.location}
              onChange={(v) => set('location', v)}
            />
          )}

          {step === 2 && (
            <StepGuestsAndType
              guests={answers.maxGuests}
              propertyType={answers.propertyType}
              onGuests={(v) => set('maxGuests', v)}
              onType={(v) => set('propertyType', v)}
            />
          )}

          {step === 3 && (
            <StepBudget
              minBudget={answers.minBudget}
              maxBudget={answers.maxBudget}
              onMin={(v) => set('minBudget', v)}
              onMax={(v) => set('maxBudget', v)}
            />
          )}

          {step === 4 && (
            <StepAmenities
              selected={answers.preferredAmenitySlugs}
              onToggle={(slug) => toggleList('preferredAmenitySlugs', slug)}
            />
          )}

          {step === 5 && (
            <StepVibeAndRating
              selectedVibes={answers.preferredVibeSlugs}
              minRating={answers.minRating}
              onToggleVibe={(slug) => toggleList('preferredVibeSlugs', slug)}
              onRating={(v) => set('minRating', v)}
            />
          )}

          <div className="card-nav">
            {step > 1 ? (
              <button type="button" onClick={() => navigate('back')} className="btn-back">
                ← Back
              </button>
            ) : (
              <span />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => navigate('forward')}
                disabled={!canAdvance()}
                className="btn-next"
              >
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="btn-submit">
                Find my stay ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}