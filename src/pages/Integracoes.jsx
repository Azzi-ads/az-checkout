import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { getProfile, saveProfile } from '../store.js'
import { supabase } from '../supabase.js'

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

  // ===== Conectar o gateway do próprio vendedor =====
  const [gwKey, setGwKey] = useState('')
  const [gwConn, setGwConn] = useState(() => !!getProfile().gatewayConnected)
  const [gw, setGw] = useState({ state: 'idle', msg: '' })
  async function gwToken() { const { data } = await supabase.auth.getSession(); return data?.session?.access_token || '' }
  async function connectGw() {
    if (!gwKey.trim()) { setGw({ state: 'err', msg: 'Cole sua chave do BravoPay.' }); return }
    setGw({ state: 'busy', msg: '' })
    try {
      const t = await gwToken()
      const r = await fetch('/api/connect-gateway', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ action: 'connect', apiKey: gwKey.trim() }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha ao conectar.')
      setGwConn(true); setGwKey(''); saveProfile({ gatewayConnected: true }); setGw({ state: 'ok', msg: 'Gateway conectado! Suas vendas caem na sua conta.' })
    } catch (e) { setGw({ state: 'err', msg: e.message }) }
  }
  async function disconnectGw() {
    setGw({ state: 'busy', msg: '' })
    try {
      const t = await gwToken()
      await fetch('/api/connect-gateway', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ action: 'disconnect' }) })
      setGwConn(false); saveProfile({ gatewayConnected: false }); setGw({ state: 'idle', msg: '' })
    } catch { setGw({ state: 'err', msg: 'Falha ao desconectar.' }) }
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
        <div className="card-head"><h3>Conectar BravoPay</h3>{gwConn ? <span className="integ-badge ok"><span className="dot" />Conectado</span> : <span className="integ-badge soon">Não conectado</span>}</div>
        <p className="area-intro" style={{ marginBottom: 14 }}>
          Cole a <b>chave de API do seu BravoPay</b>. Ela fica guardada com segurança no servidor (nunca no navegador) e é usada só para processar as <b>suas</b> vendas — o dinheiro cai direto na sua conta.
        </p>
        {gwConn ? (
          <button type="button" className="btn btn-ghost" onClick={disconnectGw} disabled={gw.state === 'busy'}><Icon name="trash" />Desconectar</button>
        ) : (
          <div className="field">
            <label htmlFor="gwkey">Chave de API (BravoPay)</label>
            <div className="copy-field">
              <input id="gwkey" type="password" value={gwKey} onChange={(e) => setGwKey(e.target.value)} placeholder="bp_live_..." autoComplete="off" />
              <button type="button" className="btn btn-primary" onClick={connectGw} disabled={gw.state === 'busy'}>{gw.state === 'busy' ? 'Conectando…' : 'Conectar'}</button>
            </div>
          </div>
        )}
        {gw.state === 'ok' && <div className="integ-result ok"><Icon name="check" />{gw.msg}</div>}
        {gw.state === 'err' && <div className="integ-result err"><Icon name="close" />{gw.msg}</div>}
        <div className="integ-note">
          <Icon name="lock" />
          <span>Cadastre este <b>webhook</b> no painel do seu BravoPay para confirmar os pagamentos automaticamente. Depois, ligue cada produto ao seu ID do BravoPay em <b>Produtos → Editar → buscar</b>.</span>
        </div>
        <CopyField label="URL do webhook" value={`${origin}/api/webhook`} />
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
