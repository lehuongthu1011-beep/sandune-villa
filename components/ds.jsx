"use client";
import React from "react";

const DS = {};
const LOGO_BYLINE = {
  vi: 'Đà Nẵng · by KUANS',
  en: 'Da Nang · by KUANS',
  ko: '다낭 · by KUANS',
  zh: '岘港 · by KUANS'
};
const MENU_LABEL = {
  vi: { open: 'Mở menu', close: 'Đóng menu' },
  en: { open: 'Open menu', close: 'Close menu' },
  ko: { open: '메뉴 열기', close: '메뉴 닫기' },
  zh: { open: '打开菜单', close: '关闭菜单' }
};

// components/core/Card.jsx
(() => {
/** Container surface. Hairline by default; raise it only when it floats over content. */
function Card({
  children,
  elevation = 'flat',
  padded = false,
  interactive = false,
  onClick,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: style,
    className: ['sv-card', `sv-card--${elevation}`, padded && 'sv-card__pad', interactive && 'sv-card--interactive', className].filter(Boolean).join(' ')
  }, children);
}
Object.assign(DS, { Card });
})();

// components/core/Icon.jsx
(() => {
const CDN = 'https://unpkg.com/lucide-static@0.441.0/icons/';
const cache = new Map();
function load(name) {
  if (!cache.has(name)) {
    cache.set(name, fetch(CDN + name + '.svg').then(r => r.ok ? r.text() : '').then(t => t.replace(/\s(?:width|height)="[^"]*"/g, '').replace(/<svg /, '<svg style="width:100%;height:100%;display:block" ')).catch(() => ''));
  }
  return cache.get(name);
}
/** Lucide glyph inlined as SVG so it inherits currentColor. */
function Icon({
  name,
  size = 20,
  filled = false,
  style = {},
  className = '',
  label
}) {
  const [svg, setSvg] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    load(name).then(t => {
      if (alive) setSvg(t);
    });
    return () => {
      alive = false;
    };
  }, [name]);
  return /*#__PURE__*/React.createElement("span", {
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : 'true',
    className: ['sv-icon', filled && 'sv-icon--filled', className].filter(Boolean).join(' '),
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: 'none',
      lineHeight: 0,
      overflow: 'hidden',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: svg || ''
    }
  });
}
Object.assign(DS, { Icon });
})();

// components/core/Badge.jsx
(() => {
/** Small status or metadata label. */
function Badge({
  children,
  tone = 'neutral',
  icon,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: ['sv-badge', `sv-badge--${tone}`, className].filter(Boolean).join(' '),
    style: style
  }, icon && /*#__PURE__*/React.createElement(DS.Icon, {
    name: icon,
    size: 13
  }), children);
}
Object.assign(DS, { Badge });
})();

// components/core/Button.jsx
(() => {
/** Primary call to action. Pill-shaped, three sizes, six tones. */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  block = false,
  disabled = false,
  as = 'button',
  href,
  onClick,
  type = 'button',
  className = '',
  style = {}
}) {
  const Tag = as === 'a' ? 'a' : 'button';
  const cls = ['sv-btn', `sv-btn--${variant}`, `sv-btn--${size}`, block && 'sv-btn--block', disabled && 'sv-btn--disabled', className].filter(Boolean).join(' ');
  const iconSize = size === 'lg' ? 20 : 18;
  return /*#__PURE__*/React.createElement(Tag, {
    className: cls,
    href: Tag === 'a' ? href : undefined,
    type: Tag === 'button' ? type : undefined,
    disabled: Tag === 'button' ? disabled : undefined,
    onClick: disabled ? undefined : onClick,
    style: style
  }, iconLeft && /*#__PURE__*/React.createElement(DS.Icon, {
    name: iconLeft,
    size: iconSize
  }), children, iconRight && /*#__PURE__*/React.createElement(DS.Icon, {
    name: iconRight,
    size: iconSize
  }));
}
Object.assign(DS, { Button });
})();

// components/core/Divider.jsx
(() => {
/** Hairline rule, vertical rule, or a centred ornament rule. */
function Divider({
  orientation = 'horizontal',
  ornament,
  className = '',
  style = {}
}) {
  if (ornament) return /*#__PURE__*/React.createElement("div", {
    className: ['sv-divider', 'sv-divider--ornament', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: typeof ornament === 'string' ? ornament : 'waves',
    size: 18
  }));
  return /*#__PURE__*/React.createElement("hr", {
    className: ['sv-divider', orientation === 'vertical' ? 'sv-divider--v' : 'sv-divider--h', className].filter(Boolean).join(' '),
    style: style
  });
}
Object.assign(DS, { Divider });
})();

