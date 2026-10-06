import React from 'react';
import CategoryIcon from '../common/CategoryIcon';

export default function CategoryCard({ category, isSelected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(category.id)}
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[96px] group focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
        isSelected
          ? `${category.bgActive} shadow-lg shadow-red-950/40 scale-[1.02]`
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70 text-slate-300'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
            isSelected
              ? 'bg-gradient-to-br ' + category.color + ' text-white shadow-md'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          <CategoryIcon aria-hidden="true" type={category.id} className="w-6 h-6" />
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'border-red-500 bg-red-500'
              : 'border-slate-600 bg-slate-900/60'
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
        </div>
      </div>

      <div className="mt-2.5">
        <span className={`block font-bold text-base tracking-wide ${isSelected ? 'text-white' : 'text-slate-100'}`}>
          {category.name}
        </span>
        <span className="block text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
          {category.subtitle}
        </span>
      </div>
    </button>
  );
}
