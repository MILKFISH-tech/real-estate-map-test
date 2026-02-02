
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Property } from './types';
import MapView from './components/MapView';
import PropertySidebar from './components/PropertySidebar';
import { Search, ChevronRight, Menu, RefreshCw, Loader2, Database, MapPin, X, Lock, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

const DATA_URL = "https://script.google.com/macros/s/AKfycbwqk2jxTzwWi7f0ufV5GBedb0lX72XH4eMYvXjp2rw64ofk_Yu1LUPKUdJT5tLpBem7HQ/exec";
const CORRECT_PASSWORD = "8888"; 

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('sy_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`);
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE')) {
        setError("權限錯誤：請確認 GAS 部署設定為「所有人」存取。");
        return;
      }
      
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setError("資料格式異常");
      }
    } catch (err) {
      setError("連線失敗：請檢查後台網址");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [fetchData, isAuthenticated]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.displayAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, properties]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-400/5 blur-[120px] rounded-full"></div>
        
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center relative z-10 animate-fade">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10">
            <Lock className="text-white/80" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">三灜地產系統</h1>
          <p className="text-slate-500 font-bold text-[10px] mb-10 tracking-[0.4em] uppercase opacity-60">Internal Database Access</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === CORRECT_PASSWORD) {
              setIsAuthenticated(true);
              sessionStorage.setItem('sy_auth', 'true');
            } else { alert("通行碼錯誤"); }
          }} className="space-y-4">
            <input
              autoFocus
              type="password"
              placeholder="••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-4 text-center text-3xl font-mono text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-800"
            />
            <button type="submit" className="w-full h-16 bg-white text-slate-900 font-black text-md rounded-2xl active:scale-95 transition-all shadow-xl">進入系統</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden relative font-sans animate-fade">
      {/* 專業灰色系頂欄 */}
      <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 z-[2000] sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
             <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">三灜地產成交地圖</span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 animate-pulse">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button onClick={() => fetchData()} className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2.5 bg-slate-900 text-white rounded-xl">
             {showSidebar ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {/* 地圖區域 */}
        <div className="flex-1 h-full relative">
          <MapView 
            properties={filteredProperties} 
            selectedProperty={selectedProperty}
            onMarkerClick={(p) => {
              setSelectedProperty(p);
              if (window.innerWidth < 768) setShowSidebar(true);
            }}
            sidebarOpen={showSidebar}
          />

          {/* 移動端搜尋框 */}
          <div className="absolute top-4 left-4 right-4 z-[1001] md:left-6 md:top-6 md:w-80">
            <div className="relative shadow-2xl">
              <input 
                type="text" 
                placeholder="搜尋物件..."
                className="w-full h-12 pl-12 pr-4 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {/* 如果有錯誤，在下方顯示小提示框，不遮擋地圖 */}
          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] md:hidden">
              <div className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black shadow-xl flex items-center gap-2">
                <AlertCircle size={14} /> 後台連線異常
              </div>
            </div>
          )}
        </div>

        {/* 專業側邊欄 - 列表風格 */}
        <aside className={`
          absolute md:relative inset-y-0 right-0 z-[2001] md:z-10
          w-full sm:w-[380px] bg-white border-l border-slate-200 flex flex-col
          transition-transform duration-500 ease-in-out
          ${showSidebar ? 'translate-x-0' : 'translate-x-full md:absolute md:right-[-380px]'}
        `}>
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Database size={16} className="text-slate-400" /> 物件列表 ({filteredProperties.length})
            </h2>
            <button onClick={() => setShowSidebar(false)} className="p-1 text-slate-300 hover:text-slate-900"><X size={20}/></button>
          </div>

          {selectedProperty && (
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 animate-fade">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-2">{selectedProperty.branch} · {selectedProperty.date}</div>
              <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">{selectedProperty.name}</h3>
              <div className="text-2xl font-black text-red-500 mb-4">{selectedProperty.price}</div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <MapPin size={14} /> {selectedProperty.displayAddress}
              </div>
            </div>
          )}

          <PropertySidebar 
            properties={filteredProperties} 
            selectedProperty={selectedProperty} 
            onSelect={setSelectedProperty} 
          />
        </aside>
      </main>
    </div>
  );
};

export default App;
