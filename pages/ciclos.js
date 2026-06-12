/* CRONOGROW — Página de Ciclos */
Router.registrar('ciclos', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando ciclos...</div>';
  const res = await API.getCiclos();
  if (!res.ok) { el.innerHTML = `<p class="estado-vazio">Erro: ${res.erro}</p>`; return; }

  const ciclos = res.dados;
  const ativo  = ciclos.find(c => c.status === 'ativo');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">🔄 Ciclos</h1>
        <p class="page-subtitulo">${ciclos.length === 0 ? 'Nenhum ciclo ainda' : Utils.plural(ciclos.length, 'ciclo')}</p>
      </div>
      ${!ativo ? `<button class="btn btn-primary" id="btn-novo-ciclo">+ Novo ciclo</button>` : ''}
    </div>

    ${ativo ? `
    <div class="card" style="border-color:var(--cor-primaria);margin-bottom:var(--gap-lg)">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-md)">
        <div>
          <div class="card-titulo">🟢 Ciclo ativo</div>
          <div style="font-family:var(--fonte-display);font-size:1.3rem;font-weight:700">${Utils.esc(ativo.nome)}</div>
          <div style="color:var(--txt-secundario);font-size:.85rem;margin-top:4px">
            Início: ${Utils.formatarData(ativo.data_inicio)} · 
            <strong style="color:var(--cor-primaria)">${Utils.diasEntre(ativo.data_inicio)} dias em andamento</strong>
          </div>
          ${ativo.objetivo ? `<div style="color:var(--txt-terciario);font-size:.8rem;margin-top:4px">🎯 ${Utils.esc(ativo.objetivo)}</div>` : ''}
        </div>
        <div style="display:flex;gap:var(--gap-sm)">
          <button class="btn btn-outline btn-sm" onclick="editarCiclo('${ativo.id}')">Editar</button>
          <button class="btn btn-perigo btn-sm"  onclick="finalizarCiclo('${ativo.id}')">Finalizar ciclo</button>
        </div>
      </div>
    </div>` : `
    <div class="estado-vazio" style="margin-bottom:var(--gap-lg)">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <h3>Nenhum ciclo ativo</h3>
      <p>Crie um novo ciclo para começar a registrar suas plantas.</p>
    </div>`}

    ${ciclos.filter(c => c.status === 'finalizado').length > 0 ? `
    <div class="card-titulo" style="margin-top:var(--gap-lg)">Ciclos finalizados</div>
    <div style="display:flex;flex-direction:column;gap:var(--gap-sm)">
      ${ciclos.filter(c => c.status === 'finalizado').map(c => `
        <div class="card card-sm" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-sm)">
          <div>
            <div style="font-weight:600">${Utils.esc(c.nome)}</div>
            <div style="font-size:.78rem;color:var(--txt-terciario)">
              ${Utils.formatarData(c.data_inicio)} → ${Utils.formatarData(c.data_fim)}
              · ${Utils.diasEntre(c.data_inicio, c.data_fim)} dias
            </div>
          </div>
          <span class="badge badge-cinza">Finalizado</span>
        </div>`).join('')}
    </div>` : ''}`;

  document.getElementById('btn-novo-ciclo')?.addEventListener('click', () => abrirModalNovoCiclo());
});

function abrirModalNovoCiclo() {
  Modal.abrir('Novo ciclo', `
    <div class="campo">
      <label>Nome do ciclo *</label>
      <input type="text" id="cic-nome" placeholder="Ex: Ciclo Janeiro 2026" />
    </div>
    <div class="campo">
      <label>Data de início *</label>
      <input type="date" id="cic-data" value="${Utils.hoje()}" />
    </div>
    <div class="campo">
      <label>Objetivo</label>
      <input type="text" id="cic-objetivo" placeholder="Ex: Testar nova genética" />
    </div>
    <div class="campo">
      <label>Observações</label>
      <textarea id="cic-obs" placeholder="Anotações iniciais..."></textarea>
    </div>
    <button class="btn btn-primary btn-full" id="btn-salvar-ciclo">Criar ciclo</button>`,
    { onOpen: () => {
      document.getElementById('btn-salvar-ciclo').onclick = async () => {
        const nome = document.getElementById('cic-nome').value.trim();
        const data = document.getElementById('cic-data').value;
        if (!nome || !data) { Toast.aviso('Preencha nome e data.'); return; }
        const btn = document.getElementById('btn-salvar-ciclo');
        btn.textContent = 'Salvando...'; btn.disabled = true;
        const res = await API.postCiclo({
          nome, data_inicio: data,
          objetivo: document.getElementById('cic-objetivo').value,
          observacoes: document.getElementById('cic-obs').value
        });
        if (res.ok) { Modal.fechar(); Toast.ok('Ciclo criado!'); Router.navegar('ciclos'); }
        else { Toast.erro(res.erro); btn.textContent = 'Criar ciclo'; btn.disabled = false; }
      };
    }}
  );
}

async function editarCiclo(id) {
  const res = await API.getCiclos();
  const ciclo = res.dados?.find(c => c.id === id);
  if (!ciclo) return;
  Modal.abrir('Editar ciclo', `
    <div class="campo">
      <label>Nome do ciclo</label>
      <input type="text" id="cic-edit-nome" value="${Utils.esc(ciclo.nome)}" />
    </div>
    <div class="campo">
      <label>Objetivo</label>
      <input type="text" id="cic-edit-obj" value="${Utils.esc(ciclo.objetivo)}" />
    </div>
    <div class="campo">
      <label>Observações</label>
      <textarea id="cic-edit-obs">${Utils.esc(ciclo.observacoes)}</textarea>
    </div>
    <button class="btn btn-primary btn-full" id="btn-upd-ciclo">Salvar alterações</button>`,
    { onOpen: () => {
      document.getElementById('btn-upd-ciclo').onclick = async () => {
        const res2 = await API.putCiclo(id, {
          nome:        document.getElementById('cic-edit-nome').value,
          objetivo:    document.getElementById('cic-edit-obj').value,
          observacoes: document.getElementById('cic-edit-obs').value
        });
        if (res2.ok) { Modal.fechar(); Toast.ok('Ciclo atualizado!'); Router.navegar('ciclos'); }
        else Toast.erro(res2.erro);
      };
    }}
  );
}

async function finalizarCiclo(id) {
  const ok = await Modal.confirmar('Finalizar ciclo', 'Tem certeza? O ciclo será marcado como finalizado e você poderá iniciar um novo.');
  if (!ok) return;
  const res = await API.putCiclo(id, { status: 'finalizado', data_fim: Utils.hoje() });
  if (res.ok) { Toast.ok('Ciclo finalizado!'); Router.navegar('ciclos'); }
  else Toast.erro(res.erro);
}
