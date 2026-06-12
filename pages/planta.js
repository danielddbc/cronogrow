/* CRONOGROW — Página de detalhe da planta */

// Registra rotas dinâmicas: planta-PLT001, planta-PLT002...
function registrarRotaPlanta(id) {
  Router.registrar('planta-' + id, (el) => carregarPlanta(el, id));
}

async function carregarPlanta(el, id) {
  el.innerHTML = '<div class="loader-inline">Carregando planta...</div>';
  const res = await API.getPlanta(id);
  if (!res.ok) { el.innerHTML = `<div class="estado-vazio"><h3>Planta não encontrada</h3></div>`; return; }
  const p   = res.dados;
  const cal = p.calculadora || {};

  // FAB → registrar evento
  const fab = document.getElementById('fab');
  fab.style.display = 'flex';
  fab.onclick = () => abrirModalEvento(p.id, p.ciclo_id);

  el.innerHTML = `
    <!-- Cabeçalho da planta -->
    <div style="display:flex;align-items:flex-start;gap:var(--gap-md);margin-bottom:var(--gap-xl);flex-wrap:wrap">
      <div style="width:12px;min-height:60px;border-radius:6px;background:${p.cor||'#2ECC71'};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:var(--gap-sm);flex-wrap:wrap">
          <h1 class="page-titulo" style="margin:0">${Utils.esc(p.nome)}</h1>
          ${Utils.statusPlantaBadge(p.status)}
        </div>
        <div style="color:var(--txt-terciario);font-size:.8rem;margin-top:4px;font-family:monospace">${Utils.esc(p.codigo)}</div>
        <div style="display:flex;gap:var(--gap-sm);flex-wrap:wrap;margin-top:var(--gap-sm)">
          ${p.genetica ? `<span class="badge badge-cinza">🧬 ${Utils.esc(p.genetica)}</span>` : ''}
          ${p.tipo     ? `<span class="badge badge-cinza">${Utils.esc(p.tipo)}</span>` : ''}
          ${p.origem   ? `<span class="badge badge-cinza">📦 ${Utils.esc(p.origem)}</span>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:var(--gap-sm)">
        <button class="btn btn-outline btn-sm" onclick="editarPlanta('${p.id}')">Editar</button>
        <button class="btn btn-perigo btn-sm"  onclick="deletarPlantaConfirm('${p.id}')">Excluir</button>
      </div>
    </div>

    <!-- Calculadora de dias -->
    <div class="card" style="margin-bottom:var(--gap-lg)">
      <div class="card-titulo">🧮 Calculadora de dias</div>
      <div class="calc-grid">
        ${[
          ['Desde água',    cal.desde_agua,      'dias totais'],
          ['Desde terra',   cal.desde_terra,     'dias no substrato'],
          ['Vegetativo',    cal.dias_vegetativo, 'dias nesta fase'],
          ['Floração',      cal.dias_floracao,   'dias nesta fase'],
          ['Secagem',       cal.dias_secagem,    'dias secando'],
          ['Cura',          cal.dias_cura,       'dias curando'],
        ].filter(([,v]) => v !== null && v !== undefined).map(([l, v, s]) => `
          <div class="calc-badge">
            <div class="calc-badge-label">${l}</div>
            <div class="calc-badge-dias">${v}</div>
            <div class="calc-badge-sub">${s}</div>
          </div>`).join('') || '<p style="color:var(--txt-terciario);font-size:.85rem">Nenhum evento registrado ainda.</p>'}
      </div>
    </div>

    <!-- Timeline de eventos -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--gap-md)">
      <div class="card-titulo" style="margin:0">📅 Linha do tempo</div>
      <button class="btn btn-primary btn-sm" onclick="abrirModalEvento('${p.id}','${p.ciclo_id}')">+ Evento</button>
    </div>

    ${p.eventos.length === 0 ? `
      <div class="estado-vazio">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>Nenhum evento ainda</h3>
        <p>Toque no + para registrar o primeiro evento desta planta.</p>
      </div>` : `
      <div class="timeline" id="timeline-planta">
        ${p.eventos.map((e, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i === p.eventos.length-1 ? 'ativo' : ''}">
              ${Utils.eventoEmoji[e.tipo] || '📌'}
            </div>
            <div class="timeline-conteudo">
              <div class="timeline-dia">Dia ${e.dia_relativo || 0}</div>
              <div class="timeline-tipo">${Utils.eventoNome[e.tipo] || e.tipo}${e.subtipo ? ` · ${e.subtipo}` : ''}</div>
              <div class="timeline-data">${Utils.formatarData(e.data)}${e.hora ? ' às ' + e.hora : ''}</div>
              ${e.observacoes ? `<div class="timeline-obs">${Utils.esc(e.observacoes)}</div>` : ''}
              <div style="display:flex;gap:var(--gap-sm);margin-top:var(--gap-xs)">
                <button class="btn btn-ghost btn-sm" onclick="verFotosEvento('${e.id}','${p.id}')">📷 Fotos</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--vermelho)" onclick="deletarEvento('${e.id}','${p.id}')">🗑</button>
              </div>
            </div>
          </div>`).join('')}
      </div>`}

    ${p.observacoes ? `
      <div class="card" style="margin-top:var(--gap-lg)">
        <div class="card-titulo">📝 Observações</div>
        <p style="color:var(--txt-secundario);font-size:.9rem;line-height:1.6">${Utils.esc(p.observacoes)}</p>
      </div>` : ''}`;
}

