// import { useEffect, useState } from 'react'
// import { supabase } from '../supabaseClient'

// export default function Clientes() {
//   const [clientes, setClientes] = useState([])
//   const [nome, setNome] = useState('')
//   const [loading, setLoading] = useState(true)

//   // Busca os clientes no banco de dados ao carregar a página
//   useEffect(() => {
//     buscarClientes()
//   }, [])

//   async function buscarClientes() {
//     setLoading(true)
//     try {
//       const { data, error } = await supabase
//         .from('clientes')
//         .select('*')
//         .order('id', { ascending: false })

//       if (error) throw error
//       setClientes(data || [])
//     } catch (error) {
//       console.error('Erro ao carregar clientes:', error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function adicionarCliente(e) {
//     e.preventDefault()
//     if (!nome.trim()) return

//     try {
//       const { error } = await supabase
//         .from('clientes')
//         .insert([{ nome: nome.trim() }])

//       if (error) throw error
      
//       setNome('')
//       buscarClientes() // Atualiza a lista automaticamente após inserir
//     } catch (error) {
//       alert('Erro ao salvar: ' + error.message)
//     }
//   }

//   return (
//     <div className="space-y-6 animate-fadeIn">
//       {/* Bloco de Cadastro */}
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">
//           Cadastrar Novo Cliente
//         </h3>
//         <form onSubmit={adicionarCliente} className="flex gap-3">
//           <input
//             type="text"
//             placeholder="Nome Completo"
//             className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all"
//             value={nome}
//             onChange={(e) => setNome(e.target.value)}
//           />
//           <button 
//             type="submit"
//             className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
//           >
//             SALVAR
//           </button>
//         </form>
//       </div>

//       {/* Tabela de Dados */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <table className="w-full text-left border-collapse">
//           <thead className="bg-slate-50 border-b border-gray-200">
//             <tr>
//               <th className="p-4 font-bold text-slate-600 text-sm uppercase">ID</th>
//               <th className="p-4 font-bold text-slate-600 text-sm uppercase">Nome do Cliente</th>
//               <th className="p-4 font-bold text-slate-600 text-sm uppercase">Data de Registro</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="3" className="p-12 text-center">
//                   <div className="flex flex-col items-center gap-2">
//                     <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                     <span className="text-gray-400 font-medium">Buscando informações...</span>
//                   </div>
//                 </td>
//               </tr>
//             ) : clientes.length === 0 ? (
//               <tr>
//                 <td colSpan="3" className="p-12 text-center text-gray-400">
//                   Nenhum registro encontrado no banco de dados.
//                 </td>
//               </tr>
//             ) : (
//               clientes.map((c) => (
//                 <tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
//                   <td className="p-4 text-gray-400 font-mono text-xs">#{c.id}</td>
//                   <td className="p-4 font-bold text-slate-700">{c.nome}</td>
//                   <td className="p-4 text-gray-500 text-sm">
//                     {new Date(c.created_at).toLocaleDateString('pt-BR')}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

/*--------------------------------------------------------------------*/

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarClientes()
  }, [])

  async function buscarClientes() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function adicionarCliente(e) {
    e.preventDefault()
    if (!nome.trim()) return

    try {
      const { error } = await supabase
        .from('clientes')
        .insert([{ nome: nome.trim(), documento: documento.trim() }])

      if (error) throw error
      
      setNome('')
      setDocumento('')
      buscarClientes()
    } catch (error) {
      alert('Erro ao salvar: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase tracking-wider">Novo Cadastro</h3>
        <form onSubmit={adicionarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nome do Cliente"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="text"
            placeholder="CPF / CNPJ"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all">
            SALVAR
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-bold text-slate-600 text-sm">ID</th>
              <th className="p-4 font-bold text-slate-600 text-sm">NOME</th>
              <th className="p-4 font-bold text-slate-600 text-sm">DOCUMENTO</th>
              <th className="p-4 font-bold text-slate-600 text-sm">DATA</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400 animate-pulse">Carregando...</td></tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-400 text-xs font-mono">#{c.id}</td>
                  <td className="p-4 font-bold text-slate-700">{c.nome}</td>
                  <td className="p-4 text-slate-600">{c.documento || '---'}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '---'}
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