// components/core/IconButton.jsx
(() => {
/** Square-free circular button holding a single Lucide glyph. */
function IconButton({
  icon,
  label,
  variant = 'plain',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  style = {}
}) {
  const px = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    disabled: disabled,
    onClick: onClick,
    style: style,
    className: ['sv-iconbtn', `sv-iconbtn--${variant}`, `sv-iconbtn--${size}`, className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: icon,
    size: px
  }));
}
Object.assign(DS, { IconButton });
})();

// components/core/Logo.jsx
(() => {
const base = () => '/assets';
/** The KUANS mark and the SanDune Villa wordmark lockup. */
function Logo({
  variant = 'lockup',
  height,
  inverse = false,
  propertyName = 'SanDune Villa',
  byline,
  lang = 'vi',
  style = {}
}) {
  if (byline == null) byline = LOGO_BYLINE[lang] || LOGO_BYLINE.vi;
  const b = base();
  const knock = inverse ? {
    filter: 'brightness(0) invert(1)'
  } : null;
  if (variant === 'mark') return /*#__PURE__*/React.createElement("img", {
    src: `${b}/logo-mark.png`,
    alt: "KUANS",
    style: {
      height: height || 40,
      width: 'auto',
      ...knock,
      ...style
    }
  });
  if (variant === 'wordmark') return /*#__PURE__*/React.createElement("img", {
    src: `${b}/logo-wordmark.png`,
    alt: "KUANS",
    style: {
      height: height || 22,
      width: 'auto',
      ...knock,
      ...style
    }
  });
  if (variant === 'stacked') return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-3)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${b}/logo-mark.png`,
    alt: "KUANS",
    style: {
      height: height || 56,
      width: 'auto',
      ...knock
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 25,
      letterSpacing: '.22em',
      textTransform: 'uppercase',
      color: inverse ? 'var(--text-inverse)' : 'var(--clay-700)'
    }
  }, propertyName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      letterSpacing: 'var(--ls-overline)',
      textTransform: 'uppercase',
      marginTop: 6,
      color: inverse ? 'var(--text-inverse-muted)' : 'var(--text-muted)'
    }
  }, byline)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${b}/logo-mark.png`,
    alt: "KUANS",
    style: {
      height: height || 34,
      width: 'auto',
      ...knock
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: 1,
      alignSelf: 'stretch',
      background: inverse ? 'var(--border-inverse)' : 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      letterSpacing: '.2em',
      textTransform: 'uppercase',
      lineHeight: 1.1,
      whiteSpace: 'nowrap',
      color: inverse ? 'var(--text-inverse)' : 'var(--clay-700)'
    }
  }, propertyName), /*#__PURE__*/React.createElement("span", {
    className: "sv-hdr-byline",
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      letterSpacing: 'var(--ls-overline)',
      textTransform: 'uppercase',
      marginTop: 3,
      whiteSpace: 'nowrap',
      color: inverse ? 'var(--text-inverse-muted)' : 'var(--text-muted)'
    }
  }, byline)));
}
Object.assign(DS, { Logo });
})();

// components/core/Overline.jsx
(() => {
/** Wide-tracked uppercase eyebrow. Echoes the letterspacing of the KUANS wordmark. */
function Overline({
  children,
  tone = 'accent',
  as = 'span',
  className = '',
  style = {}
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, {
    className: ['sv-overline', tone !== 'accent' && `sv-overline--${tone}`, className].filter(Boolean).join(' '),
    style: style
  }, children);
}
Object.assign(DS, { Overline });
})();

// components/core/Stat.jsx
(() => {
/** A single figure with a tracked caption — 400m², 5 bedrooms, 6 king beds. */
function Stat({
  value,
  label,
  inverse = false,
  align = 'left',
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-stat', inverse && 'sv-stat--inverse', className].filter(Boolean).join(' '),
    style: {
      textAlign: align,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-stat__value"
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "sv-stat__label"
  }, label));
}
Object.assign(DS, { Stat });
})();

// components/core/Tag.jsx
(() => {
/** Selectable pill — filters, amenity chips, removable selections. */
function Tag({
  children,
  icon,
  selected = false,
  onClick,
  onRemove,
  className = '',
  style = {}
}) {
  const interactive = Boolean(onClick);
  return /*#__PURE__*/React.createElement("span", {
    onClick: onClick,
    style: style,
    className: ['sv-tag', interactive && 'sv-tag--interactive', selected && 'sv-tag--selected', className].filter(Boolean).join(' ')
  }, icon && /*#__PURE__*/React.createElement(DS.Icon, {
    name: icon,
    size: 15
  }), children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "sv-tag__remove",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "x",
    size: 13
  })));
}
Object.assign(DS, { Tag });
})();

