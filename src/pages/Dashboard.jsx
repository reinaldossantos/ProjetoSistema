import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Clientes from './Clientes'
import Vendas from './Vendas' // Importação do componente que você criou

export default function Dashboard({ session }) {
  const [abaAtiva, setAbaAtiva] = useState('clientes')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-slate-900">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-xl font-extrabold border-b border-slate-800 tracking-tighter text-blue-400">
          SISTEMA <span className="text-white font-light text-xs block tracking-normal uppercase">Gestão Administrativa</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setAbaAtiva('clientes')}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
              abaAtiva === 'clientes' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">👥</span> Clientes
          </button>
          
          <button 
            onClick={() => setAbaAtiva('vendas')}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
              abaAtiva === 'vendas' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">💰</span> Vendas
          </button>

          <button 
            onClick={() => setAbaAtiva('financeiro')}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
              abaAtiva === 'financeiro' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <span className="text-lg">📊</span> Financeiro
          </button>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="mb-3 px-2">
            <p className="text-[10px] uppercase text-slate-500 font-bold">Usuário Atual</p>
            <p className="text-xs text-blue-300 truncate font-medium">{session?.user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-500 p-2.5 rounded-lg border border-red-500/20 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-xs uppercase"
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Dinâmico */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-5 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
            Painel / {abaAtiva}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-gray-500 uppercase">Sistema Online</span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Lógica de troca de abas */}
          {abaAtiva === 'clientes' && <Clientes />}
          
          {abaAtiva === 'vendas' && <Vendas />}

          {abaAtiva === 'financeiro' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-5xl mb-4">📈</span>
              <p className="text-lg font-medium">Módulo Financeiro em desenvolvimento...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}