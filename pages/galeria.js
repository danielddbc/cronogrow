/* CRONOGROW — Página de Galeria */
Router.registrar('galeria', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando galeria...</div>';

  const [resPlantas, resFotos] = await Promise.all([API.getPlantas({}), API.getFotos({})]);
  const plantas = resPlantas.dados || [];
  const todasFotos = resFotos.dados || [];

  // Estado de filtro
  let plantaFiltro = '';

  function renderGaleria(fotos) {
    if (fotos.length === 0) return `
      <div class="estado-vazio">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <h3>Nenhuma foto ainda</h3>
        <p>Adicione fotos ao registrar eventos nas plantas.</p>
      </div>`;

    // Agrupar por planta
    const porPlanta = {};
    fotos.forEach(f => {
      const pid = f.planta_id || 'sem_planta';
      if (!porPlanta[pid]) porPlanta[pid] = [];
      porPlanta[pid].push(f);
    });

    return Object.entries(porPlanta).map(([pid, fts]) => {
      const planta = plantas.find(p => p.id === pid);
      const cor    = planta?.cor || '#2ECC71';
      return `
        <div style="margin-bottom:var(--gap-xl)">
          <div style="display:flex;align-items:center;gap:var(--gap-sm);margin-bottom:var(--gap-md)">
            <div style="width:10px;height:10px;border-radius:50%;background:${cor}"></div>
            <div class="card-titulo" style="margin:0">${planta ? Utils.esc(planta.nome) : 'Sem planta'}</div>
            <span style="color:var(--txt-terciario);font-size:.75rem">${fts.length} foto${fts.length!==1?'s':''}</span>
          </div>
          <div class="galeria-grid">
            ${fts.map(f => `
              <div class="galeria-foto" onclick="verFotoGrande('${f.drive_url}','${Utils.esc(f.nome_arquivo)}')">
                <img src="${f.drive_url}" alt="${Utils.esc(f.nome_arquivo)}" loading="lazy"
                     onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--txt-terciario);font-size:.7rem\'>Erro</div>'" />
                <div style="position:absolute;bottom:0;right:0;padding:4px;display:flex;gap:4px">
                  <a href="${f.drive_url}" download target="_blank"
                     class="btn btn-ghost btn-sm" style="background:rgba(0,0,0,.5);padding:4px"
                     onclick="event.stopPropagation()" title="Download">⬇️</a>
                  <button class="btn btn-ghost btn-sm" style="background:rgba(0,0,0,.5);padding:4px"
                          onclick="event.stopPropagation();deletarFotoGaleria('${f.id}')" title="Excluir">🗑</button>
                </div>
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">🖼️ Galeria</h1>
        <p class="page-subtitulo">${Utils.plural(todasFotos.length, 'foto')}</p>
      </div>
    </div>

    <!-- Filtro por planta -->
    ${plantas.length > 1 ? `
    <div style="display:flex;gap:var(--gap-sm);flex-wrap:wrap;margin-bottom:var(--gap-lg);overflow-x:auto;padding-bottom:var(--gap-xs)">
      <button class="btn btn-primary btn-sm" id="filtro-todas" onclick="filtrarGaleria('')">Todas</button>
      ${plantas.map(p => `
        <button class="btn btn-outline btn-sm" id="filtro-${p.id}"
                style="border-left:3px solid ${p.cor||'#2ECC71'}"
                onclick="filtrarGaleria('${p.id}')">
          ${Utils.esc(p.nome)}
        </button>`).join('')}
    </div>` : ''}

    <div id="conteudo-galeria">
      ${renderGaleria(todasFotos)}
    </div>`;

  // Expor função de filtro globalmente
  window.filtrarGaleria = function(pid) {
    plantaFiltro = pid;
    const filtradas = pid ? todasFotos.filter(f => f.planta_id === pid) : todasFotos;
    document.getElementById('conteudo-galeria').innerHTML = renderGaleria(filtradas);
    // Atualizar botões de filtro
    document.querySelectorAll('[id^="filtro-"]').forEach(b => b.classList.remove('btn-primary'));
    document.querySelectorAll('[id^="filtro-"]').forEach(b => b.classList.add('btn-outline'));
    const ativo = document.getElementById(pid ? `filtro-${pid}` : 'filtro-todas');
    if (ativo) { ativo.classList.remove('btn-outline'); ativo.classList.add('btn-primary'); }
  };
});

// Lightbox simples
function verFotoGrande(url, nome) {
  Modal.abrir(`📷 ${nome || 'Foto'}`, `
    <div style="text-align:center">
      <img src="${url}" alt="${Utils.esc(nome)}"
           style="max-width:100%;max-height:65dvh;border-radius:var(--radius-md);object-fit:contain" />
    </div>
    <a href="${url}" target="_blank" class="btn btn-outline btn-full" style="margin-top:var(--gap-md)">
      ⬇️ Abrir em tamanho original
    </a>`
  );
}

async function deletarFotoGaleria(id) {
  const ok = await Modal.confirmar('Excluir foto', 'A foto será removida do Drive e da galeria.');
  if (!ok) return;
  const res = await API.deletarFoto(id);
  if (res.ok) { Toast.ok('Foto removida.'); Router.navegar('galeria'); }
  else Toast.erro(res.erro);
}
