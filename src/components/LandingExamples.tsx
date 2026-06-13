import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface Example {
  text: string;
  category: string;
}

interface LandingExamplesProps {
  onSelect: (claim: string) => void;
}

export function LandingExamples({ onSelect }: LandingExamplesProps) {
  const examples: Example[] = [
    {
      text: "NASA spent millions of dollars developing a space pen to write in zero gravity, while Soviets simply used pencils.",
      category: "Space History"
    },
    {
      text: "Bananas are botanically classified as berries, but strawberries are not.",
      category: "Biology / Botany"
    },
    {
      text: "We only use ten percent of our brain capacity in our daily lives.",
      category: "Neurology"
    },
    {
      text: "An avocado is botanically a single-seeded giant berry.",
      category: "Agriculture / Fruit"
    },
    {
      text: "The Great Wall of China is the only man-made structure visible from space with the naked eye.",
      category: "Geography"
    },
    {
      text: "Drinking eight glasses of water per day is a strict scientific requirement for a healthy life.",
      category: "Health & Diet"
    }
  ];

  return (
    <div className="mt-8 text-left">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-[11px] uppercase tracking-widest text-[#71717a] font-mono">
          Or try verifying a legendary claim
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example, idx) => {
          return (
            <button
              key={idx}
              onClick={() => onSelect(example.text)}
              className="group flex flex-col justify-between p-5 text-left rounded-sm border border-[#262626] bg-[#121212] transition-all duration-300 hover:border-amber-900/40 hover:shadow-2xl"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-sm text-[9px] font-mono tracking-wider uppercase bg-zinc-900/60 border border-zinc-800 text-zinc-400 mb-3">
                  {example.category}
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed font-serif italic">
                  "{example.text}"
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono uppercase tracking-widest text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity self-end">
                <span>Select Claim</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

