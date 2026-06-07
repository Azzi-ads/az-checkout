import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { getProfile, saveProfile } from '../store.js'

const GATEWAYS = [
  { key: 'bravopay', name: 'BravoPay', desc: 'Pix • cartão • boleto', status: 'connected', icon: 'bolt' },
  { key: 'mercadopago', name: 'Mercado Pago', desc: 'Pix • cartão', status: 'soon', icon: 'card' },
  { key: 'pagarme', name: 'Pagar.me', desc: 'Pix • cartão', status: 'soon', icon: 'card' },
  { key: 'asaas', name: 'Asaas', desc: 'Pix • cartão • boleto', status: 'soon', icon: 'card' },
]

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(value)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="field">
      <label>{label}</label>
      <div className="copy-field">
        <input value={value} readOnly />
        <button type="button" className="btn btn-ghost" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} />{copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

export default function Integracoes() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const [test, setTest] = useState({ state: 'idle', msg: '' })
  const [domain, setDomain] = useState(() => getProfile().domain || '')
  const [savedDom, setSavedDom] = useState(false)

  function saveDomain() {
    saveProfile({ domain: domain.trim() })
    setSavedDom(true); setTimeout(() => setSavedDom(false), 2000)
  }

  async function testar() {
    setTest({ state: 'testing', msg: '' })
    try {
      const r = await fetch('/api/produtos-bravo')
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao conectar.')
      const n = (j.products || []).length
      setTest({ state: 'ok', msg: `Conexão OK — ${n} produto(s) na conta.` })
    } catch (e) {
      setTest({ state: 'err', msg: e.message })
    }
  }

  return (
    <>
      <p className="area-intro">Conecte seu gateway de pagamento. O AZ é o checkout; quem processa o dinheiro é o gateway que você conectar aqui.</p>

      <div className="grid integ-grid">
        {GATEWAYS.map((g) => (
          <div className={`card integ-card${g.status === 'connected' ? ' on' : ''}`} key={g.key}>
            <div className="integ-top">
              <div className="integ-ic"><Icon name={g.icon} /></div>
              {g.status === 'connected'
                ? <span className="integ-badge ok"><span className="dot" />Conectado</span>
                : <span className="integ-badge soon">Em breve</span>}
            </div>
            <h3>{g.name}</h3>
            <p>{g.desc}</p>
            {g.status === 'connected'
              ? <button type="button" className="btn btn-ghost" onClick={testar} disabled={test.state === 'testing'}>
                  <Icon name="refresh" />{test.state === 'testing' ? 'Testando…' : 'Testar conexão'}
                </button>
              : <button type="button" className="btn btn-ghost" disabled>Conectar</button>}
          </div>
        ))}
      </div>

      {test.state !== 'idle' && test.state !== 'testing' && (
        <div className={`integ-result ${test.state}`}>
          <Icon name={test.state === 'ok' ? 'check' : 'close'} />{test.msg}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>BravoPay — configuração</h3></div>
        <div className="integ-note">
          <Icon name="lock" />
          <span>A <b>chave secreta</b> fica guardada com segurança no servidor (variável de ambiente <code>BRAVOPAY_API_KEY</code> no Vercel) — nunca no navegador. Cada produto se liga a um produto do BravoPay em <b>Produtos → Editar</b>.</span>
        </div>
        <CopyField label="URL do webhook (cadastre no painel do BravoPay)" value={`${origin}/api/webhook`} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Domínio próprio do checkout</h3><span className="pill">opcional • white-label</span></div>
        <p className="area-intro" style={{ marginBottom: 14 }}>
          Use seu próprio domínio no checkout. Sem isso, o link usa o nosso: <b>{origin}/checkout/...</b>
        </p>
        <div className="field">
          <label htmlFor="dom">Seu domínio</label>
          <div className="copy-field">
            <input id="dom" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ex.: pay.minhaloja.com" />
            <button type="button" className="btn btn-primary" onClick={saveDomain}>{savedDom ? 'Salvo!' : 'Salvar'}</button>
          </div>
        </div>
        {domain.trim() && (
          <ol className="dom-steps">
            <li><b>No Vercel:</b> projeto → Settings → Domains → adicione <code>{domain.trim().replace(/^https?:\/\//, '')}</code>.</li>
            <li><b>No seu DNS:</b> crie um registro <b>CNAME</b>:</li>
          </ol>
        )}
        {domain.trim() && (
          <div className="ck-row">
            <CopyField label="Nome (host)" value={domain.trim().replace(/^https?:\/\//, '').split('.')[0]} />
            <CopyField label="Valor (aponta para)" value="cname.vercel-dns.com" />
          </div>
        )}
        {domain.trim() && (
          <CopyField label="Seu link de checkout ficará assim" value={`https://${domain.trim().replace(/^https?:\/\//, '')}/checkout/seu-produto`} />
        )}
        <div className="integ-note">
          <Icon name="lock" />
          <span>Sem domínio próprio o link usa o nosso ({origin}/checkout/...). Depois que o domínio propagar (pode levar alguns minutos), os links de checkout passam a usar o seu — 100% white-label.</span>
        </div>
      </div>
    </>
  )
}
