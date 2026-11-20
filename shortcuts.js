(() => {
  const script = document.currentScript;
  const siteRoot = new URL('.', script.src);
  const menu = document.getElementById('menu');
  const links = {
    g: { id: 'github', href: 'https://github.com/robinpnalex', newTab: true },
    b: { id: 'blogs', href: 'blogs.html' },
    n: { id: 'notes', href: 'notes.html' },
    p: { id: 'projects', href: 'index.html#menu' },
  };

  const template = document.createElement('template');
  template.innerHTML = `<details id="shortcuts">
      <summary aria-label="Keyboard shortcuts">?</summary>
      <section class="shortcut-panel" aria-labelledby="shortcut-heading">
        <h2 id="shortcut-heading">navigation</h2>
        <dl>
          <dt><kbd>enter</kbd></dt><dd>open selection</dd>
          <dt><kbd>G</kbd>/<kbd>B</kbd>/<kbd>N</kbd>/<kbd>P</kbd></dt><dd>select by initial</dd>
          <dt><kbd>esc</kbd></dt><dd>back</dd>
          <dt><kbd>d</kbd></dt><dd>toggle theme</dd>
        </dl>
        <output aria-live="polite"></output>
      </section>
    </details>`;
  const shortcuts = template.content.firstElementChild;
  (document.getElementById('site') || document.body).append(shortcuts);
  const status = shortcuts.querySelector('output');
  let selected = null;

  function select(link) {
    if (menu && selected) document.getElementById(selected.id).classList.remove('selected');
    selected = link;
    if (menu && selected) document.getElementById(selected.id).classList.add('selected');
    status.textContent = !menu && selected ? selected.id : '';
  }

  function syncTheme() {
    document.body.classList.toggle('dark', localStorage.getItem('dark') !== 'off');
  }

  syncTheme();
  window.addEventListener('pageshow', syncTheme);

  shortcuts.addEventListener('toggle', () => {
    if (!shortcuts.open && !menu) select(null);
  });

  document.getElementById('robin-logo')?.addEventListener('click', () => select(null));

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (document.querySelector('#lightbox.open')) return;

    const key = event.key.toLowerCase();
    if (key === '?') {
      event.preventDefault();
      if (!event.repeat) shortcuts.open = !shortcuts.open;
    } else if (key === 'd') {
      event.preventDefault();
      if (!event.repeat) {
        const dark = document.body.classList.toggle('dark');
        localStorage.setItem('dark', dark ? 'on' : 'off');
      }
    } else if (key === 'escape' || (key === 'backspace' && menu?.classList.contains('visible'))) {
      event.preventDefault();
      if (shortcuts.open) shortcuts.open = false;
      else if (selected) select(null);
      else if (menu) closeMenu();
      else if (script.dataset.back) location.href = new URL(script.dataset.back, siteRoot);
    } else if (Object.hasOwn(links, key)) {
      event.preventDefault();
      if (event.repeat) return;
      if (menu) openMenu();
      else shortcuts.open = true;
      select(links[key]);
      if (event.target.closest?.('a[href], button, summary')) event.target.blur();
    } else if (key === 'enter' && !event.target.closest?.('a[href], button, summary')) {
      if (selected) {
        event.preventDefault();
        if (menu) document.getElementById(selected.id).click();
        else if (selected.newTab) window.open(selected.href, '_blank', 'noopener');
        else location.href = new URL(selected.href, siteRoot);
      } else if (menu && !menu.classList.contains('visible')) {
        event.preventDefault();
        openMenu();
      }
    }
  }, { capture: true });
})();
