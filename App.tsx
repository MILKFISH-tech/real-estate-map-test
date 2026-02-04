
import React, { useState, useEffect, useCallback } from 'react';
import { Property } from './types';
import MapView from './components/MapView';
import PropertySidebar from './components/PropertySidebar';
import { Menu, RefreshCw, Database, X, AlertCircle } from 'lucide-react';

const DATA_URL = "https://script.google.com/macros/s/AKfycbxxBnk13H6jAAQtVve-NMncirCIWnWWHOKFfszrO4gZAaIDm3xf3fsbAnEPGupzzfubzw/exec";
const CORRECT_PASSWORD = "8888"; 

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('sy_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    
    // 設置超時控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      
      const text = await response.text();
      
      if (text.startsWith('<!DOCTYPE')) {
        setError("權限錯誤");
        return;
      }
      
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setError("資料格式異常");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("連線超時");
      } else {
        setError("連線失敗");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [fetchData, isAuthenticated]);


  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
        {/* 背景光暈 */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[100px] rounded-full"></div>
        
        <div className="w-full max-w-sm p-10 text-center relative z-10 animate-fade">
          {/* LOGO */}
          <div className="mb-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
              <div className="w-5 h-5 bg-white rounded"></div>
            </div>
            <h1 className="text-2xl text-white mb-2 font-bold tracking-wide">三灜地產</h1>
            <p className="text-slate-500 text-sm">成交紀錄系統</p>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === CORRECT_PASSWORD) {
              setIsAuthenticated(true);
              sessionStorage.setItem('sy_auth', 'true');
            } else { alert("通行碼有誤，請再試一次"); }
          }} className="space-y-4">
            <input
              autoFocus
              type="password"
              placeholder="請輸入通行碼"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full h-12 bg-[#1e293b] border border-slate-700 rounded-xl px-4 text-center text-lg text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
            />
            <button type="submit" className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl active:scale-[0.98] transition-all hover:bg-blue-500 shadow-lg shadow-blue-900/50">
              進入系統
            </button>
          </form>
          
          <p className="mt-10 text-xs text-slate-600">僅供內部人員使用</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden relative animate-fade">
      {/* Loading 覆蓋層 */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[3000] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={32} className="text-blue-600 animate-spin" />
            <span className="text-slate-600 text-sm">載入資料中...</span>
          </div>
        </div>
      )}

      {/* 頂欄 - 深藍色 */}
      <header className="h-14 bg-[#0f172a] flex items-center justify-between px-5 z-[2000] sticky top-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="text-white text-base font-bold">三灜地產</span>
          <span className="hidden sm:block text-slate-400 text-sm">成交地圖</span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <button onClick={() => fetchData()} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 bg-blue-600 text-white rounded-lg">
             {showSidebar ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {/* 地圖區域 */}
        <div className="flex-1 h-full relative">
          <MapView 
            properties={properties} 
            selectedProperty={selectedProperty}
            onMarkerClick={(p) => {
              setSelectedProperty(p);
            }}
            sidebarOpen={showSidebar}
          />

          {/* 錯誤提示 */}
          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] md:hidden">
              <div className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
                <AlertCircle size={13} /> 連線異常
              </div>
            </div>
          )}

          {/* 打開側邊欄按鈕 */}
          {!showSidebar && (
            <button 
              onClick={() => setShowSidebar(true)} 
              className="absolute bottom-6 right-6 z-[1001] w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
            >
              <Database size={22} />
            </button>
          )}
        </div>

        {/* 側邊欄 - 淺色毛玻璃 */}
        <aside className={`
          absolute inset-y-0 right-0 z-[2001]
          w-full sm:w-[360px] bg-white/80 backdrop-blur-xl border-l border-white/50 flex flex-col shadow-2xl
          transition-transform duration-300 ease-out
          ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="px-5 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/50">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              <h2 className="text-sm text-slate-800 font-bold">
                物件列表
              </h2>
              <span className="text-slate-400 text-xs">({properties.length})</span>
            </div>
            <button onClick={() => setShowSidebar(false)} className="p-1 text-slate-400 hover:text-slate-800 transition-colors"><X size={20}/></button>
          </div>

          {selectedProperty && (
            <div className="px-4 py-3 bg-blue-50/80 border-b border-slate-200/50 animate-fade">
              <div className="text-[10px] text-slate-500 font-medium mb-1">三灜地產</div>
              <h3 className="text-base text-slate-800 font-bold mb-1 leading-tight">{selectedProperty.name}</h3>
              <div className="text-lg text-orange-500 font-bold mb-2">成交價：{selectedProperty.price}萬</div>
              <div className="text-[10px] text-slate-400">
                成交分店：{selectedProperty.branch} · 成交時間：{selectedProperty.date}
              </div>
            </div>
          )}

          <PropertySidebar 
            properties={properties} 
            selectedProperty={selectedProperty} 
            onSelect={setSelectedProperty} 
          />
        </aside>
      </main>
    </div>
  );
};

export default App;
