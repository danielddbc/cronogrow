/* CRONOGROW — Serviço de API */

const API = (() => {
  // ⚠️ Substitua pela URL gerada no deploy do Apps Script
  const BASE_URL = localStorage.getItem('cg_api_url') || '';

  function token() { return localStorage.getItem('cg_token') || ''; }

  async function get(rota, params = {}) {
    const url = new URL(BASE_URL);
    url.searchParams.set('rota', rota);
    url.searchParams.set('token', token());
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return res.json();
  }

  async function post(rota, body = {}, metodo = 'POST') {
    const url = new URL(BASE_URL);
    url.searchParams.set('rota', rota);
    url.searchParams.set('token', token());
    if (metodo !== 'POST') url.searchParams.set('metodo', metodo);
    const res = await fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async function upload(plantaId, eventoId, arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const base64 = e.target.result.split(',')[1];
        const res = await post('upload', {
          base64, planta_id: plantaId, evento_id: eventoId,
          nome_arquivo: arquivo.name, mime_type: arquivo.type
        });
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
  }

  return {
    ping:           ()         => get('ping'),
    login:          body       => post('login', body),
    registrar:      body       => post('registrar', body),
    logout:         ()         => post('logout'),
    dashboard:      ()         => get('dashboard'),
    getCiclos:      ()         => get('ciclos'),
    postCiclo:      b          => post('ciclo', b),
    putCiclo:       (id, b)    => post('ciclo', b, 'PUT') || get('ciclo', {id}),
    deletarCiclo:   id         => post('ciclo', {}, 'DELETE') || get('ciclo', {id}),
    getPlantas:     p          => get('plantas', p),
    getPlanta:      id         => get('planta', {id}),
    postPlanta:     b          => post('planta', b),
    putPlanta:      (id, b)    => { const u = new URL(BASE_URL); u.searchParams.set('rota','planta'); u.searchParams.set('token',token()); u.searchParams.set('metodo','PUT'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:JSON.stringify(b)}).then(r=>r.json()); },
    deletarPlanta:  id         => { const u = new URL(BASE_URL); u.searchParams.set('rota','planta'); u.searchParams.set('token',token()); u.searchParams.set('metodo','DELETE'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:'{}'}).then(r=>r.json()); },
    getEventos:     p          => get('eventos', p),
    postEvento:     b          => post('evento', b),
    deletarEvento:  id         => { const u = new URL(BASE_URL); u.searchParams.set('rota','evento'); u.searchParams.set('token',token()); u.searchParams.set('metodo','DELETE'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:'{}'}).then(r=>r.json()); },
    getTarefas:     p          => get('tarefas', p),
    postTarefa:     b          => post('tarefa', b),
    putTarefa:      (id, b)    => { const u = new URL(BASE_URL); u.searchParams.set('rota','tarefa'); u.searchParams.set('token',token()); u.searchParams.set('metodo','PUT'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:JSON.stringify(b)}).then(r=>r.json()); },
    deletarTarefa:  id         => { const u = new URL(BASE_URL); u.searchParams.set('rota','tarefa'); u.searchParams.set('token',token()); u.searchParams.set('metodo','DELETE'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:'{}'}).then(r=>r.json()); },
    getDiario:      p          => get('diario', p),
    postDiario:     b          => post('diario', b),
    putDiario:      (id, b)    => { const u = new URL(BASE_URL); u.searchParams.set('rota','diario'); u.searchParams.set('token',token()); u.searchParams.set('metodo','PUT'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:JSON.stringify(b)}).then(r=>r.json()); },
    deletarDiario:  id         => { const u = new URL(BASE_URL); u.searchParams.set('rota','diario'); u.searchParams.set('token',token()); u.searchParams.set('metodo','DELETE'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:'{}'}).then(r=>r.json()); },
    getFotos:       p          => get('fotos', p),
    deletarFoto:    id         => { const u = new URL(BASE_URL); u.searchParams.set('rota','foto'); u.searchParams.set('token',token()); u.searchParams.set('metodo','DELETE'); u.searchParams.set('id',id); return fetch(u.toString(),{method:'POST',body:'{}'}).then(r=>r.json()); },
    upload,
    getRelatorio:   p          => get('relatorio', p),
    salvarConfig:   b          => post('config', b),
    setApiUrl:      url        => localStorage.setItem('cg_api_url', url),
    getApiUrl:      ()         => localStorage.getItem('cg_api_url') || ''
  };
})();
