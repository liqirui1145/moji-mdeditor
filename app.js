/* ==========================================================
   墨记 · 富文本 Markdown 编辑器
   纯前端，无依赖。编辑内容保存在浏览器 localStorage 中。
   ========================================================== */

'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const editor = $('#editor');
  const docTitle = $('#docTitle');
  const toolbar = $('#toolbar');
  const paper = $('#paper');

  const blockBtn = $('#blockBtn');
  const blockMenu = $('#blockMenu');
  const blockLabel = $('#blockLabel');
  const colorBtn = $('#colorBtn');
  const colorMenu = $('#colorMenu');
  const colorSwatches = $('#colorSwatches');
  const colorBar = $('#colorBar');
  const highlightBtn = $('#highlightBtn');
  const highlightMenu = $('#highlightMenu');
  const highlightSwatches = $('#highlightSwatches');
  const highlightBar = $('#highlightBar');
  const insertBtn = $('#insertBtn');
  const insertMenu = $('#insertMenu');

  const undoBtn = $('#undoBtn');
  const redoBtn = $('#redoBtn');
  const boldBtn = $('#boldBtn');
  const italicBtn = $('#italicBtn');
  const underlineBtn = $('#underlineBtn');
  const strikeBtn = $('#strikeBtn');
  const inlineCodeBtn = $('#inlineCodeBtn');
  const codeBlockBtn = $('#codeBlockBtn');
  const alignLeftBtn = $('#alignLeftBtn');
  const alignCenterBtn = $('#alignCenterBtn');
  const alignRightBtn = $('#alignRightBtn');
  const bulletBtn = $('#bulletBtn');
  const orderedBtn = $('#orderedBtn');
  const taskBtn = $('#taskBtn');
  const quoteBtn = $('#quoteBtn');
  const clearBtn = $('#clearBtn');

  const exportBtn = $('#exportBtn');
  const exportOverlay = $('#exportOverlay');
  const keepStyles = $('#keepStyles');
  const markdownOutput = $('#markdownOutput');
  const mdStats = $('#mdStats');
  const copyBtn = $('#copyBtn');
  const copyLabel = $('#copyLabel');
  const downloadBtn = $('#downloadBtn');

  const linkOverlay = $('#linkOverlay');
  const linkForm = $('#linkForm');
  const linkText = $('#linkText');
  const linkUrl = $('#linkUrl');
  const linkError = $('#linkError');

  const imageOverlay = $('#imageOverlay');
  const imageForm = $('#imageForm');
  const imageUrl = $('#imageUrl');
  const imageAlt = $('#imageAlt');
  const imageError = $('#imageError');

  const tableOverlay = $('#tableOverlay');
  const tableForm = $('#tableForm');
  const tableCols = $('#tableCols');
  const tableRows = $('#tableRows');
  const tablePreview = $('#tablePreview');

  const helpOverlay = $('#helpOverlay');
  const confirmOverlay = $('#confirmOverlay');
  const confirmNewBtn = $('#confirmNewBtn');
  const newBtn = $('#newBtn');
  const helpBtn = $('#helpBtn');

  const footerSave = $('#footerSave');
  const footerSaveLabel = $('#footerSaveLabel');
  const saveChip = $('#saveChip');
  const saveLabel = $('#saveLabel');
  const wordCount = $('#wordCount');
  const charCount = $('#charCount');
  const readTime = $('#readTime');

  const toast = $('#toast');
  const toastText = $('#toastText');

  const STORAGE_KEY = 'moji-rich-markdown-editor:draft:v1';
  const DEFAULT_TEXT_COLOR = '#26251f';
  const ZERO_WIDTH = /\u200b/g;

  const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DIV', 'DL', 'FIGCAPTION',
    'FIGURE', 'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR',
    'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'UL'
  ]);

  const ALLOWED_TAGS = new Set([
    'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'DIV', 'EM', 'FONT', 'H1',
    'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'IMG', 'INS', 'LI', 'MARK',
    'OL', 'P', 'PRE', 'S', 'SPAN', 'STRIKE', 'STRONG', 'SUB', 'SUP', 'TABLE',
    'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'U', 'UL'
  ]);

  const REMOVE_WITH_CONTENT = [
    'script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template',
    'noscript', 'link', 'meta', 'base', 'canvas', 'audio', 'video', 'source',
    'track', 'map', 'area', 'frame', 'frameset'
  ].join(',');

  const TEXT_COLORS = [
    { value: '#26251f', label: '墨黑' },
    { value: '#74736a', label: '烟灰' },
    { value: '#b4463e', label: '赭红' },
    { value: '#c56b2c', label: '陶橙' },
    { value: '#9a7b2f', label: '秋褐' },
    { value: '#33775b', label: '松绿' },
    { value: '#2f7f7c', label: '青碧' },
    { value: '#356f9e', label: '靛蓝' },
    { value: '#5f5ba8', label: '暮紫' },
    { value: '#8a5a9e', label: '丁香' },
    { value: '#bf4e76', label: '胭脂' },
    { value: '#8c5c3c', label: '栗棕' }
  ];

  const HIGHLIGHT_COLORS = [
    { value: '#fef3c7', label: '暖杏' },
    { value: '#fde68a', label: '明黄' },
    { value: '#fed7aa', label: '蜜橘' },
    { value: '#fecaca', label: '浅绯' },
    { value: '#fbcfe8', label: '樱粉' },
    { value: '#e9d5ff', label: '藕紫' },
    { value: '#ddd6fe', label: '雾紫' },
    { value: '#bfdbfe', label: '天蓝' },
    { value: '#a7f3d0', label: '薄荷' },
    { value: '#d9f99d', label: '新芽' },
    { value: '#e5e7eb', label: '浅灰' },
    { value: '#f5f5f4', label: '米白' }
  ];

  const BLOCK_META = {
    p: { label: '正文', icon: '#i-text' },
    h1: { label: '标题 1', icon: '#i-text' },
    h2: { label: '标题 2', icon: '#i-text' },
    h3: { label: '标题 3', icon: '#i-text' },
    blockquote: { label: '引用', icon: '#i-quote' },
    pre: { label: '代码块', icon: '#i-code-block' }
  };

  const state = {
    savedRange: null,
    activeOverlay: null,
    overlayTimer: null,
    saveTimer: null,
    saveStatus: 'saved',
    updateFrame: null,
    toastTimer: null,
    copiedTimer: null,
    linkAnchor: null,
    pendingRange: null,
    currentTable: null,
    currentCell: null,
    tableBubble: null,
    tableFrame: null,
    lastStorageErrorAt: 0,
    isComposing: false
  };

  /* --------------------------------------------------------
     基础工具
     -------------------------------------------------------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clamp(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function setIcon(iconElement, href) {
    if (!iconElement) return;
    const use = iconElement.tagName === 'USE' ? iconElement : iconElement.querySelector('use');
    if (use) use.setAttribute('href', href);
  }

  function isSafeStyleValue(value) {
    if (typeof value !== 'string') return false;
    const clean = value.trim();
    if (!clean || clean.length > 140) return false;
    return !/url\s*\(|expression\s*\(|javascript:|@import|[<>]/i.test(clean);
  }

  function normalizeColor(input) {
    if (!input) return '';
    let value = String(input).trim().toLowerCase();
    if (!value || value === 'transparent' || value === 'inherit' || value === 'initial' || value === 'currentcolor') {
      return '';
    }

    if (/^#[0-9a-f]{3}$/.test(value)) {
      value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    if (/^#[0-9a-f]{6}$/.test(value)) return value;
    if (/^#[0-9a-f]{8}$/.test(value)) {
      return value.endsWith('00') ? '' : value;
    }

    const rgb = value.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:\s*[,/]\s*([\d.]+))?\s*\)$/i);
    if (rgb) {
      const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
      if (!Number.isFinite(alpha) || alpha <= 0.04) return '';
      const toHex = (channel) => clamp(channel, 0, 255).toString(16).padStart(2, '0');
      const hex = '#' + toHex(rgb[1]) + toHex(rgb[2]) + toHex(rgb[3]);
      if (alpha < 0.99) return `rgba(${clamp(rgb[1], 0, 255)}, ${clamp(rgb[2], 0, 255)}, ${clamp(rgb[3], 0, 255)}, ${alpha.toFixed(2)})`;
      return hex;
    }

    if (/^[a-z]+$/i.test(value)) return value;
    return '';
  }

  function normalizeUrl(raw, kind = 'link') {
    if (typeof raw !== 'string') return '';
    let url = raw.trim();
    if (!url) return '';
    if (/[\u0000-\u001f\u007f]/.test(url) || /\s/.test(url)) return '';

    if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(url)) {
      return kind === 'image' ? url.replace(/\s/g, '') : '';
    }
    if (/^(?:javascript|vbscript|file|data):/i.test(url)) return '';

    const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme) {
      const protocol = scheme[1].toLowerCase();
      const allowed = kind === 'image'
        ? ['http', 'https']
        : ['http', 'https', 'mailto', 'tel'];
      if (!allowed.includes(protocol)) return '';
      if (protocol === 'http' || protocol === 'https') {
        try {
          const parsed = new URL(url);
          if (!parsed.hostname) return '';
        } catch {
          return '';
        }
      }
      return url;
    }

    if (url.startsWith('//')) return 'https:' + url;

    if (kind === 'link') {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(url)) return 'mailto:' + url;
      if (/^[^\s@/]+\.[^\s@]{2,}(?:[/?#:].*)?$/.test(url)) return 'https://' + url;
    }
    return url;
  }

  function unwrapElement(element) {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
  }

  function isBlockTag(tagName) {
    return BLOCK_TAGS.has(String(tagName).toUpperCase());
  }

  function elementHasBlockChild(element) {
    return Array.from(element.children).some((child) => isBlockTag(child.tagName) && child.tagName !== 'BR');
  }

  function parseInlineStyle(element) {
    const style = element.style;
    const decoration = `${style.textDecorationLine || ''} ${style.textDecoration || ''}`;
    const fontColor = element.getAttribute && (element.getAttribute('color') || '');
    return {
      bold: /^(bold|bolder|[6-9]00)$/i.test(style.fontWeight || ''),
      italic: /^(italic|oblique)$/i.test(style.fontStyle || ''),
      underline: /underline/i.test(decoration),
      strike: /line-through/i.test(decoration),
      color: normalizeColor(style.color || fontColor),
      background: normalizeColor(style.backgroundColor || ''),
      align: style.textAlign || element.getAttribute('align') || ''
    };
  }

  /* --------------------------------------------------------
     富文本清理：粘贴与本地草稿载入都经过这里
     -------------------------------------------------------- */

  function sanitizeHtml(html, options = {}) {
    if (typeof html !== 'string' || !html.trim()) return '';
    const forEditor = options.forEditor === true;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const root = doc.body;

    root.querySelectorAll(REMOVE_WITH_CONTENT).forEach((node) => node.remove());
    root.querySelectorAll('input').forEach((input) => {
      const keep = forEditor
        && input.getAttribute('type') === 'checkbox'
        && input.classList.contains('task-check');
      if (!keep) input.remove();
    });

    const elements = Array.from(root.querySelectorAll('*'));

    for (const element of elements) {
      if (!root.contains(element)) continue;
      const tag = element.tagName;

      if (tag === 'INPUT') {
        const checked = element.checked || element.hasAttribute('checked');
        Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));
        element.setAttribute('type', 'checkbox');
        element.setAttribute('class', 'task-check');
        element.setAttribute('contenteditable', 'false');
        if (checked) element.setAttribute('checked', '');
        continue;
      }

      if (!ALLOWED_TAGS.has(tag)) {
        unwrapElement(element);
        continue;
      }

      const raw = {
        href: element.getAttribute('href'),
        src: element.getAttribute('src'),
        alt: element.getAttribute('alt'),
        title: element.getAttribute('title'),
        style: element.getAttribute('style'),
        align: element.getAttribute('align'),
        color: element.getAttribute('color'),
        className: element.getAttribute('class'),
        checked: element.hasAttribute('checked'),
        dataChecked: element.getAttribute('data-checked')
      };

      if (tag === 'A') {
        const safeHref = normalizeUrl(raw.href || '', 'link');
        if (!safeHref) {
          unwrapElement(element);
          continue;
        }
      }

      if (tag === 'IMG') {
        const safeSrc = normalizeUrl(raw.src || '', 'image');
        if (!safeSrc) {
          element.remove();
          continue;
        }
      }

      Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));

      if (tag === 'A') {
        const safeHref = normalizeUrl(raw.href || '', 'link');
        element.setAttribute('href', safeHref);
        if (raw.title) element.setAttribute('title', String(raw.title).slice(0, 300));
        element.setAttribute('rel', 'noopener noreferrer');
      }

      if (tag === 'IMG') {
        element.setAttribute('src', normalizeUrl(raw.src || '', 'image'));
        element.setAttribute('alt', String(raw.alt || '').slice(0, 500));
        if (raw.title) element.setAttribute('title', String(raw.title).slice(0, 300));
      }

      if (tag === 'CODE' && forEditor) {
        const language = String(raw.className || '').match(/(?:^|\s)language-([a-z0-9_+#.-]+)/i);
        if (language) element.setAttribute('class', `language-${language[1]}`);
      }

      if (forEditor && tag === 'UL' && /\btask-list\b/.test(raw.className || '')) {
        element.setAttribute('class', 'task-list');
      }

      if (forEditor && tag === 'P' && /\blead\b/.test(raw.className || '')) {
        element.setAttribute('class', 'lead');
      }

      if (forEditor && tag === 'LI') {
        const checked = raw.dataChecked === 'true' || raw.checked;
        element.setAttribute('data-checked', checked ? 'true' : 'false');
      }

      const styles = {};
      if (raw.style) {
        const probe = doc.createElement('span');
        probe.setAttribute('style', raw.style);
        ['color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-align'].forEach((property) => {
          const value = probe.style.getPropertyValue(property);
          if (value && isSafeStyleValue(value)) styles[property] = value;
        });
      }

      if (raw.color) {
        const color = normalizeColor(raw.color);
        if (color) styles.color = color;
      }

      if (raw.align && /^(left|right|center|justify)$/i.test(raw.align)) {
        styles['text-align'] = raw.align.toLowerCase();
      }

      if (tag === 'FONT' && !styles.color) {
        const fontColor = parseInlineStyle(element).color;
        if (fontColor) styles.color = fontColor;
      }

      const styleText = Object.keys(styles)
        .map((property) => `${property}: ${styles[property]}`)
        .join('; ');
      if (styleText) element.setAttribute('style', styleText);
    }

    return root.innerHTML;
  }

  /* --------------------------------------------------------
     提示、状态与自动保存
     -------------------------------------------------------- */

  function showToast(message, options = {}) {
    const isError = options.error === true;
    window.clearTimeout(state.toastTimer);
    toastText.textContent = message;
    toast.classList.toggle('is-error', isError);
    const iconUse = toast.querySelector('.toast-icon use');
    if (iconUse) iconUse.setAttribute('href', isError ? '#i-x' : '#i-check');
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        if (!toast.classList.contains('is-visible')) toast.hidden = true;
      }, 220);
    }, options.duration || 2300);
  }

  function setSaveState(status) {
    state.saveStatus = status;
    const labels = {
      saved: '已自动保存',
      saving: '正在保存…',
      error: '保存失败'
    };
    const shortLabels = {
      saved: '已保存',
      saving: '保存中…',
      error: '保存失败'
    };
    [footerSave, saveChip].forEach((element) => {
      if (!element) return;
      element.classList.toggle('is-saving', status === 'saving');
      element.classList.toggle('is-error', status === 'error');
    });
    footerSaveLabel.textContent = labels[status] || labels.saved;
    saveLabel.textContent = shortLabels[status] || shortLabels.saved;
  }

  function draftObject() {
    return {
      version: 1,
      title: docTitle.value.trim() || '未命名文档',
      html: editor.innerHTML,
      updatedAt: Date.now()
    };
  }

  function saveDraft(options = {}) {
    window.clearTimeout(state.saveTimer);
    state.saveTimer = null;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftObject()));
      setSaveState('saved');
      if (options.notify) showToast('草稿已保存到本地');
      return true;
    } catch (error) {
      setSaveState('error');
      const now = Date.now();
      if (options.notify || now - state.lastStorageErrorAt > 12000) {
        state.lastStorageErrorAt = now;
        showToast('浏览器本地存储不可用，草稿可能无法保留', { error: true, duration: 3600 });
      }
      return false;
    }
  }

  function scheduleSave(delay = 480) {
    setSaveState('saving');
    window.clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(() => saveDraft(), delay);
  }

  function updateDocumentTitle() {
    const title = docTitle.value.trim() || '未命名文档';
    document.title = `${title} · 墨记`;
  }

  function getPlainText() {
    return (editor.innerText || editor.textContent || '').replace(ZERO_WIDTH, '');
  }

  function updateCounts() {
    const text = getPlainText();
    const cjk = (text.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) || []).length;
    const latinWords = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
    const chars = (text.match(/\S/g) || []).length;
    const words = cjk + latinWords;
    const minutes = Math.max(1, Math.ceil(cjk / 300 + latinWords / 200));
    wordCount.textContent = String(words);
    charCount.textContent = String(chars);
    readTime.textContent = String(minutes);
  }

  function checkEmpty() {
    const visibleText = getPlainText().trim();
    const hasMedia = Boolean(editor.querySelector('img, hr, table, pre'));
    editor.classList.toggle('is-empty', !visibleText && !hasMedia);
  }

  function markUserChange(options = {}) {
    checkEmpty();
    updateCounts();
    scheduleSave();
    scheduleUiUpdate();
    if (options.focus !== false) {
      editor.focus({ preventScroll: true });
    }
  }

  /* --------------------------------------------------------
     选区管理
     -------------------------------------------------------- */

  function selectionIsInEditor(selection = window.getSelection()) {
    if (!selection || !selection.rangeCount) return false;
    const { anchorNode, focusNode } = selection;
    return Boolean(anchorNode && focusNode && editor.contains(anchorNode) && editor.contains(focusNode));
  }

  function getEditorSelection() {
    const selection = window.getSelection();
    return selectionIsInEditor(selection) ? selection : null;
  }

  function saveSelection() {
    const selection = getEditorSelection();
    if (!selection) return false;
    const range = selection.getRangeAt(0).cloneRange();
    if (range.startContainer === editor && range.endContainer === editor) {
      const childCount = editor.childNodes.length;
      state.savedRange = childCount
        ? (() => {
            const safe = document.createRange();
            safe.selectNodeContents(editor);
            safe.collapse(false);
            return safe;
          })()
        : range;
    } else {
      state.savedRange = range;
    }
    return true;
  }

  function placeCaretAtEnd() {
    editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    state.savedRange = range.cloneRange();
  }

  function placeCaretInElement(element, atStart = true) {
    if (!element) return;
    editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(atStart);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    state.savedRange = range.cloneRange();
  }

  function selectElementContents(element) {
    if (!element) return;
    editor.focus({ preventScroll: true });
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    state.savedRange = range.cloneRange();
  }

  function restoreSelection() {
    if (document.activeElement !== editor) {
      editor.focus({ preventScroll: true });
    }
    const selection = window.getSelection();
    if (state.savedRange) {
      try {
        const range = state.savedRange;
        if (range.startContainer && range.startContainer.isConnected !== false) {
          selection.removeAllRanges();
          selection.addRange(range);
          return true;
        }
      } catch {
        // 选区节点可能已经被移除，回退到编辑器末尾。
      }
    }
    placeCaretAtEnd();
    return false;
  }

  function getActiveElement() {
    const selection = getEditorSelection();
    if (!selection) return null;
    const node = selection.anchorNode;
    if (!node) return null;
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return element && editor.contains(element) ? element : null;
  }

  function closestInEditor(selector, node = getActiveElement()) {
    if (!node) return null;
    const match = node.closest(selector);
    return match && editor.contains(match) ? match : null;
  }

  function getBlockElement(node = getActiveElement()) {
    return closestInEditor('p, div, h1, h2, h3, h4, h5, h6, blockquote, pre, li, th, td', node);
  }

  function getListInfo() {
    const list = closestInEditor('ul, ol');
    if (!list) return null;
    const item = closestInEditor('li');
    return { list, item };
  }

  function getBlockInfo() {
    const active = getActiveElement();
    if (!active) return { type: 'p', element: null };
    const pre = active.closest('pre');
    const quote = active.closest('blockquote');
    const heading = active.closest('h1, h2, h3, h4, h5, h6');
    if (pre && editor.contains(pre)) return { type: 'pre', element: pre };
    if (quote && editor.contains(quote)) return { type: 'blockquote', element: quote };
    if (heading && editor.contains(heading)) return { type: heading.tagName.toLowerCase(), element: heading };
    const block = active.closest('p, div');
    return { type: 'p', element: block && editor.contains(block) ? block : null };
  }

  function getCurrentAlignment() {
    const active = getActiveElement();
    if (!active) return 'left';
    const block = active.closest('p, div, h1, h2, h3, h4, h5, h6, li, th, td, blockquote');
    if (!block || !editor.contains(block)) return 'left';
    const align = window.getComputedStyle(block).textAlign;
    if (align === 'center') return 'center';
    if (align === 'right' || align === 'end') return 'right';
    if (align === 'justify') return 'justify';
    return 'left';
  }

  function queryState(command) {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }

  function queryEnabled(command) {
    try {
      return document.queryCommandEnabled(command);
    } catch {
      return false;
    }
  }

  function setPressed(button, pressed) {
    if (button) button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  function updateToolbarState() {
    if (state.activeOverlay) return;
    if (!getEditorSelection()) return;

    setPressed(boldBtn, queryState('bold'));
    setPressed(italicBtn, queryState('italic'));
    setPressed(underlineBtn, queryState('underline'));
    setPressed(strikeBtn, queryState('strikeThrough'));

    const active = getActiveElement();
    const code = active && active.closest('code');
    const pre = active && active.closest('pre');
    setPressed(inlineCodeBtn, Boolean(code && (!pre || !pre.contains(code))));

    const list = active && active.closest('ul, ol');
    const isTaskList = Boolean(list && list.classList.contains('task-list'));
    setPressed(bulletBtn, Boolean(list && list.tagName === 'UL' && !isTaskList));
    setPressed(orderedBtn, Boolean(list && list.tagName === 'OL' && !isTaskList));
    setPressed(taskBtn, isTaskList);
    setPressed(quoteBtn, Boolean(active && active.closest('blockquote')));
    setPressed(codeBlockBtn, Boolean(pre));

    const alignment = getCurrentAlignment();
    setPressed(alignLeftBtn, alignment === 'left');
    setPressed(alignCenterBtn, alignment === 'center');
    setPressed(alignRightBtn, alignment === 'right');

    undoBtn.disabled = !queryEnabled('undo');
    redoBtn.disabled = !queryEnabled('redo');
    undoBtn.classList.toggle('is-disabled', undoBtn.disabled);
    redoBtn.classList.toggle('is-disabled', redoBtn.disabled);

    const block = getBlockInfo();
    let type = block.type;
    if (!BLOCK_META[type]) type = 'p';
    blockLabel.textContent = BLOCK_META[type].label;
    setIcon(blockBtn.querySelector('.block-picker-icon .icon'), BLOCK_META[type].icon);
    $$('.block-menu .menu-item').forEach((item) => {
      const selected = item.dataset.block === type;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

    updateColorIndicators(active);
    scheduleTableBubbleUpdate();
  }

  function scheduleUiUpdate() {
    if (state.updateFrame) return;
    state.updateFrame = requestAnimationFrame(() => {
      state.updateFrame = null;
      updateToolbarState();
    });
  }

  function updateColorIndicators(active) {
    let textColor = '';
    let highlightColor = '';
    if (active) {
      const colorSource = active.closest('[style*="color"], font[color]');
      if (colorSource && editor.contains(colorSource)) {
        textColor = normalizeColor(colorSource.style.color || colorSource.getAttribute('color') || '');
      }
      const highlightSource = active.closest('mark, [style*="background-color"]');
      if (highlightSource && editor.contains(highlightSource)) {
        highlightColor = normalizeColor(highlightSource.style.backgroundColor || '');
      }
    }
    colorBar.style.background = textColor || DEFAULT_TEXT_COLOR;
    highlightBar.style.background = highlightColor || '#fde68a';
  }

  /* --------------------------------------------------------
     下拉菜单与调色板
     -------------------------------------------------------- */

  const menuPairs = [
    { button: blockBtn, menu: blockMenu },
    { button: colorBtn, menu: colorMenu },
    { button: highlightBtn, menu: highlightMenu },
    { button: insertBtn, menu: insertMenu }
  ];

  function closeMenus(except = null) {
    menuPairs.forEach(({ button, menu }) => {
      if (menu === except) return;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      menu.style.left = '';
      menu.style.right = '';
    });
  }

  function openMenu(button, menu) {
    const willOpen = menu.hidden;
    closeMenus(menu);
    if (!willOpen) {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      return;
    }
    saveSelection();
    menu.hidden = false;
    menu.style.left = '0';
    menu.style.right = 'auto';
    button.setAttribute('aria-expanded', 'true');
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10) {
      menu.style.left = 'auto';
      menu.style.right = '0';
    }
  }

  function renderPalettes() {
    colorSwatches.innerHTML = '';
    highlightSwatches.innerHTML = '';

    TEXT_COLORS.forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.dataset.color = color.value;
      button.title = color.label;
      button.setAttribute('aria-label', `文字颜色：${color.label}`);
      button.style.setProperty('--swatch', color.value);
      if (color.value === DEFAULT_TEXT_COLOR) button.classList.add('is-current');
      colorSwatches.appendChild(button);
    });

    HIGHLIGHT_COLORS.forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch swatch-light';
      button.dataset.highlight = color.value;
      button.title = color.label;
      button.setAttribute('aria-label', `高亮颜色：${color.label}`);
      button.style.setProperty('--swatch', color.value);
      highlightSwatches.appendChild(button);
    });
  }

  // 由后面的事件绑定使用，避免菜单在按下按钮时抢走编辑器选区。
  toolbar.addEventListener('mousedown', (event) => {
    if (event.target.closest('button')) event.preventDefault();
  });

  menuPairs.forEach(({ button, menu }) => {
    button.addEventListener('click', () => openMenu(button, menu));
  });

  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.menu-wrap')) closeMenus();
  });

  blockMenu.addEventListener('click', (event) => {
    const item = event.target.closest('[data-block]');
    if (!item) return;
    closeMenus();
    setBlock(item.dataset.block);
  });

  insertMenu.addEventListener('click', (event) => {
    const item = event.target.closest('[data-insert]');
    if (!item) return;
    closeMenus();
    const action = item.dataset.insert;
    if (action === 'link') openLinkDialog();
    if (action === 'image') openImageDialog();
    if (action === 'table') openTableDialog();
    if (action === 'hr') insertHorizontalRule();
    if (action === 'clear') clearFormatting();
  });

  colorSwatches.addEventListener('click', (event) => {
    const swatch = event.target.closest('[data-color]');
    if (!swatch) return;
    applyTextColor(swatch.dataset.color);
    closeMenus();
  });

  highlightSwatches.addEventListener('click', (event) => {
    const swatch = event.target.closest('[data-highlight]');
    if (!swatch) return;
    applyHighlight(swatch.dataset.highlight);
    closeMenus();
  });

  $('#customColor').addEventListener('change', (event) => {
    const color = normalizeColor(event.target.value);
    if (color) applyTextColor(color);
    closeMenus();
  });

  colorMenu.querySelector('.menu-text-btn[data-color]').addEventListener('click', () => {
    applyTextColor(DEFAULT_TEXT_COLOR);
    closeMenus();
  });

  highlightMenu.querySelector('.menu-text-btn[data-highlight]').addEventListener('click', () => {
    clearHighlight();
    closeMenus();
  });

  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selectionIsInEditor(selection)) {
      if (!state.activeOverlay) hideTableBubble();
      return;
    }
    state.savedRange = selection.getRangeAt(0).cloneRange();
    updateTableBubble();
    scheduleUiUpdate();
  });

  editor.addEventListener('mouseup', saveSelection);
  editor.addEventListener('keyup', saveSelection);
  editor.addEventListener('focus', () => {
    saveSelection();
    scheduleUiUpdate();
  });
  editor.addEventListener('blur', () => {
    // 模态框或工具栏操作可能会暂时夺走焦点，保留最后一个编辑位置。
    saveSelection();
  });

  /* --------------------------------------------------------
     初始化载入与标题
     -------------------------------------------------------- */

  function ensureEditableContent() {
    if (!editor.firstChild) {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = '<br>';
      editor.appendChild(paragraph);
      return;
    }
    if (!editor.firstElementChild) {
      const paragraph = document.createElement('p');
      const text = editor.textContent || '';
      paragraph.textContent = text;
      editor.innerHTML = '';
      editor.appendChild(paragraph);
    }
  }

  function loadDraft() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      setSaveState('error');
      return false;
    }
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || typeof data.html !== 'string') return false;
      const clean = sanitizeHtml(data.html, { forEditor: true });
      editor.innerHTML = clean;
      if (typeof data.title === 'string' && data.title.trim()) {
        docTitle.value = data.title.slice(0, 80);
      }
      return true;
    } catch {
      return false;
    }
  }

  function initialize() {
    renderPalettes();
    setupTableBubble();

    const loaded = loadDraft();
    ensureEditableContent();
    normalizeAllTaskLists();
    checkEmpty();
    updateCounts();
    updateDocumentTitle();
    setSaveState('saved');
    document.execCommand('defaultParagraphSeparator', false, 'p');
    document.execCommand('styleWithCSS', false, false);

    if (!loaded) {
      // 首屏保留欢迎示例，稍后用户一编辑就会自动保存。
      state.savedRange = null;
    }

    setupEventListeners();
    updateToolbarState();
  }

  /* --------------------------------------------------------
     界面按钮、快捷键和输入行为
     -------------------------------------------------------- */

  function setupEventListeners() {
    docTitle.addEventListener('input', () => {
      updateDocumentTitle();
      scheduleSave();
    });
    docTitle.addEventListener('blur', () => {
      const clean = docTitle.value.trim() || '未命名文档';
      if (docTitle.value !== clean) {
        docTitle.value = clean;
        updateDocumentTitle();
        scheduleSave();
      }
    });
    docTitle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        docTitle.blur();
        placeCaretAtEnd();
      }
    });

    undoBtn.addEventListener('click', () => performHistory('undo'));
    redoBtn.addEventListener('click', () => performHistory('redo'));
    boldBtn.addEventListener('click', () => runCommand('bold'));
    italicBtn.addEventListener('click', () => runCommand('italic'));
    underlineBtn.addEventListener('click', () => runCommand('underline'));
    strikeBtn.addEventListener('click', () => runCommand('strikeThrough'));
    inlineCodeBtn.addEventListener('click', toggleInlineCode);
    codeBlockBtn.addEventListener('click', () => setBlock(getBlockInfo().type === 'pre' ? 'p' : 'pre'));
    alignLeftBtn.addEventListener('click', () => setAlignment('left'));
    alignCenterBtn.addEventListener('click', () => setAlignment('center'));
    alignRightBtn.addEventListener('click', () => setAlignment('right'));
    bulletBtn.addEventListener('click', toggleBulletList);
    orderedBtn.addEventListener('click', toggleOrderedList);
    taskBtn.addEventListener('click', toggleTaskList);
    quoteBtn.addEventListener('click', () => setBlock(getBlockInfo().type === 'blockquote' ? 'p' : 'blockquote'));
    clearBtn.addEventListener('click', clearFormatting);

    exportBtn.addEventListener('click', openExportDialog);
    keepStyles.addEventListener('change', renderExportMarkdown);
    copyBtn.addEventListener('click', copyMarkdown);
    downloadBtn.addEventListener('click', downloadMarkdown);
    helpBtn.addEventListener('click', () => openOverlay(helpOverlay));
    newBtn.addEventListener('click', () => openOverlay(confirmOverlay));
    confirmNewBtn.addEventListener('click', createNewDocument);

    linkForm.addEventListener('submit', submitLinkForm);
    imageForm.addEventListener('submit', submitImageForm);
    tableForm.addEventListener('submit', submitTableForm);
    tableCols.addEventListener('input', renderTablePreview);
    tableRows.addEventListener('input', renderTablePreview);

    document.addEventListener('keydown', handleGlobalKeydown, true);
    editor.addEventListener('keydown', handleEditorKeydown);
    editor.addEventListener('beforeinput', handleBeforeInput);
    editor.addEventListener('compositionstart', () => { state.isComposing = true; });
    editor.addEventListener('compositionend', () => { state.isComposing = false; });
    editor.addEventListener('input', handleEditorInput);
    editor.addEventListener('paste', handlePaste);
    editor.addEventListener('click', handleEditorLinkClick);

    editor.addEventListener('change', (event) => {
      const checkbox = event.target.closest('.task-check');
      if (!checkbox) return;
      const item = checkbox.closest('li');
      if (!item) return;
      item.dataset.checked = checkbox.checked ? 'true' : 'false';
      checkbox.toggleAttribute('checked', checkbox.checked);
      markUserChange({ focus: false });
      scheduleUiUpdate();
    });

    $$('.overlay').forEach((overlay) => {
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeOverlay(overlay);
      });
      overlay.addEventListener('mousedown', (event) => {
        if (event.target === overlay) event.preventDefault();
      });
    });

    $$('[data-close]').forEach((button) => {
      button.addEventListener('click', () => {
        const overlay = button.closest('.overlay');
        if (overlay) closeOverlay(overlay);
      });
    });

    window.addEventListener('beforeunload', () => {
      if (state.saveTimer) {
        saveDraft();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && state.saveTimer) saveDraft();
    });

    window.addEventListener('resize', () => {
      closeMenus();
      scheduleTableBubbleUpdate();
    });

    window.addEventListener('scroll', () => {
      scheduleTableBubbleUpdate();
    }, { passive: true });
  }

  function handleGlobalKeydown(event) {
    if (state.activeOverlay) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay(state.activeOverlay);
        return;
      }
      if (event.key === 'Tab') {
        trapModalFocus(event);
      }
      return;
    }

    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (event.key === 'Escape') {
      closeMenus();
      return;
    }

    if (mod && !event.altKey && key === 's') {
      event.preventDefault();
      saveDraft({ notify: true });
      return;
    }

    if (mod && event.shiftKey && (key === 'e' || event.code === 'KeyE')) {
      event.preventDefault();
      openExportDialog();
      return;
    }

    if (document.activeElement !== editor) return;

    if (mod && !event.altKey && !event.shiftKey) {
      if (key === 'b') {
        event.preventDefault();
        runCommand('bold');
        return;
      }
      if (key === 'i') {
        event.preventDefault();
        runCommand('italic');
        return;
      }
      if (key === 'u') {
        event.preventDefault();
        runCommand('underline');
        return;
      }
      if (key === 'k') {
        event.preventDefault();
        openLinkDialog();
        return;
      }
    }

    if (mod && event.altKey && !event.shiftKey) {
      if (key === '0') {
        event.preventDefault();
        setBlock('p');
        return;
      }
      if (key === '1' || key === '2' || key === '3') {
        event.preventDefault();
        setBlock(`h${key}`);
        return;
      }
    }

    if (mod && event.shiftKey) {
      if (event.code === 'Digit7' || key === '&') {
        event.preventDefault();
        toggleOrderedList();
        return;
      }
      if (event.code === 'Digit8' || key === '*') {
        event.preventDefault();
        toggleBulletList();
        return;
      }
    }
  }

  function handleEditorKeydown(event) {
    if (state.isComposing || event.isComposing) return;

    const active = getActiveElement();
    if (!active) return;

    const pre = active.closest('pre');
    if (pre) {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        const inserted = document.execCommand('insertLineBreak');
        if (!inserted) {
          const selection = getEditorSelection();
          if (selection && selection.rangeCount) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const lineBreak = document.createElement('br');
            range.insertNode(lineBreak);
            range.setStartAfter(lineBreak);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            state.savedRange = range.cloneRange();
          }
        }
        markUserChange();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        document.execCommand('insertText', false, '  ');
        markUserChange();
        return;
      }
    }

    const table = active.closest('table');
    if (table && event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      moveTableCellFocus(event.shiftKey ? -1 : 1);
      return;
    }

    const listItem = active.closest('li');
    if (!table && listItem && event.key === 'Tab') {
      event.preventDefault();
      restoreSelection();
      document.execCommand(event.shiftKey ? 'outdent' : 'indent');
      markUserChange();
      return;
    }

    const taskList = active.closest('ul.task-list, ol.task-list');
    if (taskList && event.key === 'Enter' && !event.shiftKey) {
      const item = active.closest('li');
      if (item && !getTaskItemText(item).trim()) {
        event.preventDefault();
        exitEmptyTaskItem(item, taskList);
        return;
      }
      window.setTimeout(normalizeAllTaskLists, 0);
    }
  }

  function handleBeforeInput(event) {
    // 空编辑器内的纯文本粘贴由 paste 事件处理，这里只兜底删除后状态。
    if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
      window.setTimeout(checkEmpty, 0);
    }
  }

  function handleEditorInput() {
    normalizeTaskListInput();
    checkEmpty();
    updateCounts();
    scheduleSave();
    saveSelection();
    scheduleUiUpdate();
  }

  function handlePaste(event) {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    event.preventDefault();

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');
    restoreSelection();
    document.execCommand('styleWithCSS', false, false);

    if (html && html.trim()) {
      const clean = sanitizeHtml(html, { forEditor: false });
      if (clean) {
        document.execCommand('insertHTML', false, clean);
      } else if (text) {
        insertPlainText(text);
      }
    } else if (text) {
      insertPlainText(text);
    }

    markUserChange();
    saveSelection();
    scheduleUiUpdate();
  }

  function handleEditorLinkClick(event) {
    const anchor = event.target.closest('a');
    if (!anchor || !editor.contains(anchor)) return;
    event.preventDefault();

    if (!event.ctrlKey && !event.metaKey) return;
    const safeUrl = normalizeUrl(anchor.getAttribute('href') || '', 'link');
    if (!safeUrl) return;
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }

  function insertPlainText(text) {
    const html = String(text)
      .split(/\r?\n/)
      .map((line) => escapeHtml(line))
      .join('<br>');
    document.execCommand('insertHTML', false, html);
  }

  function performHistory(command) {
    restoreSelection();
    document.execCommand(command);
    saveSelection();
    checkEmpty();
    updateCounts();
    scheduleSave();
    scheduleUiUpdate();
  }

  function trapModalFocus(event) {
    if (!state.activeOverlay) return;
    const focusable = $$(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      state.activeOverlay
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --------------------------------------------------------
     运行编辑命令与文本样式
     -------------------------------------------------------- */

  function runCommand(command) {
    restoreSelection();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(command, false, null);
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function setBlock(desired) {
    restoreSelection();
    const sourceBlock = getBlockElement();
    const sourceText = sourceBlock ? sourceBlock.textContent.trim() : '';
    const existingPres = new Set($$('pre', editor));

    document.execCommand('styleWithCSS', false, false);
    document.execCommand('formatBlock', false, desired);

    if (desired === 'pre') {
      let active = getActiveElement();
      let pre = active && active.closest('pre');
      const preCandidates = $$('pre', editor).filter((element) => !existingPres.has(element));
      if (!pre) {
        pre = preCandidates.find((element) => (
          sourceText
            ? element.textContent.includes(sourceText.slice(0, 24))
            : true
        )) || preCandidates[preCandidates.length - 1] || null;
      }
      if (!pre && sourceText) {
        pre = $$('pre', editor).find((element) => element.textContent.includes(sourceText.slice(0, 24))) || null;
      }
      if (pre) {
        if (!pre.textContent) pre.innerHTML = '<br>';
        placeCaretInElement(pre, false);
      }
    } else if (!getEditorSelection()) {
      let candidate = null;
      if (sourceText) {
        candidate = $$(desired, editor).find(
          (element) => element.textContent.trim() === sourceText
        ) || null;
      }
      if (!candidate) candidate = editor.querySelector(desired);
      if (candidate) placeCaretInElement(candidate, false);
    }

    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function ensureListAfterCommand(existingLists) {
    let info = getListInfo();
    if (info) return info;

    const newLists = $$('ul, ol', editor).filter((list) => !existingLists.has(list));
    const list = newLists[newLists.length - 1] || null;
    if (!list) return null;

    const item = Array.from(list.children).find((child) => child.tagName === 'LI') || list;
    placeCaretInElement(item, false);
    info = getListInfo();
    return info;
  }

  function setAlignment(alignment) {
    restoreSelection();
    const command = alignment === 'center'
      ? 'justifyCenter'
      : alignment === 'right'
        ? 'justifyRight'
        : 'justifyLeft';
    document.execCommand('styleWithCSS', false, false);
    document.execCommand(command, false, null);
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function normalizeListPlacement() {
    $$('p > ul, p > ol, p > table, p > blockquote, p > pre', editor).forEach((block) => {
      const parent = block.parentElement;
      if (parent && parent.children.length === 1) {
        parent.replaceWith(block);
      }
    });
  }

  function toggleBulletList() {
    restoreSelection();
    const info = getListInfo();
    if (info && info.list.classList.contains('task-list')) {
      removeTaskListDecoration(info.list);
      markUserChange();
      scheduleUiUpdate();
      return;
    }
    const existingLists = new Set($$('ul, ol', editor));
    document.execCommand('insertUnorderedList');
    normalizeListPlacement();
    ensureListAfterCommand(existingLists);
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function toggleOrderedList() {
    restoreSelection();
    const info = getListInfo();
    if (info && info.list.classList.contains('task-list')) {
      removeTaskListDecoration(info.list);
    }
    const existingLists = new Set($$('ul, ol', editor));
    document.execCommand('insertOrderedList');
    normalizeListPlacement();
    ensureListAfterCommand(existingLists);
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function toggleTaskList() {
    restoreSelection();
    let info = getListInfo();

    if (info && info.list.classList.contains('task-list')) {
      removeTaskListDecoration(info.list);
      normalizeListPlacement();
      markUserChange();
      scheduleUiUpdate();
      return;
    }

    const existingLists = new Set($$('ul, ol', editor));
    if (!info) {
      document.execCommand('insertUnorderedList');
      normalizeListPlacement();
      info = ensureListAfterCommand(existingLists);
    }

    if (info) {
      info.list.classList.add('task-list');
      Array.from(info.list.children)
        .filter((child) => child.tagName === 'LI')
        .forEach((item) => {
          item.dataset.checked = item.dataset.checked === 'true' ? 'true' : 'false';
        });
      decorateTaskList(info.list);
      if (info.item) {
        const target = Array.from(info.item.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()
        ) || info.item;
        if (target && target.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          state.savedRange = range.cloneRange();
        }
      }
    }

    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function removeTaskListDecoration(list) {
    if (!list) return;
    list.classList.remove('task-list');
    $$('input.task-check', list).forEach((checkbox) => checkbox.remove());
    Array.from(list.querySelectorAll('li')).forEach((item) => {
      delete item.dataset.checked;
    });
  }

  function decorateTaskList(list) {
    if (!list) return;
    list.classList.add('task-list');
    Array.from(list.children)
      .filter((child) => child.tagName === 'LI')
      .forEach((item) => {
        const existing = Array.from(item.children).filter(
          (child) => child.tagName === 'INPUT' && child.type === 'checkbox'
        );
        let checkbox = existing[0];
        if (!checkbox) {
          checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'task-check';
          checkbox.contentEditable = 'false';
          item.insertBefore(checkbox, item.firstChild);
        }
        existing.slice(1).forEach((extra) => extra.remove());
        if (checkbox.parentNode !== item || item.firstChild !== checkbox) {
          item.insertBefore(checkbox, item.firstChild);
        }
        checkbox.className = 'task-check';
        checkbox.contentEditable = 'false';

        const checked = item.dataset.checked === 'true' || checkbox.checked;
        checkbox.checked = checked;
        checkbox.toggleAttribute('checked', checked);
        item.dataset.checked = checked ? 'true' : 'false';
      });
  }

  function normalizeTaskListInput() {
    const active = getActiveElement();
    if (!active) return;
    const list = active.closest('.task-list');
    if (list) {
      decorateTaskList(list);
      Array.from(list.children)
        .filter((child) => child.tagName === 'LI')
        .forEach((item) => {
          if (!getTaskItemText(item).trim()) return;
          while (item.lastChild && item.lastChild.nodeName === 'BR') {
            item.removeChild(item.lastChild);
          }
        });
    }
  }

  function normalizeAllTaskLists() {
    $$('.task-list', editor).forEach((list) => decorateTaskList(list));
  }

  function getTaskItemText(item) {
    if (!item) return '';
    const clone = item.cloneNode(true);
    clone.querySelectorAll('input, ul, ol').forEach((node) => node.remove());
    return (clone.textContent || '').replace(ZERO_WIDTH, '');
  }

  function exitEmptyTaskItem(item, list) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = '<br>';
    const remaining = Array.from(list.children).filter((child) => child.tagName === 'LI' && child !== item);
    item.remove();

    if (remaining.length) {
      list.insertAdjacentElement('afterend', paragraph);
    } else {
      list.insertAdjacentElement('afterend', paragraph);
      list.remove();
    }

    placeCaretInElement(paragraph, true);
    markUserChange();
  }

  function toggleInlineCode() {
    restoreSelection();
    const selection = getEditorSelection();
    if (!selection) {
      placeCaretAtEnd();
      return;
    }
    const active = getActiveElement();
    const existing = active && active.closest('code');

    if (existing && !existing.closest('pre')) {
      const lastChild = existing.lastChild;
      unwrapElement(existing);
      if (lastChild && lastChild.isConnected) {
        const range = document.createRange();
        range.setStartAfter(lastChild);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      saveSelection();
      markUserChange();
      scheduleUiUpdate();
      return;
    }

    const range = selection.getRangeAt(0);
    const startBlock = getBlockForNode(range.startContainer);
    const endBlock = getBlockForNode(range.endContainer);
    if (startBlock && endBlock && startBlock !== endBlock) {
      showToast('行内代码只支持单段文字', { error: true });
      return;
    }

    const code = document.createElement('code');
    if (range.collapsed) {
      code.textContent = '代码';
      range.insertNode(code);
      selectElementContents(code);
    } else {
      try {
        const content = range.extractContents();
        code.appendChild(content);
        range.insertNode(code);
      } catch {
        code.textContent = selection.toString();
        range.deleteContents();
        range.insertNode(code);
      }
      const rangeAfter = document.createRange();
      rangeAfter.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(rangeAfter);
      state.savedRange = rangeAfter.cloneRange();
    }

    markUserChange();
    scheduleUiUpdate();
  }

  function getBlockForNode(node) {
    if (!node) return null;
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!element || !editor.contains(element)) return null;
    const block = element.closest('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, pre, th, td');
    return block && editor.contains(block) ? block : null;
  }

  function applyTextColor(color) {
    restoreSelection();
    const safeColor = normalizeColor(color) || DEFAULT_TEXT_COLOR;

    if (isNearBlack(safeColor)) {
      clearTextColor();
      return;
    }

    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, safeColor);
    document.execCommand('styleWithCSS', false, false);
    setColorIndicator(safeColor);
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function setColorIndicator(color) {
    colorBar.style.background = color || DEFAULT_TEXT_COLOR;
    colorSwatches.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.classList.toggle('is-current', swatch.dataset.color === color);
    });
  }

  function clearTextColor() {
    restoreSelection();
    const selection = getEditorSelection();
    if (!selection) return;

    if (!selection.isCollapsed) {
      if (selectionTouchesMultipleBlocks(selection)) {
        showToast('请在同一段落内恢复默认颜色');
        return;
      }
      removeStylesFromSelection(['color'], ['font']);
    } else {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, DEFAULT_TEXT_COLOR);
      document.execCommand('styleWithCSS', false, false);
      saveSelection();
    }

    setColorIndicator(DEFAULT_TEXT_COLOR);
    markUserChange();
    scheduleUiUpdate();
  }

  function applyHighlight(color) {
    restoreSelection();
    const safeColor = normalizeColor(color);
    if (!safeColor) {
      clearHighlight();
      return;
    }
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('hiliteColor', false, safeColor);
    document.execCommand('styleWithCSS', false, false);
    highlightBar.style.background = safeColor;
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function clearHighlight() {
    restoreSelection();
    const selection = getEditorSelection();
    if (!selection) return;
    if (selection.isCollapsed) {
      showToast('请先选中要清除高亮的文字');
      return;
    }

    if (selectionTouchesMultipleBlocks(selection)) {
      showToast('请在同一段落内清除高亮');
      return;
    }

    removeStylesFromSelection(['background-color'], ['mark']);
    highlightBar.style.background = '#fde68a';
    markUserChange();
    scheduleUiUpdate();
  }

  function selectionTouchesMultipleBlocks(selection) {
    const range = selection.getRangeAt(0);
    const start = getBlockForNode(range.startContainer);
    const end = getBlockForNode(range.endContainer);
    return Boolean(start && end && start !== end);
  }

  function removeStylesFromSelection(properties, tagsToUnwrap = []) {
    const selection = getEditorSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    let fragment;
    try {
      fragment = range.extractContents();
    } catch {
      return;
    }

    const container = document.createElement('div');
    container.appendChild(fragment);
    const elements = Array.from(container.querySelectorAll('*'));
    const unwrapSet = new Set(tagsToUnwrap.map((tag) => tag.toUpperCase()));

    elements.forEach((element) => {
      if (!container.contains(element)) return;
      properties.forEach((property) => {
        if (element.style) element.style.removeProperty(property);
        if (property === 'color') element.removeAttribute('color');
      });

      if (element.getAttribute('style') !== null && !element.getAttribute('style').trim()) {
        element.removeAttribute('style');
      }

      if (element.tagName === 'MARK' && unwrapSet.has('MARK')) {
        if (element.attributes.length) {
          const replacement = document.createElement('span');
          Array.from(element.attributes).forEach((attribute) => {
            replacement.setAttribute(attribute.name, attribute.value);
          });
          while (element.firstChild) replacement.appendChild(element.firstChild);
          element.replaceWith(replacement);
        } else {
          unwrapElement(element);
        }
      } else if (unwrapSet.has(element.tagName) && !element.attributes.length) {
        unwrapElement(element);
      } else if (element.tagName === 'FONT' && !element.attributes.length) {
        unwrapElement(element);
      } else if (element.tagName === 'SPAN' && !element.attributes.length) {
        unwrapElement(element);
      }
    });

    const nodes = Array.from(container.childNodes);
    const last = nodes[nodes.length - 1] || null;
    while (container.firstChild) {
      range.insertNode(container.firstChild);
    }

    if (last) {
      const after = document.createRange();
      after.setStartAfter(last);
      after.collapse(true);
      selection.removeAllRanges();
      selection.addRange(after);
    }
    saveSelection();
  }

  function clearFormatting() {
    restoreSelection();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('removeFormat');
    document.execCommand('justifyLeft');
    highlightBar.style.background = '#fde68a';
    colorBar.style.background = DEFAULT_TEXT_COLOR;
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  function insertHorizontalRule() {
    restoreSelection();
    document.execCommand('insertHorizontalRule');
    saveSelection();
    markUserChange();
    scheduleUiUpdate();
  }

  /* --------------------------------------------------------
     弹窗与焦点管理
     -------------------------------------------------------- */

  function openOverlay(overlay, focusSelector = null) {
    if (!overlay) return;
    closeMenus();

    if (state.activeOverlay && state.activeOverlay !== overlay) {
      closeOverlay(state.activeOverlay, { restoreFocus: false, immediate: true });
    }

    if (getEditorSelection()) saveSelection();
    state.activeOverlay = overlay;
    overlay.hidden = false;
    overlay.classList.remove('is-open');
    document.body.classList.add('modal-open');

    requestAnimationFrame(() => {
      if (state.activeOverlay === overlay) overlay.classList.add('is-open');
    });

    window.setTimeout(() => {
      if (state.activeOverlay !== overlay) return;
      let target = focusSelector ? overlay.querySelector(focusSelector) : null;
      if (!target) {
        target = overlay.querySelector('[autofocus]');
      }
      if (!target || target.disabled) {
        target = overlay.querySelector(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        );
      }
      if (target) {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    }, 90);
  }

  function closeOverlay(overlay = state.activeOverlay, options = {}) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    window.clearTimeout(state.overlayTimer);
    state.overlayTimer = window.setTimeout(() => {
      if (!overlay.classList.contains('is-open')) overlay.hidden = true;
    }, 180);

    if (state.activeOverlay === overlay) {
      state.activeOverlay = null;
      document.body.classList.remove('modal-open');
    }

    if (options.immediate) overlay.hidden = true;

    if (options.restoreFocus !== false) {
      window.setTimeout(() => {
        if (state.activeOverlay) return;
        restoreSelection();
        scheduleUiUpdate();
      }, 30);
    }
  }

  function openLinkDialog() {
    saveSelection();
    const selection = getEditorSelection();
    const active = getActiveElement();
    const anchor = active && active.closest('a');
    const selectedText = selection && !selection.isCollapsed ? selection.toString().trim() : '';

    state.linkAnchor = anchor && editor.contains(anchor) ? anchor : null;
    state.pendingRange = selection && selection.rangeCount
      ? selection.getRangeAt(0).cloneRange()
      : (state.savedRange ? state.savedRange.cloneRange() : null);

    linkError.textContent = '';
    linkText.classList.remove('is-invalid');
    linkUrl.classList.remove('is-invalid');

    if (state.linkAnchor) {
      linkText.value = state.linkAnchor.textContent || '';
      linkUrl.value = state.linkAnchor.getAttribute('href') || '';
    } else {
      linkText.value = selectedText;
      linkUrl.value = '';
    }

    openOverlay(linkOverlay, '#linkUrl');
  }

  function submitLinkForm(event) {
    event.preventDefault();
    linkError.textContent = '';
    linkText.classList.remove('is-invalid');
    linkUrl.classList.remove('is-invalid');

    let text = linkText.value.trim();
    const safeUrl = normalizeUrl(linkUrl.value, 'link');

    if (!linkUrl.value.trim()) {
      linkUrl.classList.add('is-invalid');
      linkError.textContent = '请填写链接地址。';
      linkUrl.focus();
      return;
    }
    if (!safeUrl) {
      linkUrl.classList.add('is-invalid');
      linkError.textContent = '链接地址格式不正确，请使用 http(s)、mailto、tel 或相对路径。';
      linkUrl.focus();
      return;
    }

    if (!text) {
      if (state.pendingRange) text = state.pendingRange.toString().trim();
      if (!text) text = safeUrl;
    }

    const existingAnchor = state.linkAnchor;
    const rangeToUse = state.pendingRange || state.savedRange;
    closeOverlay(linkOverlay, { restoreFocus: false });

    editor.focus({ preventScroll: true });
    if (rangeToUse) {
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToUse);
        state.savedRange = rangeToUse.cloneRange();
      } catch {
        placeCaretAtEnd();
      }
    } else {
      placeCaretAtEnd();
    }

    if (existingAnchor && existingAnchor.isConnected && editor.contains(existingAnchor)) {
      existingAnchor.setAttribute('href', safeUrl);
      existingAnchor.removeAttribute('title');
      if (existingAnchor.textContent.trim() !== text) {
        existingAnchor.textContent = text;
      }
      const range = document.createRange();
      range.setStartAfter(existingAnchor);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      state.savedRange = range.cloneRange();
    } else {
      const marker = `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const html = `<a href="${escapeAttr(safeUrl)}" data-ml-temp="${marker}">${escapeHtml(text)}</a>`;
      document.execCommand('insertHTML', false, html);
      const inserted = editor.querySelector(`[data-ml-temp="${marker}"]`);
      if (inserted) {
        inserted.removeAttribute('data-ml-temp');
        const range = document.createRange();
        range.setStartAfter(inserted);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        state.savedRange = range.cloneRange();
      }
    }

    state.linkAnchor = null;
    markUserChange();
    scheduleUiUpdate();
    showToast('链接已插入');
  }

  function openImageDialog() {
    saveSelection();
    state.pendingRange = getEditorSelection()
      ? getEditorSelection().getRangeAt(0).cloneRange()
      : (state.savedRange ? state.savedRange.cloneRange() : null);
    imageError.textContent = '';
    imageUrl.classList.remove('is-invalid');
    imageUrl.value = '';
    imageAlt.value = '';
    openOverlay(imageOverlay, '#imageUrl');
  }

  function submitImageForm(event) {
    event.preventDefault();
    imageError.textContent = '';
    imageUrl.classList.remove('is-invalid');

    const safeUrl = normalizeUrl(imageUrl.value, 'image');
    if (!imageUrl.value.trim()) {
      imageUrl.classList.add('is-invalid');
      imageError.textContent = '请填写图片地址。';
      imageUrl.focus();
      return;
    }
    if (!safeUrl) {
      imageUrl.classList.add('is-invalid');
      imageError.textContent = '图片地址格式不正确，请使用有效的 http / https 地址。';
      imageUrl.focus();
      return;
    }

    const alt = imageAlt.value.trim();
    closeOverlay(imageOverlay, { restoreFocus: false });
    editor.focus({ preventScroll: true });
    if (state.pendingRange) {
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(state.pendingRange);
        state.savedRange = state.pendingRange.cloneRange();
      } catch {
        placeCaretAtEnd();
      }
    } else {
      placeCaretAtEnd();
    }

    const marker = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const html = `<img src="${escapeAttr(safeUrl)}" alt="${escapeAttr(alt)}" data-ml-temp="${marker}">`;
    document.execCommand('insertHTML', false, html);
    const inserted = editor.querySelector(`[data-ml-temp="${marker}"]`);
    if (inserted) {
      inserted.removeAttribute('data-ml-temp');
      const range = document.createRange();
      range.setStartAfter(inserted);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      state.savedRange = range.cloneRange();
    }

    markUserChange();
    scheduleUiUpdate();
    showToast('图片已插入');
  }

  function openTableDialog() {
    saveSelection();
    state.pendingRange = getEditorSelection()
      ? getEditorSelection().getRangeAt(0).cloneRange()
      : (state.savedRange ? state.savedRange.cloneRange() : null);
    tableCols.value = '3';
    tableRows.value = '2';
    renderTablePreview();
    openOverlay(tableOverlay, '#tableCols');
  }

  function renderTablePreview() {
    const cols = clamp(tableCols.value, 1, 8);
    const rows = clamp(tableRows.value, 1, 20);
    const previewRows = Math.min(rows + 1, 4);
    tablePreview.innerHTML = '';
    tablePreview.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    for (let row = 0; row < previewRows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cell = document.createElement('span');
        cell.className = row === 0 ? 'table-preview-cell is-header' : 'table-preview-cell';
        tablePreview.appendChild(cell);
      }
    }
  }

  function submitTableForm(event) {
    event.preventDefault();
    const cols = clamp(tableCols.value, 1, 8);
    const rows = clamp(tableRows.value, 1, 20);
    const rangeToUse = state.pendingRange || state.savedRange;

    closeOverlay(tableOverlay, { restoreFocus: false });
    editor.focus({ preventScroll: true });

    if (rangeToUse) {
      try {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToUse);
        state.savedRange = rangeToUse.cloneRange();
      } catch {
        placeCaretAtEnd();
      }
    } else {
      placeCaretAtEnd();
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let col = 0; col < cols; col += 1) {
      const th = document.createElement('th');
      th.textContent = `列 ${col + 1}`;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let row = 0; row < rows; row += 1) {
      const tr = document.createElement('tr');
      for (let col = 0; col < cols; col += 1) {
        const td = document.createElement('td');
        td.innerHTML = '<br>';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const paragraph = document.createElement('p');
    paragraph.innerHTML = '<br>';

    const active = getActiveElement();
    let topLevel = active;
    while (topLevel && topLevel.parentElement && topLevel.parentElement !== editor) {
      topLevel = topLevel.parentElement;
    }
    if (!topLevel || topLevel.parentElement !== editor) {
      topLevel = editor.lastElementChild;
    }

    if (topLevel && topLevel.parentElement === editor) {
      topLevel.insertAdjacentElement('afterend', table);
      table.insertAdjacentElement('afterend', paragraph);
    } else {
      editor.appendChild(table);
      editor.appendChild(paragraph);
    }

    const firstHeader = table.querySelector('th');
    if (firstHeader) selectElementContents(firstHeader);
    saveSelection();
    updateTableBubble();
    markUserChange();
    scheduleUiUpdate();
    showToast('表格已插入，工具栏下方可快速增减行列');
  }

  function createNewDocument() {
    closeOverlay(confirmOverlay, { restoreFocus: false });
    docTitle.value = '未命名文档';
    editor.innerHTML = '<p><br></p>';
    state.savedRange = null;
    updateDocumentTitle();
    checkEmpty();
    updateCounts();
    saveDraft();
    editor.focus({ preventScroll: true });
    placeCaretInElement(editor.querySelector('p'), true);
    scheduleUiUpdate();
    showToast('已创建空白文档');
  }

  /* --------------------------------------------------------
     表格浮动工具
     -------------------------------------------------------- */

  function setupTableBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'table-bubble';
    bubble.hidden = true;
    bubble.setAttribute('role', 'toolbar');
    bubble.setAttribute('aria-label', '表格操作');
    bubble.innerHTML = `
      <span class="table-bubble-label">表格</span>
      <button type="button" data-table-action="row-add" title="在下方增加一行">
        <svg class="icon"><use href="#i-rows"></use></svg>行 +
      </button>
      <button type="button" data-table-action="col-add" title="在右侧增加一列">
        <svg class="icon"><use href="#i-columns"></use></svg>列 +
      </button>
      <span class="table-bubble-sep" aria-hidden="true"></span>
      <button type="button" data-table-action="row-delete" title="删除当前行" class="danger">行 −</button>
      <button type="button" data-table-action="col-delete" title="删除当前列" class="danger">列 −</button>
      <span class="table-bubble-sep" aria-hidden="true"></span>
      <button type="button" data-table-action="table-delete" title="删除整个表格" class="danger">
        <svg class="icon"><use href="#i-trash"></use></svg>表格
      </button>
    `;
    bubble.addEventListener('mousedown', (event) => {
      if (event.target.closest('button')) event.preventDefault();
    });
    bubble.addEventListener('click', handleTableBubbleAction);
    const toolbarShell = $('.toolbar-shell');
    if (toolbarShell) toolbarShell.appendChild(bubble);
    state.tableBubble = bubble;
  }

  function hideTableBubble() {
    if (state.tableBubble) state.tableBubble.hidden = true;
    state.currentTable = null;
    state.currentCell = null;
  }

  function scheduleTableBubbleUpdate() {
    if (state.tableFrame) return;
    state.tableFrame = requestAnimationFrame(() => {
      state.tableFrame = null;
      updateTableBubble();
    });
  }

  function updateTableBubble() {
    const bubble = state.tableBubble;
    if (!bubble) return;
    if (state.activeOverlay) {
      bubble.hidden = true;
      return;
    }

    const active = getActiveElement();
    const table = active && active.closest('table');
    if (!table || !editor.contains(table)) {
      bubble.hidden = true;
      state.currentTable = null;
      state.currentCell = null;
      return;
    }

    const cell = active.closest('th, td');
    state.currentTable = table;
    state.currentCell = cell;
    bubble.hidden = false;
  }

  function getTableRows(table) {
    return Array.from(table.querySelectorAll('tr')).filter(
      (row) => row.closest('table') === table
    );
  }

  function focusTableCell(cell, atStart = true) {
    if (!cell) return;
    if (!cell.firstChild) cell.innerHTML = '<br>';
    placeCaretInElement(cell, atStart);
    updateTableBubble();
    scheduleUiUpdate();
  }

  function addTableRow(cell, focus = true) {
    const row = cell && cell.closest('tr');
    const table = row && row.closest('table');
    if (!row || !table) return null;

    const newRow = document.createElement('tr');
    const cellCount = row.children.length;
    for (let index = 0; index < cellCount; index += 1) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }

    if (row.parentElement && row.parentElement.tagName === 'THEAD') {
      const tbody = table.tBodies[0] || table.appendChild(document.createElement('tbody'));
      tbody.insertBefore(newRow, tbody.firstChild);
    } else {
      row.insertAdjacentElement('afterend', newRow);
    }

    if (focus && newRow.cells[0]) focusTableCell(newRow.cells[0], true);
    markUserChange();
    scheduleUiUpdate();
    return newRow;
  }

  function addTableColumn(cell, focus = true) {
    const row = cell && cell.closest('tr');
    const table = row && row.closest('table');
    if (!row || !table) return null;

    const rows = getTableRows(table);
    const cellIndex = Array.from(row.children).indexOf(cell);
    const columnIndex = Math.max(0, cellIndex);
    let focusTarget = null;

    rows.forEach((tableRow) => {
      const reference = tableRow.children[columnIndex] || tableRow.lastElementChild;
      if (!reference) return;
      const newCell = document.createElement(reference.tagName === 'TH' ? 'th' : 'td');
      newCell.innerHTML = '<br>';
      reference.insertAdjacentElement('afterend', newCell);
      if (tableRow === row) focusTarget = newCell;
    });

    if (focus && focusTarget) focusTableCell(focusTarget, true);
    markUserChange();
    scheduleUiUpdate();
    return focusTarget;
  }

  function deleteTableRow(cell) {
    const row = cell && cell.closest('tr');
    const table = row && row.closest('table');
    if (!row || !table) return;

    if (row.parentElement && row.parentElement.tagName === 'THEAD') {
      showToast('表头行不能删除，可以删除整个表格', { error: true });
      return;
    }

    const rows = getTableRows(table);
    if (rows.length <= 1) {
      deleteTable(table);
      return;
    }

    const rowIndex = rows.indexOf(row);
    row.remove();
    const remaining = getTableRows(table);
    const nextRow = remaining[Math.min(rowIndex, remaining.length - 1)];
    const target = nextRow && (nextRow.cells[0] || nextRow.lastElementChild);
    if (target) focusTableCell(target, true);
    markUserChange();
    scheduleUiUpdate();
  }

  function deleteTableColumn(cell) {
    const row = cell && cell.closest('tr');
    const table = row && row.closest('table');
    if (!row || !table) return;

    const cellCount = row.cells.length;
    if (cellCount <= 1) {
      showToast('表格至少需要保留一列', { error: true });
      return;
    }

    const columnIndex = Array.from(row.children).indexOf(cell);
    getTableRows(table).forEach((tableRow) => {
      if (tableRow.children[columnIndex]) tableRow.children[columnIndex].remove();
    });

    const nextTarget = row.children[Math.min(columnIndex, row.children.length - 1)];
    if (nextTarget) focusTableCell(nextTarget, true);
    markUserChange();
    scheduleUiUpdate();
  }

  function deleteTable(table = state.currentTable) {
    if (!table || !table.isConnected) return;
    const parent = table.parentNode;
    const anchor = document.createElement('p');
    anchor.innerHTML = '<br>';
    table.insertAdjacentElement('afterend', anchor);
    table.remove();
    placeCaretInElement(anchor, true);
    hideTableBubble();
    markUserChange();
    scheduleUiUpdate();
  }

  function handleTableBubbleAction(event) {
    const button = event.target.closest('[data-table-action]');
    if (!button) return;
    const action = button.dataset.tableAction;
    const table = state.currentTable;
    const cell = state.currentCell || (table && table.querySelector('th, td'));
    if (!table || !table.isConnected || !cell) {
      hideTableBubble();
      return;
    }

    if (action === 'row-add') addTableRow(cell, true);
    if (action === 'col-add') addTableColumn(cell, true);
    if (action === 'row-delete') deleteTableRow(cell);
    if (action === 'col-delete') deleteTableColumn(cell);
    if (action === 'table-delete') deleteTable(table);
    scheduleTableBubbleUpdate();
  }

  function moveTableCellFocus(direction) {
    const active = getActiveElement();
    const cell = active && active.closest('th, td');
    const table = cell && cell.closest('table');
    if (!cell || !table) return;

    const cells = Array.from(table.querySelectorAll('th, td')).filter(
      (tableCell) => tableCell.closest('table') === table
    );
    const currentIndex = cells.indexOf(cell);

    if (direction > 0 && currentIndex === cells.length - 1) {
      const newRow = addTableRow(cell, false);
      if (newRow && newRow.cells[0]) focusTableCell(newRow.cells[0], true);
      return;
    }

    if (direction < 0 && currentIndex <= 0) {
      placeCaretInElement(cell, true);
      return;
    }

    const target = cells[currentIndex + direction];
    if (target) focusTableCell(target, true);
  }

  /* --------------------------------------------------------
     导出 Markdown
     -------------------------------------------------------- */

  function openExportDialog() {
    if (getEditorSelection()) saveSelection();
    closeMenus();
    renderExportMarkdown();
    const focusSelector = copyBtn.disabled ? '.modal-close' : '#copyBtn';
    openOverlay(exportOverlay, focusSelector);
  }

  function renderExportMarkdown() {
    if (!markdownOutput) return;
    const markdown = htmlToMarkdown(editor, keepStyles.checked);
    markdownOutput.value = markdown;
    const hasContent = Boolean(markdown.trim());
    copyBtn.disabled = !hasContent;
    downloadBtn.disabled = !hasContent;
    markdownOutput.placeholder = '还没有可导出的内容，先回到编辑器写点什么吧。';

    const lineCount = hasContent ? markdown.replace(/\n$/, '').split('\n').length : 0;
    mdStats.textContent = `${markdown.length} 字符 · ${lineCount} 行`;
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // 退回到 execCommand，兼容 file:// 或权限受限的场景。
      }
    }

    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.top = '-1000px';
    helper.style.left = '-1000px';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    }
    helper.remove();
    return success;
  }

  async function copyMarkdown() {
    if (copyBtn.disabled) return;
    const text = markdownOutput.value;
    if (!text.trim()) {
      showToast('还没有可复制的内容', { error: true });
      return;
    }

    const success = await copyTextToClipboard(text);
    if (!success) {
      markdownOutput.focus();
      markdownOutput.select();
      showToast('复制失败，已为你选中文本，请按 Ctrl / ⌘ + C', { error: true, duration: 3800 });
      return;
    }

    copyBtn.classList.add('is-copied');
    copyLabel.textContent = '已复制';
    setIcon(copyBtn.querySelector('use'), '#i-check');
    showToast('Markdown 已复制到剪贴板');
    if (state.activeOverlay === exportOverlay) copyBtn.focus({ preventScroll: true });
    window.clearTimeout(state.copiedTimer);
    state.copiedTimer = window.setTimeout(() => {
      copyBtn.classList.remove('is-copied');
      copyLabel.textContent = '复制 Markdown';
      setIcon(copyBtn.querySelector('use'), '#i-copy');
    }, 1800);

    if (document.activeElement === editor) saveSelection();
  }

  function safeFileName(title) {
    const base = String(title || '未命名文档')
      .replace(/[\\/:*?"<>|]/g, '–')
      .replace(/\.md$/i, '')
      .replace(/\s+/g, ' ')
      .replace(/^[.\s]+|[.\s]+$/g, '')
      .slice(0, 80);
    return (base || '未命名文档') + '.md';
  }

  function downloadMarkdown() {
    if (downloadBtn.disabled) return;
    const text = markdownOutput.value;
    const filename = safeFileName(docTitle.value.trim() || '未命名文档');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast(`已下载 ${filename}`);
  }

  /* --------------------------------------------------------
     HTML → Markdown 转换
     -------------------------------------------------------- */

  function htmlToMarkdown(root, keepRich) {
    if (!root) return '';
    const clone = root.cloneNode(true);
    const context = { keepRich: keepRich !== false };
    let markdown = serializeBlockChildren(clone, context, 'left');
    markdown = markdown.replace(ZERO_WIDTH, '').replace(/^\n+|\n+$/g, '');
    return markdown;
  }

  function serializeBlockChildren(container, context, inheritedAlign = 'left') {
    const blocks = [];
    let inlineBuffer = [];

    const flushInline = () => {
      if (!inlineBuffer.length) return;
      const nodes = inlineBuffer;
      inlineBuffer = [];
      const markdown = serializeInlineNodes(nodes, context, 'markdown').trim();
      if (!hasVisibleMarkdown(markdown)) return;

      if (context.keepRich && isNonLeftAlignment(inheritedAlign)) {
        const html = serializeInlineNodes(nodes, context, 'html').trim();
        blocks.push(`<p align="${escapeAttr(inheritedAlign)}">${html}</p>`);
      } else {
        blocks.push(markdown);
      }
    };

    for (const node of Array.from(container.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.nodeValue.trim() && !inlineBuffer.length) continue;
        inlineBuffer.push(node);
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (node.tagName === 'INPUT' && node.classList.contains('task-check')) continue;

      if (node.tagName === 'BR') {
        if (inlineBuffer.length) inlineBuffer.push(node);
        continue;
      }

      if (isBlockTag(node.tagName)) {
        flushInline();
        const markdown = serializeBlockNode(node, context, inheritedAlign);
        if (markdown && hasVisibleMarkdown(markdown)) blocks.push(markdown);
      } else {
        inlineBuffer.push(node);
      }
    }

    flushInline();
    return joinMarkdownBlocks(blocks);
  }

  function joinMarkdownBlocks(blocks) {
    return blocks
      .map((block) => String(block).replace(/\n+$/g, ''))
      .filter((block) => block.trim())
      .join('\n\n');
  }

  function isNonLeftAlignment(align) {
    return align === 'center' || align === 'right' || align === 'justify';
  }

  function readInlineAlignment(element) {
    if (!element) return '';
    const inlineStyle = element.style ? element.style.textAlign : '';
    const attribute = element.getAttribute ? element.getAttribute('align') : '';
    const value = String(inlineStyle || attribute || '').toLowerCase();
    if (value === 'center' || value === 'right' || value === 'justify') return value;
    if (value === 'left' || value === 'start') return 'left';
    if (value === 'end') return 'right';
    return '';
  }

  function resolveAlignment(element, inherited) {
    const own = readInlineAlignment(element);
    return own || inherited || 'left';
  }

  function serializeBlockNode(element, context, inheritedAlign = 'left') {
    const tag = element.tagName;
    const alignment = resolveAlignment(element, inheritedAlign);

    if (/^H[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      const markdown = serializeInlineChildren(element, context, 'markdown').trim();
      if (!hasVisibleMarkdown(markdown)) return '';
      if (context.keepRich && isNonLeftAlignment(alignment)) {
        const html = serializeInlineChildren(element, context, 'html').trim();
        return `<h${level} align="${escapeAttr(alignment)}">${html}</h${level}>`;
      }
      return `${'#'.repeat(level)} ${markdown.replace(/\s*\n\s*/g, ' ')}`;
    }

    if (tag === 'P' || tag === 'DIV') {
      if (elementHasBlockChild(element)) {
        return serializeBlockChildren(element, context, alignment);
      }
      const markdown = serializeInlineChildren(element, context, 'markdown').trim();
      if (!hasVisibleMarkdown(markdown)) return '';
      if (context.keepRich && isNonLeftAlignment(alignment)) {
        const html = serializeInlineChildren(element, context, 'html').trim();
        return `<p align="${escapeAttr(alignment)}">${html}</p>`;
      }
      return markdown;
    }

    if (tag === 'BLOCKQUOTE') {
      const inner = serializeBlockChildren(element, context, alignment);
      if (!inner.trim()) return '';
      return inner
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
    }

    if (tag === 'PRE') {
      return serializeCodeBlock(element);
    }

    if (tag === 'UL' || tag === 'OL') {
      return serializeList(element, context, 0);
    }

    if (tag === 'TABLE') {
      return serializeTable(element, context);
    }

    if (tag === 'HR') {
      return '---';
    }

    if (tag === 'LI') {
      const content = serializeInlineChildren(element, context, 'markdown').trim();
      return hasVisibleMarkdown(content) ? `- ${content}` : '';
    }

    if (elementHasBlockChild(element)) {
      return serializeBlockChildren(element, context, alignment);
    }

    const markdown = serializeInlineChildren(element, context, 'markdown').trim();
    if (!hasVisibleMarkdown(markdown)) return '';
    if (context.keepRich && isNonLeftAlignment(alignment)) {
      const html = serializeInlineChildren(element, context, 'html').trim();
      return `<p align="${escapeAttr(alignment)}">${html}</p>`;
    }
    return markdown;
  }

  function hasVisibleMarkdown(value) {
    return String(value)
      .replace(ZERO_WIDTH, '')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/<br\s*\/?>/gi, '')
      .trim().length > 0;
  }

  function getPreText(element) {
    let output = '';
    const visit = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        output += node.nodeValue.replace(/\u00a0/g, ' ');
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (node.tagName === 'BR') {
        output += '\n';
        return;
      }

      const blockish = node.tagName === 'DIV' || node.tagName === 'P' || node.tagName === 'LI';
      if (blockish) {
        if (output && !output.endsWith('\n')) output += '\n';
        Array.from(node.childNodes).forEach(visit);
        if (output && !output.endsWith('\n')) output += '\n';
        return;
      }

      Array.from(node.childNodes).forEach(visit);
    };
    Array.from(element.childNodes).forEach(visit);
    return output.replace(/\n+$/g, '');
  }

  function serializeCodeBlock(pre) {
    const code = pre.querySelector('code');
    const source = code || pre;
    const text = getPreText(source);
    if (!text.trim()) return '';

    let language = '';
    const codeClass = code ? code.getAttribute('class') || '' : '';
    const languageMatch = codeClass.match(/(?:^|\s)language-([a-z0-9_+#.-]+)/i);
    if (languageMatch) language = languageMatch[1];

    const backtickRuns = text.match(/`+/g) || [];
    const maxRun = backtickRuns.reduce((max, run) => Math.max(max, run.length), 0);
    const fence = '`'.repeat(Math.max(3, maxRun + 1));

    return `${fence}${language}\n${text}\n${fence}`;
  }

  function serializeList(list, context, depth) {
    const items = Array.from(list.children).filter((child) => child.tagName === 'LI');
    if (!items.length) return '';

    const isOrdered = list.tagName === 'OL';
    const isTask = list.classList.contains('task-list');
    const lines = [];

    items.forEach((item, index) => {
      const checkbox = Array.from(item.children).find(
        (child) => child.tagName === 'INPUT' && child.type === 'checkbox'
      );
      const checked = item.dataset.checked === 'true' || Boolean(checkbox && checkbox.checked);
      const content = serializeListItemContent(item, context);
      const marker = isTask
        ? `- [${checked ? 'x' : ' '}] `
        : isOrdered
          ? `${index + 1}. `
          : '- ';
      const indent = '    '.repeat(depth);
      const continuationIndent = ' '.repeat(marker.length);
      const contentLines = content.split('\n');

      if (!contentLines.length) contentLines.push('');
      lines.push(indent + marker + contentLines[0]);
      for (let lineIndex = 1; lineIndex < contentLines.length; lineIndex += 1) {
        lines.push(indent + continuationIndent + contentLines[lineIndex]);
      }

      Array.from(item.children)
        .filter((child) => child.tagName === 'UL' || child.tagName === 'OL')
        .forEach((nestedList) => {
          const nested = serializeList(nestedList, context, depth + 1);
          if (nested.trim()) lines.push(nested);
        });
    });

    return lines.join('\n');
  }

  function serializeListItemContent(item, context) {
    const clone = item.cloneNode(true);
    Array.from(clone.children).forEach((child) => {
      if (child.tagName === 'INPUT') child.remove();
      if (child.tagName === 'UL' || child.tagName === 'OL') child.remove();
    });
    return serializeInlineChildren(clone, context, 'markdown')
      .replace(/^\n+|\n+$/g, '')
      .trim();
  }

  function serializeTable(table, context) {
    const rows = getTableRows(table);
    if (!rows.length) return '';

    const matrix = rows.map((row) => Array.from(row.children)
      .filter((cell) => cell.tagName === 'TD' || cell.tagName === 'TH')
      .map((cell) => serializeTableCell(cell, context)));

    const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
    if (!width) return '';

    const normalized = matrix.map((row) => {
      const next = row.slice();
      while (next.length < width) next.push(' ');
      return next;
    });

    const headerCells = Array.from(rows[0].children).filter(
      (cell) => cell.tagName === 'TD' || cell.tagName === 'TH'
    );
    const header = normalized[0];
    const separator = header.map((_, index) => {
      const cell = headerCells[index];
      const align = cell ? readInlineAlignment(cell) : '';
      if (align === 'center') return ':---:';
      if (align === 'right' || align === 'end') return '---:';
      return '---';
    });

    const lines = [`| ${header.join(' | ')} |`, `| ${separator.join(' | ')} |`];
    normalized.slice(1).forEach((row) => {
      lines.push(`| ${row.join(' | ')} |`);
    });

    return lines.join('\n');
  }

  function serializeTableCell(cell, context) {
    let content = serializeInlineChildren(cell, context, 'markdown').trim();
    content = content.replace(/\r?\n/g, '<br>');
    content = content.replace(/\|/g, '\\|');
    return content || ' ';
  }

  function serializeInlineChildren(parent, context, mode) {
    let output = '';
    Array.from(parent.childNodes).forEach((node) => {
      output += serializeInlineNode(node, context, mode);
    });
    return output;
  }

  function serializeInlineNodes(nodes, context, mode) {
    return nodes.map((node) => serializeInlineNode(node, context, mode)).join('');
  }

  function serializeInlineNode(node, context, mode = 'markdown') {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) {
      return mode === 'html' ? escapeHtmlText(node.nodeValue) : escapeMarkdownText(node.nodeValue);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    if (node.tagName === 'INPUT' || tag === 'script' || tag === 'style') return '';
    if (node.hidden || node.getAttribute('aria-hidden') === 'true') return '';

    if (tag === 'br') {
      return mode === 'html' ? '<br>' : '  \n';
    }

    if (tag === 'img') {
      return serializeImage(node, mode);
    }

    if (tag === 'a') {
      return serializeLink(node, context, mode);
    }

    if (tag === 'pre') {
      const inline = getPreText(node).trim();
      return serializeCodeText(inline, mode);
    }

    if (tag === 'code') {
      const text = (node.textContent || '').replace(/\u00a0/g, ' ').replace(/\r?\n/g, ' ');
      return serializeCodeText(text, mode);
    }

    let content = serializeInlineChildren(node, context, mode);
    if (!content) return '';

    const style = parseInlineStyle(node);
    const bold = tag === 'strong' || tag === 'b' || style.bold;
    const italic = tag === 'em' || tag === 'i' || style.italic;
    const underline = tag === 'u' || tag === 'ins' || style.underline;
    const strike = tag === 's' || tag === 'strike' || tag === 'del' || style.strike;

    if (bold && italic) {
      content = mode === 'html'
        ? `<strong><em>${content}</em></strong>`
        : wrapMarkdown(content, '***');
    } else if (bold) {
      content = mode === 'html' ? `<strong>${content}</strong>` : wrapMarkdown(content, '**');
    } else if (italic) {
      content = mode === 'html' ? `<em>${content}</em>` : wrapMarkdown(content, '*');
    }

    if (underline) {
      if (mode === 'html' || context.keepRich) content = `<u>${content}</u>`;
    }

    if (strike) {
      content = mode === 'html' ? `<s>${content}</s>` : wrapMarkdown(content, '~~');
    }

    if (tag === 'sup') content = `<sup>${content}</sup>`;
    if (tag === 'sub') content = `<sub>${content}</sub>`;

    if (context.keepRich) {
      const color = style.color && !isNearBlack(colorToKeep(style.color)) ? style.color : '';
      const background = style.background || (tag === 'mark' ? '#fef3c7' : '');
      if (background) {
        const styleValue = `background-color: ${background}${color ? `; color: ${color}` : ''}`;
        content = `<mark style="${escapeAttr(styleValue)}">${content}</mark>`;
      } else if (color) {
        content = `<span style="color: ${escapeAttr(color)}">${content}</span>`;
      } else if (tag === 'mark') {
        content = `<mark>${content}</mark>`;
      }
    }

    return content;
  }

  function colorToKeep(color) {
    return normalizeColor(color) || '';
  }

  function isNearBlack(color) {
    if (!color) return true;
    return ['#000000', '#111111', '#1f1f1f', '#26251f', '#292923', '#33332c'].includes(
      String(color).toLowerCase()
    );
  }

  function escapeHtmlText(value) {
    return escapeHtml(value).replace(/\u00a0/g, '&nbsp;');
  }

  function escapeMarkdownText(value) {
    let text = String(value).replace(/\u00a0/g, ' ');
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\\/g, '\\\\')
      .replace(/([`*_[\]])/g, '\\$1');

    text = text
      .replace(/^([ \t]*)(#{1,6})(?=\s)/gm, '$1\\$2')
      .replace(/^([ \t]*)([-+])(?=\s)/gm, '$1\\$2')
      .replace(/^([ \t]*)(\d+)\.(?=\s)/gm, '$1$2\\.');

    return text;
  }

  function wrapMarkdown(content, marker) {
    if (!content) return '';
    const leadingMatch = content.match(/^\s*/);
    const trailingMatch = content.match(/\s*$/);
    const leading = leadingMatch ? leadingMatch[0] : '';
    const trailing = trailingMatch ? trailingMatch[0] : '';
    const end = trailing ? content.length - trailing.length : content.length;
    const inner = content.slice(leading.length, end);
    if (!inner) return content;
    return `${leading}${marker}${inner}${marker}${trailing}`;
  }

  function serializeCodeText(text, mode) {
    if (!text) return '';
    if (mode === 'html') return `<code>${escapeHtml(text)}</code>`;

    const normalized = String(text).replace(/\n/g, ' ');
    let longest = 0;
    const runs = normalized.match(/`+/g) || [];
    runs.forEach((run) => { longest = Math.max(longest, run.length); });
    const fence = '`'.repeat(longest + 1);
    const needsPadding = /^`|`$/.test(normalized) || /^\s|\s$/.test(normalized);
    return `${fence}${needsPadding ? ' ' : ''}${normalized}${needsPadding ? ' ' : ''}${fence}`;
  }

  function serializeImage(image, mode) {
    const src = normalizeUrl(image.getAttribute('src') || '', 'image');
    if (!src) return '';
    const alt = String(image.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
    const title = String(image.getAttribute('title') || '').replace(/\s+/g, ' ').trim();

    if (mode === 'html') {
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${
        title ? ` title="${escapeAttr(title)}"` : ''
      }>`;
    }

    const safeAlt = alt
      .replace(/\\/g, '\\\\')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
    const titlePart = title
      ? ` "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
      : '';
    return `![${safeAlt}](${markdownUrl(src)}${titlePart})`;
  }

  function serializeLink(link, context, mode) {
    const href = normalizeUrl(link.getAttribute('href') || '', 'link');
    const label = serializeInlineChildren(link, context, mode).trim();
    if (!href) return label;
    const text = label || escapeMarkdownText(href);
    const title = String(link.getAttribute('title') || '').replace(/\s+/g, ' ').trim();

    if (mode === 'html') {
      return `<a href="${escapeAttr(href)}"${title ? ` title="${escapeAttr(title)}"` : ''}>${text}</a>`;
    }

    const titlePart = title
      ? ` "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
      : '';
    return `[${text}](${markdownUrl(href)}${titlePart})`;
  }

  function markdownUrl(url) {
    return String(url)
      .replace(/\\/g, '%5C')
      .replace(/ /g, '%20')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E');
  }

  /* 初始化在文件末尾调用。 */
  initialize();
})();
