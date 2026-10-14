import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Children, Fragment, isValidElement, useState, type ComponentProps, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { alpha, makeStyles, radius, shadow, space, tone, toneSoft, type, useTheme } from '@/lib/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const { p } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? p.text} />;
}

/** Zone touchable qui s'enfonce légèrement quand on appuie. */
export function Press({ style, scale = 0.98, ...props }: PressableProps & { style?: StyleProp<ViewStyle>; scale?: number }) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [style, pressed && !props.disabled && { opacity: 0.86, transform: [{ scale }] }]}
    />
  );
}

/**
 * Écran défilant. Avec `title`, affiche un grand titre (écrans des onglets) ;
 * `top` ajoute la marge de la barre d'état quand l'écran n'a pas d'en-tête.
 */
export function Screen({
  children,
  top = false,
  title,
  overline,
  right,
  style,
}: {
  children: ReactNode;
  top?: boolean;
  title?: string;
  overline?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[
        s.content,
        { paddingTop: top || title ? insets.top + space.lg : space.sm, paddingBottom: insets.bottom + 48 },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {!!title && (
        <View style={s.titleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            {!!overline && <Text style={s.overlineTop}>{overline}</Text>}
            <Text style={s.title}>{title}</Text>
          </View>
          {right}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const s = useStyles();
  return <Text style={[s.title, style]}>{children}</Text>;
}

/** Titre de section discret (en capitales), avec une action facultative à droite. */
export function H2({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const s = useStyles();
  return (
    <View style={s.h2row}>
      <Text style={s.h2}>{children}</Text>
      {right}
    </View>
  );
}

/** Section : titre discret + contenu. */
export function Section({
  title,
  action,
  children,
  style,
}: {
  title?: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <View style={[{ gap: space.sm + 2 }, style]}>
      {!!title && (
        <H2
          right={
            action && (
              <Pressable onPress={action.onPress} hitSlop={10}>
                <Text style={[s.action, { color: p.accent }]}>{action.label}</Text>
              </Pressable>
            )
          }>
          {title}
        </H2>
      )}
      {children}
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
  flat,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Fond coloré (sans contour ni ombre). */
  tint?: string;
  flat?: boolean;
}) {
  const { p } = useTheme();
  const s = useStyles();
  const inner = [s.card, !tint && !flat && shadow(p), tint ? { backgroundColor: tint, borderColor: 'transparent' } : null, style];
  if (!onPress) return <View style={inner}>{children}</View>;
  return (
    <Press onPress={onPress} style={inner} scale={0.985}>
      {children}
    </Press>
  );
}

/** Liste groupée : une carte, des lignes séparées par un filet. */
export function Group({ children, style, inset = 66 }: { children: ReactNode; style?: StyleProp<ViewStyle>; inset?: number }) {
  const { p } = useTheme();
  const s = useStyles();
  const items = Children.toArray(children).filter((c) => isValidElement(c));
  return (
    <View style={[s.group, shadow(p), style]}>
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={[s.sep, { marginLeft: inset }]} />}
          {c}
        </Fragment>
      ))}
    </View>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  icon,
  kind = 'primary',
  size = 'md',
  disabled,
  style,
  color,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  kind?: ButtonKind;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  const { p } = useTheme();
  const s = useStyles();
  const c = color ? tone(color, p) : p.accent;
  const onC = color ? (p.dark ? '#0b0d12' : '#ffffff') : p.onAccent;
  const look: Record<ButtonKind, { bg: string; fg: string; border: string }> = {
    primary: { bg: c, fg: onC, border: c },
    secondary: { bg: p.surface, fg: p.text, border: p.line },
    soft: { bg: color ? toneSoft(color, p) : p.accentSoft, fg: c, border: 'transparent' },
    ghost: { bg: 'transparent', fg: c, border: 'transparent' },
    danger: { bg: p.badSoft, fg: p.bad, border: 'transparent' },
  };
  const l = look[kind];
  const pad = size === 'lg' ? 16 : size === 'sm' ? 8 : 13;
  return (
    <Press
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        { backgroundColor: l.bg, borderColor: l.border, paddingVertical: pad, paddingHorizontal: size === 'sm' ? 12 : 18 },
        kind === 'primary' && !p.dark && { shadowColor: c, shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
        disabled && { opacity: 0.42 },
        style,
      ]}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} color={l.fg} />}
      <Text style={[s.buttonText, size === 'sm' && { fontSize: 13.5 }, size === 'lg' && { fontSize: 16 }, { color: l.fg }]}>{label}</Text>
    </Press>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  color?: string;
  icon?: IconName;
}) {
  const { p } = useTheme();
  const s = useStyles();
  const c = color ? tone(color, p) : p.accent;
  return (
    <Press
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: alpha(c, p.dark ? 0.22 : 0.12), borderColor: c }]}
      hitSlop={4}>
      {icon && <Icon name={icon} size={15} color={active ? c : p.muted} />}
      <Text style={[s.chipText, active && { color: c }]}>{label}</Text>
    </Press>
  );
}

/** Choix exclusif sur une ligne (style iOS). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <View style={s.segmented}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable key={String(o.id)} onPress={() => onChange(o.id)} style={[s.segment, on && [s.segmentOn, shadow(p)]]}>
            {o.icon && <Icon name={o.icon} size={16} color={on ? p.text : p.muted} />}
            <Text style={[s.segmentText, on && { color: p.text }]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Bar({ value, color, height = 6, track }: { value: number; color?: string; height?: number; track?: string }) {
  const { p } = useTheme();
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track ?? p.surface2, overflow: 'hidden' }}>
      <View style={{ width: `${v * 100}%`, minWidth: v > 0 ? height : 0, height, borderRadius: height, backgroundColor: color ?? p.accent }} />
    </View>
  );
}

/** Anneau de progression (0–1), avec un contenu facultatif au centre. */
export function Ring({
  value,
  size = 56,
  stroke = 6,
  color,
  track,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const { p } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? p.surface2} strokeWidth={stroke} fill="none" />
        {v > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color ?? p.accent}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - v)}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

