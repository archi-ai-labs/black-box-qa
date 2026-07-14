export function getRelativeTime(timestamp: string, locale: 'vi' | 'en' = 'vi'): string {
  const elapsed = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'en') {
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  if (seconds < 10) return 'Vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

export function parseSharedMemory(text: string) {
  const sections = {
    rules: [] as string[],
    patterns: [] as string[],
    checklist: [] as string[]
  };

  if (!text) return sections;

  const lines = text.split('\n');
  let currentSection: 'none' | 'rules' | 'patterns' | 'checklist' = 'none';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Quy tắc làm việc nghiêm ngặt') || line.includes('Strict QA Persona')) {
      currentSection = 'rules';
      continue;
    } else if (line.includes('Nhật ký Kinh nghiệm') || line.includes('🧠 Nhật ký Kinh nghiệm') || line.includes('Bug Patterns')) {
      currentSection = 'patterns';
      continue;
    } else if (line.includes('Checklist Kiểm thử Tổng hợp') || line.includes('Checklist')) {
      currentSection = 'checklist';
      continue;
    }

    if (currentSection === 'rules') {
      sections.rules.push(line);
    } else if (currentSection === 'patterns') {
      sections.patterns.push(line);
    } else if (currentSection === 'checklist') {
      sections.checklist.push(line);
    }
  }

  return sections;
}

export function getRules(rulesLines: string[]) {
  const rulesList: { title: string; content: string[] }[] = [];
  let currentRule: { title: string; content: string[] } | null = null;

  rulesLines.forEach(line => {
    const trimmed = line.trim();
    if (/^\d+\.\s+/.test(trimmed)) {
      if (currentRule) rulesList.push(currentRule);
      currentRule = {
        title: trimmed.replace(/^\d+\.\s+\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, ''),
        content: []
      };
    } else if (trimmed && currentRule) {
      const cleanContent = trimmed.replace(/^-\s+/, '').replace(/^\*\s+/, '');
      if (cleanContent) currentRule.content.push(cleanContent);
    }
  });
  if (currentRule) rulesList.push(currentRule);
  return rulesList;
}

export function getPatterns(patternsLines: string[]) {
  const categories: { title: string; content: string[] }[] = [];
  let currentCat: { title: string; content: string[] } | null = null;

  patternsLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ') || (trimmed.startsWith('* ') && trimmed.includes(':'))) {
      if (currentCat) categories.push(currentCat);
      
      let title = trimmed;
      if (title.startsWith('### ')) title = title.slice(4);
      else if (title.startsWith('* ')) title = title.slice(2);
      
      currentCat = {
        title: title.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, ''),
        content: []
      };
    } else if (trimmed && currentCat) {
      const cleanContent = trimmed.replace(/^-\s+/, '').replace(/^\*\s+/, '');
      if (cleanContent) currentCat.content.push(cleanContent);
    }
  });
  if (currentCat) categories.push(currentCat);
  
  return categories.filter(c => c.title.trim().length > 0);
}

export function getChecklist(checklistLines: string[]) {
  const items: { text: string; checked: boolean }[] = [];
  checklistLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      items.push({
        text: trimmed.slice(6).trim(),
        checked: trimmed.startsWith('- [x]')
      });
    }
  });
  return items;
}