// components/feedback/Dialog.jsx
(() => {
/** Centred modal over a blurred teal scrim. */
function Dialog({
  open = true,
  title,
  children,
  footer,
  onClose,
  width = 480,
  className = '',
  style = {}
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "sv-scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: ['sv-dialog', className].filter(Boolean).join(' '),
    style: {
      maxWidth: width,
      ...style
    },
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-dialog__head"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sv-dialog__title"
  }, title), onClose && /*#__PURE__*/React.createElement(DS.IconButton, {
    icon: "x",
    label: "\u0110\xF3ng",
    size: "sm",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    className: "sv-dialog__body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "sv-dialog__foot"
  }, footer)));
}
Object.assign(DS, { Dialog });
})();

// components/feedback/EmptyState.jsx
(() => {
/** Placeholder for empty lists — no bookings, no results. */
function EmptyState({
  icon = 'tree-palm',
  title,
  description,
  action,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-empty', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-empty__icon"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: icon,
    size: 34
  })), /*#__PURE__*/React.createElement("div", {
    className: "sv-empty__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-body-sm)',
      maxWidth: 340,
      margin: '0 auto'
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)'
    }
  }, action));
}
Object.assign(DS, { EmptyState });
})();

// components/feedback/Rating.jsx
(() => {
/** Star score with optional review count. */
function Rating({
  value = 5,
  max = 5,
  count,
  size = 15,
  showScore = true,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: ['sv-rating', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-rating__stars"
  }, Array.from({
    length: max
  }, (_, i) => /*#__PURE__*/React.createElement(DS.Icon, {
    key: i,
    name: "star",
    size: size,
    filled: i < Math.round(value),
    style: i < Math.round(value) ? undefined : {
      opacity: .3
    }
  }))), showScore && /*#__PURE__*/React.createElement("span", {
    className: "sv-rating__score"
  }, value.toFixed(1)), count != null && /*#__PURE__*/React.createElement("span", {
    className: "sv-rating__count"
  }, "(", count, ")"));
}
Object.assign(DS, { Rating });
})();

// components/feedback/Toast.jsx
(() => {
const ICONS = {
  success: 'circle-check',
  danger: 'circle-alert',
  info: 'info'
};
/** Transient confirmation, bottom-right on desktop, bottom-centre on mobile. */
function Toast({
  tone = 'success',
  title,
  description,
  onDismiss,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-toast', `sv-toast--${tone}`, className].filter(Boolean).join(' '),
    style: style,
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-toast__icon"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: ICONS[tone],
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "sv-toast__desc"
  }, description)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "\u0110\xF3ng",
    style: {
      background: 'none',
      border: 'none',
      color: 'inherit',
      opacity: .6,
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "x",
    size: 15
  })));
}
Object.assign(DS, { Toast });
})();

// components/feedback/Tooltip.jsx
(() => {
/** Hover label above the trigger. */
function Tooltip({
  label,
  children,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: ['sv-tip', className].filter(Boolean).join(' '),
    style: style
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "sv-tip__bubble",
    role: "tooltip"
  }, label));
}
Object.assign(DS, { Tooltip });
})();

