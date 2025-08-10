import React from 'react';
import { User, Mail, Calendar, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-eco-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-eco-green" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-eco-dark mb-2">
          {user?.name || 'User Profile'}
        </h1>
        <p className="text-eco-light">
          Manage your EcoSort profile and view your eco-achievements
        </p>
      </div>

      {/* Profile Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-eco-dark mb-4 flex items-center gap-2">
          <User size={20} />
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-eco-light" size={20} />
            <div>
              <p className="text-eco-dark font-medium">{user?.email || 'Not available'}</p>
              <p className="text-eco-light text-sm">Email Address</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="text-eco-light" size={20} />
            <div>
              <p className="text-eco-dark font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
              </p>
              <p className="text-eco-light text-sm">Member Since</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Award className="text-eco-yellow" size={20} />
            <div>
              <p className="text-eco-dark font-medium text-2xl">{user?.points || 0}</p>
              <p className="text-eco-light text-sm">Total Points Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="card text-center py-8 bg-eco-green bg-opacity-5 border-eco-green border-opacity-30">
        <h2 className="text-xl font-bold text-eco-dark mb-4">
          Profile Features Coming Soon! ⚡
        </h2>
        <p className="text-eco-light mb-4">
          We're working on additional profile features including:
        </p>
        <ul className="text-left text-eco-light space-y-2 max-w-md mx-auto">
          <li>• Edit profile information</li>
          <li>• Achievement badges and milestones</li>
          <li>• Waste disposal history and analytics</li>
          <li>• Environmental impact metrics</li>
          <li>• Personal waste reduction goals</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
