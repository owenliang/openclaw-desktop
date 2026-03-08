import { marked } from 'marked';
import DOMPurify from 'dompurify';

const renderer = new marked.Renderer();
const originalLink = renderer.link.bind(renderer);
renderer.link = function (href: string, title: string | null | undefined, text: string) {
  const html = originalLink(href, title, text);
  return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
};

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer,
});

export function renderMarkdown(text: string): string {
  const html = marked.parse(text) as string;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  });
}