// components/forms/Checkbox.jsx
(() => {
/** Square check control. */
function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  name,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['sv-check', disabled && 'sv-check--disabled', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    name: name,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("span", {
    className: "sv-check__box"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "check",
    size: 13
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(DS, { Checkbox });
})();

// components/forms/DateRangePicker.jsx
(() => {
const DOW_BY_LANG = {
  vi: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ko: ['월', '화', '수', '목', '금', '토', '일'],
  zh: ['一', '二', '三', '四', '五', '六', '日']
};
const MONTHS_BY_LANG = {
  vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
};
const CAL_NAV_LABEL = {
  vi: { prev: 'Tháng trước', next: 'Tháng sau' },
  en: { prev: 'Previous month', next: 'Next month' },
  ko: { prev: '이전 달', next: '다음 달' },
  zh: { prev: '上个月', next: '下个月' }
};
/** Two-tap check-in / check-out calendar. */
function DateRangePicker({
  year = 2026,
  month = 7,
  start = null,
  end = null,
  onChange,
  unavailable = [],
  unavailableDates = [],
  lang = 'vi',
  className = '',
  style = {}
}) {
  const DOW = DOW_BY_LANG[lang] || DOW_BY_LANG.vi;
  const MONTHS = MONTHS_BY_LANG[lang] || MONTHS_BY_LANG.vi;
  const navLabel = CAL_NAV_LABEL[lang] || CAL_NAV_LABEL.vi;
  const [m, setM] = React.useState(month);
  const [y, setY] = React.useState(year);
  if (unavailableDates.length) {
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
    unavailable = unavailableDates.filter(d => d.startsWith(prefix)).map(d => parseInt(d.slice(8, 10), 10));
  }
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const pick = d => {
    if (!onChange) return;
    if (start == null || start != null && end != null) onChange({
      start: d,
      end: null
    });else if (d <= start) onChange({
      start: d,
      end: null
    });else onChange({
      start,
      end: d
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-cal', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-cal__head"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sv-iconbtn sv-iconbtn--sm",
    "aria-label": navLabel.prev,
    onClick: () => {
      if (m === 0) {
        setM(11);
        setY(y - 1);
      } else setM(m - 1);
    }
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "chevron-left",
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "sv-cal__month"
  }, MONTHS[m], " ", y), /*#__PURE__*/React.createElement("button", {
    className: "sv-iconbtn sv-iconbtn--sm",
    "aria-label": navLabel.next,
    onClick: () => {
      if (m === 11) {
        setM(0);
        setY(y + 1);
      } else setM(m + 1);
    }
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "chevron-right",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sv-cal__grid"
  }, DOW.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    className: "sv-cal__dow"
  }, d)), cells.map((d, i) => {
    if (d == null) return /*#__PURE__*/React.createElement("span", {
      key: `e${i}`
    });
    const off = unavailable.includes(d);
    const isStart = d === start,
      isEnd = d === end;
    const inRange = start != null && end != null && d > start && d < end;
    const cls = ['sv-cal__day', off && 'sv-cal__day--muted', inRange && 'sv-cal__day--in', (isStart || isEnd) && 'sv-cal__day--edge', isStart && end != null && 'sv-cal__day--start', isEnd && 'sv-cal__day--end'].filter(Boolean).join(' ');
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: cls,
      disabled: off,
      onClick: () => pick(d)
    }, d);
  })));
}
Object.assign(DS, { DateRangePicker });
})();

// components/forms/Field.jsx
(() => {
/** Label + hint + error wrapper shared by every form control. */
function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-field', className].filter(Boolean).join(' '),
    style: style
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "sv-field__label",
    htmlFor: htmlFor
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "sv-field__req"
  }, " *")), children, error ? /*#__PURE__*/React.createElement("span", {
    className: "sv-field__error"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "sv-field__hint"
  }, hint) : null);
}
Object.assign(DS, { Field });
})();

// components/forms/GuestStepper.jsx
(() => {
/** −/+ counter row for adults, children, infants. */
function GuestStepper({
  label,
  sublabel,
  value = 0,
  min = 0,
  max = 12,
  onChange,
  className = '',
  style = {}
}) {
  const set = v => onChange && onChange(Math.min(max, Math.max(min, v)));
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-stepper', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sv-stepper__name"
  }, label), sublabel && /*#__PURE__*/React.createElement("div", {
    className: "sv-stepper__sub"
  }, sublabel)), /*#__PURE__*/React.createElement("div", {
    className: "sv-stepper__ctrl"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sv-iconbtn sv-iconbtn--sm sv-iconbtn--outline",
    "aria-label": `Bớt ${label}`,
    disabled: value <= min,
    onClick: () => set(value - 1)
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "minus",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    className: "sv-stepper__count"
  }, value), /*#__PURE__*/React.createElement("button", {
    className: "sv-iconbtn sv-iconbtn--sm sv-iconbtn--outline",
    "aria-label": `Thêm ${label}`,
    disabled: value >= max,
    onClick: () => set(value + 1)
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "plus",
    size: 15
  }))));
}
Object.assign(DS, { GuestStepper });
})();

// components/forms/Input.jsx
(() => {
/** Single-line text input with optional leading/trailing glyphs. */
function Input({
  value,
  defaultValue,
  onChange,
  placeholder,
  type = 'text',
  iconLeft,
  iconRight,
  size = 'md',
  error = false,
  disabled = false,
  id,
  name,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-input', size === 'sm' && 'sv-input--sm', error && 'sv-input--error', disabled && 'sv-input--disabled', className].filter(Boolean).join(' '),
    style: style
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "sv-input__affix"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: iconLeft,
    size: 17
  })), /*#__PURE__*/React.createElement("input", {
    className: "sv-input__el",
    id: id,
    name: name,
    type: type,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled
  }), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "sv-input__affix"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: iconRight,
    size: 17
  })));
}
Object.assign(DS, { Input });
})();

