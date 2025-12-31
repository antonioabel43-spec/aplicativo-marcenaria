
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Plus, 
  Trash2, 
  Settings, 
  Package,
  Home,
  User,
  Layers,
  // Fix: Tool does not exist in lucide-react, using Wrench instead
  Wrench,
  PlusSquare,
  Printer,
  FileText,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { BudgetSettings, FurnitureItem, ExtraItem, ClientData } from './types';

// Inicialização segura para evitar erro de "process is not defined" em celulares
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const initialSettings: BudgetSettings = {
  mdfWhitePrice: 210,
  mdfColorPrice: 295,
  edge22Price: 1.6,
  edge35Price: 3.2,
  back3Price: 88,
  back6Price: 115,
  hingePrice: 9.5,
  slidePrice: 48,
  slidingKitPrice: 195,
  casterPrice: 18,
  rodPrice: 42,
  laborPercentage: 40,
  profitMargin: 30
};

const initialClient: ClientData = {
  name: '',
  phone: '',
  address: '',
  date: new Date().toLocaleDateString('pt-BR'),
  projectTitle: ''
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'prices' | 'project' | 'extras'>('project');
  const [settings, setSettings] = useState<BudgetSettings>(() => {
    const saved = localStorage.getItem('is_settings_v4');
    return saved ? JSON.parse(saved) : initialSettings;
  });
  
  const [client, setClient] = useState<ClientData>(() => {
    const saved = localStorage.getItem('is_client_v4');
    return saved ? JSON.parse(saved) : initialClient;
  });

  const [items, setItems] = useState<FurnitureItem[]>(() => {
    const saved = localStorage.getItem('is_items_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [extras, setExtras] = useState<ExtraItem[]>(() => {
    const saved = localStorage.getItem('is_extras_v4');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar automaticamente no navegador
  useEffect(() => {
    localStorage.setItem('is_settings_v4', JSON.stringify(settings));
    localStorage.setItem('is_items_v4', JSON.stringify(items));
    localStorage.setItem('is_extras_v4', JSON.stringify(extras));
    localStorage.setItem('is_client_v4', JSON.stringify(client));
  }, [settings, items, extras, client]);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      mdfType: 'white',
      mdfSheets: 0,
      edgeType: '22mm',
      edgeMeters: 0,
      backType: '3mm',
      backSheets: 0,
      hinges: 0,
      slides: 0
    }]);
  };

  const addExtra = () => {
    setExtras([...extras, {
      id: Date.now().toString(),
      description: '',
      price: 0,
      quantity: 1
    }]);
  };

  const updateItem = (id: string, field: keyof FurnitureItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totals = useMemo(() => {
    let materialCost = 0;
    
    items.forEach(item => {
      const mdfCost = item.mdfSheets * (item.mdfType === 'white' ? settings.mdfWhitePrice : settings.mdfColorPrice);
      const edgeCost = item.edgeMeters * (item.edgeType === '22mm' ? settings.edge22Price : settings.edge35Price);
      const backCost = item.backSheets * (item.backType === '3mm' ? settings.back3Price : (item.backType === '6mm' ? settings.back6Price : 0));
      const hardwareCost = (item.hinges * settings.hingePrice) + (item.slides * settings.slidePrice);
      
      materialCost += (mdfCost + edgeCost + backCost + hardwareCost) * item.quantity;
    });

    const extrasTotal = extras.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const laborValue = materialCost * (settings.laborPercentage / 100);
    const subtotal = materialCost + laborValue;
    const profitValue = subtotal * (settings.profitMargin / 100);
    const finalTotal = subtotal + profitValue + extrasTotal;

    return { materialCost, laborValue, profitValue, extrasTotal, finalTotal };
  }, [items, extras, settings]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#041c32] text-gray-100 font-sans pb-40">
      {/* NAVEGAÇÃO SUPERIOR - Oculta ao imprimir */}
      <header className="bg-[#062642] border-b border-[#be841c]/30 p-4 md:p-6 no-print sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Home size={32} className="text-[#be841c]" />
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-black text-white uppercase tracking-tight">Irmãos Silva <span className="text-[#be841c]">Planejados</span></h1>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-[#041c32] p-1 rounded-2xl overflow-x-auto w-full">
            {[
              { id: 'client', label: 'Dados Cliente', icon: User },
              { id: 'prices', label: 'Preços Materiais', icon: Settings },
              { id: 'project', label: 'Módulos/Móveis', icon: Package },
              { id: 'extras', label: 'Itens Extras', icon: PlusSquare },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#be841c] text-[#041c32]' : 'text-gray-400 hover:text-white'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 no-print">
        {/* ABA DADOS DO CLIENTE */}
        {activeTab === 'client' && (
          <div className="bg-[#062642] p-8 rounded-[2rem] border border-[#be841c]/20 shadow-2xl animate-in fade-in duration-300">
            <h2 className="text-[#be841c] font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-3">
              <User size={20} /> Identificação do Orçamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-2">Título do Orçamento</label>
                <input type="text" value={client.projectTitle} onChange={e => setClient({...client, projectTitle: e.target.value})} className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-2xl p-4 text-white outline-none focus:border-[#be841c]" placeholder="Ex: Cozinha e Área de Serviço" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-2">Nome do Cliente</label>
                <input type="text" value={client.name} onChange={e => setClient({...client, name: e.target.value})} className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-2xl p-4 text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-2">Telefone</label>
                <input type="text" value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-2xl p-4 text-white outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest ml-2">Endereço da Obra</label>
                <input type="text" value={client.address} onChange={e => setClient({...client, address: e.target.value})} className="w-full bg-[#041c32] border border-[#be841c]/20 rounded-2xl p-4 text-white outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* ABA TABELA DE PREÇOS MATERIAIS */}
        {activeTab === 'prices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="bg-[#062642] p-6 rounded-[2rem] border border-[#be841c]/20">
              <h3 className="text-[#be841c] font-black text-[10px] uppercase mb-6 flex items-center gap-2 tracking-widest"><Layers size={16}/> MDF e Fundo</h3>
              <div className="space-y-4">
                {[
                  { label: 'MDF Branco TX (Chapa)', key: 'mdfWhitePrice' },
                  { label: 'MDF Cores/Amadeirado (Chapa)', key: 'mdfColorPrice' },
                  { label: 'Fundo 3mm (Chapa)', key: 'back3Price' },
                  { label: 'Fundo 6mm (Chapa)', key: 'back6Price' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[8px] text-gray-500 uppercase block mb-1 font-black">{f.label}</label>
                    <input type="number" value={(settings as any)[f.key]} onChange={e => setSettings({...settings, [f.key]: Number(e.target.value)})} className="w-full bg-[#041c32] border border-[#be841c]/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#062642] p-6 rounded-[2rem] border border-[#be841c]/20">
              {/* Fix: Replaced non-existent Tool icon with Wrench */}
              <h3 className="text-[#be841c] font-black text-[10px] uppercase mb-6 flex items-center gap-2 tracking-widest"><Wrench size={16}/> Ferragens e Acessórios</h3>
              <div className="space-y-4">
                {[
                  { label: 'Dobradiça (Par)', key: 'hingePrice' },
                  { label: 'Corrediça (Par)', key: 'slidePrice' },
                  { label: 'Kit Porta Correr', key: 'slidingKitPrice' },
                  { label: 'Rodízio (Unid)', key: 'casterPrice' },
                  { label: 'Cabideiro (Metro)', key: 'rodPrice' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[8px] text-gray-500 uppercase block mb-1 font-black">{f.label}</label>
                    <input type="number" value={(settings as any)[f.key]} onChange={e => setSettings({...settings, [f.key]: Number(e.target.value)})} className="w-full bg-[#041c32] border border-[#be841c]/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#062642] p-6 rounded-[2rem] border border-[#be841c]/20">
              <h3 className="text-[#be841c] font-black text-[10px] uppercase mb-6 flex items-center gap-2 tracking-widest"><Settings size={16}/> Fitas e Lucros</h3>
              <div className="space-y-4">
                {[
                  { label: 'Fita de Borda 22mm (Metro)', key: 'edge22Price' },
                  { label: 'Fita de Borda 35mm (Metro)', key: 'edge35Price' },
                  { label: 'Mão de Obra (%)', key: 'laborPercentage' },
                  { label: 'Margem de Lucro (%)', key: 'profitMargin' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[8px] text-gray-500 uppercase block mb-1 font-black">{f.label}</label>
                    <input type="number" value={(settings as any)[f.key]} onChange={e => setSettings({...settings, [f.key]: Number(e.target.value)})} className="w-full bg-[#041c32] border border-[#be841c]/10 rounded-xl p-3 text-sm text-white outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA MÓDULOS DO PROJETO */}
        {activeTab === 'project' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#062642] rounded-[2rem] border border-[#be841c]/10 overflow-hidden shadow-2xl">
              <div className="p-6 bg-[#082d4f]/50 flex justify-between items-center border-b border-[#be841c]/10">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#be841c]">Listagem de Móveis</h2>
                <button onClick={addItem} className="bg-[#be841c] text-[#041c32] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16} /> Adicionar Móvel</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#041c32] text-[#be841c]">
                    <tr className="uppercase font-black tracking-widest border-b border-[#be841c]/10">
                      <th className="p-5">Ambiente/Móvel</th>
                      <th className="p-5">MDF Chapa</th>
                      <th className="p-5">Fita Metro</th>
                      <th className="p-5">Ferragens</th>
                      <th className="p-5">Fundo</th>
                      <th className="p-5">Qtd</th>
                      <th className="p-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#be841c]/5">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-5">
                          <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="bg-transparent border-none focus:ring-0 text-white w-full font-bold" placeholder="Ex: Armário Cozinha" />
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <select value={item.mdfType} onChange={e => updateItem(item.id, 'mdfType', e.target.value)} className="bg-[#041c32] border-none text-[9px] p-1 rounded-lg text-[#be841c] font-black">
                              <option value="white">BRANCO TX</option>
                              <option value="color">COR/AMAD</option>
                            </select>
                            <input type="number" step="0.1" value={item.mdfSheets} onChange={e => updateItem(item.id, 'mdfSheets', Number(e.target.value))} className="bg-[#041c32] border border-[#be841c]/10 rounded-lg p-1.5 w-full text-center" />
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <select value={item.edgeType} onChange={e => updateItem(item.id, 'edgeType', e.target.value)} className="bg-[#041c32] border-none text-[9px] p-1 rounded-lg">
                              <option value="22mm">22mm</option>
                              <option value="35mm">35mm</option>
                            </select>
                            <input type="number" value={item.edgeMeters} onChange={e => updateItem(item.id, 'edgeMeters', Number(e.target.value))} className="bg-[#041c32] border border-[#be841c]/10 rounded-lg p-1.5 w-full text-center" />
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center justify-between gap-1 text-[8px] text-gray-500 font-bold">
                               DOBR: <input type="number" value={item.hinges} onChange={e => updateItem(item.id, 'hinges', Number(e.target.value))} className="bg-[#041c32] w-8 text-center rounded p-0.5" />
                             </div>
                             <div className="flex items-center justify-between gap-1 text-[8px] text-gray-500 font-bold">
                               CORR: <input type="number" value={item.slides} onChange={e => updateItem(item.id, 'slides', Number(e.target.value))} className="bg-[#041c32] w-8 text-center rounded p-0.5" />
                             </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            <select value={item.backType} onChange={e => updateItem(item.id, 'backType', e.target.value)} className="bg-[#041c32] border-none text-[9px] p-1 rounded-lg">
                              <option value="3mm">3mm</option>
                              <option value="6mm">6mm</option>
                            </select>
                            <input type="number" step="0.1" value={item.backSheets} onChange={e => updateItem(item.id, 'backSheets', Number(e.target.value))} className="bg-[#041c32] border border-[#be841c]/10 rounded-lg p-1.5 w-full text-center" />
                          </div>
                        </td>
                        <td className="p-5">
                          <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="bg-[#be841c] text-[#041c32] border-none rounded-lg p-2 w-10 text-center font-black" />
                        </td>
                        <td className="p-5">
                          <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-gray-600 hover:text-red-400"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA ITENS EXTRAS */}
        {activeTab === 'extras' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-[#062642] rounded-[2rem] border border-[#be841c]/10 overflow-hidden shadow-2xl">
              <div className="p-6 bg-[#082d4f]/50 flex justify-between items-center border-b border-[#be841c]/10">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#be841c]">Espelhos, Metalon, Estofados, etc.</h2>
                <button onClick={addExtra} className="bg-[#be841c] text-[#041c32] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all"><Plus size={16} /> Novo Extra</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extras.map(extra => (
                  <div key={extra.id} className="bg-[#041c32] p-4 rounded-2xl border border-[#be841c]/20 relative group shadow-lg">
                    <button onClick={() => setExtras(extras.filter(x => x.id !== extra.id))} className="absolute top-2 right-2 text-gray-700 hover:text-red-400"><Trash2 size={16} /></button>
                    <div className="space-y-3">
                      <input type="text" value={extra.description} onChange={e => setExtras(extras.map(x => x.id === extra.id ? {...x, description: e.target.value} : x))} className="bg-transparent border-none p-0 text-white font-black text-xs w-full outline-none" placeholder="Ex: Espelho Bronze 4mm" />
                      <div className="grid grid-cols-2 gap-2">
                         <div>
                          <label className="text-[8px] text-gray-500 uppercase block mb-1 font-bold">R$ Preço</label>
                          <input type="number" value={extra.price} onChange={e => setExtras(extras.map(x => x.id === extra.id ? {...x, price: Number(e.target.value)} : x))} className="bg-[#062642] border border-[#be841c]/10 rounded-lg p-2 w-full text-xs text-[#be841c] font-black" />
                         </div>
                         <div>
                          <label className="text-[8px] text-gray-500 uppercase block mb-1 font-bold">Qtd</label>
                          <input type="number" value={extra.quantity} onChange={e => setExtras(extras.map(x => x.id === extra.id ? {...x, quantity: Number(e.target.value)} : x))} className="bg-[#062642] border border-[#be841c]/10 rounded-lg p-2 w-full text-xs text-white" />
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER FIXO COM RESUMO TOTAL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#062642] border-t-4 border-[#be841c] p-4 md:p-6 no-print shadow-[0_-10px_40px_rgba(0,0,0,0.6)] z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 md:gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             <div className="min-w-fit">
              <span className="text-[8px] text-[#be841c] block uppercase font-black tracking-widest mb-1">Materiais</span>
              <p className="font-black text-white text-xs md:text-sm">R$ {totals.materialCost.toLocaleString('pt-BR')}</p>
             </div>
             <div className="min-w-fit">
              <span className="text-[8px] text-[#be841c] block uppercase font-black tracking-widest mb-1">Mão de Obra</span>
              <p className="font-black text-white text-xs md:text-sm">R$ {totals.laborValue.toLocaleString('pt-BR')}</p>
             </div>
             <div className="min-w-fit">
              <span className="text-[8px] text-[#be841c] block uppercase font-black tracking-widest mb-1">Extras</span>
              <p className="font-black text-white text-xs md:text-sm">R$ {totals.extrasTotal.toLocaleString('pt-BR')}</p>
             </div>
             <div className="min-w-fit">
              <span className="text-[8px] text-[#be841c] block uppercase font-black tracking-widest mb-1">Valor Total</span>
              <p className="text-lg md:text-2xl font-black text-[#be841c]">R$ {totals.finalTotal.toLocaleString('pt-BR')}</p>
             </div>
          </div>
          <button onClick={handlePrint} className="w-full md:w-auto bg-[#be841c] text-[#041c32] px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl active:scale-95 group">
            <Printer size={20} className="group-hover:rotate-12 transition-transform" /> Gerar Orçamento
          </button>
        </div>
      </footer>

      {/* ÁREA DE IMPRESSÃO (ESTILO PAPEL TIMBRADO) */}
      <div className="hidden print-block p-10 bg-white text-black min-h-screen font-serif">
        <div className="border-[8px] border-double border-gray-200 p-8">
          {/* Cabeçalho Proposta */}
          <div className="flex justify-between items-center border-b-4 border-gray-900 pb-8 mb-8">
            <div className="flex items-center gap-4">
              <Home size={60} className="text-gray-900" />
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Irmãos Silva</h1>
                <h2 className="text-xl text-gray-600 uppercase tracking-widest font-light">Móveis Planejados</h2>
              </div>
            </div>
            <div className="text-right text-[10px] uppercase font-bold leading-relaxed">
              <p>Móveis sob medida e alto padrão</p>
              <p>WhatsApp: (00) 00000-0000</p>
              <p>Data: {client.date}</p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-black uppercase border-b border-gray-300 mb-4 pb-1 tracking-widest">Proposta para Cliente</h3>
            <div className="grid grid-cols-2 gap-y-4 text-[12px]">
              <p><span className="font-black uppercase">Projeto:</span> {client.projectTitle || 'ORÇAMENTO DE MARCENARIA'}</p>
              <p><span className="font-black uppercase">Cliente:</span> {client.name || 'NÃO INFORMADO'}</p>
              <p><span className="font-black uppercase">Telefone:</span> {client.phone || '-'}</p>
              <p><span className="font-black uppercase">Local:</span> {client.address || '-'}</p>
            </div>
          </div>

          {/* Tabela de Itens (Módulos) */}
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase bg-gray-900 text-white px-4 py-2 mb-4 tracking-widest">Descrição Técnica dos Módulos</h3>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900 text-left uppercase">
                  <th className="py-2">Item/Ambiente</th>
                  <th className="py-2">Especificação de Material</th>
                  <th className="py-2 text-center">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="py-4 font-black uppercase">{item.description}</td>
                    <td className="py-4 italic">
                      MDF {item.mdfType === 'white' ? 'BRANCO TX' : 'COR/AMADEIRADO'} | 
                      Fundo {item.backType} | 
                      {item.hinges} Dobr. | {item.slides} Corr.
                    </td>
                    <td className="py-4 text-center font-black">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras */}
          {extras.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xs font-black uppercase bg-gray-100 px-4 py-2 mb-4 tracking-widest">Itens Complementares (Vidros/Outros)</h3>
              <table className="w-full text-[11px]">
                <tbody className="divide-y divide-gray-100">
                  {extras.map(extra => (
                    <tr key={extra.id}>
                      <td className="py-2 font-black uppercase">{extra.description}</td>
                      <td className="py-2 text-right">{extra.quantity} Unid.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo Final e Assinaturas */}
          <div className="mt-16 pt-8 border-t-2 border-gray-900">
            <div className="flex justify-between items-end">
              <div className="text-[8px] text-gray-500 max-w-sm uppercase leading-relaxed font-bold italic">
                <p>* Proposta válida por 10 dias.</p>
                <p>* Prazos de entrega contados após medição técnica final.</p>
                <p>* Granitos, cubas e eletros não inclusos.</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Total do Investimento</p>
                 <p className="text-4xl font-black border-b-4 border-gray-900 pb-2">R$ {totals.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="mt-24 flex justify-between gap-16">
            <div className="flex-1 border-t border-gray-400 pt-2 text-center text-[9px] uppercase font-bold">
              Responsável (Irmãos Silva Planejados)
            </div>
            <div className="flex-1 border-t border-gray-400 pt-2 text-center text-[9px] uppercase font-bold">
              Aceite do Cliente ({client.name || 'Assinatura'})
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Inter:wght@300;400;700;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        h1, h2 { font-family: 'Playfair Display', serif; }

        @media print {
          .no-print { display: none !important; }
          .print-block { display: block !important; }
          body { background: white !important; padding: 0 !important; }
          @page { margin: 1cm; size: A4; }
        }

        .animate-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
