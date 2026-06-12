/* CRONOGROW — galeria (em breve) */
Router.registrar('galeria', async (el) => {
  el.innerHTML = `<div class="estado-vazio">
    <svg viewBox="0 0 24 24" width="48" height="48"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <h3>🚧 Em breve</h3>
    <p>Esta tela chegará na próxima etapa.</p>
  </div>`;
});