// components/forms/Radio.jsx
(() => {
/** Round single-choice control. */
function Radio({
  checked,
  defaultChecked,
  onChange,
  label,
  value,
  name,
  disabled = false,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['sv-check', disabled && 'sv-check--disabled', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("span", {
    className: "sv-check__box sv-check__box--radio"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-check__dot"
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(DS, { Radio });
})();

// components/forms/Select.jsx
(() => {
/** Native select with the brand's chevron and border treatment. */
function Select({
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  id,
  name,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-select', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("select", {
    id: id,
    name: name,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("span", {
    className: "sv-select__chev"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "chevron-down",
    size: 17
  })));
}
Object.assign(DS, { Select });
})();

// components/forms/Switch.jsx
(() => {
/** On/off toggle for preferences and in-stay services. */
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  name,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['sv-switch', className].filter(Boolean).join(' '),
    style: {
      opacity: disabled ? .5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    role: "switch",
    name: name,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }), /*#__PURE__*/React.createElement("span", {
    className: "sv-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-switch__knob"
  })), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(DS, { Switch });
})();

// components/forms/Textarea.jsx
(() => {
/** Multi-line note field — special requests, messages to the host. */
function Textarea({
  value,
  defaultValue,
  onChange,
  placeholder,
  rows = 4,
  error = false,
  disabled = false,
  id,
  name,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-input', 'sv-textarea', error && 'sv-input--error', disabled && 'sv-input--disabled', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "sv-input__el",
    id: id,
    name: name,
    rows: rows,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled
  }));
}
Object.assign(DS, { Textarea });
})();

// components/navigation/Breadcrumbs.jsx
(() => {
/** Trail for deep pages. */
function Breadcrumbs({
  items = [],
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: ['sv-crumbs', className].filter(Boolean).join(' '),
    style: style,
    "aria-label": "Breadcrumb"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: it.label
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sv-crumbs__sep"
  }, "/"), i === items.length - 1 ? /*#__PURE__*/React.createElement("span", {
    className: "sv-crumbs__current"
  }, it.label) : /*#__PURE__*/React.createElement("a", {
    href: it.href || '#'
  }, it.label))));
}
Object.assign(DS, { Breadcrumbs });
})();

// components/navigation/SiteFooter.jsx
(() => {
/** Dark footer with contact block, link columns and socials. */
function SiteFooter({
  columns = [],
  address = '43 Mỹ Khê 1, Sơn Trà, Đà Nẵng',
  phone = '096.315.9933',
  email = 'trinhgia.jsc.vn@gmail.com',
  socials = ['instagram', 'facebook'],
  legal = '© 2026 SanDune Villa Danang by KUANS',
  lang = 'vi',
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: ['sv-footer', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-footer__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-footer__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DS.Logo, {
    variant: "lockup",
    height: 34,
    inverse: true,
    lang: lang
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--space-5)',
      color: 'var(--text-inverse-muted)',
      fontSize: 'var(--size-body-sm)',
      lineHeight: 1.7,
      maxWidth: 260
    }
  }, address), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-5)'
    }
  }, socials.map(s => /*#__PURE__*/React.createElement("a", {
    key: s,
    href: "#",
    "aria-label": s,
    style: {
      color: 'var(--sand-400)'
    }
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: s,
    size: 18
  }))))), columns.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-footer__title"
  }, c.title), c.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#"
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sv-footer__title"
  }, "Li\xEAn h\u1EC7"), /*#__PURE__*/React.createElement("a", {
    href: `tel:${phone}`
  }, phone), /*#__PURE__*/React.createElement("a", {
    href: `mailto:${email}`
  }, email))), /*#__PURE__*/React.createElement("div", {
    className: "sv-footer__base"
  }, /*#__PURE__*/React.createElement("span", null, legal), /*#__PURE__*/React.createElement("span", null, (LOGO_BYLINE[lang] || LOGO_BYLINE.vi).split(' \u00B7 ')[0]))));
}
Object.assign(DS, { SiteFooter });
})();

