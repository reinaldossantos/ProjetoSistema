
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export default function Vendas() {
  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [total, setTotal] = useState('')
  const [loading, setLoading] = useState(true)

  const carregarDados = useCallback(async () => {
    setLoading(true)
    try {
      const [resVendas, resClientes] = await Promise.all([
        supabase
          .from('vendas')
          .select('*, clientes(nome)')
          .order('id', { ascending: false }),
        supabase
          .from('clientes')
          .select('id, nome')
          .order('nome', { ascending: true })
      ])

      if (resVendas.error) throw resVendas.error
      if (resClientes.error) throw resClientes.error

      setVendas(resVendas.data || [])
      setClientes(resClientes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  async function registrarVenda(e) {
    e.preventDefault()
    
    if (!clienteId || !total) {
      alert('Por favor, selecione um cliente e informe o valor total.')
      return
    }

    try {
      const valorNumerico = parseFloat(total.replace(',', '.'))

      const { error } = await supabase.from('vendas').insert([
        { 
          cliente_id: clienteId, 
          total: valorNumerico // Usando 'total' conforme sua imagem
        }
      ])

      if (error) throw error

      setClienteId('')
      setTotal('')
      carregarDados()
      
    } catch (error) {
      alert('Erro ao registrar venda: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">Lançar Operação</h3>
        <form onSubmit={registrarVenda} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Selecione o Cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Valor Total (Ex: 100,00)"
            className="p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />

          <button 
            type="submit" 
            className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all shadow-md"
          >
            CONFIRMAR VENDA
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Cliente</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Valor (Total)</th>
              <th className="p-4 font-bold text-slate-600 text-xs uppercase">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">Sincronizando...</td></tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 uppercase">{v.clientes?.nome}</td>
                  <td className="p-4 font-extrabold text-green-600">
                    R$ {v.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-gray-400 text-xs font-medium">
                    {v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '---'}
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

