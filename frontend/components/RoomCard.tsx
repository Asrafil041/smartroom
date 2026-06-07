'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Item } from '@/app/rooms/page';

interface RoomCardProps {
  item: Item;
}

export default function RoomCard({ item }: RoomCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'hard':
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐ Mudah';
      case 'medium':
        return '⭐⭐ Menengah';
      case 'hard':
        return '⭐⭐⭐ Sulit';
      default:
        return '';
    }
  };

  const handleSelectRoom = () => {
    if (loading || !item.is_accessible) return;

    setLoading(true);
    setTimeout(() => {
      router.push(`/simulation/${item.id}`);
    }, 300);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform ${
        item.is_accessible ? 'cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Card background */}
      <div className="bg-white overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative w-full h-48 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            priority={false}
          />

          {/* Lock overlay for inaccessible items */}
          {!item.is_accessible && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <span className="text-5xl drop-shadow-lg">🔒</span>
            </div>
          )}

          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(item.difficulty)}`}>
              {getDifficultyLabel(item.difficulty)}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          {/* Title */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
          </div>

          {/* Requirement for inaccessible items */}
          {!item.is_accessible && item.requirement && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700">
                <span className="font-semibold block mb-1">🔐 Persyaratan:</span>
                {item.requirement}
              </p>
            </div>
          )}

          {/* Progress bar for accessible items with progress */}
          {item.is_accessible && item.completion_rate > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600">Progress</span>
                <span className="text-xs font-bold text-orange-600">{Math.round(item.completion_rate * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.completion_rate * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleSelectRoom}
            disabled={!item.is_accessible || loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              item.is_accessible
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Memulai...
              </span>
            ) : item.is_accessible ? (
              'Masuk Ruangan'
            ) : (
              'Terkunci'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