// components/navigation/SiteHeader.jsx
(() => {
/** Marketing-site masthead: lockup, links, language toggle, booking CTA. */
function SiteHeader({
  links = [],
  active,
  onNavigate,
  variant = 'solid',
  lang = 'vi',
  langs,
  onLangChange,
  ctaLabel = 'Đặt phòng',
  onCta,
  className = '',
  style = {}
}) {
  const inverse = variant === 'transparent';
  const [open, setOpen] = React.useState(false);
  const langOptions = langs && langs.length ? langs : [{ code: 'VI', label: 'VI' }, { code: 'EN', label: 'EN' }];
  const close = () => setOpen(false);
  const navCls = ['sv-header__nav', open && 'sv-header__nav--open'].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("header", {
    className: ['sv-header', `sv-header--${variant}`, open && 'sv-header--menu-open', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-header__inner"
  }, /*#__PURE__*/React.createElement(DS.Logo, {
    variant: "lockup",
    height: 32,
    inverse: inverse && !open,
    lang: lang
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": open ? (MENU_LABEL[lang] || MENU_LABEL.vi).close : (MENU_LABEL[lang] || MENU_LABEL.vi).open,
    "aria-expanded": open,
    onClick: () => setOpen(v => !v),
    className: ['sv-header__burger', inverse && !open && 'sv-header__burger--inverse'].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: open ? 'x' : 'menu',
    size: 22
  })), /*#__PURE__*/React.createElement("nav", {
    className: navCls
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id || l.label,
    href: l.href || '#',
    onClick: e => {
      e.preventDefault();
      close();
      onNavigate && onNavigate(l.id || l.label);
    },
    className: ['sv-navlink', inverse && !open && 'sv-navlink--inverse', active === (l.id || l.label) && 'sv-navlink--active'].filter(Boolean).join(' ')
  }, l.label)), /*#__PURE__*/React.createElement("div", {
    className: "sv-header__langs"
  }, langOptions.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.code,
    onClick: () => {
      onLangChange && onLangChange(o.code);
    },
    className: ['sv-navlink', inverse && !open && 'sv-navlink--inverse', lang === o.code && 'sv-navlink--active'].filter(Boolean).join(' '),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      letterSpacing: '.1em'
    }
  }, o.label))), /*#__PURE__*/React.createElement(DS.Button, {
    variant: inverse && !open ? 'inverse' : 'primary',
    size: "sm",
    onClick: () => {
      close();
      onCta && onCta();
    },
    className: "sv-header__cta-mobile"
  }, ctaLabel))));
}
Object.assign(DS, { SiteHeader });
})();

// components/navigation/Stepper.jsx
(() => {
/** Horizontal progress through the booking flow. */
function Stepper({
  steps = [],
  current = 0,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-steps', className].filter(Boolean).join(' '),
    style: style
  }, steps.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    className: "sv-step__bar"
  }), /*#__PURE__*/React.createElement("div", {
    className: ['sv-step', i < current && 'sv-step--done', i === current && 'sv-step--active'].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-step__dot"
  }, i < current ? /*#__PURE__*/React.createElement(DS.Icon, {
    name: "check",
    size: 13
  }) : i + 1), /*#__PURE__*/React.createElement("span", {
    className: "sv-step__label"
  }, s)))));
}
Object.assign(DS, { Stepper });
})();

// components/navigation/TabBar.jsx
(() => {
/** Bottom navigation for the in-stay guest app. */
function TabBar({
  items = [],
  value,
  onChange,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: ['sv-tabbar', className].filter(Boolean).join(' '),
    style: style
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => onChange && onChange(it.id),
    className: ['sv-tabbar__item', value === it.id && 'sv-tabbar__item--active'].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: it.icon,
    size: 21
  }), it.label)));
}
Object.assign(DS, { TabBar });
})();

// components/navigation/Tabs.jsx
(() => {
/** Underlined tab strip for in-page section switching. */
function Tabs({
  items = [],
  value,
  onChange,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-tabs', className].filter(Boolean).join(' '),
    style: style,
    role: "tablist"
  }, items.map(t => {
    const it = typeof t === 'string' ? {
      id: t,
      label: t
    } : t;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": value === it.id,
      onClick: () => onChange && onChange(it.id),
      className: ['sv-tab', value === it.id && 'sv-tab--active'].filter(Boolean).join(' ')
    }, it.label);
  }));
}
Object.assign(DS, { Tabs });
})();

// components/villa/AmenityList.jsx
(() => {
/** Grid of amenities with sand roundel glyphs. */
function AmenityList({
  items = [],
  columns = 3,
  variant = 'default',
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-amen', variant === 'compact' && 'sv-amen--compact', className].filter(Boolean).join(' '),
    style: {
      gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
      ...style
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    className: "sv-amen__item",
    key: it.name
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-amen__glyph"
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: it.icon,
    size: variant === 'compact' ? 18 : 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sv-amen__name"
  }, it.name), it.note && /*#__PURE__*/React.createElement("div", {
    className: "sv-amen__note"
  }, it.note)))));
}
Object.assign(DS, { AmenityList });
})();

