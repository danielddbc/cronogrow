/* CRONOGROW — Página de Configurações */
Router.registrar('config', async (el) => {

  const nome  = localStorage.getItem('cg_nome') || 'Cultivador';
  const tema  = Storage.get('tema', 'escuro');
  const apiUrl = API.getApiUrl();

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">⚙️ Configurações</h1>
        <p class="page-subtitulo">Preferências do CronoGrow</p>
      </div>
    </div>

    <!-- Perfil -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">👤 Perfil</div>
      <div class="campo">
        <label>Seu nome</label>
        <input type="text" id="cfg-nome" value="${Utils.esc(nome)}" />
      </div>
      <button class="btn btn-primary btn-sm" style="margin-top:var(--gap-md)" id="btn-salvar-nome">Salvar nome</button>
    </div>

    <!-- Aparência -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">🎨 Aparência</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-weight:600;font-size:.9rem">Tema</div>
          <div style="font-size:.8rem;color:var(--txt-terciario)">Escolha entre claro e escuro</div>
        </div>
        <div style="display:flex;gap:var(--gap-sm)">
          <button class="btn ${tema==='escuro'?'btn-primary':'btn-outline'} btn-sm" id="btn-tema-escuro" onclick="alterarTema('escuro')">🌙 Escuro</button>
          <button class="btn ${tema==='claro' ?'btn-primary':'btn-outline'} btn-sm" id="btn-tema-claro"  onclick="alterarTema('claro')">☀️ Claro</button>
        </div>
      </div>
    </div>

    <!-- API -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">🔗 URL da API</div>
      <p style="font-size:.8rem;color:var(--txt-terciario);word-break:break-all;background:var(--bg-input);
        padding:var(--gap-sm) var(--gap-md);border-radius:var(--radius-md);border:1px solid var(--borda)">
        ${Utils.esc(apiUrl)}
      </p>
      <p style="font-size:.78rem;color:var(--txt-terciario);margin-top:var(--gap-sm)">
        Esta URL agora é fixa no código-fonte (<code>js/services/api.js</code>). Para alterá-la,
        edite o arquivo diretamente no GitHub.
      </p>
    </div>

    <!-- Senha -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">🔒 Alterar senha</div>
      <div class="campo">
        <label>Senha atual</label>
        <input type="password" id="cfg-senha-atual" placeholder="••••••••" />
      </div>
      <div class="campo">
        <label>Nova senha</label>
        <input type="password" id="cfg-senha-nova" placeholder="••••••••" />
      </div>
      <div class="campo">
        <label>Confirmar nova senha</label>
        <input type="password" id="cfg-senha-conf" placeholder="••••••••" />
      </div>
      <p style="font-size:.78rem;color:var(--txt-terciario);margin-top:var(--gap-sm)">
        ⚠️ A alteração de senha requer que você faça login novamente após salvar.
      </p>
      <button class="btn btn-outline btn-sm" style="margin-top:var(--gap-md)" id="btn-salvar-senha">Alterar senha</button>
    </div>

    <!-- Dados -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">💾 Dados e backup</div>
      <div style="display:flex;flex-direction:column;gap:var(--gap-md)">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-sm)">
          <div>
            <div style="font-weight:600;font-size:.9rem">Backup da planilha</div>
            <div style="font-size:.78rem;color:var(--txt-terciario)">Abre o Google Sheets para você fazer uma cópia manual</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="abrirPlanilha()">📊 Abrir planilha</button>
        </div>
        <div class="divisor"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-sm)">
          <div>
            <div style="font-weight:600;font-size:.9rem">Limpar cache local</div>
            <div style="font-size:.78rem;color:var(--txt-terciario)">Remove preferências salvas no navegador (não apaga dados da planilha)</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="limparCache()">🗑 Limpar cache</button>
        </div>
        <div class="divisor"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-sm)">
          <div>
            <div style="font-weight:600;font-size:.9rem">Sair</div>
            <div style="font-size:.78rem;color:var(--txt-terciario)">Encerra a sessão atual</div>
          </div>
          <button class="btn btn-perigo btn-sm" onclick="Auth.logout()">🚪 Sair</button>
        </div>
      </div>
    </div>

    <!-- Sobre -->
    <div class="card">
      <div class="card-titulo">ℹ️ Sobre</div>
      <div style="display:flex;flex-direction:column;gap:var(--gap-xs);font-size:.85rem;color:var(--txt-secundario)">
        <div>🌿 <strong>CronoGrow</strong> — Seu cultivo organizado no tempo</div>
        <div>📦 Versão 1.0.0</div>
        <div>🔧 Backend: Google Apps Script</div>
        <div>🗄️ Banco: Google Sheets</div>
        <div>🌐 Frontend: GitHub Pages</div>
      </div>
    </div>`;

  // ── Handlers ──────────────────────────────────────────────────
  document.getElementById('btn-salvar-nome').onclick = async () => {
    const novo = document.getElementById('cfg-nome').value.trim();
    if (!novo) { Toast.aviso('Nome não pode ser vazio.'); return; }
    localStorage.setItem('cg_nome', novo);
    await API.salvarConfig({ chave: 'usuario_nome', valor: novo });
    Toast.ok('Nome atualizado!');
  };


  document.getElementById('btn-salvar-senha').onclick = async () => {
    const atual = document.getElementById('cfg-senha-atual').value;
    const nova  = document.getElementById('cfg-senha-nova').value;
    const conf  = document.getElementById('cfg-senha-conf').value;
    if (!atual || !nova) { Toast.aviso('Preencha todos os campos de senha.'); return; }
    if (nova !== conf)   { Toast.erro('As senhas não coincidem.'); return; }
    if (nova.length < 4) { Toast.aviso('A senha deve ter pelo menos 4 caracteres.'); return; }
    // Login com senha atual para verificar
    const resLogin = await API.login({ senha: atual });
    if (!resLogin.ok) { Toast.erro('Senha atual incorreta.'); return; }
    // Registrar nova senha (o endpoint troca o hash)
    const resNova = await API.salvarConfig({ chave: '_senha_hash', valor: nova });
    Toast.ok('Senha alterada! Faça login novamente.');
    setTimeout(() => Auth.logout(), 2000);
  };
});

function alterarTema(tema) {
  document.body.dataset.theme = tema;
  Storage.set('tema', tema);
  document.getElementById('btn-tema-escuro').className = `btn ${tema==='escuro'?'btn-primary':'btn-outline'} btn-sm`;
  document.getElementById('btn-tema-claro').className  = `btn ${tema==='claro' ?'btn-primary':'btn-outline'} btn-sm`;
  Toast.ok(`Tema ${tema} ativado!`);
}

function abrirPlanilha() {
  Toast.show('Abrindo Google Sheets...', 'info');
  window.open('https://sheets.google.com', '_blank');
}

async function limparCache() {
  const ok = await Modal.confirmar('Limpar cache', 'Remove preferências locais (tema, sessão). Você precisará fazer login novamente.');
  if (!ok) return;
  Storage.clear();
  localStorage.removeItem('cg_token');
  localStorage.removeItem('cg_nome');
  Toast.ok('Cache limpo!');
  setTimeout(() => location.reload(), 1000);
}

