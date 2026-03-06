import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// Importações - Verifique se os nomes dos arquivos na pasta 'pages' são estes mesmos
import Clientes from './Clientes'
import Vendas from './Vendas'
import Produtos from './Produtos'
import Financeiro from './Financeiro'

export default function Dashboard({ session }) {
  const [abaAtiva, setAbaAtiva] = useState('clientes')
  const [perfil, setPerfil] = useState({ nome: 'Reinaldo', nivel_acesso: 'admin' }) // Valor inicial para teste
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function buscarPerfil() {
      try {
        setLoading(true)
        if (!session?.user?.id) return

        // Busca no banco exatamente na tabela 'perfis' que você mostrou
        const { data, error } = await supabase
          .from('perfis')
          .select('nome, nivel_acesso')
          .eq('id', session.user.id)
          .single()

        if (data) {
          setPerfil(data)
        } else {
          // SE O BANCO FALHAR: Se o e-mail for o seu, o sistema te dá acesso admin na marra
          if (session.user.email === 'reinaldo@teste.com') {
            setPerfil({ nome: 'Reinaldo', nivel_acesso: 'admin' })
          }
        }
      } catch (err) {
        console.error("Erro na busca:", err)
      } finally {
        setLoading(false)
      }
    }
    buscarPerfil()
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Verifica se é admin (Pelo banco ou pelo seu e-mail de teste)
  const eAdmin = perfil?.nivel_acesso === 'admin' || session?.user?.email === 'reinaldo@teste.com'

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar Lateral */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-black text-blue-400">SISTEMA</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Gestão Administrativa</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setAbaAtiva('clientes')} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'clientes' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            👥 Clientes
          </button>
          <button onClick={() => setAbaAtiva('vendas')} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'vendas' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
            💰 Vendas
          </button>

          {/* Menus que só aparecem para Admin */}
          {eAdmin && (
            <>
              <button onClick={() => setAbaAtiva('produtos')} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'produtos' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                📦 Stock / Produtos
              </button>
              <button onClick={() => setAbaAtiva('financeiro')} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all ${abaAtiva === 'financeiro' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                📊 Financeiro
              </button>
            </>
          )}
        </nav>

        {/* Rodapé com seu nome e cargo */}
        <div className="p-4 border-t border-slate-800 bg-black">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${eAdmin ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <p className="text-[10px] text-slate-500 uppercase font-bold">
              {eAdmin ? 'Administrador' : 'Operador'}
            </p>
          </div>
          <p className="text-white text-sm font-bold uppercase truncate">
            {loading ? 'Sincronizando...' : perfil?.nome}
          </p>
          <button onClick={handleLogout} className="w-full mt-4 bg-red-900/20 text-red-500 border border-red-900/50 p-2 rounded text-[10px] font-black hover:bg-red-600 hover:text-white transition-all">
            SAIR DO SISTEMA
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-sm font-black text-slate-700 uppercase">
            PAINEL / <span className="text-blue-600">{abaAtiva}</span>
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {abaAtiva === 'clientes' && <Clientes />}
          {abaAtiva === 'vendas' && <Vendas />}
          {abaAtiva === 'produtos' && eAdmin && <Produtos />}
          {abaAtiva === 'financeiro' && eAdmin && <Financeiro />}
        </main>
      </div>
    </div>
  )
}