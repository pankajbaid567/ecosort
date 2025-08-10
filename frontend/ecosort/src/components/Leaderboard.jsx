import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  // Mock data for demonstration
  const topUsers = [
    { rank: 1, name: 'Eco Warrior', points: 300, logs: 45 },
    { rank: 2, name: 'Demo User', points: 150, logs: 23 },
    { rank: 3, name: 'Green Guardian', points: 120, logs: 18 },
    { rank: 4, name: 'Nature Lover', points: 95, logs: 15 },
    { rank: 5, name: 'Planet Protector', points: 78, logs: 12 },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-orange-500" size={24} />;
      default:
        return <span className="text-eco-green font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-eco-light text-lg">
          Top eco-warriors making a difference in waste management
        </p>
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto">
        {topUsers.map((user, index) => (
          <div
            key={user.rank}
            className={`card mb-4 border-2 ${getRankBg(user.rank)} hover:shadow-eco-lg transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(user.rank)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-eco-dark">
                    {user.name}
                  </h3>
                  <p className="text-eco-light text-sm">
                    {user.logs} items logged
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-eco-green">
                  {user.points}
                </div>
                <p className="text-eco-light text-sm">points</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="card text-center mt-8 bg-eco-green bg-opacity-5 border-eco-green border-opacity-30">
        <h2 className="text-xl font-bold text-eco-dark mb-2">
          Want to climb the leaderboard? 🚀
        </h2>
        <p className="text-eco-light mb-4">
          Start logging your waste disposal activities and earn points for every item you properly dispose of!
        </p>
        <a 
          href="/waste-guide" 
          className="btn-primary inline-block"
        >
          Start Logging Waste
        </a>
      </div>
    </div>
  );
};

export default Leaderboard;
