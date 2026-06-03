import { Lightbulb } from 'lucide-react';

export default function RecommendationCard({ recommendation, index }) {
  return (
    <div
      id={`recommendation-${index}`}
      className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
        <span className="text-xs font-mono font-bold text-blue-400">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 font-medium">
            Recommendation
          </span>
        </div>
        <p className="text-sm text-slate-300">{recommendation}</p>
      </div>
    </div>
  );
}
