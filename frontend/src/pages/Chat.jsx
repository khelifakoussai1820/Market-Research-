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
  text: `D’après la base documentaire, voici une synthèse pour « ${q} » : les retours clients penchent vers un positionnement clair et premium, avec un point de vigilance sur la clarté du message. Je recommande de consolider la preuve sociale avant toute campagne broad.`,
  sources: [
    { label: 'Rapport Q2 — page 4', score: 0.92 },
    { label: 'Interviews cible 25-34', score: 0.87 },
    { label: 'Analyse concurrents', score: 0.81 },
  ],
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
        ? 'Bonjour, j’ai analysé votre rapport de marché. Posez-moi une question précise et je m’appuie dessus pour répondre.'
        : 'Bonjour, je suis votre assistant marché. Décrivez d’abord votre projet pour obtenir une analyse personnalisée, ou posez une question générale.',
      sources: [],
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
        const sources = Array.isArray(res.sources)
          ? res.sources.map((s) =>
              typeof s === 'string' ? { label: s, score: null } : s,
            )
          : []
        setMessages((m) => [
          ...m,
          { id: agentId, role: 'agent', text: res.answer, sources },
        ])
      } else {
        await new Promise((r) => setTimeout(r, 700))
        const res = mockAgent(value)
        const agentId = (idRef.current += 1)
        setMessages((m) => [...m, { id: agentId, role: 'agent', ...res }])
      }
    } catch {
      const res = mockAgent(value)
      const agentId = (idRef.current += 1)
      setMessages((m) => [...m, { id: agentId, role: 'agent', ...res }])
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
              {m.sources?.length > 0 && (
                <div className="msg-sources">
                  <span className="sources-label">Sources</span>
                  {m.sources.map((s, i) => (
                    <span className="source-chip" key={i} title={s.score != null ? `pertinence ${Math.round(s.score * 100)}%` : 'source'}>
                      <svg className="source-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M4 1.5h5.5L13 5v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Zm5 1.2V5h2.8L9 2.7ZM5.5 8h5v1h-5v-1Zm0 2.5h5v1h-5v-1Zm0-5h2v1h-2v-1Z"
                        />
                      </svg>
                      {s.label}
                      {s.score != null && <em>{Math.round(s.score * 100)}%</em>}
                    </span>
                  ))}
                </div>
              )}
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
