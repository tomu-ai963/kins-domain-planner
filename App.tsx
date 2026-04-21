import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Apple, 
  Carrot, 
  Trees, 
  Waves, 
  Home, 
  Eraser, 
  Undo2,
  Trash2,
  Info,
  Download,
  Upload,
  BarChart3,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';

// --- Types ---

type ToolType = 'hedge' | 'orchard' | 'garden' | 'forest' | 'pond' | 'house' | 'eraser';

interface PlacedItem {
  id: string;
  type: ToolType;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

interface ToolConfig {
  id: ToolType;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc?: string;
  estimatedArea?: number; // m2 per unit (rough estimation for statistics)
}

// --- Constants ---

const TOOLS: ToolConfig[] = [
  { id: 'hedge', label: '生きた垣根', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-100', estimatedArea: 5 },
  { id: 'orchard', label: '果樹園', icon: Apple, color: 'text-rose-500', bg: 'bg-rose-100', estimatedArea: 20 },
  { id: 'garden', label: '菜園', icon: Carrot, color: 'text-orange-500', bg: 'bg-orange-100', estimatedArea: 10 },
  { id: 'forest', label: '森', icon: Trees, color: 'text-green-700', bg: 'bg-green-100', estimatedArea: 50 },
  { id: 'pond', label: '池', icon: Waves, color: 'text-blue-500', bg: 'bg-blue-100', estimatedArea: 40 },
  { id: 'house', label: '家', icon: Home, color: 'text-amber-700', bg: 'bg-amber-100', estimatedArea: 60 },
  { id: 'eraser', label: '消しゴム', icon: Eraser, color: 'text-slate-500', bg: 'bg-slate-200' },
];

const CANVAS_SIZE = 600;
const GRID_INTERVAL = 10;
const LOCAL_STORAGE_KEY = 'kins-domain-design';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('hedge');
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved design');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // --- Export/Import ---

  const exportData = () => {
    const data = JSON.stringify(items, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kins-domain-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (e) {
        alert('無効なファイル形式です。');
      }
    };
    reader.readAsText(file);
  };

  // --- Statistics ---

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalEstimatedArea = 0;
    
    items.forEach(item => {
      counts[item.type] = (counts[item.type] || 0) + 1;
      const config = TOOLS.find(t => t.id === item.type);
      if (config?.estimatedArea) totalEstimatedArea += config.estimatedArea;
    });

    const percent = Math.min((totalEstimatedArea / 10000) * 100, 100);
    return { counts, totalEstimatedArea, percent };
  }, [items]);

  // --- Guide Logic (Simulated AI Analysis) ---

  const analysis = useMemo(() => {
    const tips: string[] = [];
    const scores: { label: string, status: 'good' | 'warn' | 'neutral' }[] = [];

    // 1. Perimeter Hedge Check
    const hedgeCount = items.filter(i => i.type === 'hedge').length;
    const hasPerimeter = items.filter(i => i.type === 'hedge' && (i.x < 15 || i.x > 85 || i.y < 15 || i.y > 85)).length > 10;
    
    if (hasPerimeter) {
      scores.push({ label: '生きた垣根による保護', status: 'good' });
    } else {
      tips.push('土地の境界に「生きた垣根」を植えることで、一族の空間を守り、調和のとれた微気候を作ることができます。');
      scores.push({ label: '生きた垣根による保護', status: 'warn' });
    }

    // 2. Diversity Check
    const typesCount = new Set(items.map(i => i.type)).size;
    if (typesCount >= 5) {
      scores.push({ label: '生物の多様性', status: 'good' });
    } else {
      tips.push('果樹園、菜園、森、池など、多様な要素を組み合わせることで、自然の自浄作用と豊かさが生まれます。');
      scores.push({ label: '生物の多様性', status: 'warn' });
    }

    // 3. Center Openness Check
    const centerItems = items.filter(i => i.x > 35 && i.x < 65 && i.y > 35 && i.y < 65).length;
    if (centerItems < items.length * 0.2) {
      scores.push({ label: '中央の開放感', status: 'good' });
    } else {
      tips.push('中央部分を少し開けておくことで、光が入り、家族が集まるための風通しの良い空間になります。');
      scores.push({ label: '中央の開放感', status: 'warn' });
    }

    // 4. Essential Elements
    const hasPond = items.some(i => i.type === 'pond');
    const hasForest = items.some(i => i.type === 'forest');
    if (!hasPond) tips.push('小さな「池」は、土地の湿度を保ち、鳥や益虫を呼び寄せる大切な命の源になります。');
    if (!hasForest) tips.push('土地の1/4から3/4を「森」にすることで、土壌が育まれ、心地よい静寂が得られます。');

    return { tips, scores };
  }, [items]);

  // --- Handlers ---

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (activeTool === 'eraser') return;
    const newItem: PlacedItem = { id: Math.random().toString(36).substr(2, 9), type: activeTool, x, y };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'eraser' || e.button === 2) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-stone-800 font-sans flex flex-col selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
            <Trees className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-none mb-1">Kin's Domain Planner</h1>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Sustainable Garden Design Interface</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors">
            <Upload size={14} /> インポート
          </button>
          <button onClick={exportData} className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors">
            <Download size={14} /> エクスポート
          </button>
          <div className="w-px h-8 bg-stone-200 mx-1" />
          <button onClick={() => setItems([])} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500" title="Clear All">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-stone-200 p-6 flex flex-col gap-6 shadow-sm overflow-y-auto z-10">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">配置アイテム</h2>
            <div className="grid gap-2">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`
                    flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200
                    ${activeTool === tool.id 
                      ? `${tool.bg} ${tool.color} shadow-sm ring-1 ring-inset ring-current/20 scale-[1.02]` 
                      : 'hover:bg-stone-50 text-stone-500'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <tool.icon size={18} />
                    <span className="font-semibold text-sm">{tool.label}</span>
                  </div>
                  {stats.counts[tool.id] > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/50 font-bold`}>
                      {stats.counts[tool.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
             <button 
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl border transition-all ${showStats ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-stone-50 border-stone-100 hover:border-stone-200'}`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-bold">統計パネル</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${showStats ? 'rotate-90' : ''}`} />
            </button>
            
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className={`flex items-center gap-3 w-full p-4 rounded-2xl border transition-all ${showGuide ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-stone-50 border-stone-100 hover:border-stone-200'}`}
            >
              <Sparkles size={18} />
              <span className="text-sm font-bold">アナスタシア・ガイド</span>
              <ChevronRight size={14} className={`ml-auto transition-transform ${showGuide ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className="mt-auto bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Quick Tip</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed italic">
              "自らの手で一本の木を植えるとき、それは地球の魂に触れることと同じです。"
            </p>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className="flex-1 overflow-auto p-12 flex justify-center items-start bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="relative group">
            <div className="absolute -inset-8 bg-white/40 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
            
            <div 
              ref={canvasRef}
              onClick={handleCanvasClick}
              onContextMenu={(e) => e.preventDefault()}
              className="relative bg-[#e8f5e9] rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-[12px] border-white overflow-hidden cursor-crosshair transition-all duration-700 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)]"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{
                  backgroundImage: `linear-gradient(to right, #065f46 1.5px, transparent 1.5px), linear-gradient(to bottom, #065f46 1.5px, transparent 1.5px)`,
                  backgroundSize: `${100 / (100 / GRID_INTERVAL)}% ${100 / (100 / GRID_INTERVAL)}%`
                }}
              />

              {items.map((item) => {
                const config = TOOLS.find(t => t.id === item.type)!;
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => removeItem(item.id, e)}
                    onContextMenu={(e) => { e.preventDefault(); removeItem(item.id, e); }}
                    className={`
                      absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer
                      transition-all duration-300 hover:scale-150 group/item
                      p-2 rounded-full ${config.bg} ${config.color} shadow-lg ring-2 ring-white
                      flex items-center justify-center animate-in zoom-in-50 duration-300
                    `}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  >
                    <Icon size={20} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                      {config.label}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute -bottom-10 left-4 right-4 flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">
              <span>Start (0m)</span>
              <div className="h-px bg-stone-200 flex-1 mx-8 self-center" />
              <span>1 Hectare (100m)</span>
            </div>
          </div>
        </section>

        {/* Overlay Panels */}
        {showStats && (
          <div className="absolute top-6 right-6 w-64 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-stone-100 p-6 animate-in fade-in slide-in-from-right-4 duration-300 z-30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">土地の統計</h3>
              <button onClick={() => setShowStats(false)} className="text-stone-400 hover:text-stone-600"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase mb-1">
                  <span>推定活用面積</span>
                  <span>{stats.percent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS.filter(t => t.id !== 'eraser').map(tool => (
                  <div key={tool.id} className="p-2 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-400 mb-0.5">{tool.label}</div>
                    <div className="font-bold text-sm">{stats.counts[tool.id] || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showGuide && (
          <div className="absolute bottom-6 right-6 w-80 bg-stone-900 text-stone-100 rounded-[2rem] shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 z-30 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400" size={18} />
                <h3 className="font-bold text-sm">原則ガイド分析</h3>
              </div>
              <button onClick={() => setShowGuide(false)} className="text-stone-500 hover:text-stone-300"><X size={16} /></button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                {analysis.scores.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-stone-400">{s.label}</span>
                    <span className={s.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}>
                      {s.status === 'good' ? '適合' : '要改善'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="h-px bg-white/10" />
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">AI フィードバック</h4>
                {analysis.tips.length > 0 ? (
                  analysis.tips.map((tip, i) => (
                    <div key={i} className="text-xs leading-relaxed text-stone-300 flex gap-2">
                      <span className="text-amber-500 shrink-0">•</span>
                      <p>{tip}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-400 italic">素晴らしい！基本原則に沿った調和のとれた設計です。この土地は一族にとっての聖域となるでしょう。</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes zoom-in-50 {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-in { animation-fill-mode: forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

