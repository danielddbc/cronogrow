/* CRONOGROW — Página de Tarefas */
Router.registrar('tarefas', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando tarefas...</div>';

  const [resCiclos, resTarefas] = await Promise.all([API.getCiclos(), API.getTarefas({})]);
  const cicloAtivo = resCiclos.dados?.find(c => c.status === 'ativo');
  const tarefas    = resTarefas.dados || [];
  const pendentes  = tarefas.filter(t => t.concluida !== true && t.concluida !== 'TRUE');
  const concluidas = tarefas.filter(t => t.concluida === true  || t.concluida === 'TRUE');

  const fab = document.getElementById('fab');
  fab.style.display = 'flex';
  fab.onclick = () => abrirModalNovaTarefa(cicloAtivo?.id || '');

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">✅ Tarefas</h1>
        <p class="page-subtitulo">${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''}</p>
      </div>
      <button class="btn btn-primary" onclick="abrirModalNovaTarefa('${cicloAtivo?.id||''}')">+ Nova tarefa</button>
    </div>

    ${pendentes.length === 0 ? `
      <div class="estado-vazio" style="margin-bottom:var(--gap-xl)">
        <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <h3>Tudo em dia! 🎉</h3>
        <p>Nenhuma tarefa pendente.</p>
      </div>` : `
      <div class="card-titulo">Pendentes</div>
      <div style="display:flex;flex-direction:column;gap:var(--gap-sm);margin-bottom:var(--gap-xl)" id="lista-pendentes">
        ${pendentes.map(t => htmlTarefa(t)).join('')}
      </div>`}

    ${concluidas.length > 0 ? `
      <details>
        <summary style="cursor:pointer;color:var(--txt-terciario);font-size:.85rem;
          padding:var(--gap-sm) 0;border-top:1px solid var(--borda);list-style:none;
          display:flex;align-items:center;gap:var(--gap-sm)">
          ▸ Concluídas (${concluidas.length})
        </summary>
        <div style="display:flex;flex-direction:column;gap:var(--gap-sm);margin-top:var(--gap-md)" id="lista-concluidas">
          ${concluidas.map(t => htmlTarefa(t)).join('')}
        </div>
      </details>` : ''}`;
});

function htmlTarefa(t) {
  const feita = t.concluida === true || t.concluida === 'TRUE';
  const vencida = !feita && t.data_prazo && new Date(t.data_prazo) < new Date();
  return `
    <div class="tarefa-item ${feita ? 'concluida' : ''}" id="tar-${t.id}">
      <button class="tarefa-check ${feita ? 'marcada' : ''}"
              onclick="toggleTarefa('${t.id}', ${feita})"></button>
      <div style="flex:1">
        <div class="tarefa-titulo">${Utils.esc(t.titulo)}</div>
        ${t.descricao ? `<div style="font-size:.8rem;color:var(--txt-terciario);margin-top:2px">${Utils.esc(t.descricao)}</div>` : ''}
        ${t.data_prazo ? `<div class="tarefa-prazo" style="${vencida ? 'color:var(--vermelho)' : ''}">
          📅 ${Utils.formatarData(t.data_prazo)}${vencida ? ' · Vencida' : ''}
        </div>` : ''}
      </div>
      <div class="tarefa-acoes">
        <button class="btn btn-ghost btn-sm" onclick="editarTarefa('${t.id}')" title="Editar">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deletarTarefaConfirm('${t.id}')" title="Excluir">🗑</button>
      </div>
    </div>`;
}

async function toggleTarefa(id, feita) {
  const res = await API.putTarefa(id, { concluida: !feita });
  if (res.ok) { Toast.ok(feita ? 'Tarefa reaberta.' : 'Tarefa concluída! ✅'); Router.navegar('tarefas'); }
  else Toast.erro(res.erro);
}

function abrirModalNovaTarefa(cicloId) {
  Modal.abrir('Nova tarefa', `
    <div class="campo">
      <label>Título *</label>
      <input type="text" id="tar-titulo" placeholder="Ex: Fazer poda topping" />
    </div>
    <div class="campo">
      <label>Descrição</label>
      <textarea id="tar-desc" placeholder="Detalhes opcionais..."></textarea>
    </div>
    <div class="campo">
      <label>Data limite</label>
      <input type="date" id="tar-prazo" />
    </div>
    <button class="btn btn-primary btn-full" id="btn-salvar-tar">Criar tarefa</button>`,
    { onOpen: () => {
      document.getElementById('btn-salvar-tar').onclick = async () => {
        const titulo = document.getElementById('tar-titulo').value.trim();
        if (!titulo) { Toast.aviso('Título obrigatório.'); return; }
        const btn = document.getElementById('btn-salvar-tar');
        btn.textContent = 'Salvando...'; btn.disabled = true;
        const res = await API.postTarefa({
          ciclo_id:  cicloId,
          titulo,
          descricao: document.getElementById('tar-desc').value,
          data_prazo: document.getElementById('tar-prazo').value
        });
        if (res.ok) { Modal.fechar(); Toast.ok('Tarefa criada!'); Router.navegar('tarefas'); }
        else { Toast.erro(res.erro); btn.textContent = 'Criar tarefa'; btn.disabled = false; }
      };
    }}
  );
}

async function editarTarefa(id) {
  const res = await API.getTarefas({});
  const t = res.dados?.find(x => x.id === id);
  if (!t) return;
  Modal.abrir('Editar tarefa', `
    <div class="campo">
      <label>Título</label>
      <input type="text" id="edit-tar-titulo" value="${Utils.esc(t.titulo)}" />
    </div>
    <div class="campo">
      <label>Descrição</label>
      <textarea id="edit-tar-desc">${Utils.esc(t.descricao)}</textarea>
    </div>
    <div class="campo">
      <label>Data limite</label>
      <input type="date" id="edit-tar-prazo" value="${t.data_prazo||''}" />
    </div>
    <button class="btn btn-primary btn-full" id="btn-upd-tar">Salvar</button>`,
    { onOpen: () => {
      document.getElementById('btn-upd-tar').onclick = async () => {
        const r2 = await API.putTarefa(id, {
          titulo:     document.getElementById('edit-tar-titulo').value,
          descricao:  document.getElementById('edit-tar-desc').value,
          data_prazo: document.getElementById('edit-tar-prazo').value
        });
        if (r2.ok) { Modal.fechar(); Toast.ok('Tarefa atualizada!'); Router.navegar('tarefas'); }
        else Toast.erro(r2.erro);
      };
    }}
  );
}

async function deletarTarefaConfirm(id) {
  const ok = await Modal.confirmar('Excluir tarefa', 'Remover esta tarefa permanentemente?');
  if (!ok) return;
  const res = await API.deletarTarefa(id);
  if (res.ok) { Toast.ok('Tarefa removida.'); Router.navegar('tarefas'); }
  else Toast.erro(res.erro);
}
