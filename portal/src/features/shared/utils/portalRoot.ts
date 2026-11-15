export function getModalContainer(): HTMLElement {
  if (typeof document === 'undefined') {
    return null as unknown as HTMLElement;
  }
  let container = document.getElementById('modal-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
  }
  return container;
}

