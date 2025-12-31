
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Plus, 
  Trash2, 
  Settings, 
  Wand2, 
  FileText, 
  Package,
  Home,
  Users,
  Copy,
  Check,
  X,
  Download,
  Smartphone
} from 'lucide-react';
import { BudgetSettings, FurnitureItem } from './types';

// Inicializa a IA com o modelo gratuito (Flash)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const initialSettings: BudgetSettings = {
  mdfSheetPrice: 280,
  edgeTapePricePerMeter: 1.5,
  laborPercentage: 40,
  profitMargin: 30
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<BudgetSettings>(() => {
    const saved = localStorage.getItem('irmaos_silva_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });
  
  const [items, setItems] = useState<FurnitureItem[]>(() => {
    const saved = localStorage.getItem('irmaos_silva_items');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        description: 'Móvel de Exemplo',
        quantity: 1,
        mdfSheetsNeeded: 1,
        hardwareCost: 50,
        edgeTapeMeters: 10,
        extraCosts: 0
      }
    ];
  });

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [importData, setImportData] = useState('');

  // Auto-save
  useEffect(() => {
    localStorage.setItem('irmaos_silva_settings', JSON.stringify(settings));
    localStorage.setItem('irmaos_silva_items', JSON.stringify(items));
  }, [settings, items]);

  const addItem = () => {
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      mdfSheetsNeeded: 0,
      hardwareCost: 0,
      edgeTapeMeters: 0,
      extraCosts: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (confirm("Remover este item do orçamento?")) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof FurnitureItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const exportAllData = () => {
    const data = JSON.stringify({ settings, items });
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      if (parsed.settings && parsed.items) {
        setSettings(parsed.settings);
        setItems(parsed.items);
        setShowSyncModal(false);
        setImportData('');
        alert("Dados carregados com sucesso!");
      }
    } catch (e) {
      alert("Código inválido.");
    }
  };

  const totals = useMemo(() => {
    let materialCost = 0;
    items.forEach(item => {
      const itemMdf = item.mdfSheetsNeeded * settings.mdfSheetPrice;
      const itemTape = item.edgeTapeMeters * settings.edgeTapePricePerMeter;
      const itemBaseCost = (itemMdf + itemTape + item.hardwareCost + item.extraCosts) * item.quantity;
      materialCost += itemBaseCost;
    });
    const laborCost = materialCost * (settings.laborPercentage / 100);
    const totalCost = materialCost + laborCost;
    const profit = totalCost * (settings.profitMargin / 100);
    const suggestedPrice = totalCost + profit;
    return { materialCost, laborCost, totalCost, suggestedPrice, profit };
  }, [items, settings]);

  const askAiEstimator = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Modelo que não exige Paid API Key no Veo
        contents: `Como consultor técnico da Irmãos Silva Planejados, estime os materiais necessários (chapas MDF, fita de borda, ferragens) para: "${aiInput}". Seja prático e profissional para marceneiros.`,
      });
      setAiResponse(response.text);
    } catch (error) {
      setAiResponse("O assistente está ocupado no momento. Tente novamente em breve.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041c32] text-gray-100 font-sans p-4 md:p-8 pb-32">
      {/* Header Profissional */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col items-center text-center gap-4 relative">
        <div className="absolute right-0 top-0 flex gap-2 no-print">
          <button 
            onClick={() => setShowSyncModal(true)}
            className="p-3 bg-[#0a2e4d] rounded-2xl border border-[#be841c]/30 text-[#be841c] hover:bg-[#be841c] hover:text-[#041c32] transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Smartphone size={20} />
            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Acessar no Celular</span>
          </button>
        </div>

        <div className="flex flex-col items-center mt-6">
          <div className="relative mb-3">
            <Home size={64} className="text-[#be841c]" />
            <div className="absolute -bottom-2 -right-2 bg-[#041c32] p-1">
               <Users size={32} className="text-[#be841c]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white uppercase">
            Irmãos Silva <span className="text-[#be841c]">Planejados</span>
          </h1>
          <p className="text-[#be841c]/70 text-sm tracking-[0.2em] uppercase font-light mt-1">Orçamentos e Materiais</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel de Custos */}
        <section className="lg:col-span-4 space-y-6 no-print">
          <div className="bg-[#062642] p-6 rounded-[2rem] border border-[#be841c]/20 shadow-2xl">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-[#be841c] uppercase tracking-widest">
              <Settings size={18} /> Tabela de Preços
            </h2>
            <div className="space-y-5">
              {[
                { label: 'Valor Chapa MDF (R$)', key: 'mdfSheetPrice' },
                { label: 'Fita de Borda (R$/m)', key: 'edgeTapePricePerMeter' },
                { label: 'Mão de Obra (%)', key: 'laborPercentage' },
                { label: 'Margem Lucro (%)', key: 'profitMargin' }
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-gray-400 block mb-1.5 uppercase tracking-widest font-semibold">{f.label}</label>
                  <input 
                    type="number" 
                    value={(settings as any)[f.key]}
                    onChange={(e) => setSettings({...settings, [f.key]: Number(e.target.value)})}
                    className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-xl px-4 py-4 focus:ring-1 focus:ring-[#be841c] outline-none text-white font-medium text-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#062642] p-6 rounded-[2rem] border border-[#be841c]/20 shadow-2xl">
            <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-[#be841c] uppercase tracking-widest">
              <Wand2 size={18} /> Consultor Silva (IA)
            </h2>
            <div className="space-y-4">
              <textarea 
                placeholder="Ex: Armário de quarto 2,5m com maleiro..."
                className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-xl px-4 py-4 text-base h-32 outline-none focus:ring-1 focus:ring-[#be841c] text-white resize-none"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button 
                onClick={askAiEstimator}
                disabled={aiLoading}
                className="w-full py-4 bg-[#be841c] text-[#041c32] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? "Consultando..." : "Estimar Materiais"}
              </button>
              {aiResponse && (
                <div className="mt-4 p-5 bg-[#041c32]/80 border border-[#be841c]/30 rounded-xl text-xs leading-relaxed text-gray-200 italic shadow-inner">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabela de Orçamento */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-[#062642] rounded-[2rem] border border-[#be841c]/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#be841c]/10 flex justify-between items-center bg-[#082d4f]/50">
              <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <Package size={22} className="text-[#be841c]" /> Itens do Projeto
              </h2>
              <button onClick={addItem} className="bg-[#be841c] hover:bg-[#d4af37] text-[#041c32] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2">
                <Plus size={18} /> Adicionar Módulo
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#041c32] text-[#be841c] text-[10px] uppercase tracking-[0.2em] border-b border-[#be841c]/10">
                    <th className="px-6 py-5 min-w-[180px]">Módulo</th>
                    <th className="px-6 py-5">Qtd</th>
                    <th className="px-6 py-5">Chapas</th>
                    <th className="px-6 py-5">Fita(m)</th>
                    <th className="px-6 py-5 text-right">Subtotal</th>
                    <th className="px-6 py-5 no-print w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#be841c]/5">
                  {items.map((item) => {
                    const subtotal = ((item.mdfSheetsNeeded * settings.mdfSheetPrice) + (item.edgeTapeMeters * settings.edgeTapePricePerMeter) + item.hardwareCost + item.extraCosts) * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-[#082d4f]/30 transition-colors">
                        <td className="px-6 py-5">
                          <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="bg-transparent border-none outline-none w-full text-base font-medium text-white" placeholder="Ex: Roupeiro..." />
                        </td>
                        <td className="px-6 py-5">
                          <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} className="bg-transparent border-none outline-none w-10 text-base text-gray-300 font-bold" />
                        </td>
                        <td className="px-6 py-5">
                          <input type="number" step="0.1" value={item.mdfSheetsNeeded} onChange={(e) => updateItem(item.id, 'mdfSheetsNeeded', Number(e.target.value))} className="bg-transparent border-none outline-none w-12 text-base text-gray-300" />
                        </td>
                        <td className="px-6 py-5">
                          <input type="number" value={item.edgeTapeMeters} onChange={(e) => updateItem(item.id, 'edgeTapeMeters', Number(e.target.value))} className="bg-transparent border-none outline-none w-12 text-base text-gray-300" />
                        </td>
                        <td className="px-6 py-5 text-right font-black text-white text-lg">
                          R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-5 no-print">
                          <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 p-2 transition-transform active:scale-90"><Trash2 size={20} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {items.length === 0 && <div className="p-12 text-center text-gray-600 italic">Nenhum item adicionado ao orçamento.</div>}
            </div>
          </div>

          {/* Totais do Orçamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#062642] p-5 rounded-3xl border border-[#be841c]/10 shadow-lg text-center">
              <span className="text-[9px] text-[#be841c] block uppercase tracking-widest font-bold mb-1">Total Materiais</span>
              <div className="text-xl font-bold text-white">R$ {totals.materialCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#062642] p-5 rounded-3xl border border-[#be841c]/10 shadow-lg text-center">
              <span className="text-[9px] text-[#be841c] block uppercase tracking-widest font-bold mb-1">Mão de Obra</span>
              <div className="text-xl font-bold text-white">R$ {totals.laborCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-[#062642] p-5 rounded-3xl border border-[#be841c]/10 shadow-lg text-center">
              <span className="text-[9px] text-[#be841c] block uppercase tracking-widest font-bold mb-1">Lucro Previsto</span>
              <div className="text-xl font-bold text-white">R$ {totals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-gradient-to-br from-[#be841c] to-[#d4af37] p-6 rounded-3xl shadow-2xl scale-105 border-2 border-white/10 text-center">
              <span className="text-[10px] text-[#041c32] block uppercase tracking-widest font-black mb-1">Total Sugerido</span>
              <div className="text-2xl font-black text-[#041c32]">R$ {totals.suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          <div className="flex justify-center no-print">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-4 bg-[#0a2e4d] border border-[#be841c]/40 text-[#be841c] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#be841c] hover:text-[#041c32] transition-all shadow-xl">
              <FileText size={18} /> Gerar PDF do Orçamento
            </button>
          </div>
        </section>
      </div>

      {/* Modal de Sincronização Mobile */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-[#041c32]/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[#062642] p-8 rounded-[3rem] border-2 border-[#be841c] max-w-lg w-full text-center relative shadow-[0_0_50px_rgba(190,132,28,0.2)]">
            <button onClick={() => setShowSyncModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-white"><X size={28} /></button>
            <Smartphone size={48} className="text-[#be841c] mx-auto mb-4" />
            <h3 className="text-[#be841c] font-serif text-3xl mb-6 uppercase tracking-tight">Sincronizar com Celular</h3>
            
            <div className="space-y-6">
              <div className="bg-[#041c32] p-6 rounded-3xl border border-[#be841c]/20">
                <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-bold">1. Abrir o App no Celular</p>
                <div className="bg-white p-4 rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.href)}&color=041c32`} className="w-32 h-32" alt="QR Code" />
                </div>
                <p className="text-[10px] text-gray-500 italic">Aponte a câmera para abrir o sistema no telefone.</p>
              </div>

              <div className="bg-[#041c32] p-6 rounded-3xl border border-[#be841c]/20 text-left">
                <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-bold text-center">2. Transferir Dados Digitados</p>
                <button onClick={exportAllData} className="w-full py-4 bg-[#be841c] text-[#041c32] rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-3 mb-4 transition-all active:scale-95 shadow-lg">
                  {copied ? <Check size={18} /> : <Download size={18} />}
                  {copied ? "Código de Dados Copiado!" : "Gerar Código de Sincronização"}
                </button>
                <textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Cole o código recebido aqui..." className="w-full bg-[#062642] border border-[#be841c]/20 rounded-xl p-4 text-[10px] h-20 mb-3 text-white font-mono outline-none focus:border-[#be841c]" />
                <button onClick={handleImport} className="w-full py-3 bg-transparent border-2 border-[#be841c] text-[#be841c] rounded-xl font-black text-[10px] uppercase hover:bg-[#be841c] hover:text-[#041c32] transition-all">Sincronizar Agora</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-[#be841c]/10 text-center text-gray-500 text-[10px] uppercase tracking-[0.4em] no-print">
        Irmãos Silva Planejados &copy; {new Date().getFullYear()} - Sistema de Gestão Interna
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;600;900&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        h1 { font-family: 'Playfair Display', serif; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .bg-[#062642], .bg-[#082d4f], .bg-[#041c32] { background: white !important; color: black !important; border: 1px solid #ddd !important; }
          .text-white, .text-[#be841c], .text-gray-100 { color: black !important; }
          .lg\\:col-span-8 { width: 100% !important; grid-column: span 12 / span 12 !important; }
          input { color: black !important; font-weight: bold !important; border: none !important; }
          table { border-collapse: collapse !important; width: 100% !important; }
          th, td { border-bottom: 1px solid #eee !important; padding: 10px !important; }
          .bg-gradient-to-br { background: #f3f4f6 !important; border: 2px solid black !important; }
        }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
