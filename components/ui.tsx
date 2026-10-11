import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, radius, space, useTheme } from '@/lib/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const { p } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? p.text} />;
}

/** Écran défilant avec marges et zone sûre. */
export function Screen({
  children,
  top = false,
  style,
}: {
  children: ReactNode;
  top?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.content, { paddingTop: top ? insets.top + space.lg : space.md, paddingBottom: insets.bottom + 40 }, style]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.h1, style]}>{children}</Text>;
}

export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.h2row}>
      <Text style={s.h2}>{children}</Text>
      {right}
    </View>
  );
}

export function Muted({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const s = useStyles();
  return (
    <Text style={[s.muted, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function Card({
  children,
  onPress,
  style,
  tint,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: string;
}) {
  const s = useStyles();
  const inner = [s.card, tint ? { backgroundColor: tint, borderColor: 'transparent' } : null, style];
  if (!onPress) return <View style={inner}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [inner, pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  icon,
  kind = 'primary',
  disabled,
  style,
  color,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  kind?: 'primary' | 'ghost' | 'soft';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  const { p } = useTheme();
  const s = useStyles();
  const c = color ?? p.accent;
  const bg = kind === 'primary' ? c : kind === 'soft' ? p.surface2 : 'transparent';
  const fg = kind === 'primary' ? p.onAccent : kind === 'soft' ? p.text : c;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: bg, borderColor: kind === 'ghost' ? c : 'transparent' },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 },
        style,
      ]}>
      {icon && <Icon name={icon} size={19} color={fg} />}
      <Text style={[s.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color?: string }) {
  const { p } = useTheme();
  const s = useStyles();
  const c = color ?? p.text;
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? { backgroundColor: c, borderColor: c } : null]}
      hitSlop={4}>
      <Text style={[s.chipText, active ? { color: p.bg } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Bar({ value, color, height = 6 }: { value: number; color?: string; height?: number }) {
  const { p } = useTheme();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: p.line, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height, backgroundColor: color ?? p.accent }} />
    </View>
  );
}

/** Ligne de liste : icône, titre, sous-titre, chevron. */
export function Row({
  icon,
  title,
  sub,
  onPress,
  right,
  color,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  onPress?: () => void;
  right?: ReactNode;
  color?: string;
}) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}>
      {icon && (
        <View style={[s.rowIcon, { backgroundColor: (color ?? p.accent) + '1f' }]}>
          <Icon name={icon} size={20} color={color ?? p.accent} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {!!sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={22} color={p.muted} /> : null)}
    </Pressable>
  );
}

export function Empty({ icon, title, sub, children }: { icon: IconName; title: string; sub?: string; children?: ReactNode }) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <View style={s.empty}>
      <View style={[s.emptyIcon, { backgroundColor: p.accentSoft }]}>
        <Icon name={icon} size={30} color={p.accent} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {!!sub && <Text style={[s.muted, { textAlign: 'center' }]}>{sub}</Text>}
      {children}
    </View>
  );
}

export function Pill({ label, color }: { label: string; color?: string }) {
  const { p } = useTheme();
  const c = color ?? p.accent;
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: c + '22', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color: c, fontSize: 11.5, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', fontFamily: 'Inter' }}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((p) => ({
  screen: { flex: 1, backgroundColor: p.bg },
  content: { paddingHorizontal: space.lg, gap: space.md },
  h1: { fontFamily: 'Inter', fontSize: 28, fontWeight: '800', color: p.text, letterSpacing: -0.6 },
  h2row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md },
  h2: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: p.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  muted: { fontFamily: 'Inter', fontSize: 14, color: p.muted, lineHeight: 20 },
  body: { fontFamily: 'Inter', fontSize: 16, color: p.text, lineHeight: 24 },
  card: {
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: p.line,
    padding: space.lg,
    gap: space.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  buttonText: { fontFamily: 'Inter', fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: p.line,
    backgroundColor: p.surface,
  },
  chipText: { fontFamily: 'Inter', fontSize: 13.5, fontWeight: '600', color: p.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: 'Inter', fontSize: 15.5, fontWeight: '600', color: p.text },
  rowSub: { fontFamily: 'Inter', fontSize: 13, color: p.muted },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: p.text, textAlign: 'center' },
}));
