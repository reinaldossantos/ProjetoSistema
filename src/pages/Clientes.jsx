import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export default function Clientes({ userRole }) {
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState('')

  // 1. Usamos o useCallback para que a função seja memorizada e reconhecida pelo useEffect
  const fetchClientes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true })
      
      if (error) throw error
      if (data) setClientes(data)
    } catch (error) {
      console.error("Erro ao carregar lista:", error.message)
    }
  }, [])

  // 2. O useEffect agora chama a função memorizada sem erros de referência
  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  // 3. Função para adicionar cliente
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!nome.trim()) return

    try {
      const { error } = await supabase.from('clientes').insert([{ nome }])
      if (error) throw error
      
      setNome('')
      fetchClientes()
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message)
    }
  }

  // 4. Função para excluir (apenas se for admin)
  const handleDelete = async (id) => {
    if (userRole !== 'admin') {
      alert("Permissão negada: Apenas administradores podem excluir.")
      return
    }

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id)
      if (error) throw error
      fetchClientes()
    } catch (error) {
      alert("Erro ao excluir: " + error.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gerenciamento de Clientes</h2>
      
      {/* Formulário de Cadastro */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8 bg-white p-4 rounded-lg shadow-sm border">
        <input 
          className="flex-1 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Digite o nome do cliente..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-all"
        >
          Cadastrar
        </button>
      </form>

      {/* Lista de Clientes */}
      <div className="grid gap-3">
        {clientes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum cliente encontrado.</p>
        ) : (
          clientes.map(cliente => (
            <div 
              key={cliente.id} 
              className="flex justify-between items-center p-4 bg-white shadow-sm rounded-md border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-gray-700 font-medium">{cliente.nome}</span>
              
              {userRole === 'admin' && (
                <button 
                  onClick={() => handleDelete(cliente.id)}
                  className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors border border-red-200"
                >
                  Excluir
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}