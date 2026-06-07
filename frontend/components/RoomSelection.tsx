'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_accessible: boolean;
  requirement?: string;
  completion_rate: number;
  icon: string;
  image: string;
}

interface RoomSelectionProps {
  rooms: Room[];
}

export default function RoomSelection({ rooms }: RoomSelectionProps) {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '';
    }
  };

  const handleSelectRoom = (roomId: string) => {
    if (loading) return;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room?.is_accessible) {
      return;
    }

    setLoading(true);
    setSelectedRoom(roomId);
    
    // Simulate navigation
    setTimeout(() => {
      router.push(`/simulation/${roomId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 px-4 py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">Pilih Ruangan</h1>
        <p className="text-purple-200">Pilih ruangan simulasi IoT untuk belajar</p>
      </div>

      {/* Room Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="group relative"
          >
            <div
              onClick={() => handleSelectRoom(room.id)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 transform ${
                room.is_accessible
                  ? 'cursor-pointer hover:scale-105 hover:shadow-2xl'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Room Image */}
              <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  className="object-cover"
                  priority={false}
                />
                
                {/* Lock overlay for inaccessible rooms */}
                {!room.is_accessible && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-5xl">🔒</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="bg-gradient-to-b from-white to-gray-50 p-6">
                {/* Title with icon */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{room.title}</h3>
                  <span className="text-3xl">{room.icon}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{room.description}</p>

                {/* Difficulty badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(room.difficulty)}`}>
                    {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)} {getDifficultyStars(room.difficulty)}
                  </span>
                </div>

                {/* Progress bar for completed rooms */}
                {room.is_accessible && room.completion_rate > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-bold text-purple-600">{Math.round(room.completion_rate * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${room.completion_rate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Status text */}
                {!room.is_accessible && room.requirement && (
                  <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded mb-4">
                    🔐 {room.requirement}
                  </div>
                )}

                {/* Button */}
                <button
                  onClick={() => handleSelectRoom(room.id)}
                  disabled={!room.is_accessible || selectedRoom === room.id}
                  className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 ${
                    room.is_accessible
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white disabled:opacity-50'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {selectedRoom === room.id && loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Memulai...
                    </span>
                  ) : room.is_accessible ? (
                    'Mulai Simulasi'
                  ) : (
                    'Terkunci'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
