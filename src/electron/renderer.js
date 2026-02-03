
window.addEventListener('DOMContentLoaded', () => {

  const closeBtn = document.getElementById('close');
  const minimizeBtn = document.getElementById('minimize');
  const maximizeBtn = document.getElementById('maximize');

  closeBtn.addEventListener('click', () => {
    window.windowControls.close();
  });

  minimizeBtn.addEventListener('click', () => {
    window.windowControls.minimize();
  });

  maximizeBtn.addEventListener('click', () => {
    window.windowControls.maximize();
  });

});