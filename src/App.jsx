import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Dashboard from './Pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Verifica a sessão atual assim que o app carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuta mudanças na autenticação (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Se não houver sessão, mostra o Login. Se houver, mostra o Dashboard.
  return (
    <div className="min-h-screen">
      {!session ? <Login /> : <Dashboard  />}
    </div>
  )
}

export default App