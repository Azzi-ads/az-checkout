import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { getProducts, saveProducts } from '../store.js'
import { defaultCheckout } from '../checkoutConfig.js'
import { useSales, computeMetrics, DAY } from '../metrics.js'
import { supabase, hasBackend } from '../supabase.js'

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produto'
}
function uniqueSlug(base, list) {
  let slug = base, i = 2
  while (list.some((p) => p.slug === slug)) slug = `${base}-${i++}`
  return slug
}
async function authToken() {
  if (!hasBackend) return ''
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || ''
}

function buildProduct(pr, existing) {
  const base = defaultCheckout('padrao')
  const checkout = {
    ...base,
    accent: pr.accent || base.accent,
    theme: pr.theme === 'dark' ? 'dark' : 'light',
    title: pr.title || base.title,
    subtitle: pr.subtitle || base.subtitle,
    ctaText: pr.ctaText || base.ctaText,
    bump: { ...base.bump, ...(pr.bump || {}) },
    upsell: { ...base.upsell, ...(pr.upsell || {}) },
    downsell: { ...base.downsell, ...(pr.downsell || {}) },
  }
  const slug = uniqueSlug(slugify(pr.name), existing)
  const amount = Number(pr.amount) || 0
  return {
    icon: 'p-video', name: pr.name || 'Novo produto', amount, oldAmount: Number(pr.oldAmount) || 0,
    status: 'Ativo', desc: pr.desc || '', image: '', bravoProductId: '',
    entrega: { tipo: 'email', url: '', conteudo: '' },
    checkout, slug, price: formatBRL(amount), tone: 'pago', meta: '0 vendas',
  }
}

export default function IA() {
  const [tab, setTab] = useState('funil')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [funnel, setFunnel] = useState(null)
  const [created, setCreated] = useState(false)
  const [summary, setSummary] = useState('')
  const sales = useSales()

  async function gerarFunil() {
    if (!prompt.trim()) return
    setBusy(true); setErr(''); setFunnel(null); setCreated(false)
    try {
      const token = await authToken()
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'funnel', prompt, context: { products: getProducts().map((p) => p.name) } }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha na IA.')
      if (j.parseError || !j.funnel) throw new Error('A IA não retornou um funil válido. Tente reescrever o pedido.')
      setFunnel(j.funnel)
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  function criarFunil() {
    const existing = getProducts()
    const novos = []
    for (const pr of funnel.products) { const np = buildProduct(pr, [...existing, ...novos]); novos.push(np) }
    saveProducts([...novos, ...existing])
    setCreated(true)
  }

  async function gerarResumo() {
    setBusy(true); setErr(''); setSummary('')
    try {
      const m = computeMetrics(sales, DAY)
      const pend = sales.filter((s) => s.status === 'aguardando').length
      const token = await authToken()
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: 'summary', prompt, context: { receita: m.receita, pagos: m.pagos, ticket: m.ticket, conversao: m.conv, pedidos: m.total, abandonos: m.abandonos, pendentes: pend } }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Falha na IA.')
      setSummary(j.text || '')
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <div className="ia-tabs">
        <button type="button" className={tab === 'funil' ? 'on' : ''} onClick={() => setTab('funil')}><Icon name="spark" />Criar funil</button>
        <button type="button" className={tab === 'resumo' ? 'on' : ''} onClick={() => setTab('resumo')}><Icon name="chart" />Resumo do dia</button>
      </div>

      {tab === 'funil' ? (
        <div className="card ia-card">
          <div className="ia-hero"><Icon name="spark" /><div><b>Crie um funil com IA</b><span>Descreva o produto, as cores e o upsell — a IA monta tudo.</span></div></div>
          <textarea className="ia-input" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex.: Crie o produto 'Curso de Tráfego' por R$197 (de R$497), cor verde, com order bump de templates a R$27 e upsell de mentoria a R$67." />
          <button type="button" className="btn btn-primary" onClick={gerarFunil} disabled={busy || !prompt.trim()}>
            <Icon name="spark" />{busy ? 'Gerando…' : 'Gerar funil'}
          </button>
          {err && <p className="ia-err">{err}</p>}

          {funnel && (
            <div className="ia-result">
              {funnel.message && <p className="ia-msg">{funnel.message}</p>}
              {funnel.products.map((p, i) => (
                <div className="ia-prod" key={i}>
                  <span className="ia-prod-color" style={{ background: p.accent || '#16a34a' }} />
                  <div className="ia-prod-body">
                    <b>{p.name} — {formatBRL(Number(p.amount) || 0)}{p.oldAmount ? <s> {formatBRL(Number(p.oldAmount))}</s> : null}</b>
                    <span>{p.title} · {p.theme === 'dark' ? 'tema escuro' : 'tema claro'}</span>
                    {p.bump?.enabled && <span>+ Order bump: {p.bump.title} ({formatBRL(Number(p.bump.amount) || 0)})</span>}
                    {p.upsell?.enabled && <span>↑ Upsell: {p.upsell.title} ({formatBRL(Number(p.upsell.price) || 0)})</span>}
                    {p.downsell?.enabled && <span>↓ Downsell: {p.downsell.title} ({formatBRL(Number(p.downsell.price) || 0)})</span>}
                  </div>
                </div>
              ))}
              {created ? (
                <p className="ia-ok"><Icon name="check" />Funil criado! Veja em Produtos / Checkout.</p>
              ) : (
                <button type="button" className="btn btn-primary" onClick={criarFunil}><Icon name="check" />Criar {funnel.products.length > 1 ? `${funnel.products.length} produtos` : 'produto'}</button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card ia-card">
          <div className="ia-hero"><Icon name="chart" /><div><b>Resumo do dia com IA</b><span>A IA analisa suas vendas de hoje e dá uma recomendação.</span></div></div>
          <button type="button" className="btn btn-primary" onClick={gerarResumo} disabled={busy}>
            <Icon name="spark" />{busy ? 'Analisando…' : 'Gerar resumo do dia'}
          </button>
          {err && <p className="ia-err">{err}</p>}
          {summary && <div className="ia-summary">{summary.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>}
        </div>
      )}
    </>
  )
}