// ── Modal de novo evento ─────────────────────────────────────────
const TIPOS_EVENTO = [
  {tipo:'agua',             nome:'💧 Semente na água'},
  {tipo:'papel',            nome:'📄 Foi para papel'},
  {tipo:'germinou',         nome:'🌱 Germinou'},
  {tipo:'terra',            nome:'🪴 Foi para terra'},
  {tipo:'emergiu',          nome:'🌿 Emergiu'},
  {tipo:'primeiro_par',     nome:'🍃 Primeiro par de folhas'},
  {tipo:'transplante',      nome:'♻️ Transplante'},
  {tipo:'inicio_vegetativo',nome:'☀️ Início vegetativo'},
  {tipo:'poda',             nome:'✂️ Poda', subtipos:['Top','FIM','Limpeza','Outra']},
  {tipo:'amarracao',        nome:'🪢 Amarração'},
  {tipo:'desfolha',         nome:'🍂 Desfolha'},
  {tipo:'troca_vaso',       nome:'🪣 Troca de vaso'},
  {tipo:'mudanca_luz',      nome:'💡 Mudança de iluminação'},
  {tipo:'mudanca_ambiente', nome:'🏠 Mudança de ambiente'},
  {tipo:'inicio_floracao',  nome:'🌸 Início floração'},
  {tipo:'lavagem',          nome:'🚿 Lavagem'},
  {tipo:'colheita',         nome:'🌾 Colheita'},
  {tipo:'inicio_secagem',   nome:'🌬️ Início secagem'},
  {tipo:'inicio_cura',      nome:'🫙 Início cura'},
  {tipo:'finalizacao',      nome:'🏁 Finalização'},
];

let _tipoSelecionado = null;

function abrirModalEvento(plantaId, cicloId) {
  _tipoSelecionado = null;
  Modal.abrir('Registrar evento', `
    <div class="campo" style="margin-bottom:var(--gap-sm)">
      <label>Tipo de evento *</label>
      <div class="evento-tipos">
        ${TIPOS_EVENTO.map(t => `
          <button class="evento-tipo-btn" data-tipo="${t.tipo}" onclick="selecionarTipoEvento(this,'${t.tipo}')">
            ${t.nome}
          </button>`).join('')}
      </div>
    </div>
    <div id="subtipo-wrap" style="display:none" class="campo">
      <label>Tipo de poda</label>
      <select id="evt-subtipo">
        <option value="">Selecione...</option>
        <option>Top</option><option>FIM</option><option>Limpeza</option><option>Outra</option>
      </select>
    </div>
    <div class="grid-2">
      <div class="campo">
        <label>Data *</label>
        <input type="date" id="evt-data" value="${Utils.hoje()}" />
      </div>
      <div class="campo">
        <label>Hora</label>
        <input type="time" id="evt-hora" value="${Utils.horaAgora()}" />
      </div>
    </div>
    <div class="campo">
      <label>Observações</label>
      <textarea id="evt-obs" placeholder="O que você observou?"></textarea>
    </div>
    <button class="btn btn-primary btn-full" id="btn-salvar-evento">Registrar evento</button>`,
    { onOpen: () => {
      document.getElementById('btn-salvar-evento').onclick = async () => {
        if (!_tipoSelecionado) { Toast.aviso('Selecione o tipo de evento.'); return; }
        const btn = document.getElementById('btn-salvar-evento');
        btn.textContent = 'Salvando...'; btn.disabled = true;
        const res = await API.postEvento({
          planta_id:   plantaId,
          ciclo_id:    cicloId,
          tipo:        _tipoSelecionado,
          subtipo:     document.getElementById('evt-subtipo')?.value || '',
          data:        document.getElementById('evt-data').value,
          hora:        document.getElementById('evt-hora').value,
          observacoes: document.getElementById('evt-obs').value
        });
        if (res.ok) {
          Modal.fechar();
          Toast.ok('Evento registrado! Dia ' + res.dados.dia_relativo);
          carregarPlanta(document.getElementById('main-content'), plantaId);
        } else {
          Toast.erro(res.erro);
          btn.textContent = 'Registrar evento'; btn.disabled = false;
        }
      };
    }}
  );
}