// components/villa/BookingWidget.jsx
(() => {
/** Sticky price + dates + guests panel that floats beside the villa detail. */
function BookingWidget({
  price,
  unit = '/ đêm',
  checkIn = 'Thêm ngày',
  checkOut = 'Thêm ngày',
  guests = 'Thêm khách',
  onEditDates,
  onEditGuests,
  onSubmit,
  submitLabel = 'Kiểm tra phòng trống',
  note = 'Chưa trừ tiền ở bước này',
  children,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-book', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-book__price"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-book__amount"
  }, price), /*#__PURE__*/React.createElement("span", {
    className: "sv-book__unit"
  }, unit)), /*#__PURE__*/React.createElement("div", {
    className: "sv-book__fields"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sv-book__cell",
    onClick: onEditDates
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellk"
  }, "Nh\u1EADn ph\xF2ng"), /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellv"
  }, checkIn)), /*#__PURE__*/React.createElement("button", {
    className: "sv-book__cell",
    onClick: onEditDates
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellk"
  }, "Tr\u1EA3 ph\xF2ng"), /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellv"
  }, checkOut)), /*#__PURE__*/React.createElement("button", {
    className: "sv-book__cell sv-book__cell--full",
    onClick: onEditGuests
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellk"
  }, "Kh\xE1ch"), /*#__PURE__*/React.createElement("span", {
    className: "sv-book__cellv"
  }, guests))), /*#__PURE__*/React.createElement(DS.Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: onSubmit
  }, submitLabel), note && /*#__PURE__*/React.createElement("span", {
    className: "sv-book__note"
  }, note), children);
}
Object.assign(DS, { BookingWidget });
})();

// components/villa/Figure.jsx
(() => {
/** Photography frame: arch, soft or full-bleed, with optional protection gradient. */
function Figure({
  src,
  alt = '',
  shape = 'framed',
  ratio = '4/3',
  caption,
  protect = false,
  mount = 'md',
  className = '',
  style = {}
}) {
  const framed = shape === 'framed';
  return /*#__PURE__*/React.createElement("figure", {
    className: ['sv-figure', `sv-figure--${shape}`, framed && mount === 'lg' && 'sv-figure--framed-lg', className].filter(Boolean).join(' '),
    style: {
      aspectRatio: framed ? undefined : ratio,
      margin: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: framed ? {
      aspectRatio: ratio
    } : undefined
  }), (protect || caption) && /*#__PURE__*/React.createElement("span", {
    className: "sv-figure__protect"
  }), caption && /*#__PURE__*/React.createElement("figcaption", {
    className: "sv-figure__caption"
  }, caption));
}
Object.assign(DS, { Figure });
})();

// components/villa/Gallery.jsx
(() => {
/** Mosaic photo grid — one lead image plus a 2×2 of supporting shots. */
function Gallery({
  images = [],
  onOpen,
  moreLabel,
  className = '',
  style = {}
}) {
  const [lead, ...rest] = images;
  const shown = rest.slice(0, 4);
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-gal', className].filter(Boolean).join(' '),
    style: {
      gridTemplateColumns: '1.6fr 1fr 1fr',
      gridTemplateRows: 'repeat(2,1fr)',
      aspectRatio: '16/9',
      ...style
    }
  }, lead && /*#__PURE__*/React.createElement("div", {
    className: "sv-gal__cell",
    style: {
      gridRow: '1 / span 2'
    },
    onClick: () => onOpen && onOpen(0)
  }, /*#__PURE__*/React.createElement("img", {
    src: lead.src,
    alt: lead.alt || ''
  })), shown.map((im, i) => /*#__PURE__*/React.createElement("div", {
    className: "sv-gal__cell",
    key: im.src + i,
    onClick: () => onOpen && onOpen(i + 1)
  }, /*#__PURE__*/React.createElement("img", {
    src: im.src,
    alt: im.alt || ''
  }), i === shown.length - 1 && moreLabel && /*#__PURE__*/React.createElement("span", {
    className: "sv-gal__more"
  }, moreLabel))));
}
Object.assign(DS, { Gallery });
})();

// components/villa/PriceSummary.jsx
(() => {
/** Line-item breakdown ending in a bold total. */
function PriceSummary({
  rows = [],
  total,
  totalLabel = 'Tổng cộng',
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: style
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    className: "sv-price__row",
    key: r.label
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-price__label"
  }, r.label, r.info && /*#__PURE__*/React.createElement(DS.Tooltip, {
    label: r.info
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: "info",
    size: 13
  }))), /*#__PURE__*/React.createElement("span", null, r.value))), total != null && /*#__PURE__*/React.createElement("div", {
    className: "sv-price__row sv-price__row--total"
  }, /*#__PURE__*/React.createElement("span", null, totalLabel), /*#__PURE__*/React.createElement("span", null, total)));
}
Object.assign(DS, { PriceSummary });
})();

