/* CRONOGROW — Página de Relatórios */
Router.registrar('relatorios', async (el) => {
  el.innerHTML = '<div class="loader-inline">Carregando relatório...</div>';

  const [resCiclos] = await Promise.all([API.getCiclos()]);
  const ciclos     = resCiclos.dados || [];
  const cicloAtivo = ciclos.find(c => c.status === 'ativo');

  // Ciclo selecionado (padrão: ativo ou último)
  let cicloId = cicloAtivo?.id || ciclos[ciclos.length - 1]?.id || '';

  async function carregarRelatorio(cid) {
    const div = document.getElementById('rel-conteudo');
    if (!div) return;
    div.innerHTML = '<div class="loader-inline">Gerando relatório...</div>';
    const res = await API.getRelatorio({ ciclo_id: cid });
    if (!res.ok) { div.innerHTML = `<div class="estado-vazio"><h3>Erro</h3><p>${res.erro}</p></div>`; return; }
    const d = res.dados;

    // Montar barras de estágio
    const statusCores = { ativa:'var(--cor-primaria)', perdida:'var(--vermelho)', colhida:'var(--amarelo)', curando:'var(--azul)', finalizada:'var(--txt-terciario)' };
    const statusNomes = { ativa:'Ativas', perdida:'Perdidas', colhida:'Colhidas', curando:'Curando', finalizada:'Finalizadas' };

    div.innerHTML = `
      <!-- Resumo do ciclo -->
      <div class="card" style="margin-bottom:var(--gap-lg)">
        <div class="card-titulo">📋 Resumo do ciclo</div>
        <div style="font-family:var(--fonte-display);font-size:1.3rem;font-weight:700;margin-bottom:var(--gap-sm)">
          ${Utils.esc(d.ciclo.nome)}
        </div>
        <div class="grid-2" style="gap:var(--gap-sm)">
          <div class="stat-card">
            <div class="stat-label">⏱ Duração</div>
            <div class="stat-valor">${d.duracao_dias}</div>
            <div class="stat-sub">dias de ciclo</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🪴 Plantas</div>
            <div class="stat-valor">${d.total_plantas}</div>
            <div class="stat-sub">cadastradas</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">📅 Eventos</div>
            <div class="stat-valor">${d.total_eventos}</div>
            <div class="stat-sub">registrados</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">✅ Tarefas</div>
            <div class="stat-valor">${d.tarefas_feitas}<span style="font-size:1rem;color:var(--txt-terciario)">/${d.total_tarefas}</span></div>
            <div class="stat-sub">concluídas</div>
          </div>
        </div>
      </div>

      <!-- Status das plantas -->
      ${Object.keys(d.plantas_status).length > 0 ? `
      <div class="card" style="margin-bottom:var(--gap-lg)">
        <div class="card-titulo">🌿 Plantas por status</div>
        ${Object.entries(d.plantas_status).map(([s, n]) => `
          <div style="display:flex;align-items:center;gap:var(--gap-md);margin-bottom:var(--gap-sm)">
            <div style="width:90px;font-size:.8rem;color:var(--txt-secundario)">${statusNomes[s]||s}</div>
            <div style="flex:1;background:var(--bg-card-2);border-radius:var(--radius-full);height:8px;overflow:hidden">
              <div style="width:${Math.round(n/d.total_plantas*100)}%;height:100%;background:${statusCores[s]||'var(--cor-primaria)'};border-radius:var(--radius-full);transition:width .5s ease"></div>
            </div>
            <div style="font-family:var(--fonte-display);font-weight:700;min-width:24px;text-align:right">${n}</div>
          </div>`).join('')}
      </div>` : ''}

      <!-- Detalhes por planta -->
      <div class="card-titulo">🌱 Detalhes por planta</div>
      <div style="display:flex;flex-direction:column;gap:var(--gap-md);margin-bottom:var(--gap-xl)">
        ${d.plantas.map(p => {
          const cal = p.calculadora || {};
          return `
          <div class="card card-sm" style="border-left:4px solid ${p.cor||'#2ECC71'}">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--gap-sm)">
              <div>
                <div style="font-weight:700">${Utils.esc(p.nome)}</div>
                <div style="font-size:.75rem;color:var(--txt-terciario)">${Utils.esc(p.codigo)}</div>
              </div>
              ${Utils.statusPlantaBadge(p.status)}
            </div>
            <div class="calc-grid" style="margin-top:var(--gap-sm)">
              ${cal.desde_agua    !== null && cal.desde_agua    !== undefined ? `<div class="calc-badge"><div class="calc-badge-label">Total</div><div class="calc-badge-dias">${cal.desde_agua}</div><div class="calc-badge-sub">dias</div></div>` : ''}
              ${cal.dias_vegetativo !== null && cal.dias_vegetativo !== undefined ? `<div class="calc-badge"><div class="calc-badge-label">Veg</div><div class="calc-badge-dias">${cal.dias_vegetativo}</div><div class="calc-badge-sub">dias</div></div>` : ''}
              ${cal.dias_floracao  !== null && cal.dias_floracao  !== undefined ? `<div class="calc-badge"><div class="calc-badge-label">Flora</div><div class="calc-badge-dias">${cal.dias_floracao}</div><div class="calc-badge-sub">dias</div></div>` : ''}
              <div class="calc-badge"><div class="calc-badge-label">Eventos</div><div class="calc-badge-dias">${p.total_eventos}</div><div class="calc-badge-sub">registrados</div></div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Exportar -->
      <div class="card">
        <div class="card-titulo">📤 Exportar relatório</div>
        <div style="display:flex;gap:var(--gap-md);flex-wrap:wrap">
          <button class="btn btn-outline" onclick="exportarCSV(${JSON.stringify(d).replace(/"/g,'&quot;')})">⬇️ Exportar CSV</button>
          <button class="btn btn-outline" onclick="exportarTexto(${JSON.stringify(d).replace(/"/g,'&quot;')})">📄 Exportar texto</button>
        </div>
        <p style="font-size:.78rem;color:var(--txt-terciario);margin-top:var(--gap-sm)">
          Para exportar PDF, use o menu de impressão do navegador (Ctrl+P) e escolha "Salvar como PDF".
        </p>
      </div>`;
  }

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-titulo">📊 Relatórios</h1>
        <p class="page-subtitulo">Resumo do ciclo de cultivo</p>
      </div>
    </div>

    ${ciclos.length > 1 ? `
    <div class="campo" style="margin-bottom:var(--gap-lg);max-width:320px">
      <label>Selecionar ciclo</label>
      <select id="sel-ciclo" onchange="document.getElementById('rel-conteudo').innerHTML='';carregarRelatorioPage(this.value)">
        ${ciclos.map(c => `<option value="${c.id}" ${c.id===cicloId?'selected':''}>${Utils.esc(c.nome)}</option>`).join('')}
      </select>
    </div>` : ''}

    <div id="rel-conteudo"></div>`;

  window.carregarRelatorioPage = carregarRelatorio;

  if (cicloId) carregarRelatorio(cicloId);
  else el.querySelector('#rel-conteudo').innerHTML = `<div class="estado-vazio"><h3>Nenhum ciclo encontrado</h3><p>Crie um ciclo primeiro.</p></div>`;
});

