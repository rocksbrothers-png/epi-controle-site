'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const locale = window.EpiI18n?.current?.() || 'pt';

  window.EpiI18n?.apply?.(locale);
  window.EpiLangSelector?.render?.('#login-lang-selector', {
    style: 'pills',
    showFlag: true,
    showName: true,
  });

  window.addEventListener('epi:locale-changed', ({ detail }) => {
    window.EpiI18n?.apply?.(detail.locale);
    window.EpiLangSelector?.render?.('#login-lang-selector', {
      style: 'pills',
      showFlag: true,
      showName: true,
    });
  });
});
