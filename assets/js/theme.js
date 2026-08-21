/**
 * Light / dark theme switcher.
 *
 * The initial theme is applied by a tiny inline script in the document <head>
 * (see base.html.twig) so there is no flash of the wrong theme before this
 * file loads. This script keeps the switcher button, the persisted choice and
 * live OS changes in sync.
 *
 * Resolution order: an explicit choice saved in localStorage wins; otherwise
 * the OS `prefers-color-scheme` preference is followed, defaulting to light.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function storedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function systemTheme() {
    return media && media.matches ? 'dark' : 'light';
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || storedTheme() || systemTheme();
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);

    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      var isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute(
        'aria-label',
        isDark ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  function setup() {
    // Reflect the theme the inline head script already resolved.
    applyTheme(currentTheme());

    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          /* localStorage unavailable (e.g. private mode) — apply anyway */
        }
        applyTheme(next);
      });
    }

    // Follow the OS while the visitor has not made an explicit choice.
    if (media) {
      var onSystemChange = function (event) {
        if (!storedTheme()) {
          applyTheme(event.matches ? 'dark' : 'light');
        }
      };
      if (media.addEventListener) {
        media.addEventListener('change', onSystemChange);
      } else if (media.addListener) {
        media.addListener(onSystemChange);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
