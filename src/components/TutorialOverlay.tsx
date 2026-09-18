import React from 'react';
import { TUTORIAL_STEPS, TutorialState } from '../core/tutorial';

export const TutorialOverlay: React.FC<{ state: TutorialState; onNext: () => void; onClose: () => void; onReplay?: () => void }> = ({ state, onNext, onClose }) => {
  const step = TUTORIAL_STEPS[state.step];
  return <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
    <section className="w-full max-w-lg rounded-2xl border border-amber-500/60 bg-[#10131d] p-5 shadow-2xl">
      <div className="flex justify-between items-start gap-3"><div><p className="text-xs font-mono text-amber-400">GUILD FIELD GUIDE · {state.step + 1}/{TUTORIAL_STEPS.length}</p><h2 id="tutorial-title" className="text-2xl font-bold text-amber-200 font-cinzel">{step.title}</h2></div><button onClick={onClose} aria-label="Close tutorial" className="text-gray-400 hover:text-white text-xl">×</button></div>
      <p className="mt-4 text-gray-200 leading-relaxed">{step.body}</p><p className="mt-3 rounded-lg bg-[#0b0d14] border border-[#283149] p-3 text-sm text-cyan-200 font-mono">Shortcut: {step.hint}</p>
      <div className="mt-5 flex justify-end"><button autoFocus onClick={onNext} className="rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-gray-950 hover:bg-amber-400">{state.completed ? 'Done' : state.step === TUTORIAL_STEPS.length - 1 ? 'Finish guide' : 'Next lesson'} →</button></div>
    </section>
  </div>;
};
