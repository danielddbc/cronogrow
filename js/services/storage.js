/* CRONOGROW — Storage local (cache e preferências) */
const Storage = {
  set:    (k, v) => localStorage.setItem('cg_' + k, JSON.stringify(v)),
  get:    (k, d) => { try { const v = localStorage.getItem('cg_' + k); return v !== null ? JSON.parse(v) : d; } catch { return d; } },
  remove: (k)    => localStorage.removeItem('cg_' + k),
  clear:  ()     => Object.keys(localStorage).filter(k => k.startsWith('cg_')).forEach(k => localStorage.removeItem(k))
};
