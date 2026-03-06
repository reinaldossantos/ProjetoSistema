import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [nome, setNome] = useState('')
  const [estoque, setEstoque] = useState('')
  const [preco, setPreco] = useState('')
  const [loading, setLoading] = useState(true)

  const carregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setProdutos(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  async function salvarProduto(e) {
    e.preventDefault()
    if (!nome || !estoque) {
      alert('Nome e Estoque são obrigatórios.')
      return
    }

    try {
      const { error } = await supabase.from('produtos').insert([
        { 
          nome: nome.trim(), 
          estoque: parseInt(estoque), // Nome da coluna conforme seu banco
          preco: parseFloat(preco.replace(',', '.')) || 0 // Nome da coluna conforme seu banco
        }
      ])

      if (error) throw error
      
      setNome('')
      setEstoque('')
      setPreco('')
      carregarProdutos()
    } catch (error) {
      alert('Erro ao cadastrar: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Cadastro de Estoque</h3>
        <form onSubmit={salvarProduto} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Nome do Produto"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="number"
            placeholder="Qtd em Estoque"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
          />
          <input
            type="text"
            placeholder="Preço de Venda"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all">
            CADASTRAR
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Descrição do Item</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Qtd Física</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Preço Unitário</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Consultando estoque...</td></tr>
            ) : produtos.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Nenhum produto em estoque.</td></tr>
            ) : (
              produtos.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-slate-700 uppercase">{p.nome}</td>
                  <td className={`p-4 font-bold ${p.estoque < 10 ? 'text-red-600' : 'text-slate-600'}`}>
                    {p.estoque} UN
                  </td>
                  <td className="p-4 text-slate-600">
                    R$ {p.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}