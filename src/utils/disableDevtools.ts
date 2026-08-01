export function disableDevToolsInProd() {
  // if (import.meta.env.DEV) return
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });

  const block = () => {
    document.body.innerHTML = 'Vui lòng đóng DevTools để tiếp tục.';
  };

  setInterval(() => {
    if (window.outerWidth - window.innerWidth > 160 ||
      window.outerHeight - window.innerHeight > 160) {
      block();
    }
  }, 1000);

  // Cách 2: debugger trap (bắt cả trường hợp undocked)
  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) block();
  }, 1000);
}