/** Pourcentage au centre d'un anneau. */
export function RingLabel({ value, size = 13 }: { value: number; size?: number }) {
  const s = useStyles();
  return <Text style={[s.ringLabel, { fontSize: size }]}>{Math.round(Math.max(0, Math.min(1, value || 0)) * 100)}%</Text>;
}

/**
 * Fond en dégradé diagonal (à placer en premier enfant d'une vue avec overflow: 'hidden').
 * Le SVG reçoit sa taille mesurée : sur Android, une taille en % le laisse plus petit que la carte.
 */
export function Gradient({ colors, id = 'g' }: { colors: [string, string]; id?: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const { w, h } = size;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors[1] }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (Math.round(width) !== w || Math.round(height) !== h) setSize({ w: Math.round(width), h: Math.round(height) });
      }}>
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill={`url(#${id})`} />
          <Circle cx={w * 0.92} cy={-h * 0.1} r={w * 0.38} fill="#ffffff" fillOpacity={0.07} />
          <Circle cx={w * 1.05} cy={h * 0.7} r={w * 0.24} fill="#ffffff" fillOpacity={0.05} />
        </Svg>
      )}
    </View>
  );
}

/** Carré d'icône coloré. */
export function IconTile({ icon, color, size = 40 }: { icon: IconName; color?: string; size?: number }) {
  const { p } = useTheme();
  const c = color ? tone(color, p) : p.accent;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color ? toneSoft(color, p) : p.accentSoft,
      }}>
      <Icon name={icon} size={size * 0.5} color={c} />
    </View>
  );
}

/** Ligne de liste : icône, titre, sous-titre, valeur, chevron. */
export function Row({
  icon,
  title,
  sub,
  value,
  onPress,
  right,
  color,
  leading,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  color?: string;
  leading?: ReactNode;
}) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { backgroundColor: p.surface2 }]}>
      {leading ?? (icon && <IconTile icon={icon} color={color} size={36} />)}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {!!sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      {!!value && <Text style={s.rowValue}>{value}</Text>}
      {right ?? (onPress ? <Icon name="chevron-right" size={20} color={alpha(p.muted, 0.7)} /> : null)}
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
      {!!sub && <Text style={[s.muted, { textAlign: 'center', maxWidth: 300 }]}>{sub}</Text>}
      {children && <View style={{ alignSelf: 'stretch', gap: space.sm, marginTop: space.sm }}>{children}</View>}
    </View>
  );
}

/** Petite étiquette colorée. */
export function Pill({ label, color, icon }: { label: string; color?: string; icon?: IconName }) {
  const { p } = useTheme();
  const c = color ? tone(color, p) : p.accent;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: alpha(c, p.dark ? 0.2 : 0.11),
        borderRadius: 99,
        paddingHorizontal: 9,
        paddingVertical: 3.5,
      }}>
      {icon && <Icon name={icon} size={13} color={c} />}
      <Text style={{ color: c, fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3, fontFamily: 'Inter' }}>{label}</Text>
    </View>
  );
}

/** Chiffre clé avec son libellé. */
export function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  const { p } = useTheme();
  const s = useStyles();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[s.statValue, color ? { color: tone(color, p) } : null]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((p) => ({
  screen: { flex: 1, backgroundColor: p.bg },
  content: { paddingHorizontal: 18, gap: space.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginBottom: 2 },
  overlineTop: { ...type.callout, color: p.muted },
  title: { ...type.display, color: p.text },
  h2row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, paddingHorizontal: 2 },
  h2: { ...type.overline, color: p.muted },
  action: { ...type.callout, fontWeight: '600' },
  muted: { ...type.callout, color: p.muted, lineHeight: 20 },
  body: { ...type.body, color: p.text },
  card: {
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    padding: space.lg,
    gap: space.sm,
  },
  group: {
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    overflow: 'hidden',
  },
  sep: { height: 1, backgroundColor: p.line, marginLeft: 66 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  buttonText: { fontFamily: 'Inter', fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: p.line,
    backgroundColor: p.surface,
  },
  chipText: { fontFamily: 'Inter', fontSize: 13.5, fontWeight: '600', color: p.text2 },
  segmented: { flexDirection: 'row', backgroundColor: p.surface2, borderRadius: radius.md, padding: 3, gap: 3 },
  segment: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: radius.md - 3 },
  segmentOn: { backgroundColor: p.dark ? p.line : p.surface },
  segmentText: { fontFamily: 'Inter', fontSize: 13.5, fontWeight: '600', color: p.muted },
  ringLabel: { fontFamily: 'Inter', fontWeight: '800', color: p.text, letterSpacing: -0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: space.lg },
  rowTitle: { ...type.bodyStrong, color: p.text },
  rowSub: { ...type.caption, color: p.muted, fontSize: 13 },
  rowValue: { ...type.callout, color: p.muted, fontWeight: '600' },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  emptyIcon: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...type.headline, color: p.text, textAlign: 'center' },
  statValue: { ...type.number, color: p.text },
  statLabel: { ...type.caption, color: p.muted },
}));
