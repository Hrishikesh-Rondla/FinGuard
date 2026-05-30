import { Lightbulb } from 'lucide-react';

export default function RecommendationCard({ recommendation, index }) {
  return (
    <div
      id={`recommendation-${index}`}
      className="glass-card-hover p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-teal/20 rounded-lg flex items-center justify-center">
        <span className="text-xs font-mono font-bold text-teal">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-4 h-4 text-amber flex-shrink-0" />
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Recommendation
          </span>
        </div>
        <p className="text-sm text-gray-300">{recommendation}</p>
      </div>
    </div>
  );
}