// components/villa/RoomCard.jsx
(() => {
/** A bedroom or the whole villa, as a bookable card. */
function RoomCard({
  image,
  name,
  flag,
  meta = [],
  price,
  unit = '/ đêm',
  onSelect,
  onFavourite,
  favourited = false,
  ctaLabel = 'Chi tiết',
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("article", {
    className: ['sv-room', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sv-room__media"
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: name
  }), flag && /*#__PURE__*/React.createElement("span", {
    className: "sv-room__flag"
  }, /*#__PURE__*/React.createElement(DS.Badge, {
    tone: "solid"
  }, flag)), onFavourite && /*#__PURE__*/React.createElement("span", {
    className: "sv-room__fav"
  }, /*#__PURE__*/React.createElement(DS.IconButton, {
    icon: favourited ? 'heart' : 'heart',
    label: "L\u01B0u",
    size: "sm",
    variant: "glass",
    onClick: onFavourite
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sv-room__body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sv-room__name"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "sv-room__meta"
  }, meta.map(m => /*#__PURE__*/React.createElement("span", {
    key: m.label
  }, /*#__PURE__*/React.createElement(DS.Icon, {
    name: m.icon,
    size: 15
  }), m.label))), /*#__PURE__*/React.createElement("div", {
    className: "sv-room__foot"
  }, price ? /*#__PURE__*/React.createElement("span", {
    className: "sv-room__cost"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sv-room__price"
  }, price), /*#__PURE__*/React.createElement("span", {
    className: "sv-room__per"
  }, unit)) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement(DS.Button, {
    size: "sm",
    variant: "secondary",
    onClick: onSelect
  }, ctaLabel))));
}
Object.assign(DS, { RoomCard });
})();

// components/villa/SectionHeading.jsx
(() => {
/** Overline + display title + lede, with an optional right-hand action. */
function SectionHeading({
  overline,
  title,
  accent,
  lede,
  action,
  align = 'left',
  inverse = false,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['sv-secthead', align === 'center' && 'sv-secthead--center', inverse && 'sv-secthead--inverse', className].filter(Boolean).join(' '),
    style: style
  }, /*#__PURE__*/React.createElement("div", null, overline && /*#__PURE__*/React.createElement(DS.Overline, {
    tone: inverse ? 'inverse' : 'accent'
  }, overline), title && /*#__PURE__*/React.createElement("h2", {
    className: "sv-secthead__title"
  }, title), accent && /*#__PURE__*/React.createElement("div", {
    className: "sv-secthead__accent"
  }, accent), lede && /*#__PURE__*/React.createElement("p", {
    className: "sv-secthead__lede"
  }, lede)), action && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action));
}
Object.assign(DS, { SectionHeading });
})();

// components/villa/Testimonial.jsx
(() => {
/** A guest quote set in Spectral Light. */
function Testimonial({
  quote,
  name,
  from,
  rating,
  avatar,
  inverse = false,
  className = '',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("figure", {
    className: ['sv-quote', inverse && 'sv-quote--inverse', className].filter(Boolean).join(' '),
    style: {
      margin: 0,
      ...style
    }
  }, rating != null && /*#__PURE__*/React.createElement(DS.Rating, {
    value: rating,
    showScore: false,
    style: {
      marginBottom: 'var(--space-4)'
    }
  }), /*#__PURE__*/React.createElement("blockquote", {
    className: "sv-quote__text",
    style: {
      margin: 0
    }
  }, quote), /*#__PURE__*/React.createElement("figcaption", {
    className: "sv-quote__who"
  }, avatar && /*#__PURE__*/React.createElement("img", {
    src: avatar,
    alt: "",
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "sv-quote__name",
    style: {
      display: 'block'
    }
  }, name), from && /*#__PURE__*/React.createElement("span", {
    className: "sv-quote__from"
  }, from))));
}
Object.assign(DS, { Testimonial });
})();


const {
  Card,
  Icon,
  Badge,
  Button,
  Divider,
  IconButton,
  Logo,
  Overline,
  Stat,
  Tag,
  Dialog,
  EmptyState,
  Rating,
  Toast,
  Tooltip,
  Checkbox,
  DateRangePicker,
  Field,
  GuestStepper,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
  Breadcrumbs,
  SiteFooter,
  SiteHeader,
  Stepper,
  TabBar,
  Tabs,
  AmenityList,
  BookingWidget,
  Figure,
  Gallery,
  PriceSummary,
  RoomCard,
  SectionHeading,
  Testimonial,
} = DS;

export {
  Card,
  Icon,
  Badge,
  Button,
  Divider,
  IconButton,
  Logo,
  Overline,
  Stat,
  Tag,
  Dialog,
  EmptyState,
  Rating,
  Toast,
  Tooltip,
  Checkbox,
  DateRangePicker,
  Field,
  GuestStepper,
  Input,
  Radio,
  Select,
  Switch,
  Textarea,
  Breadcrumbs,
  SiteFooter,
  SiteHeader,
  Stepper,
  TabBar,
  Tabs,
  AmenityList,
  BookingWidget,
  Figure,
  Gallery,
  PriceSummary,
  RoomCard,
  SectionHeading,
  Testimonial,
};
