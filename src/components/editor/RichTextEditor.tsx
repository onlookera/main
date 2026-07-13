import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Bold, Italic, List, Type, Minus, Plus } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  fontSize?: number;
}

const FONT_SIZE_OPTIONS = [11, 12, 13, 14, 15, 16, 18];

const RichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = '输入内容...',
  minHeight = 100,
  fontSize: initialFontSize = 14,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editorHeight, setEditorHeight] = useState(minHeight);
  const [editorFontSize, setEditorFontSize] = useState(initialFontSize);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Sync font size with prop changes
  useEffect(() => {
    setEditorFontSize(initialFontSize);
  }, [initialFontSize]);

  // ============ Resize logic ============
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartY.current = e.clientY;
      dragStartHeight.current = editorHeight;
    },
    [editorHeight]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - dragStartY.current;
      const newHeight = Math.max(minHeight, Math.min(600, dragStartHeight.current + delta));
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight]);

  // ============ Formatting helpers ============
  const getSelection = useCallback((): { start: number; end: number; text: string } => {
    const ta = textareaRef.current;
    if (!ta) return { start: 0, end: 0, text: '' };
    return {
      start: ta.selectionStart,
      end: ta.selectionEnd,
      text: ta.value.substring(ta.selectionStart, ta.selectionEnd),
    };
  }, []);

  const insertFormatting = useCallback(
    (before: string, after: string, defaultText: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const { start, end, text } = getSelection();
      const selectedText = text || defaultText;

      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        ta.focus();
        if (text) {
          ta.setSelectionRange(start + before.length, end + before.length);
        } else {
          const cursorPos = start + before.length + selectedText.length + after.length;
          ta.setSelectionRange(cursorPos, cursorPos);
        }
      });
    },
    [value, onChange, getSelection]
  );

  const handleBold = useCallback(() => {
    insertFormatting('**', '**', '加粗文字');
  }, [insertFormatting]);

  const handleItalic = useCallback(() => {
    insertFormatting('*', '*', '斜体文字');
  }, [insertFormatting]);

  const handleBulletList = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { start, end, text } = getSelection();

    // If text is selected, prefix each line with bullet
    if (text) {
      const lines = text.split('\n');
      const bulleted = lines.map((l) => `• ${l}`).join('\n');
      const newValue = value.substring(0, start) + bulleted + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start, start + bulleted.length);
      });
    } else {
      // Insert a bullet at cursor
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const newValue = value.substring(0, lineStart) + '• ' + value.substring(lineStart);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(lineStart + 2, lineStart + 2);
      });
    }
  }, [value, onChange, getSelection]);

  const handleFontSizeChange = useCallback(
    (delta: number) => {
      setEditorFontSize((prev) => {
        const currentIdx = FONT_SIZE_OPTIONS.indexOf(prev);
        const newIdx = Math.max(0, Math.min(FONT_SIZE_OPTIONS.length - 1, currentIdx + delta));
        return FONT_SIZE_OPTIONS[newIdx];
      });
    },
    []
  );

  const handleFontSizeSet = useCallback((size: number) => {
    setEditorFontSize(size);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          handleBold();
        } else if (e.key === 'i') {
          e.preventDefault();
          handleItalic();
        }
      }
    },
    [handleBold, handleItalic]
  );

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-1 py-1 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
        {/* Bold */}
        <button
          onClick={handleBold}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
          title="加粗 (Ctrl+B)"
          type="button"
        >
          <Bold size={15} />
        </button>

        {/* Italic */}
        <button
          onClick={handleItalic}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
          title="斜体 (Ctrl+I)"
          type="button"
        >
          <Italic size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Bullet List */}
        <button
          onClick={handleBulletList}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
          title="无序列表"
          type="button"
        >
          <List size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* Font Size */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleFontSizeChange(-1)}
            disabled={editorFontSize <= FONT_SIZE_OPTIONS[0]}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="缩小字号"
            type="button"
          >
            <Minus size={13} />
          </button>

          <div className="relative group">
            <button
              className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-200 transition-colors text-gray-600 text-xs font-medium min-w-[40px] justify-center"
              title="字号"
              type="button"
            >
              <Type size={14} />
              <span>{editorFontSize}px</span>
            </button>
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-xl py-1 z-50 hidden group-hover:block hover:block min-w-[70px]">
              {FONT_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeSet(size)}
                  className={`w-full px-3 py-1.5 text-xs text-left hover:bg-blue-50 transition-colors ${
                    size === editorFontSize ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-gray-600'
                  }`}
                  type="button"
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleFontSizeChange(1)}
            disabled={editorFontSize >= FONT_SIZE_OPTIONS[FONT_SIZE_OPTIONS.length - 1]}
            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
            title="增大字号"
            type="button"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          height: editorHeight,
          fontSize: editorFontSize,
          resize: 'none',
          fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
        }}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder:text-gray-400 leading-relaxed"
      />

      {/* Resize handle */}
      <div
        onMouseDown={handleDragStart}
        className="flex items-center justify-center h-4 cursor-s-resize hover:bg-gray-100 rounded-b transition-colors group -mt-1 relative z-10"
        title="拖拽调整高度"
      >
        <div className="w-8 h-1 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
      </div>

      <style>{`
        .rich-text-editor textarea::-webkit-scrollbar {
          width: 5px;
        }
        .rich-text-editor textarea::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
