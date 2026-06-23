import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const welcomeMessage = "Bonjour! Je suis votre coach SafeDrink. Je suis la pour vous aider a suivre votre consommation et vous donner des conseils personnalises. N'hesitez pas a me poser vos questions!"

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcomeMessage }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setSending(true)

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    // Simulate AI response (replace with actual Supabase Edge Function call)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const responses: Record<string, string> = {
      default: "Je comprends. N'oubliez pas de boire de l'eau entre chaque verre d'alcool. L'hydratation est essentielle pour reduire les effets de l'alcool.",
      conseil: "Voici quelques conseils:\n1. Alternez entre boissons alcoolisees et eau\n2. Ne buvez jamais a jeun\n3. Limitez-vous a 2 verres par occasion\n4. Prenez le temps de savourer votre boisson",
      aide: "Je peux vous aider avec:\n- Calculer votre taux d'alcoolemie\n- Vous donner des conseils de moderation\n- Vous rappeler de boire de l'eau\n- Suggere des alternatives sans alcool"
    }

    const lowerInput = userMessage.toLowerCase()
    let response = responses.default
    if (lowerInput.includes('conseil') || lowerInput.includes('astuce')) {
      response = responses.conseil
    } else if (lowerInput.includes('aide') || lowerInput.includes('pouvez')) {
      response = responses.aide
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    setSending(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center">
            <Bot className="w-5 h-5 text-on-brand" />
          </div>
          <div>
            <h1 className="font-semibold">Coach SafeDrink</h1>
            <p className="text-xs text-success">En ligne</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-on-brand" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-brand-tertiary text-on-brand-tertiary'
                  : 'bg-surface-secondary glass text-on-surface'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-on-brand" />
            </div>
            <div className="bg-surface-secondary rounded-lg px-4 py-3 glass">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-on-surface-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-on-surface-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-on-surface-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-surface-secondary rounded-lg border border-border">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ecrivez votre message..."
              className="w-full bg-transparent px-4 py-3 resize-none focus:outline-none text-on-surface placeholder:text-on-surface-secondary"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-lg bg-brand flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-secondary transition-colors"
          >
            <Send className="w-5 h-5 text-on-brand" />
          </button>
        </div>
      </div>
    </div>
  )
}
