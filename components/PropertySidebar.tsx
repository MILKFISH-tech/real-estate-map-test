
import React from 'react';
import { Property } from '../types';
import { ChevronRight, LayoutGrid } from 'lucide-react';

interface PropertySidebarProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelect: (p: Property) => void;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ properties, selectedProperty, onSelect }) => {
  // 分店顏色映射
  const getBranchColor = (branch: string) => {
    if (branch.includes('松竹')) return '#60a5fa'; // 亮藍
    if (branch.includes('南興')) return '#f87171'; // 亮紅
    if (branch.includes('十期')) return '#4ade80'; // 亮綠
    return '#94a3b8'; // 預設灰
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent px-4 py-3">
      {properties.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <LayoutGrid className="text-slate-300" size={20} />
          </div>
          <p className="text-slate-400 text-sm">查無相符資料</p>
        </div>
      ) : (
        <div className="space-y-0">
          {properties.map((p, idx) => {
            const isSelected = selectedProperty?.name === p.name && selectedProperty?.date === p.date;
            const branchColor = getBranchColor(p.branch);
            const isEven = idx % 2 === 0;
            
            return (
              <button
                key={`${p.name}-${idx}`}
                onClick={() => onSelect(p)}
                className={`
                  w-full text-left px-5 py-4 transition-all flex items-center gap-3 group relative border-b border-slate-100
                  ${isSelected 
                    ? 'bg-blue-600 shadow-lg' 
                    : isEven 
                      ? 'bg-white hover:bg-blue-50' 
                      : 'bg-slate-50/80 hover:bg-blue-50'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? '#93c5fd' : branchColor }}
                    ></div>
                    <span className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      {p.branch.includes('總店') ? p.branch.replace('總店', '三灜地產') : p.branch}
                    </span>
                  </div>
                  <h3 className={`text-sm font-bold truncate mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-bold ${isSelected ? 'text-amber-300' : 'text-orange-500'}`}>
                      {String(p.price).replace(/萬/g, '')}萬
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      {p.date}
                    </span>
                  </div>
                </div>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}
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
