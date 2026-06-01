// Contador "ao vivo" do Livex. Conta nova = sem tráfego, tudo zero.
// TODO(roadmap): alimentar via WebSocket quando houver backend; aí volta a ter
// movimento real em vez de zero fixo.
export default function useLiveCount() {
  return { atCheckout: 0, atPayment: 0 }
}
