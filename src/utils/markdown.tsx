import React from 'react';

/**
 * Renders simple Markdown text to JSX.
 * Supports: **bold**, *italic*, • bullet lists, line breaks
 */
export function renderMarkdown(text: string, baseStyle?: React.CSSProperties): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletGroup: string[] = [];
  let key = 0;

  const flushBulletGroup = () => {
    if (bulletGroup.length > 0) {
      elements.push(
        <ul key={key++} style={{ margin: '4px 0', paddingLeft: 18, listStyleType: 'disc', ...baseStyle }}>
          {bulletGroup.map((item, i) => (
            <li key={i} style={{ marginBottom: 2, lineHeight: 1.6 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      bulletGroup = [];
    }
  };

  for (const line of lines) {
    // Check for bullet lines: "• text" or "- text" or "* text"
    const bulletMatch = line.match(/^[•\-*]\s+(.+)/);
    if (bulletMatch) {
      // Flush non-bullet content
      bulletGroup.push(bulletMatch[1]);
      continue;
    }

    // Flush any accumulated bullet group
    flushBulletGroup();

    // Regular line
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={key++} style={{ margin: '2px 0', lineHeight: 1.65, ...baseStyle }}>
          {renderInline(line)}
        </p>
      );
    }
  }

  flushBulletGroup();

  if (elements.length === 0) return null;
  if (elements.length === 1) return elements[0];
  return <>{elements}</>;
}

/**
 * Renders inline formatting: **bold**, *italic*
 */
function renderInline(text: string): React.ReactNode {
  // Split by bold markers **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return <strong key={i}>{renderItalic(inner)}</strong>;
    }
    return renderItalic(part);
  });
}

/**
 * Renders italic: *text*
 */
function renderItalic(text: string): React.ReactNode {
  const parts = text.split(/(\*.*?\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const inner = part.slice(1, -1);
      return <em key={i}>{inner}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * Simple string version for non-JSX contexts
 */
export function renderMarkdownHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
