/* CRONOGROW — Inicialização do app e Toast/Modal globais */

// ── Toast ────────────────────────────────────────────────────────
const Toast = {
  show(msg, tipo = 'sucesso', ms = 3000) {
    const c = document.getElementById('toast-container');
    const icones = { sucesso: '✅', erro: '❌', aviso: '⚠️', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${tipo}`;
    t.innerHTML = `<span class="toast-icone">${icones[tipo]||'ℹ️'}</span><span>${Utils.esc(msg)}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.animation = `fadeOut ${0.3}s ease forwards`; setTimeout(() => t.remove(), 300); }, ms);
  },
  ok:    msg => Toast.show(msg, 'sucesso'),
  erro:  msg => Toast.show(msg, 'erro', 4000),
  aviso: msg => Toast.show(msg, 'aviso')
};

// ── Modal ────────────────────────────────────────────────────────
const Modal = {
  abrir(titulo, htmlBody, opts = {}) {
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-body').innerHTML = htmlBody;
    document.getElementById('modal-overlay').classList.remove('hidden');
    if (opts.onOpen) opts.onOpen(document.getElementById('modal-body'));
  },
  fechar() { document.getElementById('modal-overlay').classList.add('hidden'); },
  confirmar(titulo, msg) {
    return new Promise(resolve => {
      Modal.abrir(titulo, `
        <p style="color:var(--txt-secundario)">${Utils.esc(msg)}</p>
        <div style="display:flex;gap:var(--gap-md);margin-top:var(--gap-md)">
          <button class="btn btn-outline btn-full" id="modal-nao">Cancelar</button>
          <button class="btn btn-perigo btn-full"  id="modal-sim">Confirmar</button>
        </div>`);
      document.getElementById('modal-sim').onclick = () => { Modal.fechar(); resolve(true); };
      document.getElementById('modal-nao').onclick = () => { Modal.fechar(); resolve(false); };
    });
  }
};

