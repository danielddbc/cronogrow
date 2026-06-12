/* CRONOGROW — Roteador de páginas SPA */
const Router = (() => {
  const paginas = {};
  let paginaAtual = null;

  function registrar(nome, fn) { paginas[nome] = fn; }

  async function navegar(rota) {
    rota = rota || 'dashboard';
    const main = document.getElementById('main-content');
    // Atualizar nav
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('ativo', a.dataset.page === rota);
    });
    // FAB — ocultar por padrão; cada página decide
    const fab = document.getElementById('fab');
    if (fab) fab.style.display = 'none';

    if (paginas[rota]) {
      main.innerHTML = '<div class="loader-inline">Carregando...</div>';
      try { await paginas[rota](main); }
      catch (e) { main.innerHTML = `<div class="estado-vazio"><p>Erro ao carregar: ${e.message}</p></div>`; }
    } else {
      main.innerHTML = '<div class="estado-vazio"><h3>Página não encontrada</h3></div>';
    }
    paginaAtual = rota;
    window.location.hash = rota;
  }

  function init() {
    window.addEventListener('hashchange', () => {
      navegar(window.location.hash.replace('#', '') || 'dashboard');
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        navegar(a.dataset.page);
      });
    });
  }

  return { registrar, navegar, init, atual: () => paginaAtual };
})();
