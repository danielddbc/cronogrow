/* CRONOGROW — Página de Plantas */
Router.registrar('plantas', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando plantas...</div>';

  // Buscar ciclo ativo e plantas juntos
  const [resCiclos, resPlantas] = await Promise.all([API.getCiclos(), API.getPlantas({})]);
  const cicloAtivo = resCiclos.dados?.find(c => c.status === 'ativo');
  const plantas    = resPlantas.dados || [];
  const ativas     = plantas.filter(p => p.status === 'ativa');
  const outras     = plantas.filter(p => p.status !== 'ativa');

  // FAB
  const fab = document.getElementById('fab');
  if (cicloAtivo) {
    fab.style.display = 'flex';
    fab.onclick = () => abrirModalNovaPlanta(cicloAtivo.id);
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">🪴 Plantas</h1>
        <p class="page-subtitulo">${cicloAtivo ? `Ciclo: ${Utils.esc(cicloAtivo.nome)}` : 'Nenhum ciclo ativo'}</p>
      </div>
      ${cicloAtivo
        ? `<button class="btn btn-primary" onclick="abrirModalNovaPlanta('${cicloAtivo.id}')">+ Nova planta</button>`
        : `<button class="btn btn-outline" onclick="Router.navegar('ciclos')">Criar ciclo primeiro</button>`}
    </div>

    ${!cicloAtivo ? `
      <div class="estado-vazio">
        <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
        <h3>Nenhum ciclo ativo</h3>
        <p>Crie um ciclo antes de cadastrar plantas.</p>
        <button class="btn btn-primary" style="margin-top:var(--gap-md)" onclick="Router.navegar('ciclos')">Criar ciclo</button>
      </div>` : ''}

    ${cicloAtivo && plantas.length === 0 ? `
      <div class="estado-vazio">
        <svg viewBox="0 0 24 24"><path d="M12 22V12M12 12C12 7 7 4 2 6M12 12C12 7 17 4 22 6"/></svg>
        <h3>Nenhuma planta ainda</h3>
        <p>Cadastre a primeira planta do ciclo.</p>
      </div>` : ''}

    ${ativas.length > 0 ? `
      <div class="card-titulo">Plantas ativas (${ativas.length})</div>
      <div class="grid-2" id="grid-ativas" style="margin-bottom:var(--gap-xl)">
        ${ativas.map(p => cartaoPlanta(p)).join('')}
      </div>` : ''}

    ${outras.length > 0 ? `
      <div class="card-titulo" style="margin-top:var(--gap-md)">Outras plantas</div>
      <div class="grid-2" id="grid-outras">
        ${outras.map(p => cartaoPlanta(p)).join('')}
      </div>` : ''}`;
});

function cartaoPlanta(p) {
  return `
    <div class="planta-card" style="border-left-color:${p.cor||'#2ECC71'}"
         onclick="Router.navegar('planta-' + '${p.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--gap-sm)">
        <div>
          <div class="planta-card-nome">${Utils.esc(p.nome)}</div>
          <div class="planta-card-codigo">${Utils.esc(p.codigo)}</div>
        </div>
        ${Utils.statusPlantaBadge(p.status)}
      </div>
      <div class="planta-card-info">
        ${p.genetica ? `<span class="badge badge-cinza">🧬 ${Utils.esc(p.genetica)}</span>` : ''}
        ${p.tipo     ? `<span class="badge badge-cinza">${Utils.esc(p.tipo)}</span>` : ''}
        ${p.origem   ? `<span class="badge badge-cinza">📦 ${Utils.esc(p.origem)}</span>` : ''}
      </div>
    </div>`;
}

function abrirModalNovaPlanta(cicloId) {
  Modal.abrir('Nova planta', `
    <div class="campo">
      <label>Nome da planta *</label>
      <input type="text" id="plt-nome" placeholder="Ex: Maria, Planta 01..." />
    </div>
    <div class="grid-2">
      <div class="campo">
        <label>Genética / Strain</label>
        <input type="text" id="plt-genetica" placeholder="Ex: OG Kush" />
      </div>
      <div class="campo">
        <label>Tipo</label>
        <select id="plt-tipo">
          <option value="">Selecione...</option>
          <option value="feminizada">Feminizada</option>
          <option value="automatica">Automática</option>
          <option value="fotoperiodo">Fotoperiodo</option>
          <option value="clone">Clone</option>
        </select>
      </div>
    </div>
    <div class="grid-2">
      <div class="campo">
        <label>Origem</label>
        <input type="text" id="plt-origem" placeholder="Ex: banco, troca..." />
      </div>
      <div class="campo">
        <label>Qtd. sementes do lote</label>
        <input type="number" id="plt-qtd" value="1" min="1" />
      </div>
    </div>
    <div class="campo">
      <label>Cor identificadora</label>
      <div class="cor-picker" id="cor-picker">
        ${Utils.coresPlanta.map((c, i) => `
          <div class="cor-opcao ${i===0?'selecionada':''}"
               style="background:${c}" data-cor="${c}"
               onclick="selecionarCor(this)"></div>`).join('')}
      </div>
    </div>
    <div class="campo">
      <label>Observações</label>
      <textarea id="plt-obs" placeholder="Informações adicionais..."></textarea>
    </div>
    <button class="btn btn-primary btn-full" id="btn-salvar-planta">Cadastrar planta</button>`,
    { onOpen: () => {
      document.getElementById('btn-salvar-planta').onclick = async () => {
        const nome = document.getElementById('plt-nome').value.trim();
        if (!nome) { Toast.aviso('Nome é obrigatório.'); return; }
        const corSel = document.querySelector('.cor-opcao.selecionada');
        const cor = corSel ? corSel.dataset.cor : '#2ECC71';
        const btn = document.getElementById('btn-salvar-planta');
        btn.textContent = 'Salvando...'; btn.disabled = true;
        const res = await API.postPlanta({
          ciclo_id: cicloId, nome, cor,
          genetica:     document.getElementById('plt-genetica').value,
          tipo:         document.getElementById('plt-tipo').value,
          origem:       document.getElementById('plt-origem').value,
          qtd_sementes: document.getElementById('plt-qtd').value,
          observacoes:  document.getElementById('plt-obs').value
        });
        if (res.ok) {
          Modal.fechar(); Toast.ok('Planta cadastrada!');
          Router.navegar('plantas');
        } else {
          Toast.erro(res.erro);
          btn.textContent = 'Cadastrar planta'; btn.disabled = false;
        }
      };
    }}
  );
}

function selecionarCor(el) {
  document.querySelectorAll('.cor-opcao').forEach(c => c.classList.remove('selecionada'));
  el.classList.add('selecionada');
}
