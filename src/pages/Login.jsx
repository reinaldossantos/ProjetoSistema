import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email, 
        password: password 
      })
      if (error) throw error
    } catch (error) {
      alert('Erro ao entrar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-8 border-blue-600">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">SENAI</h2>
          <p className="text-gray-500 text-sm">Acesse o sistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="E-mail" required
            className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Senha" required
            className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-all"
          >
            {loading ? 'CARREGANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
}