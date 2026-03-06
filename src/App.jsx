import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Dashboard from './pages/Dashboard'
import Login from './Pages/Login'


export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)

  // Definindo como constante ANTES do useEffect para garantir que o VS Code a reconheça
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (data) setRole(data.role)
      if (error) throw error
    } catch (error) {
      console.error("Erro ao buscar role:", error.message)
      setRole('comum') 
    }
  }

  useEffect(() => {
    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
    })

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchUserRole(session.user.id)
      else setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) return <Login />

  return <Dashboard session={session} userRole={role} />
}

