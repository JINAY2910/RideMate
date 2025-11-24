import React from 'react';
import { Leaf, Award, TreeDeciduous } from 'lucide-react';

interface GreenStatsCardProps {
    co2Saved: number;
    greenPoints: number;
}

const GreenStatsCard: React.FC<GreenStatsCardProps> = ({ co2Saved, greenPoints }) => {
    // Determine level based on points
    const getLevel = (points: number) => {
        if (points < 100) return { name: 'Seedling', icon: Leaf, color: 'text-green-400', nextLevel: 100 };
        if (points < 500) return { name: 'Sapling', icon: TreeDeciduous, color: 'text-green-500', nextLevel: 500 };
        return { name: 'Forest Guardian', icon: Award, color: 'text-emerald-600', nextLevel: 1000 };
    };

    const level = getLevel(greenPoints);
    const LevelIcon = level.icon;

    // Calculate progress to next level
    const progress = Math.min(100, (greenPoints / level.nextLevel) * 100);

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 shadow-sm border border-green-100 mb-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 opacity-10">
                <TreeDeciduous size={150} className="text-green-800" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <h3 className="text-green-800 font-bold text-lg flex items-center gap-2">
                        <Leaf className="w-5 h-5" />
                        GreenMiles Impact
                    </h3>
                    <p className="text-green-600 text-sm mt-1">Your contribution to a greener planet</p>
                </div>
                <div className={`bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold ${level.color} border border-green-200 shadow-sm`}>
                    {level.name}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide">CO2 Saved</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">{co2Saved.toFixed(1)} <span className="text-sm font-normal text-green-600">kg</span></p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-100">
                    <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Green Points</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">{greenPoints}</p>
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <div className="flex justify-between text-xs text-green-700 mb-1 font-medium">
                    <span>Level Progress</span>
                    <span>{greenPoints} / {level.nextLevel} pts</span>
                </div>
                <div className="h-2.5 bg-green-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-green-600 mt-2 text-center italic">
                    Ride more to grow your forest! 🌱
                </p>
            </div>
        </div>
    );
};

export default GreenStatsCard;
