(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. 给每条连线量长度，交给 CSS 画出来 */
  function measure(root) {
    var wires = root.querySelectorAll('.diagram .wire');
    for (var i = 0; i < wires.length; i++) {
      var len = 0;
      try { len = wires[i].getTotalLength(); } catch (e) { len = 0; }
      wires[i].style.setProperty('--len', Math.ceil(len));
    }
  }

  var diagrams = document.querySelectorAll('.diagram');
  for (var d = 0; d < diagrams.length; d++) measure(diagrams[d]);

  function reveal(el) {
    if (el.classList.contains('rise')) {
      el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
      el.classList.add('rise-in');
    } else {
      el.classList.add('is-in');
    }
  }

  var targets = Array.prototype.slice.call(
    document.querySelectorAll('.sheet-wrap, .figure, .rise')
  );

  /* 首屏元素直接亮出来，不等观察器 —— 也不能让内容依赖 JS 才可见 */
  targets.forEach(function (el) {
    if (reduce) { reveal(el); return; }
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) reveal(el);
  });

  if (reduce) return;

  /* 2. 滚动到图纸时，连线像绘图仪一样画出来 */
  var rest = targets.filter(function (el) {
    return !el.classList.contains('is-in') && !el.classList.contains('rise-in');
  });

  if (!('IntersectionObserver' in window) || !rest.length) {
    rest.forEach(reveal);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  rest.forEach(function (el) { io.observe(el); });
})();
