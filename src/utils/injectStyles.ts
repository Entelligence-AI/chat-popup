export const injectStyles = (cssText: string) => {
  if (typeof document === 'undefined') return;
  
  try {
    if (!document.getElementById('entelligence-chat-styles')) {
      const style = document.createElement('style');
      style.id = 'entelligence-chat-styles';
      style.textContent = cssText;
      document.head.appendChild(style);
    }
  } catch (e) {
    console.warn('Failed to inject styles:', e);
  }
}; 