function exportarCSV(dados) {
  const linhas = [
    ['Planta','Código','Status','Dias total','Dias veg','Dias floração','Total eventos'],
    ...dados.plantas.map(p => [
      p.nome, p.codigo, p.status,
      p.calculadora?.desde_agua ?? '',
      p.calculadora?.dias_vegetativo ?? '',
      p.calculadora?.dias_floracao ?? '',
      p.total_eventos
    ])
  ];
  const csv = linhas.map(l => l.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `cronogrow-${dados.ciclo.nome.replace(/\s+/g,'-')}.csv`;
  a.click(); URL.revokeObjectURL(url);
  Toast.ok('CSV exportado!');
}

function exportarTexto(dados) {
  const linhas = [
    `CRONOGROW — Relatório de Ciclo`,
    `================================`,
    `Ciclo: ${dados.ciclo.nome}`,
    `Início: ${Utils.formatarData(dados.ciclo.data_inicio)}`,
    `Duração: ${dados.duracao_dias} dias`,
    `Total de plantas: ${dados.total_plantas}`,
    `Total de eventos: ${dados.total_eventos}`,
    `Tarefas concluídas: ${dados.tarefas_feitas}/${dados.total_tarefas}`,
    ``,
    `PLANTAS`,
    `-------`,
    ...dados.plantas.map(p => [
      `${p.nome} (${p.codigo}) — ${p.status}`,
      `  Genética: ${p.genetica || '—'}`,
      `  Dias totais: ${p.calculadora?.desde_agua ?? '—'}`,
      `  Dias vegetativo: ${p.calculadora?.dias_vegetativo ?? '—'}`,
      `  Dias floração: ${p.calculadora?.dias_floracao ?? '—'}`,
      `  Eventos: ${p.total_eventos}`,
    ].join('\n')),
    ``,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
  ].join('\n');
  const blob = new Blob([linhas], { type: 'text/plain;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `cronogrow-${dados.ciclo.nome.replace(/\s+/g,'-')}.txt`;
  a.click(); URL.revokeObjectURL(url);
  Toast.ok('Arquivo exportado!');
}