// ── Páginas ──────────────────────────────────────────────────────
// Dashboard
Router.registrar('dashboard', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando dashboard...</div>';
  const res = await API.dashboard();
  if (!res.ok) { el.innerHTML = `<p class="estado-vazio">Erro: ${res.erro}</p>`; return; }
  const d = res.dados;
  const c = d.cicloAtivo;
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">🌿 Início</h1>
        <p class="page-subtitulo">${c ? `Ciclo: ${Utils.esc(c.nome)}` : 'Nenhum ciclo ativo'}</p>
      </div>
      ${c ? `<div class="badge badge-verde">Dia ${d.diasCiclo} do ciclo</div>` : '<button class="btn btn-primary btn-sm" onclick="Router.navegar(\'plantas\')">Criar ciclo</button>'}
    </div>

    <!-- Widgets de estágio -->
    <div class="card-titulo">Plantas por estágio</div>
    <div class="grid-4" style="margin-bottom:var(--gap-lg)">
      ${[
        ['💧','Em água',       d.estagios.agua],
        ['🌱','Germinação',   d.estagios.germinacao],
        ['☀️','Vegetativo',   d.estagios.vegetativo],
        ['🌸','Floração',     d.estagios.floracao],
        ['🌾','Colheita',     d.estagios.colheita],
        ['🫙','Cura',         d.estagios.cura],
        ['🏁','Finalizadas',  d.estagios.finalizadas],
        ['🪴','Total ativas', d.totalPlantas]
      ].map(([e,l,v]) => `
        <div class="stat-card">
          <div class="stat-label">${e} ${l}</div>
          <div class="stat-valor">${v || 0}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2" style="gap:var(--gap-lg)">
      <!-- Próximas tarefas -->
      <div class="card">
        <div class="card-titulo">📋 Próximas tarefas</div>
        ${d.proximasTarefas.length === 0
          ? '<p style="color:var(--txt-terciario);font-size:.85rem">Nenhuma tarefa pendente 🎉</p>'
          : d.proximasTarefas.map(t => `
            <div class="tarefa-item" style="margin-bottom:var(--gap-sm)">
              <div class="tarefa-check"></div>
              <div><div class="tarefa-titulo">${Utils.esc(t.titulo)}</div>
              ${t.data_prazo ? `<div class="tarefa-prazo">📅 ${Utils.formatarData(t.data_prazo)}</div>` : ''}</div>
            </div>`).join('')}
        <button class="btn btn-ghost btn-sm" style="margin-top:var(--gap-sm)" onclick="Router.navegar('tarefas')">Ver todas →</button>
      </div>

      <!-- Últimos eventos -->
      <div class="card">
        <div class="card-titulo">⏱ Últimos eventos</div>
        ${d.ultimosEventos.length === 0
          ? '<p style="color:var(--txt-terciario);font-size:.85rem">Nenhum evento registrado ainda.</p>'
          : d.ultimosEventos.map(e => `
            <div style="display:flex;align-items:center;gap:var(--gap-sm);padding:var(--gap-xs) 0;border-bottom:1px solid var(--borda)">
              <span style="font-size:1.2rem">${Utils.eventoEmoji[e.tipo]||'📌'}</span>
              <div>
                <div style="font-size:.85rem;font-weight:600">${Utils.eventoNome[e.tipo]||e.tipo}</div>
                <div style="font-size:.72rem;color:var(--txt-terciario)">${Utils.formatarData(e.data)}</div>
              </div>
            </div>`).join('')}
        <button class="btn btn-ghost btn-sm" style="margin-top:var(--gap-sm)" onclick="Router.navegar('timeline')">Ver timeline →</button>
      </div>
    </div>`;
});

// Plantas, Timeline, Tarefas, Diário, Galeria, Relatórios, Config
// Stub — serão implementados nas próximas etapas
['plantas','timeline','tarefas','diario','galeria','relatorios','config'].forEach(p => {
  Router.registrar(p, async (el) => {
    el.innerHTML = `<div class="estado-vazio">
      <h3>🚧 ${p.charAt(0).toUpperCase()+p.slice(1)}</h3>
      <p>Esta tela chegará na próxima etapa.</p>
    </div>`;
  });
});

// ── Setup tela de login ──────────────────────────────────────────
async function setupLogin() {
  // Verificar se há usuário cadastrado via ping + checagem local
  const temUrl = !!API.getApiUrl();
  const telaLogin = document.getElementById('tela-login');
  const loginTitulo = document.getElementById('login-titulo');
  const campoNome = document.getElementById('campo-nome');
  const btnEntrar = document.getElementById('btn-entrar');
  const loginErro = document.getElementById('login-erro');

  // Se URL da API ainda não foi configurada, pedir
  if (!temUrl) {
    document.getElementById('login-form').innerHTML = `
      <h2>Configurar API</h2>
      <p style="color:var(--txt-secundario);font-size:.875rem;margin-bottom:var(--gap-md)">
        Cole abaixo a URL gerada no deploy do Apps Script:
      </p>
      <div class="campo">
        <label>URL da API</label>
        <input type="url" id="inp-api-url" placeholder="https://script.google.com/macros/s/.../exec" />
      </div>
      <button class="btn btn-primary btn-full" id="btn-salvar-url" style="margin-top:var(--gap-md)">Salvar e continuar</button>
      <p class="login-msg" id="login-erro"></p>`;
    document.getElementById('btn-salvar-url').onclick = () => {
      const url = document.getElementById('inp-api-url').value.trim();
      if (!url.startsWith('https://script.google.com')) {
        document.getElementById('login-erro').textContent = 'URL inválida. Verifique e tente novamente.';
        return;
      }
      API.setApiUrl(url);
      location.reload();
    };
    telaLogin.classList.remove('hidden');
    return;
  }

  // Verificar se já tem cadastro
  let primeiroCadastro = false;
  try {
    const ping = await API.ping();
    // Tentar login sem senha para detectar se há usuário
    const teste = await fetch(API.getApiUrl() + '?rota=login', { method:'POST', body:'{"senha":"__probe__"}' });
    const r = await teste.json();
    primeiroCadastro = r.codigo === 404; // "Nenhum usuário cadastrado"
  } catch {}

  if (primeiroCadastro) {
    loginTitulo.textContent = 'Criar conta';
    campoNome.style.display = 'flex';
    btnEntrar.textContent = 'Criar conta';
  }

  telaLogin.classList.remove('hidden');

  btnEntrar.onclick = async () => {
    const senha = document.getElementById('inp-senha').value;
    const nome = document.getElementById('inp-nome')?.value || '';
    loginErro.textContent = '';
    if (!senha) { loginErro.textContent = 'Digite a senha.'; return; }
    btnEntrar.textContent = '...';
    btnEntrar.disabled = true;
    const res = await Auth.login(senha, primeiroCadastro ? nome : '');
    if (res.ok) {
      telaLogin.classList.add('hidden');
      iniciarApp();
    } else {
      loginErro.textContent = res.erro || 'Erro no login.';
      btnEntrar.textContent = primeiroCadastro ? 'Criar conta' : 'Entrar';
      btnEntrar.disabled = false;
    }
  };

  document.getElementById('inp-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') btnEntrar.click();
  });
}

// ── Iniciar app ──────────────────────────────────────────────────
function iniciarApp() {
  const app = document.getElementById('app');
  app.classList.remove('hidden');
  // Aplicar tema salvo
  const tema = Storage.get('tema', 'escuro');
  document.body.dataset.theme = tema;
  // Logout
  document.getElementById('btn-logout').onclick = () => Auth.logout();
  // Modal fechar
  document.getElementById('modal-fechar').onclick = () => Modal.fechar();
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) Modal.fechar();
  });
  // Router
  Router.init();
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  Router.navegar(hash);
}

// ── Boot ─────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading-screen');
  const jaLogado = await Auth.init();
  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => loading.classList.add('hidden'), 400);
    if (jaLogado) {
      iniciarApp();
    } else {
      setupLogin();
    }
  }, 800);
});

// ── Service Worker ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
