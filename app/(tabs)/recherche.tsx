import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Empty, Group, Icon, Screen, Section } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { makeStyles, radius, shadow, tone, type, useTheme } from '@/lib/theme';

// Comparaison sans accents ni majuscules, en gardant la même longueur que le texte d'origine.
const fold = (s: string) =>
  s
    .split('')
    .map((c) => (c.normalize('NFD')[0] ?? c).toLowerCase())
    .join('')
    .replace(/[’']/g, "'");

type Hit = { key: string; course: string; color: string; code: string; kind: 'cours' | 'carte' | 'question'; title: string; before: string; match: string; after: string; go: string };

function search(q: string): Hit[] {
  const needle = fold(q.trim());
  if (needle.length < 2) return [];
  const hits: Hit[] = [];
  const cut = (text: string, i: number, n: number) => ({
    before: (i > 60 ? '…' : '') + text.slice(Math.max(0, i - 60), i),
    match: text.slice(i, i + n),
    after: text.slice(i + n, i + n + 90) + (i + n + 90 < text.length ? '…' : ''),
  });
  for (const c of COURSES) {
    for (const ch of c.chapters) {
      if (ch.id === 'quiz') continue;
      const hay = fold(ch.text);
      let from = 0;
      let count = 0;
      while (count < 3) {
        const i = hay.indexOf(needle, from);
        if (i < 0) break;
        const part = cut(ch.text, i, needle.length);
        hits.push({
          key: `${c.id}-${ch.id}-${i}`,
          course: c.id,
          color: c.color,
          code: c.code,
          kind: 'cours',
          title: `${ch.eyebrow} · ${ch.title}`,
          ...part,
          go: `/cours/${c.id}/lire?ch=${ch.id}&find=${encodeURIComponent(part.match)}`,
        });
        from = i + needle.length + 200;
        count++;
      }
    }
    for (const card of c.cards) {
      const text = `${card.q} — ${card.a}`;
      const i = fold(text).indexOf(needle);
      if (i >= 0)
        hits.push({ key: card.id, course: c.id, color: c.color, code: c.code, kind: 'carte', title: card.q, ...cut(text, i, needle.length), go: `/cartes?course=${c.id}&ch=${card.ch}&all=1` });
    }
    c.questions.forEach((qq, k) => {
      const text = `${qq.q} ${qq.e}`;
      const i = fold(text).indexOf(needle);
      if (i >= 0)
        hits.push({
          key: `${c.id}-q${k}`,
          course: c.id,
          color: c.color,
          code: c.code,
          kind: 'question',
          title: qq.q,
          ...cut(text, i, needle.length),
          go: qq.t === 'ex' ? `/cours/${c.id}/exercices` : `/cours/${c.id}/quiz?ch=${qq.ch ?? ''}`,
        });
    });
  }
  return hits;
}

const KIND = {
  cours: { label: 'Dans le cours', icon: 'book-open-page-variant-outline' },
  carte: { label: 'Cartes mémoire', icon: 'cards-outline' },
  question: { label: 'Questions', icon: 'format-list-checks' },
} as const;

export default function Search() {
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const [q, setQ] = useState('');
  const hits = useMemo(() => search(q), [q]);

  return (
    <Screen title="Recherche">
      <View style={[s.box, shadow(p)]}>
        <Icon name="magnify" size={22} color={p.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Bellman, replay buffer, gather…"
          placeholderTextColor={p.muted}
          style={s.input}
          autoCorrect={false}
          returnKeyType="search"
        />
        {!!q && (
          <Pressable onPress={() => setQ('')} hitSlop={10}>
            <Icon name="close-circle" size={20} color={p.muted} />
          </Pressable>
        )}
      </View>

      {q.trim().length >= 2 && !hits.length && <Empty icon="text-search" title="Aucun résultat" sub="Essaie un autre mot ou une orthographe différente." />}
      {q.trim().length < 2 && <Empty icon="magnify" title="Cherche dans tous tes cours" sub="Le texte des chapitres, les cartes mémoire et les questions." />}

      {(['cours', 'carte', 'question'] as const).map((k) => {
        const list = hits.filter((h) => h.kind === k);
        if (!list.length) return null;
        return (
          <Section key={k} title={`${KIND[k].label} · ${list.length}`}>
            <Group inset={16}>
              {list.slice(0, 30).map((h) => (
                <Pressable key={h.key} onPress={() => router.push(h.go as never)} style={({ pressed }) => [s.hit, pressed && { backgroundColor: p.surface2 }]}>
                  <View style={s.hitHead}>
                    <Icon name={KIND[k].icon} size={14} color={tone(h.color, p)} />
                    <Text style={[s.code, { color: tone(h.color, p) }]}>{h.code}</Text>
                  </View>
                  <Text style={s.title} numberOfLines={2}>
                    {h.title}
                  </Text>
                  <Text style={s.snippet} numberOfLines={3}>
                    {h.before}
                    <Text style={{ backgroundColor: p.warnSoft, color: p.text, fontWeight: '700' }}>{h.match}</Text>
                    {h.after}
                  </Text>
                </Pressable>
              ))}
            </Group>
          </Section>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: p.surface,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontFamily: 'Inter', fontSize: 16, color: p.text, paddingVertical: 13 },
  hit: { paddingHorizontal: 16, paddingVertical: 13, gap: 3 },
  hitHead: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  code: { ...type.overline, fontSize: 10.5 },
  title: { ...type.bodyStrong, color: p.text },
  snippet: { fontFamily: 'Inter', fontSize: 14, color: p.muted, lineHeight: 20 },
}));
