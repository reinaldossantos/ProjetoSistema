import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([])
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('saida')
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0 })
  const [loading, setLoading] = useState(true)

  const carregarDadosFinanceiros = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Busca vendas (Entradas automáticas) e lançamentos manuais
      const [resVendas, resFinanceiro] = await Promise.all([
        supabase.from('vendas').select('total'),
        supabase.from('financeiro').select('*').order('data', { ascending: false })
      ])

      const vendasTotal = resVendas.data?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0
      const manualDados = resFinanceiro.data || []
      
      // 2. Calcula Saídas e Entradas manuais
      const entradasManuais = manualDados.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + Number(curr.valor), 0)
      const saidasTotal = manualDados.filter(f => f.tipo === 'saida').reduce((acc, curr) => acc + Number(curr.valor), 0)

      setLancamentos(manualDados)
      setResumo({
        entradas: vendasTotal + entradasManuais,
        saidas: saidasTotal,
        saldo: (vendasTotal + entradasManuais) - saidasTotal
      })
    } catch (error) {
      console.error('Erro ao processar finanças:', error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDadosFinanceiros()
  }, [carregarDadosFinanceiros])

  async function salvarLancamento(e) {
    e.preventDefault()
    if (!descricao || !valor) return alert('Preencha todos os campos')

    try {
      const { error } = await supabase.from('financeiro').insert([
        { 
          descricao: descricao.trim(), 
          valor: parseFloat(valor.replace(',', '.')), 
          tipo 
        }
      ])

      if (error) throw error
      setDescricao('')
      setValor('')
      carregarDadosFinanceiros()
    } catch (error) {
      alert('Erro ao salvar: ' + error.message)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Entradas</p>
          <p className="text-2xl font-black text-green-600">R$ {resumo.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Saídas</p>
          <p className="text-2xl font-black text-red-600">R$ {resumo.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Saldo em Caixa</p>
          <p className={`text-2xl font-black ${resumo.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            R$ {resumo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Formulário de Custos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Novo Lançamento Manual</h3>
        <form onSubmit={salvarLancamento} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Ex: Pagamento Energia"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            type="text"
            placeholder="Valor (0,00)"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <select 
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="saida">Saída (Custo/Despesa)</option>
            <option value="entrada">Entrada (Aporte/Extra)</option>
          </select>
          <button type="submit" className="bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-all">
            REGISTRAR
          </button>
        </form>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Descrição</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Valor</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">Calculando saldos...</td></tr>
            ) : lancamentos.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-slate-700">{l.descricao}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${l.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {l.tipo}
                  </span>
                </td>
                <td className={`p-4 font-bold ${l.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-gray-400 text-xs">
                  {new Date(l.data).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}