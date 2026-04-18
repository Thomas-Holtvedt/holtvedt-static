const getNavHeight = () => document.querySelector('.navbar')?.offsetHeight ?? 0;

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - getNavHeight();
    window.scrollTo({ top, behavior: 'smooth' });
    history.pushState(null, '', link.getAttribute('href'));
  });
});

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const originals = Array.from(track?.querySelectorAll('.carousel-img') ?? []);
  if (!viewport || !track || originals.length === 0) return;

  const hasClones = originals.length > 1;
  if (hasClones) {
    const first = originals[0].cloneNode(true);
    const last = originals[originals.length - 1].cloneNode(true);
    first.classList.remove('is-active');
    last.classList.remove('is-active');
    track.insertBefore(last, originals[0]);
    track.appendChild(first);
  }

  const images = Array.from(track.querySelectorAll('.carousel-img'));
  const lastIndex = images.length - 1;
  let index = hasClones ? 1 : 0;

  const goTo = (next, animate = true) => {
    index = next;
    const img = images[index];
    const offset = img.offsetLeft + img.offsetWidth / 2 - viewport.offsetWidth / 2;

    track.style.transition = animate ? '' : 'none';
    if (!animate) images.forEach((i) => { i.style.transition = 'none'; });

    track.style.transform = `translateX(${-offset}px)`;
    images.forEach((i) => i.classList.remove('is-active'));
    img.classList.add('is-active');

    if (!animate) {
      void track.offsetWidth;
      images.forEach((i) => { i.style.transition = ''; });
    }
  };

  const wrapIfAtClone = () => {
    if (!hasClones) return;
    if (index === 0) goTo(lastIndex - 1, false);
    else if (index === lastIndex) goTo(1, false);
  };

  const step = (delta) => {
    wrapIfAtClone();
    goTo(index + delta);
  };

  track.addEventListener('transitionend', (event) => {
    if (event.target === track && event.propertyName === 'transform') wrapIfAtClone();
  });

  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => step(-1));
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => step(1));
  images.forEach((img, i) => img.addEventListener('click', () => {
    if (i !== index) goTo(i);
  }));

  goTo(index, false);
  window.addEventListener('resize', () => goTo(index, false));
});
