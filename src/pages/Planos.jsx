import PlanCard from '../components/PlanCard.jsx'
import { plans } from '../data.js'

export default function Planos() {
  return (
    <>
      <div className="plans-head">
        <h2>Escolha o plano ideal</h2>
        <p>Comece de graça e evolua conforme sua operação cresce. Sem surpresas, com taxas que diminuem quanto maior o seu plano.</p>
      </div>
      <div className="grid plans">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
    </>
  )
}
