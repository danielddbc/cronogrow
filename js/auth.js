/* CRONOGROW — Autenticação frontend */
const Auth = {
  async init() {
    const token = localStorage.getItem('cg_token');
    if (!token) return false;
    // Token existe — tenta um ping para validar URL da API
    try {
      if (!API.getApiUrl()) return false;
      return true;
    } catch { return false; }
  },
  async login(senha, nome = '') {
    const body = nome ? { senha, nome } : { senha };
    const rota = nome ? 'registrar' : 'login';
    const res = nome ? await API.registrar(body) : await API.login(body);
    if (res.ok) {
      localStorage.setItem('cg_token', res.dados.token);
      localStorage.setItem('cg_nome', res.dados.nome);
    }
    return res;
  },
  async logout() {
    try { await API.logout(); } catch {}
    Storage.clear();
    location.reload();
  },
  nome() { return localStorage.getItem('cg_nome') || 'Cultivador'; }
};
