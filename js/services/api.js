/* CRONOGROW — Serviço de API */

const API = (() => {
  // ⚠️ COLE AQUI a URL gerada no deploy do Apps Script (Etapa 2).
  // Isso fixa a URL no código-fonte — não depende mais do localStorage do navegador.
  const BASE_URL = "https://script.google.com/macros/s/AKfycbxWQtMbKon8PMmuBZnuXBirBwR4xE2iTXNE848k311ARWM_F9O01OijXUcN1YHAjw0w/exec";

  function token() { return localStorage.getItem('cg_token') || ''; }

  // Quando o token expira/é inválido (código 401), volta para a tela de
  // login automaticamente, em vez de deixar a página presa num erro genérico.
  function tratarRespostaAuth(res) {
    if (!res.ok && res.codigo === 401) {
      localStorage.removeItem('cg_token');
      try { Toast.aviso('Sua sessão expirou. Faça login novamente.'); } catch (e) {}
      setTimeout(() => location.reload(), 1200);
    }
    return res;
  }

  async function get(rota, params = {}) {
    const url = new URL(BASE_URL);
    url.searchParams.set('rota', rota);
    url.searchParams.set('token', token());
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    return tratarRespostaAuth(await res.json());
  }

  // Helper único para POST / PUT / DELETE — todos passam por aqui,
  // garantindo que o tratamento de token expirado seja sempre aplicado.
  async function enviar(rota, body = {}, metodo = 'POST', id = null) {
    const url = new URL(BASE_URL);
    url.searchParams.set('rota', rota);
    url.searchParams.set('token', token());
    if (metodo !== 'POST') url.searchParams.set('metodo', metodo);
    if (id !== null) url.searchParams.set('id', id);
    const res = await fetch(url.toString(), {
      method: 'POST', // Apps Script só aceita doPost; PUT/DELETE viajam via parâmetro "metodo"
      body: JSON.stringify(body)
    });
    return tratarRespostaAuth(await res.json());
  }

  async function upload(plantaId, eventoId, arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const base64 = e.target.result.split(',')[1];
        const res = await enviar('upload', {
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
    login:          body       => enviar('login', body),
    registrar:      body       => enviar('registrar', body),
    logout:         ()         => enviar('logout'),

    dashboard:      ()         => get('dashboard'),

    getCiclos:      ()         => get('ciclos'),
    postCiclo:      b          => enviar('ciclo', b),
    putCiclo:       (id, b)    => enviar('ciclo', b, 'PUT', id),
    deletarCiclo:   id         => enviar('ciclo', {}, 'DELETE', id),

    getPlantas:     p          => get('plantas', p),
    getPlanta:      id         => get('planta', {id}),
    postPlanta:     b          => enviar('planta', b),
    putPlanta:      (id, b)    => enviar('planta', b, 'PUT', id),
    deletarPlanta:  id         => enviar('planta', {}, 'DELETE', id),

    getEventos:     p          => get('eventos', p),
    postEvento:     b          => enviar('evento', b),
    deletarEvento:  id         => enviar('evento', {}, 'DELETE', id),

    getTarefas:     p          => get('tarefas', p),
    postTarefa:     b          => enviar('tarefa', b),
    putTarefa:      (id, b)    => enviar('tarefa', b, 'PUT', id),
    deletarTarefa:  id         => enviar('tarefa', {}, 'DELETE', id),

    getDiario:      p          => get('diario', p),
    postDiario:     b          => enviar('diario', b),
    putDiario:      (id, b)    => enviar('diario', b, 'PUT', id),
    deletarDiario:  id         => enviar('diario', {}, 'DELETE', id),

    getFotos:       p          => get('fotos', p),
    deletarFoto:    id         => enviar('foto', {}, 'DELETE', id),
    upload,

    getRelatorio:   p          => get('relatorio', p),
    salvarConfig:   b          => enviar('config', b),

    setApiUrl:      url        => { /* não usado mais — URL é fixa no código */ },
    getApiUrl:      ()         => BASE_URL
  };
})();
