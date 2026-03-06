import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

function Vendas() {
  // 1. ESTADOS (Dados e Formulário)
  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [produtos, setProdutos] = useState([])
  
  const [clienteId, setClienteId] = useState('')
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [desconto, setDesconto] = useState(0)
  const [total, setTotal] = useState(0)
  const [estoqueDisponivel, setEstoqueDisponivel] = useState(0)
  const [loading, setLoading] = useState(true)

  // 2. CARREGAR DADOS DO SUPABASE
  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const [resVendas, resClientes, resProdutos] = await Promise.all([
        supabase.from('vendas').select('*, clientes(nome), produtos(nome)').order('id', { ascending: false }),
        supabase.from('clientes').select('id, nome').order('nome'),
        supabase.from('produtos').select('id, nome, preco, estoque').order('nome')
      ])
      
      setVendas(resVendas.data || [])
      setClientes(resClientes.data || [])
      setProdutos(resProdutos.data || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { 
    carregarDados() 
  }, [carregarDados])

  // 3. LÓGICA DE CÁLCULO E VALIDAÇÃO EM TEMPO REAL
  useEffect(() => {
    const produtoSelecionado = produtos.find(p => p.id === parseInt(produtoId))
    if (produtoSelecionado) {
      setEstoqueDisponivel(produtoSelecionado.estoque)
      const valorBruto = produtoSelecionado.preco * (parseInt(quantidade) || 0)
      const valorComDesconto = valorBruto - parseFloat(desconto || 0)
      setTotal(valorComDesconto > 0 ? valorComDesconto : 0)
    } else {
      setEstoqueDisponivel(0)
      setTotal(0)
    }
  }, [produtoId, quantidade, desconto, produtos])

  // 4. REGISTRAR VENDA
  async function registrarVenda(e) {
    e.preventDefault()
    
    // Validação extra antes de enviar
    if (!clienteId || !produtoId) {
      alert('Selecione o Cliente e o Produto!')
      return
    }

    if (parseInt(quantidade) > estoqueDisponivel) {
      alert(`Venda cancelada: O estoque atual é de apenas ${estoqueDisponivel} unidades.`)
      return
    }

    try {
      const { error } = await supabase.from('vendas').insert([
        { 
          cliente_id: clienteId, 
          produto_id: parseInt(produtoId),
          quantidade: parseInt(quantidade),
          desconto: parseFloat(desconto || 0),
          total: total 
        }
      ])

      if (error) throw error
      
      // Limpeza do formulário e atualização
      setClienteId('')
      setProdutoId('')
      setQuantidade(1)
      setDesconto(0)
      carregarDados() 
      alert('Venda realizada com sucesso!')
    } catch (error) {
      alert('Erro ao registrar venda: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Venda */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Painel de Vendas</h3>
        <form onSubmit={registrarVenda} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Cliente</label>
            <select 
              className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              value={clienteId} 
              onChange={e => setClienteId(e.target.value)}
            >
              <option value="">Selecionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Produto</label>
            <select 
              className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              value={produtoId} 
              onChange={e => setProdutoId(e.target.value)}
            >
              <option value="">Selecionar...</option>
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Qtd (Max: {estoqueDisponivel})
            </label>
            <input 
              type="number" 
              className={`p-3 border rounded-lg outline-none ${quantidade > estoqueDisponivel ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50'}`}
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
              min="1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Desconto (R$)</label>
            <input 
              type="number" 
              className="p-3 border rounded-lg bg-red-50 text-red-600 font-bold outline-none" 
              value={desconto} 
              onChange={e => setDesconto(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Total Final</label>
            <div className="p-3 border rounded-lg bg-blue-600 text-white font-extrabold text-center">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={quantidade > estoqueDisponivel || total <= 0}
            className={`font-bold rounded-lg transition-all h-[50px] mt-auto ${
              (quantidade > estoqueDisponivel || total <= 0) 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
            }`}
          >
            CONFIRMAR
          </button>
        </form>
        
        {quantidade > estoqueDisponivel && (
          <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">
            ⚠️ Atenção: Quantidade acima do estoque disponível ({estoqueDisponivel} un).
          </p>
        )}
      </div>

      {/* Histórico de Vendas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-4">Cliente</th>
              <th className="p-4">Produto</th>
              <th className="p-4 text-center">Qtd</th>
              <th className="p-4 text-right">Desconto</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">Atualizando vendas...</td></tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 uppercase">{v.clientes?.nome}</td>
                  <td className="p-4 text-slate-600 text-sm uppercase">{v.produtos?.nome}</td>
                  <td className="p-4 text-center text-slate-600">{v.quantidade} un</td>
                  <td className="p-4 text-right text-red-500">- R$ {v.desconto?.toFixed(2)}</td>
                  <td className="p-4 text-right font-extrabold text-green-600">
                    R$ {v.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

export default Vendas