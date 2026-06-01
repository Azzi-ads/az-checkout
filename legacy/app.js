const titles={
  dashboard:['Início','Visão geral da sua operação'],
  livex:['Livex','Pessoas ao vivo no checkout'],
  produtos:['Produtos','Gerencie seu catálogo'],
  vendas:['Vendas','Histórico de pedidos'],
  config:['Configurações','Ajustes da sua conta e checkout'],
  planos:['Planos','Escolha o melhor para o seu momento'],
};
const items=document.querySelectorAll('.nav-item');
const pages=document.querySelectorAll('.page');
items.forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.page;
  items.forEach(i=>i.classList.remove('active'));
  b.classList.add('active');
  pages.forEach(p=>p.classList.toggle('active',p.id===id));
  document.getElementById('ptitle').textContent=titles[id][0];
  document.getElementById('psub').textContent=titles[id][1];
  document.querySelector('.main').scrollTo({top:0,behavior:'smooth'});
}));

// toggles
document.querySelectorAll('[data-sw]').forEach(s=>s.addEventListener('click',()=>s.classList.toggle('on')));

// live counter
setInterval(()=>{
  const n=8+Math.floor(Math.random()*9);
  const p=Math.max(2,Math.floor(n/3));
  ['liveBadge','liveBig','lv1'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=n;});
  const e2=document.getElementById('lv2');if(e2)e2.textContent=p;
},2600);