function selecionarTipoEvento(el, tipo) {
  document.querySelectorAll('.evento-tipo-btn').forEach(b => b.classList.remove('ativo'));
  el.classList.add('ativo');
  _tipoSelecionado = tipo;
  document.getElementById('subtipo-wrap').style.display = tipo === 'poda' ? 'flex' : 'none';
}

// ── Editar planta ─────────────────────────────────────────────────
async function editarPlanta(id) {
  const res = await API.getPlanta(id);
  if (!res.ok) return;
  const p = res.dados;
  Modal.abrir('Editar planta', `
    <div class="campo">
      <label>Nome</label>
      <input type="text" id="edit-nome" value="${Utils.esc(p.nome)}" />
    </div>
    <div class="grid-2">
      <div class="campo">
        <label>Genética</label>
        <input type="text" id="edit-gen" value="${Utils.esc(p.genetica)}" />
      </div>
      <div class="campo">
        <label>Tipo</label>
        <select id="edit-tipo">
          <option value="">—</option>
          ${['feminizada','automatica','fotoperiodo','clone'].map(t =>
            `<option value="${t}" ${p.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="campo">
      <label>Status</label>
      <select id="edit-status">
        ${['ativa','perdida','colhida','curando','finalizada'].map(s =>
          `<option value="${s}" ${p.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="campo">
      <label>Cor identificadora</label>
      <div class="cor-picker">
        ${Utils.coresPlanta.map(c => `
          <div class="cor-opcao ${c===p.cor?'selecionada':''}" style="background:${c}" data-cor="${c}"
               onclick="selecionarCor(this)"></div>`).join('')}
      </div>
    </div>
    <div class="campo">
      <label>Observações</label>
      <textarea id="edit-obs">${Utils.esc(p.observacoes)}</textarea>
    </div>
    <button class="btn btn-primary btn-full" id="btn-upd-planta">Salvar</button>`,
    { onOpen: () => {
      document.getElementById('btn-upd-planta').onclick = async () => {
        const cor = document.querySelector('.cor-opcao.selecionada')?.dataset.cor || p.cor;
        const r2 = await API.putPlanta(id, {
          nome:        document.getElementById('edit-nome').value,
          genetica:    document.getElementById('edit-gen').value,
          tipo:        document.getElementById('edit-tipo').value,
          status:      document.getElementById('edit-status').value,
          observacoes: document.getElementById('edit-obs').value,
          cor
        });
        if (r2.ok) { Modal.fechar(); Toast.ok('Planta atualizada!'); carregarPlanta(document.getElementById('main-content'), id); }
        else Toast.erro(r2.erro);
      };
    }}
  );
}

async function deletarPlantaConfirm(id) {
  const ok = await Modal.confirmar('Excluir planta', 'Esta ação é irreversível. Todos os eventos desta planta serão mantidos na planilha.');
  if (!ok) return;
  const res = await API.deletarPlanta(id);
  if (res.ok) { Toast.ok('Planta removida.'); Router.navegar('plantas'); }
  else Toast.erro(res.erro);
}

async function deletarEvento(eventoId, plantaId) {
  const ok = await Modal.confirmar('Excluir evento', 'Remover este evento da timeline?');
  if (!ok) return;
  const res = await API.deletarEvento(eventoId);
  if (res.ok) { Toast.ok('Evento removido.'); carregarPlanta(document.getElementById('main-content'), plantaId); }
  else Toast.erro(res.erro);
}

// ── Fotos do evento ───────────────────────────────────────────────
async function verFotosEvento(eventoId, plantaId) {
  const res = await API.getFotos({ evento_id: eventoId });
  const fotos = res.dados || [];
  Modal.abrir('📷 Fotos do evento', `
    ${fotos.length === 0
      ? '<p style="color:var(--txt-terciario);text-align:center">Nenhuma foto ainda.</p>'
      : `<div class="galeria-grid">${fotos.map(f => `
          <div class="galeria-foto">
            <img src="${f.drive_url}" alt="foto" loading="lazy"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231A3A1C%22 width=%22100%22 height=%22100%22/></svg>'" />
          </div>`).join('')}</div>`}
    <div style="margin-top:var(--gap-md)">
      <label class="btn btn-outline btn-full" style="cursor:pointer">
        📎 Adicionar foto
        <input type="file" accept="image/*" style="display:none"
               onchange="uploadFotoEvento(this,'${eventoId}','${plantaId}')" />
      </label>
    </div>`
  );
}

async function uploadFotoEvento(input, eventoId, plantaId) {
  const arquivo = input.files[0];
  if (!arquivo) return;
  Toast.show('Enviando foto...', 'info', 8000);
  const res = await API.upload(plantaId, eventoId, arquivo);
  Modal.fechar();
  if (res.ok) { Toast.ok('Foto enviada!'); }
  else Toast.erro('Erro no upload: ' + res.erro);
}
