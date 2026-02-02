
import React from 'react';
import { Property } from '../types';
import { Calendar, ChevronRight, LayoutGrid, MapPin } from 'lucide-react';

interface PropertySidebarProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelect: (p: Property) => void;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ properties, selectedProperty, onSelect }) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-4 py-4">
      {properties.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-4">
          <LayoutGrid className="text-slate-100" size={48} />
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">查無相符資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p, idx) => {
            const isSelected = selectedProperty?.name === p.name && selectedProperty?.date === p.date;
            return (
              <button
                key={`${p.name}-${idx}`}
                onClick={() => onSelect(p)}
                className={`
                  w-full text-left p-5 rounded-[1.8rem] transition-all flex items-center gap-4 group relative border
                  ${isSelected 
                    ? 'bg-slate-900 border-slate-900 shadow-xl scale-[1.02] z-10' 
                    : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-lg active:scale-95'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${p.branch.includes('松竹') ? 'bg-indigo-500' : p.branch.includes('南興') ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {p.branch}
                    </span>
                  </div>
                  <h3 className={`font-black text-sm truncate mb-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`font-black text-lg tracking-tight ${isSelected ? 'text-red-400' : 'text-red-500'}`}>
                      {p.price}
                    </span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>
                      {p.date}
                    </span>
                  </div>
                </div>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-300'}
                `}>
                  <ChevronRight size={18} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertySidebar;
