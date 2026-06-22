/* CRONOGROW — Página de Diário */
Router.registrar('diario', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando diário...</div>';

  const [resCiclos, resDiario] = await Promise.all([API.getCiclos(), API.getDiario({})]);
  const cicloAtivo = resCiclos.dados?.find(c => c.status === 'ativo');
  let entradas = resDiario.dados || [];

  const fab = document.getElementById('fab');
  fab.style.display = 'flex';
  fab.onclick = () => abrirModalNovaEntrada(cicloAtivo?.id || '');

  function renderEntradas(lista) {
    if (lista.length === 0) return `
      <div class="estado-vazio">
        <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <h3>Diário vazio</h3>
        <p>Registre observações, descobertas e momentos do cultivo.</p>
      </div>`;
    return lista.map(e => `
      <div class="diario-entrada" id="dia-${e.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--gap-sm)">
          <div class="diario-data">📅 ${Utils.formatarData(e.data)}</div>
          <div style="display:flex;gap:var(--gap-xs)">
            <button class="btn btn-ghost btn-sm" onclick="editarEntrada('${e.id}')">✏️</button>
            <button class="btn btn-ghost btn-sm" onclick="deletarEntradaConfirm('${e.id}')">🗑</button>
          </div>
        </div>
        ${e.titulo ? `<div class="diario-titulo">${Utils.esc(e.titulo)}</div>` : ''}
        <div class="diario-texto">${Utils.esc(e.texto)}</div>
        ${e.tags ? `<div class="diario-tags">
          ${e.tags.split(',').filter(Boolean).map(tag =>
            `<span class="diario-tag">#${Utils.esc(tag.trim())}</span>`).join('')}
        </div>` : ''}
      </div>`).join('');
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">📓 Diário</h1>
        <p class="page-subtitulo">${Utils.plural(entradas.length, 'anotação', 'anotações')}</p>
      </div>
      <button class="btn btn-primary" onclick="abrirModalNovaEntrada('${cicloAtivo?.id||''}')">+ Anotação</button>
    </div>

    <!-- Busca -->
    <div class="busca-bar" style="margin-bottom:var(--gap-lg)">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="busca-diario" placeholder="Buscar anotações..." />
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--gap-md)" id="lista-diario">
      ${renderEntradas(entradas)}
    </div>`;

  // Busca em tempo real
  document.getElementById('busca-diario').addEventListener('input', async function() {
    const q = this.value.trim();
    if (q.length === 0) {
      document.getElementById('lista-diario').innerHTML = renderEntradas(entradas);
      return;
    }
    if (q.length < 2) return;
    const res = await API.getDiario({ busca: q });
    document.getElementById('lista-diario').innerHTML = renderEntradas(res.dados || []);
  });
});

function abrirModalNovaEntrada(cicloId) {
  Modal.abrir('Nova anotação', `
    <div class="campo">
      <label>Data</label>
      <input type="date" id="dia-data" value="${Utils.hoje()}" />
    </div>
    <div class="campo">
      <label>Título (opcional)</label>
      <input type="text" id="dia-titulo" placeholder="Ex: Observação interessante..." />
    </div>
    <div class="campo">
      <label>Anotação *</label>
      <textarea id="dia-texto" placeholder="O que você observou hoje?" style="min-height:120px"></textarea>
    </div>
    <div class="campo">
      <label>Tags (separadas por vírgula)</label>
      <input type="text" id="dia-tags" placeholder="Ex: crescimento, rega, observação" />
    </div>
    <button class="btn btn-primary btn-full" id="btn-salvar-dia">Salvar anotação</button>`,
    { onOpen: () => {
      document.getElementById('dia-texto').focus();
      document.getElementById('btn-salvar-dia').onclick = async () => {
        const texto = document.getElementById('dia-texto').value.trim();
        if (!texto) { Toast.aviso('Escreva algo antes de salvar.'); return; }
        const btn = document.getElementById('btn-salvar-dia');
        btn.textContent = 'Salvando...'; btn.disabled = true;
        const res = await API.postDiario({
          ciclo_id: cicloId,
          data:     document.getElementById('dia-data').value,
          titulo:   document.getElementById('dia-titulo').value,
          texto,
          tags:     document.getElementById('dia-tags').value
        });
        if (res.ok) { Modal.fechar(); Toast.ok('Anotação salva!'); Router.navegar('diario'); }
        else { Toast.erro(res.erro); btn.textContent = 'Salvar anotação'; btn.disabled = false; }
      };
    }}
  );
}

async function editarEntrada(id) {
  const res = await API.getDiario({});
  const e = res.dados?.find(x => x.id === id);
  if (!e) return;
  Modal.abrir('Editar anotação', `
    <div class="campo">
      <label>Data</label>
      <input type="date" id="edit-dia-data" value="${e.data||Utils.hoje()}" />
    </div>
    <div class="campo">
      <label>Título</label>
      <input type="text" id="edit-dia-titulo" value="${Utils.esc(e.titulo)}" />
    </div>
    <div class="campo">
      <label>Anotação</label>
      <textarea id="edit-dia-texto" style="min-height:120px">${Utils.esc(e.texto)}</textarea>
    </div>
    <div class="campo">
      <label>Tags</label>
      <input type="text" id="edit-dia-tags" value="${Utils.esc(e.tags)}" />
    </div>
    <button class="btn btn-primary btn-full" id="btn-upd-dia">Salvar</button>`,
    { onOpen: () => {
      document.getElementById('btn-upd-dia').onclick = async () => {
        const r2 = await API.putDiario(id, {
          titulo: document.getElementById('edit-dia-titulo').value,
          texto:  document.getElementById('edit-dia-texto').value,
          tags:   document.getElementById('edit-dia-tags').value
        });
        if (r2.ok) { Modal.fechar(); Toast.ok('Anotação atualizada!'); Router.navegar('diario'); }
        else Toast.erro(r2.erro);
      };
    }}
  );
}

async function deletarEntradaConfirm(id) {
  const ok = await Modal.confirmar('Excluir anotação', 'Remover esta anotação permanentemente?');
  if (!ok) return;
  const res = await API.deletarDiario(id);
  if (res.ok) { Toast.ok('Anotação removida.'); Router.navegar('diario'); }
  else Toast.erro(res.erro);
}
