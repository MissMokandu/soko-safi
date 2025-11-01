// Debug panel for development
export const showDebugPanel = () => {
  if (import.meta.env.PROD) return;
  
  const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  console.group('🔍 DEBUG PANEL');
  console.log('Token exists:', !!token);
  console.log('User data:', user);
  console.log('Recent errors:', errors.slice(-10));
  console.log('Current URL:', window.location.href);
  console.groupEnd();
  
  // Show in UI (XSS-safe)
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed; top: 10px; right: 10px; z-index: 9999;
    background: #000; color: #0f0; padding: 10px; border-radius: 5px;
    font-family: monospace; font-size: 12px; max-width: 300px;
    max-height: 200px; overflow-y: auto;
  `;
  
  // Create elements safely without innerHTML
  const tokenDiv = document.createElement('div');
  tokenDiv.textContent = `Token: ${token ? '✅' : '❌'}`;
  
  const userDiv = document.createElement('div');
  userDiv.textContent = `User: ${user?.email || 'None'}`;
  
  const errorsDiv = document.createElement('div');
  errorsDiv.textContent = `Errors: ${errors.length}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'float: right; background: none; border: none; color: #0f0; cursor: pointer;';
  closeBtn.addEventListener('click', () => panel.remove());
  
  panel.appendChild(closeBtn);
  panel.appendChild(tokenDiv);
  panel.appendChild(userDiv);
  panel.appendChild(errorsDiv);
  
  document.body.appendChild(panel);
  
  setTimeout(() => panel.remove(), 10000);
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.showDebug = showDebugPanel;
}