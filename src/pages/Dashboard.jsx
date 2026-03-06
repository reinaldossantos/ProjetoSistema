import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Importação dos componentes
import Clientes from './Clientes'
import Vendas from './Vendas'
import Produtos from './Produtos'
import Financeiro from './Financeiro'

export default function Dashboard({ session }) {
  const [abaAtiva, setAbaAtiva] = useState('clientes')
  const [perfil, setPerfil] = useState({ nome: 'Carregando...', nivel_acesso: 'usuario' })

  // 1. Busca os dados extras (Nome e Nível) na tabela 'perfis'
  useEffect(() => {
    async function obterPerfil() {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('perfis')
          .select('nome, nivel_acesso')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setPerfil(data)
        } else {
          // Caso não encontre perfil, usa o e-mail como nome temporário
          setPerfil({ nome: session.user.email.split('@')[0], nivel_acesso: 'usuario' })
        }
      }
    }
    obterPerfil()
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // 2. Lógica de Restrição: Usuário simples só lança (Clientes e Vendas)
  // Administrador vê tudo (Produtos e Financeiro)
  const eAdmin = perfil.nivel_acesso === 'admin'

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col relative">
        <div className="p-6">
          <h1 className="text-xl font-black text-blue-400">SISTEMA</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Gestão Administrativa</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {/* Abas liberadas para todos */}
          <button onClick={() => setAbaAtiva('clientes')} className={`w-full text-left p-3 rounded-lg text-sm font-bold ${abaAtiva === 'clientes' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            👥 Clientes
          </button>
          <button onClick={() => setAbaAtiva('vendas')} className={`w-full text-left p-3 rounded-lg text-sm font-bold ${abaAtiva === 'vendas' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            💰 Vendas
          </button>

          {/* Abas restritas para ADM (Marcilene/Fabiana) */}
          {eAdmin && (
            <>
              <button onClick={() => setAbaAtiva('produtos')} className={`w-full text-left p-3 rounded-lg text-sm font-bold ${abaAtiva === 'produtos' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                📦 Stock / Produtos
              </button>
              <button onClick={() => setAbaAtiva('financeiro')} className={`w-full text-left p-3 rounded-lg text-sm font-bold ${abaAtiva === 'financeiro' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                📊 Financeiro
              </button>
            </>
          )}
        </nav>

        {/* Rodapé com Nome e Nível de Acesso */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${eAdmin ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <p className="text-[10px] text-slate-500 uppercase font-bold">
              {perfil.nivel_acesso === 'admin' ? 'Administrador' : 'Operador'}
            </p>
          </div>
          <p className="text-white text-sm font-bold truncate uppercase">
            {perfil.nome}
          </p>
          <button onClick={handleLogout} className="w-full mt-4 bg-red-900/20 text-red-500 border border-red-900/50 p-2 rounded text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">
            SAIR DO SISTEMA
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {abaAtiva === 'clientes' && <Clientes />}
          {abaAtiva === 'vendas' && <Vendas />}
          {abaAtiva === 'produtos' && eAdmin && <Produtos />}
          {abaAtiva === 'financeiro' && eAdmin && <Financeiro />}
          
          {/* Mensagem de bloqueio caso um usuário tente acessar via URL/Estado */}
          {!eAdmin && (abaAtiva === 'produtos' || abaAtiva === 'financeiro') && (
            <div className="bg-red-50 text-red-600 p-10 rounded-xl border border-red-200 text-center font-bold">
              🚫 Acesso Negado. Esta área é restrita à administração.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}