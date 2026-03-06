import { useState } from 'react'
import { supabase } from '../supabaseClient'
import Clientes from './Clientes'
// Importe aqui futuramente: import Vendas from './Vendas'

export default function Dashboard({ session, userRole }) {
  const [abaAtiva, setAbaAtiva] = useState('clientes')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra Lateral (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
          AgroVida <span className="text-white text-sm block font-normal">Gestão Escolar</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setAbaAtiva('clientes')}
            className={`w-full text-left p-3 rounded transition ${abaAtiva === 'clientes' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            👥 Clientes
          </button>
          
          <button 
            onClick={() => setAbaAtiva('vendas')}
            className={`w-full text-left p-3 rounded transition ${abaAtiva === 'vendas' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            💰 Vendas
          </button>

          {/* Item visível apenas para Admin */}
          {userRole === 'admin' && (
            <button 
              onClick={() => setAbaAtiva('relatorios')}
              className={`w-full text-left p-3 rounded transition border-t border-slate-700 mt-4 ${abaAtiva === 'relatorios' ? 'bg-purple-600' : 'hover:bg-slate-800 text-purple-300'}`}
            >
              📊 Relatórios Admin
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2 truncate">{session.user.email}</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white transition"
          >
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Área de Conteúdo Dinâmico */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700 uppercase">
            {abaAtiva}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase">
            Perfil: {userRole}
          </span>
        </header>

        <section className="p-4">
          {abaAtiva === 'clientes' && <Clientes userRole={userRole} />}
          {abaAtiva === 'vendas' && (
            <div className="p-20 text-center text-gray-400">Tela de Vendas em desenvolvimento...</div>
          )}
          {abaAtiva === 'relatorios' && (
            <div className="p-20 text-center text-gray-400">Tela de Relatórios em desenvolvimento...</div>
          )}
        </section>
      </main>
    </div>
  )
}