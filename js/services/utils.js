/* CRONOGROW — Utilitários */
const Utils = {
  // Formata data YYYY-MM-DD → DD/MM/AAAA
  formatarData(data) {
    if (!data) return '—';
    const [a, m, d] = String(data).split('T')[0].split('-');
    return `${d}/${m}/${a}`;
  },
  // Hoje em YYYY-MM-DD
  hoje() { return new Date().toISOString().slice(0, 10); },
  // Hora atual HH:MM
  horaAgora() { return new Date().toTimeString().slice(0, 5); },
  // Dias entre duas datas
  diasEntre(d1, d2) {
    const a = new Date(d1), b = d2 ? new Date(d2) : new Date();
    return Math.max(0, Math.floor((b - a) / 86400000));
  },
  // Pluralizar
  plural(n, s, p) { return `${n} ${n === 1 ? s : (p || s + 's')}`; },
  // Mapa de emojis por tipo de evento
  eventoEmoji: {
    agua:'💧', papel:'📄', germinou:'🌱', terra:'🪴', emergiu:'🌿',
    primeiro_par:'🍃', transplante:'♻️', inicio_vegetativo:'☀️',
    poda:'✂️', amarracao:'🪢', desfolha:'🍂', troca_vaso:'🪣',
    mudanca_luz:'💡', mudanca_ambiente:'🏠', inicio_floracao:'🌸',
    lavagem:'🚿', colheita:'🌾', inicio_secagem:'🌬️',
    inicio_cura:'🫙', finalizacao:'🏁'
  },
  // Nome legível do evento
  eventoNome: {
    agua:'Semente na água', papel:'Foi para papel', germinou:'Germinou',
    terra:'Foi para terra', emergiu:'Emergiu', primeiro_par:'Primeiro par de folhas',
    transplante:'Transplante', inicio_vegetativo:'Início vegetativo',
    poda:'Poda', amarracao:'Amarração', desfolha:'Desfolha',
    troca_vaso:'Troca de vaso', mudanca_luz:'Mudança de iluminação',
    mudanca_ambiente:'Mudança de ambiente', inicio_floracao:'Início floração',
    lavagem:'Lavagem', colheita:'Colheita', inicio_secagem:'Início secagem',
    inicio_cura:'Início cura', finalizacao:'Finalização'
  },
  // Badge de status da planta
  statusPlantaBadge(status) {
    const m = { ativa:'badge-verde', perdida:'badge-vermelho', colhida:'badge-amarelo', curando:'badge-azul', finalizada:'badge-cinza' };
    const n = { ativa:'Ativa', perdida:'Perdida', colhida:'Colhida', curando:'Curando', finalizada:'Finalizada' };
    return `<span class="badge ${m[status]||'badge-cinza'}">${n[status]||status}</span>`;
  },
  // Escapar HTML
  esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },
  // Cores padrão para plantas
  coresPlanta: ['#2ECC71','#3498DB','#E74C3C','#F1C40F','#9B59B6','#E67E22','#1ABC9C','#E91E63','#FF5722','#00BCD4']
};
