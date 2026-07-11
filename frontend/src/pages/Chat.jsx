import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { askBrand } from '../api/client.js'
import './Chat.css'

const SUGGESTIONS = [
  'Quel positionnement recommandes-tu ?',
  'Résume les retours de la cible 25-34 ans',
  'Quels concurrents citent le plus les clients ?',
]

const mockAgent = (q) => ({
  text: `D'après la base documentaire, voici une synthèse pour « ${q} » : les retours clients penchent vers un positionnement clair et premium, avec un point de vigilance sur la clarté du message. Je recommande de consolider la preuve sociale avant toute campagne broad.`,
})

export default function Chat() {
  const location = useLocation()
  const navigate = useNavigate()
  const brandId = location.state?.brandId

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'agent',
      text: brandId
        ? 'Bonjour, j\'ai analysé votre rapport de marché. Posez-moi une question précise et je m\'appuie dessus pour répondre.'
        : 'Bonjour, je suis votre assistant marché. Décrivez d\'abord votre projet pour obtenir une analyse personnalisée, ou posez une question générale.',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)
  const idRef = useRef(2)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function send(text) {
    const value = (text ?? input).trim()
    if (!value || typing) return
    const userId = (idRef.current += 1)
    setMessages((m) => [...m, { id: userId, role: 'user', text: value }])
    setInput('')
    setTyping(true)

    try {
      if (brandId) {
        const res = await askBrand(brandId, value)
        const agentId = (idRef.current += 1)
        setMessages((m) => [
          ...m,
          { id: agentId, role: 'agent', text: res.answer },
        ])
      } else {
        await new Promise((r) => setTimeout(r, 700))
        const res = mockAgent(value)
        const agentId = (idRef.current += 1)
        setMessages((m) => [...m, { id: agentId, role: 'agent', ...res }])
      }
    } catch (err) {
      const agentId = (idRef.current += 1)
      const errorMsg = brandId
        ? `Erreur : ${err.message || 'Le service est indisponible. Vérifiez que les clés API (GROQ) sont configurées dans .env.'}`
        : null
      if (errorMsg) {
        setMessages((m) => [...m, { id: agentId, role: 'agent', text: errorMsg }])
      } else {
        const res = mockAgent(value)
        setMessages((m) => [...m, { id: agentId, role: 'agent', text: res.text }])
      }
    } finally {
      setTyping(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-shell">
      <header className="chat-header">
        <div className="chat-id">
          <span className="chat-avatar" aria-hidden="true">AI</span>
          <div>
            <h1>Assistant marché</h1>
            <p className="chat-status">
              <span className="dot" />
              {brandId ? 'Connecté à votre rapport' : 'Mode démonstration'}
            </p>
          </div>
        </div>
        {brandId ? (
          <button className="btn btn-ghost chat-back" onClick={() => navigate('/research', { state: { brandId } })}>
            ← Rapport
          </button>
        ) : (
          <Link className="btn btn-ghost chat-back" to="/">
            ← Studio
          </Link>
        )}
      </header>

      <div className="chat-body">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.role === 'agent' && (
              <span className="msg-avatar" aria-hidden="true">AI</span>
            )}
            <div className="msg-content">
              <p>{m.text}</p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="msg agent">
            <span className="msg-avatar" aria-hidden="true">AI</span>
            <div className="msg-content">
              <div className="typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat-suggest">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="suggest-chip" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          rows={1}
          placeholder="Posez votre question sur votre projet…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn btn-primary send" onClick={() => send()} disabled={!input.trim() || typing}>
          Envoyer
        </button>
      </div>
    </div>
  )
}
