(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 量出每条连线的长度，交给 CSS 画 */
  var diagrams = document.querySelectorAll('.diagram');
  for (var d = 0; d < diagrams.length; d++) {
    var wires = diagrams[d].querySelectorAll('.wire');
    for (var w = 0; w < wires.length; w++) {
      var len = 0;
      try { len = wires[w].getTotalLength(); } catch (e) { len = 0; }
      wires[w].style.setProperty('--len', Math.ceil(len));
    }
  }

  /* 2. 图纸进入视口时把线画出来；首屏的立刻画 */
  var figures = Array.prototype.slice.call(
    document.querySelectorAll('.sheet-wrap, .figure')
  );

  function show(el) { el.classList.add('is-in'); }

  figures.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94) show(el);
  });

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    figures.forEach(function (el) {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
  } else {
    figures.forEach(show);
  }

  /* 3. 详情页目录：滚动时标出当前小节 */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (!tocLinks.length) return;

  var sections = tocLinks.map(function (a) {
    var id = a.getAttribute('href');
    return document.querySelector(id);
  });

  var ticking = false;

  function sync() {
    ticking = false;
    var line = window.scrollY + 160;
    var current = 0;

    for (var i = 0; i < sections.length; i++) {
      if (!sections[i]) continue;
      var top = sections[i].getBoundingClientRect().top + window.scrollY;
      if (top <= line) current = i;
    }

    /* 到底部时点亮最后一节 */
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
      current = sections.length - 1;
    }

    for (var j = 0; j < tocLinks.length; j++) {
      tocLinks[j].classList.toggle('is-active', j === current);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(sync);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  sync();
})();
