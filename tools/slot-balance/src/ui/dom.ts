export function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) throw new Error(`Missing element: ${id}`);
  return element as T;
}

export function replaceChildren(element: Element, ...children: Node[]): void {
  element.replaceChildren(...children);
}

export function textElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  text: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function setHidden(element: HTMLElement, hidden: boolean): void {
  element.hidden = hidden;
}

export function namedControl(
  form: HTMLFormElement,
  name: string,
): HTMLInputElement | HTMLSelectElement | undefined {
  const control = form.elements.namedItem(name);
  return control instanceof HTMLInputElement || control instanceof HTMLSelectElement
    ? control
    : undefined;
}
