(() => {
  document.documentElement.classList.add('js');

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const recipes = document.querySelectorAll('.recipe');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.querySelector('#recipe-search');
  const emptyState = document.querySelector('.empty-state');

  const closeNav = () => {
    if (!toggle || !navLinks) return;
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    if (!toggle || !navLinks) return;
    navLinks.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  // Sticky header shadow
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  if (toggle && navLinks) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (navLinks.classList.contains('open')) closeNav();
      else openNav();
    });

    // Do not preventDefault on nav links — let the browser navigate
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        // Close after a tick so navigation isn't interrupted
        setTimeout(closeNav, 0);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });

    window.addEventListener(
      'resize',
      () => {
        if (window.innerWidth > 768) closeNav();
      },
      { passive: true }
    );
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal, .recipe');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in', 'visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in', 'visible'));
  }

  // Fallback: if still hidden after 1.2s, force show
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in), .recipe:not(.visible)').forEach((el) => {
      el.classList.add('in', 'visible');
    });
  }, 1200);

  const toggleRecipe = (card, btn) => {
    if (!card) return;
    const open = card.classList.toggle('open');
    const toggleBtn = btn || card.querySelector('.recipe-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(open));
      toggleBtn.textContent = open ? 'Hide method' : 'View method';
    }
  };

  // Expand recipe steps via button
  document.querySelectorAll('.recipe-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleRecipe(btn.closest('.recipe'), btn);
    });
  });

  // Whole recipe card is clickable to expand/collapse
  recipes.forEach((recipe) => {
    recipe.style.cursor = 'pointer';
    recipe.setAttribute('tabindex', '0');
    recipe.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, label')) return;
      toggleRecipe(recipe);
    });
    recipe.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleRecipe(recipe);
      }
    });
  });

  // Filter + search
  let activeFilter = 'all';

  const applyFilters = () => {
    const q = (searchInput?.value || '').trim().toLowerCase();
    let shown = 0;

    recipes.forEach((recipe) => {
      const tags = (recipe.dataset.tags || '').toLowerCase();
      const text = recipe.textContent.toLowerCase();
      const matchFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchSearch = !q || text.includes(q);
      const show = matchFilter && matchSearch;
      recipe.classList.toggle('hidden', !show);
      if (show) {
        shown += 1;
        recipe.classList.add('visible');
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Lazy-load non-hero images if the attribute is missing
  document.querySelectorAll('img:not(.hero-media img)').forEach((img) => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  // Soft page enter
  document.body.classList.add('page-enter');
})();
