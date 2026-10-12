import {
  FlashcardDeck,
  FlashcardItem,
  SlideDeck,
  SlideItem,
  CheatsheetDoc,
  CheatsheetSection,
  CheatsheetItem,
} from '@/types';

// ============================================================================
// FLASHCARDS PARSER & SERIALIZER
// ============================================================================

export function parseCardDeck(raw: string, defaultTitle = 'Набор карточек'): FlashcardDeck {
  if (!raw || !raw.trim()) {
    return {
      id: 'deck_' + Date.now(),
      title: defaultTitle,
      activeCardIndex: 0,
      cards: [
        {
          id: 'card_1',
          term: 'Новая карточка',
          category: 'ОБЩЕЕ',
          front: 'Вопрос или термин...',
          back: 'Ответ или пояснение...',
        },
      ],
    };
  }

  // Support multi-card separator === NEXT_CARD ===
  const rawCards = raw.split(/=== NEXT_CARD ===/i);
  const cards: FlashcardItem[] = [];

  rawCards.forEach((cardBlock, idx) => {
    const trimmed = cardBlock.trim();
    if (!trimmed) return;

    let category = 'ОБЩЕЕ';
    let term = `Карточка #${idx + 1}`;
    let remaining = trimmed;

    // Parse metadata tags if present: [CATEGORY: ...]
    const catMatch = remaining.match(/\[CATEGORY:\s*([^\]]+)\]/i);
    if (catMatch) {
      category = catMatch[1].trim();
      remaining = remaining.replace(catMatch[0], '').trim();
    }

    // Parse metadata tags if present: [TERM: ...]
    const termMatch = remaining.match(/\[TERM:\s*([^\]]+)\]/i);
    if (termMatch) {
      term = termMatch[1].trim();
      remaining = remaining.replace(termMatch[0], '').trim();
    }

    // Split front and back
    const parts = remaining.split(/=== BACK ===/i);
    const front = (parts[0] || '').trim();
    const back = (parts[1] || '').trim();

    // Auto-extract term from front if term was not explicitly provided and front has heading
    if (term === `Карточка #${idx + 1}`) {
      const headingMatch = front.match(/^#+\s*(.+)$/m);
      if (headingMatch) {
        term = headingMatch[1].trim();
      }
    }

    cards.push({
      id: `card_${Date.now()}_${idx}`,
      term,
      category,
      front: front || 'Лицевая сторона...',
      back: back || 'Обратная сторона...',
    });
  });

  return {
    id: 'deck_' + Date.now(),
    title: defaultTitle,
    activeCardIndex: 0,
    cards: cards.length > 0 ? cards : [
      {
        id: 'card_1',
        term: 'Карточка',
        category: 'ОБЩЕЕ',
        front: raw,
        back: '',
      },
    ],
  };
}

export function serializeCardDeck(deck: FlashcardDeck): string {
  if (!deck.cards || deck.cards.length === 0) return '';

  return deck.cards
    .map((card) => {
      const catHeader = card.category ? `[CATEGORY: ${card.category}]\n` : '';
      const termHeader = card.term ? `[TERM: ${card.term}]\n` : '';
      return `${catHeader}${termHeader}${card.front}\n=== BACK ===\n${card.back}`.trim();
    })
    .join('\n\n=== NEXT_CARD ===\n\n');
}

// ============================================================================
// SLIDES PARSER & SERIALIZER
// ============================================================================

export function parseSlideDeck(raw: string, defaultTitle = 'Презентация'): SlideDeck {
  if (!raw || !raw.trim()) {
    return {
      id: 'deck_' + Date.now(),
      title: defaultTitle,
      activeSlideIndex: 0,
      aspectRatio: '16:9',
      slides: [
        {
          id: 'slide_1',
          title: 'Слайд 1',
          tag: 'SLIDE 1/1',
          content: '# Титульный слайд\n\nТекст презентации...',
          layout: 'default',
        },
      ],
    };
  }

  const rawSlides = raw.split(/\n---\s*\n/);
  const slides: SlideItem[] = rawSlides.map((slideContent, idx) => {
    const trimmed = slideContent.trim();
    const headingMatch = trimmed.match(/^#\s*(.+)$/m);
    const title = headingMatch ? headingMatch[1].trim() : `Слайд ${idx + 1}`;
    const tag = `SLIDE ${idx + 1}/${rawSlides.length}`;

    return {
      id: `slide_${Date.now()}_${idx}`,
      title,
      tag,
      content: trimmed,
      layout: 'default',
    };
  });

  return {
    id: 'deck_' + Date.now(),
    title: defaultTitle,
    activeSlideIndex: 0,
    aspectRatio: '16:9',
    slides,
  };
}

export function serializeSlideDeck(deck: SlideDeck): string {
  if (!deck.slides || deck.slides.length === 0) return '';
  return deck.slides.map((s) => s.content.trim()).join('\n\n---\n\n');
}

// ============================================================================
// CHEATSHEET PARSER & SERIALIZER
// ============================================================================

export function parseCheatsheetDoc(raw: string, defaultTitle = 'Интерактивная шпаргалка'): CheatsheetDoc {
  if (!raw || !raw.trim()) {
    return {
      id: 'cheat_' + Date.now(),
      title: defaultTitle,
      columns: 2,
      sections: [],
    };
  }

  const lines = raw.split('\n');
  const sections: CheatsheetSection[] = [];
  let currentSection: CheatsheetSection = {
    id: 'sec_1',
    title: 'Основные команды',
    items: [],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section heading: ## Heading or # Heading
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '').trim();
      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `sec_${sections.length + 1}`,
        title: headingText,
        items: [],
      };
      continue;
    }

    // Match code pattern: `command` — description or `command` - description
    const codeMatch = trimmed.match(/^`([^`]+)`\s*(?:—|-|:)\s*(.+)$/);
    if (codeMatch) {
      currentSection.items.push({
        cmd: codeMatch[1].trim(),
        desc: codeMatch[2].trim(),
      });
      continue;
    }

    // Match list pattern: - command: description
    const listMatch = trimmed.match(/^-\s*`?([^`:]+)`?\s*(?:—|-|:)\s*(.+)$/);
    if (listMatch) {
      currentSection.items.push({
        cmd: listMatch[1].trim(),
        desc: listMatch[2].trim(),
      });
      continue;
    }

    // Fallback item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentSection.items.push({
        cmd: trimmed.replace(/^[-*]\s*/, ''),
        desc: '',
      });
    }
  }

  if (currentSection.items.length > 0 || sections.length === 0) {
    sections.push(currentSection);
  }

  return {
    id: 'cheat_' + Date.now(),
    title: defaultTitle,
    columns: 2,
    sections,
  };
}

export function serializeCheatsheetDoc(doc: CheatsheetDoc): string {
  if (!doc.sections || doc.sections.length === 0) return '';

  return doc.sections
    .map((section) => {
      const header = `## ${section.title}\n`;
      const itemsText = section.items
        .map((item) => (item.desc ? `\`${item.cmd}\` — ${item.desc}` : `- \`${item.cmd}\``))
        .join('\n');
      return `${header}${itemsText}`;
    })
    .join('\n\n');
}
