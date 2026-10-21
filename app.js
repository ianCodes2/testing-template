/* ============================================================
   Northstar — savings jars + weekly weight tracking
   Vanilla JS, localStorage, no build step.
   ============================================================ */
(() => {
  'use strict';

  const STORAGE_KEY = 'northstar.data.v1';
  const KG_TO_LB = 2.2046226218;
  const PEOPLE = ['ian', 'caca'];

  const CURRENCIES = {
    USD: { label: 'US Dollar', locale: 'en-US', decimals: 2, symbol: '$' },
    IDR: { label: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0, symbol: 'Rp' },
    EUR: { label: 'Euro', locale: 'de-DE', decimals: 2, symbol: '€' },
    GBP: { label: 'British Pound', locale: 'en-GB', decimals: 2, symbol: '£' },
    AUD: { label: 'Australian Dollar', locale: 'en-AU', decimals: 2, symbol: 'A$' },
    CAD: { label: 'Canadian Dollar', locale: 'en-CA', decimals: 2, symbol: 'C$' },
    SGD: { label: 'Singapore Dollar', locale: 'en-SG', decimals: 2, symbol: 'S$' },
    JPY: { label: 'Japanese Yen', locale: 'ja-JP', decimals: 0, symbol: '¥' },
    MYR: { label: 'Malaysian Ringgit', locale: 'ms-MY', decimals: 2, symbol: 'RM' },
    PHP: { label: 'Philippine Peso', locale: 'en-PH', decimals: 2, symbol: '₱' }
  };

  const JAR_COLORS = [
    '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
    '#ef4444', '#db2777', '#8b5cf6', '#14b8a6'
  ];

  const JAR_COLOR_NAMES = {
    '#6366f1': 'Indigo', '#0ea5e9': 'Sky', '#10b981': 'Emerald',
    '#f59e0b': 'Amber', '#ef4444': 'Red', '#db2777': 'Pink',
    '#8b5cf6': 'Violet', '#14b8a6': 'Teal'
  };

  const ICONS = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    jar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8"/><path d="M9 3v3M15 3v3"/><path d="M7 6h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2Z"/><path d="M5 11h14"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 15a4 4 0 0 1 8 0"/><path d="m12 11 2.5-3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L19 7"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>',
    smartphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
  const safeId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function initial(name) {
    const chars = Array.from(String(name || '?').trim());
    return (chars[0] || '?').toUpperCase();
  }

  /* ---------- dates ---------- */
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function isValidISODate(value) {
    if (!DATE_RE.test(String(value || ''))) return false;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  function parseISO(value) {
    if (!isValidISODate(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function todayISO() {
    return toISO(new Date());
  }

  function dayNumber(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  }

  function addDaysISO(iso, days) {
    const n = dayNumber(iso) + days;
    const date = new Date(n * 86400000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }

  function addMonthsISO(iso, months, anchorDay) {
    const [y, m, d] = iso.split('-').map(Number);
    const monthIndex = m - 1 + months;
    const first = new Date(Date.UTC(y, monthIndex, 1));
    const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const day = Math.min(anchorDay || d, last);
    return `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function daysBetween(a, b) {
    return dayNumber(b) - dayNumber(a);
  }

  function startOfWeekISO(iso) {
    const date = parseISO(iso);
    if (!date) return iso;
    const offset = (date.getDay() + 6) % 7;
    return addDaysISO(iso, -offset);
  }

  function formatDate(iso, options) {
    const date = parseISO(iso);
    if (!date) return '';
    return date.toLocaleDateString(undefined, options || { month: 'short', day: 'numeric' });
  }

  function formatShortDate(iso) {
    const date = parseISO(iso);
    if (!date) return '';
    const options = { month: 'short', day: 'numeric' };
    if (date.getFullYear() !== new Date().getFullYear()) options.year = 'numeric';
    return date.toLocaleDateString(undefined, options);
  }

  function formatLongDate(iso) {
    return formatDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatMonthYear(iso) {
    return formatDate(iso, { month: 'long', year: 'numeric' });
  }

  function relativeDate(iso) {
    const diff = daysBetween(todayISO(), iso);
    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    if (diff === -1) return 'yesterday';
    if (diff > 1 && diff <= 7) return `in ${diff} days`;
    if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
    return formatShortDate(iso);
  }

  /* ---------- money ---------- */
  function roundAmount(value, currency) {
    const decimals = CURRENCIES[currency] ? CURRENCIES[currency].decimals : 2;
    const factor = Math.pow(10, decimals);
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function parseAmountInput(value, currency) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return null;
    const number = Number(raw);
    if (!Number.isFinite(number)) return null;
    return roundAmount(number, currency);
  }

  function formatMoney(amount, currency) {
    const meta = CURRENCIES[currency] || CURRENCIES.USD;
    const value = Number(amount) || 0;
    const hasFraction = meta.decimals > 0 && Math.round(Math.abs(value) * 100) % 100 !== 0;
    const digits = hasFraction ? meta.decimals : 0;
    try {
      return new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency: CURRENCIES[currency] ? currency : 'USD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      }).format(value);
    } catch (error) {
      return `${currency} ${value.toFixed(digits)}`;
    }
  }

  function currencySymbol(currency) {
    const meta = CURRENCIES[currency] || CURRENCIES.USD;
    try {
      const parts = new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol'
      }).formatToParts(0);
      const found = parts.find((part) => part.type === 'currency');
      return found ? found.value : meta.symbol;
    } catch (error) {
      return meta.symbol;
    }
  }

  function configureAmountInput(input, currency) {
    if (!input) return;
    const decimals = CURRENCIES[currency] ? CURRENCIES[currency].decimals : 2;
    input.step = decimals === 0 ? '1' : '0.01';
    input.min = decimals === 0 ? '1' : '0.01';
  }

  /* ---------- weight ---------- */
  function weightInUnit(kg, unit) {
    return unit === 'lb' ? Number(kg) * KG_TO_LB : Number(kg);
  }

  function toKg(value, unit) {
    return unit === 'lb' ? Number(value) / KG_TO_LB : Number(value);
  }

  function displayWeight(kg, unit) {
    return weightInUnit(kg, unit).toFixed(1);
  }

  function weightText(kg, unit) {
    return `${displayWeight(kg, unit)} ${unit}`;
  }

  function roundKg(value) {
    return Math.round(Number(value) * 1000) / 1000;
  }

  /* ---------- data defaults & normalization ---------- */
  function defaultData() {
    return {
      version: 1,
      settings: { theme: 'system', lastPerson: 'ian' },
      people: {
        ian: {
          id: 'ian', name: 'Ian', currency: 'USD', weightUnit: 'lb',
          jars: [], weightGoal: null, weighIns: []
        },
        caca: {
          id: 'caca', name: 'Caca', currency: 'IDR', weightUnit: 'kg',
          jars: [], weightGoal: null, weighIns: []
        }
      }
    };
  }

  let loadWarning = '';
  let data = loadData();
  let route = null;
  let currentRouteKey = '';
  let draftJarColor = JAR_COLORS[0];
  let confirmAction = null;

  const ui = {
    chartRange: { ian: '3m', caca: '3m' },
    chartObserver: null,
    chartFrame: 0,
    installPrompt: null
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      return normalizeData(parsed);
    } catch (error) {
      loadWarning = 'Saved data could not be read. Starting fresh.';
      return defaultData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      showToast('Could not save on this device. Storage may be full or blocked.');
    }
  }

  function normalizeData(parsed) {
    const base = defaultData();
    if (!parsed || typeof parsed !== 'object') return base;

    const settings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
    base.settings.theme = ['system', 'light', 'dark'].includes(settings.theme) ? settings.theme : 'system';
    base.settings.lastPerson = PEOPLE.includes(settings.lastPerson) ? settings.lastPerson : 'ian';

    for (const id of PEOPLE) {
      const source = parsed.people && parsed.people[id];
      if (!source || typeof source !== 'object') continue;
      const person = base.people[id];

      if (CURRENCIES[source.currency]) person.currency = source.currency;
      if (source.weightUnit === 'lb' || source.weightUnit === 'kg') person.weightUnit = source.weightUnit;

      person.jars = Array.isArray(source.jars)
        ? source.jars.map(normalizeJar).filter(Boolean)
        : [];

      person.weightGoal = normalizeWeightGoal(source.weightGoal);

      const entries = Array.isArray(source.weighIns)
        ? source.weighIns.map(normalizeWeighIn).filter(Boolean)
        : [];
      const byDate = new Map();
      for (const entry of entries.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))) {
        byDate.set(entry.date, entry);
      }
      person.weighIns = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    return base;
  }

  function normalizeJar(source) {
    if (!source || typeof source !== 'object') return null;
    const target = Number(source.target);
    if (!Number.isFinite(target) || target <= 0) return null;

    const id = safeId(source.id) ? source.id : makeId();
    const name = String(source.name || '').trim().slice(0, 60) || 'Untitled jar';
    const color = JAR_COLORS.includes(source.color) ? source.color : JAR_COLORS[0];
    const createdAt = typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString();

    const contributions = Array.isArray(source.contributions)
      ? source.contributions.map(normalizeContribution).filter(Boolean)
      : [];

    const seenAuto = new Set();
    const uniqueContributions = [];
    for (const contribution of contributions) {
      if (contribution.source === 'auto' && contribution.occurrence) {
        if (seenAuto.has(contribution.occurrence)) continue;
        seenAuto.add(contribution.occurrence);
      }
      uniqueContributions.push(contribution);
    }

    const rules = Array.isArray(source.rules)
      ? source.rules.map(normalizeRule).filter(Boolean)
      : [];

    return {
      id,
      name,
      target: roundAmount(target, 'USD'),
      color,
      createdAt,
      contributions: uniqueContributions,
      rules
    };
  }

  function normalizeContribution(source) {
    if (!source || typeof source !== 'object') return null;
    const amount = Number(source.amount);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    if (!isValidISODate(source.date)) return null;
    const sourceKind = source.source === 'auto' ? 'auto' : 'manual';
    const ruleId = safeId(source.ruleId) ? source.ruleId : '';
    let occurrence = typeof source.occurrence === 'string' ? source.occurrence : '';
    if (!occurrence && sourceKind === 'auto' && ruleId) occurrence = `${ruleId}|${source.date}`;
    return {
      id: safeId(source.id) ? source.id : makeId(),
      date: source.date,
      amount: roundAmount(amount, 'USD'),
      note: String(source.note || '').slice(0, 100),
      source: sourceKind,
      ruleId,
      occurrence,
      createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString()
    };
  }

  function normalizeRule(source) {
    if (!source || typeof source !== 'object') return null;
    const amount = Number(source.amount);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const frequency = ['weekly', 'biweekly', 'monthly'].includes(source.frequency) ? source.frequency : 'weekly';
    const startDate = isValidISODate(source.startDate) ? source.startDate : todayISO();
    let endDate = isValidISODate(source.endDate) ? source.endDate : '';
    if (endDate && endDate < startDate) endDate = '';
    const active = source.active !== false;
    const startDay = Number(startDate.slice(8, 10));
    const anchorDay = Number.isInteger(source.anchorDay) && source.anchorDay >= 1 && source.anchorDay <= 31
      ? source.anchorDay
      : startDay;

    let nextDate = isValidISODate(source.nextDate) ? source.nextDate : '';
    if (active && !nextDate) {
      if (!endDate || endDate >= todayISO()) nextDate = startDate;
    }
    if (active && endDate && nextDate && nextDate > endDate) nextDate = '';
    if (!active) nextDate = '';

    return {
      id: safeId(source.id) ? source.id : makeId(),
      amount: roundAmount(amount, 'USD'),
      frequency,
      startDate,
      endDate,
      nextDate,
      active,
      anchorDay,
      note: String(source.note || '').slice(0, 100),
      createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString()
    };
  }

  function normalizeWeightGoal(source) {
    if (!source || typeof source !== 'object') return null;
    const startKg = Number(source.startKg);
    const targetKg = Number(source.targetKg);
    if (!Number.isFinite(startKg) || !Number.isFinite(targetKg) || startKg <= 0 || targetKg <= 0) return null;
    return {
      startKg: roundKg(startKg),
      targetKg: roundKg(targetKg),
      startDate: isValidISODate(source.startDate) ? source.startDate : todayISO()
    };
  }

  function normalizeWeighIn(source) {
    if (!source || typeof source !== 'object') return null;
    const kg = Number(source.kg);
    if (!Number.isFinite(kg) || kg <= 0 || kg > 500) return null;
    if (!isValidISODate(source.date)) return null;
    return {
      id: safeId(source.id) ? source.id : makeId(),
      date: source.date,
      kg: roundKg(kg),
      note: String(source.note || '').slice(0, 100),
      createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString()
    };
  }

  /* ---------- recurring rules ---------- */
  function advanceRuleDate(iso, rule) {
    if (rule.frequency === 'weekly') return addDaysISO(iso, 7);
    if (rule.frequency === 'biweekly') return addDaysISO(iso, 14);
    return addMonthsISO(iso, 1, rule.anchorDay || Number(iso.slice(8, 10)));
  }

  function firstOccurrenceOnOrAfter(rule, target) {
    let cursor = rule.startDate;
    let guard = 0;
    while (cursor < target && guard < 5000) {
      cursor = advanceRuleDate(cursor, rule);
      guard += 1;
    }
    return cursor;
  }

  function runRule(rule, jar) {
    if (!rule.active || !rule.nextDate) return 0;
    const today = todayISO();
    let next = rule.nextDate;
    if (rule.startDate && next < rule.startDate) next = rule.startDate;
    let generated = 0;
    let guard = 0;

    while (next && next <= today && guard < 1500) {
      if (rule.endDate && next > rule.endDate) {
        next = '';
        break;
      }
      const occurrence = `${rule.id}|${next}`;
      if (!jar.contributions.some((entry) => entry.occurrence === occurrence)) {
        jar.contributions.push({
          id: makeId(),
          date: next,
          amount: rule.amount,
          note: rule.note || 'Recurring contribution',
          source: 'auto',
          ruleId: rule.id,
          occurrence,
          createdAt: new Date().toISOString()
        });
        generated += 1;
      }
      next = advanceRuleDate(next, rule);
      guard += 1;
    }

    if (rule.endDate && next && next > rule.endDate) next = '';
    rule.nextDate = next;
    return generated;
  }

  function catchUpAll() {
    let generated = 0;
    for (const person of Object.values(data.people)) {
      for (const jar of person.jars) {
        for (const rule of jar.rules) {
          if (rule.active) generated += runRule(rule, jar);
        }
      }
    }
    return generated;
  }

  /* ---------- derived savings data ---------- */
  function jarTotal(jar) {
    return jar.contributions.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }

  function jarPercent(jar) {
    if (!jar.target) return 0;
    return Math.round((jarTotal(jar) / jar.target) * 100);
  }

  function personTotal(person) {
    return person.jars.reduce((sum, jar) => sum + jarTotal(jar), 0);
  }

  function personTarget(person) {
    return person.jars.reduce((sum, jar) => sum + Number(jar.target || 0), 0);
  }

  function personPercent(person) {
    const target = personTarget(person);
    return target > 0 ? Math.round((personTotal(person) / target) * 100) : 0;
  }

  function nextRuleForJar(jar) {
    return jar.rules
      .filter((rule) => rule.active && rule.nextDate)
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0] || null;
  }

  function ruleStatus(rule) {
    if (!rule.active) return { key: 'paused', label: 'Paused' };
    if (!rule.nextDate) return { key: 'ended', label: 'Ended' };
    return { key: 'active', label: 'Active' };
  }

  function ruleFrequencyLabel(frequency) {
    if (frequency === 'biweekly') return 'Every 2 weeks';
    if (frequency === 'monthly') return 'Monthly';
    return 'Weekly';
  }

  function ruleSubtext(rule) {
    if (!rule.active) return 'Paused — no new contributions';
    if (!rule.nextDate) {
      return rule.endDate ? `Ended ${formatShortDate(rule.endDate)}` : 'Schedule complete';
    }
    const diff = daysBetween(todayISO(), rule.nextDate);
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    if (diff > 1) return `Due in ${diff} days`;
    return `Due ${formatShortDate(rule.nextDate)}`;
  }

  function sortRules(rules) {
    const order = { active: 0, paused: 1, ended: 2 };
    return [...rules].sort((a, b) => {
      const statusA = ruleStatus(a);
      const statusB = ruleStatus(b);
      return order[statusA.key] - order[statusB.key]
        || String(a.nextDate || '').localeCompare(String(b.nextDate || ''))
        || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  }

  /* ---------- derived weight data ---------- */
  function sortedWeighIns(person) {
    return [...person.weighIns].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  }

  function latestWeighIn(person) {
    const sorted = sortedWeighIns(person);
    return sorted.length ? sorted[sorted.length - 1] : null;
  }

  function weightStats(person) {
    const goal = person.weightGoal;
    if (!goal) return null;

    const latest = latestWeighIn(person);
    const currentKg = latest ? latest.kg : goal.startKg;
    const losing = goal.targetKg < goal.startKg;
    const total = Math.abs(goal.startKg - goal.targetKg);
    const progressAmount = losing ? goal.startKg - currentKg : currentKg - goal.startKg;
    const pct = total > 0 ? Math.round(clamp(progressAmount / total, 0, 1) * 100) : 0;
    const complete = total > 0 && (losing ? currentKg <= goal.targetKg : currentKg >= goal.targetKg);
    const toGoKg = complete ? 0 : Math.max(0, losing ? currentKg - goal.targetKg : goal.targetKg - currentKg);

    let deltaKg = null;
    let deltaBasis = '';
    if (latest) {
      const earlier = sortedWeighIns(person).filter((entry) => entry.id !== latest.id && entry.date <= latest.date);
      if (earlier.length) {
        const previous = earlier[earlier.length - 1];
        deltaKg = latest.kg - previous.kg;
        deltaBasis = 'entry';
      } else if (latest.date > goal.startDate) {
        deltaKg = latest.kg - goal.startKg;
        deltaBasis = 'start';
      }
    }

    const week = startOfWeekISO(todayISO());
    const weekLogged = person.weighIns.some((entry) => startOfWeekISO(entry.date) === week)
      || (goal.startDate && startOfWeekISO(goal.startDate) === week);

    return {
      goal,
      latest,
      currentKg,
      losing,
      total,
      pct,
      complete,
      toGoKg,
      deltaKg,
      deltaBasis,
      weekLogged
    };
  }

  function deltaSummary(stats, unit) {
    if (stats.deltaKg == null) return '';
    const delta = stats.deltaKg;
    if (Math.abs(delta) < 0.05) {
      return stats.deltaBasis === 'start' ? 'At your starting weight' : 'No change since last weigh-in';
    }
    const direction = delta < 0 ? 'down' : 'up';
    const basis = stats.deltaBasis === 'start' ? 'since your start' : 'since last weigh-in';
    return `${displayWeight(Math.abs(delta), unit)} ${unit} ${direction} ${basis}`;
  }

  /* ---------- contribution grouping ---------- */
  function groupContributions(jar) {
    const sorted = [...jar.contributions].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    const groups = new Map();
    for (const entry of sorted) {
      const key = entry.date.slice(0, 7);
      if (!groups.has(key)) {
        groups.set(key, { key, label: formatMonthYear(entry.date), total: 0, entries: [] });
      }
      const group = groups.get(key);
      group.entries.push(entry);
      group.total += Number(entry.amount || 0);
    }
    return Array.from(groups.values());
  }

  /* ---------- shared view pieces ---------- */
  function personSwitchHTML(activeId) {
    return `<nav class="person-switch" aria-label="Choose person">${PEOPLE.map((id) => {
      const person = data.people[id];
      return `<a class="person-switch__option accent-${id}" href="#/${id}"${id === activeId ? ' aria-current="page"' : ''}>
        <span class="person-switch__avatar">${esc(initial(person.name))}</span>
        <span>${esc(person.name)}</span>
      </a>`;
    }).join('')}</nav>`;
  }

  function emptyJarsHTML() {
    return `<div class="empty-card">
      <div class="empty-card__icon">${ICONS.jar}</div>
      <h3>No savings jars yet</h3>
      <p>Create a jar for each thing you're saving toward. Every contribution moves the bar.</p>
      <button class="btn btn--primary btn--sm" type="button" data-action="new-jar">${ICONS.plus} Create your first jar</button>
    </div>`;
  }

  function emptyWeightHTML(person) {
    return `<div class="empty-card">
      <div class="empty-card__icon">${ICONS.scale}</div>
      <h3>Set a weight goal</h3>
      <p>Start with a starting weight and a target. Then log one weigh-in a week and watch the trend.</p>
      <button class="btn btn--primary btn--sm" type="button" data-action="weight-goal">Set up weight goal</button>
    </div>`;
  }

  /* ---------- person page ---------- */
  function jarCardHTML(person, jar) {
    const total = jarTotal(jar);
    const pct = jarPercent(jar);
    const next = nextRuleForJar(jar);
    const contributionCount = jar.contributions.length;
    const autoText = next
      ? `Auto ${formatMoney(next.amount, person.currency)} · ${relativeDate(next.nextDate)}`
      : `${contributionCount} contribution${contributionCount === 1 ? '' : 's'}`;
    const href = `#/${encodeURIComponent(person.id)}/jar/${encodeURIComponent(jar.id)}`;

    return `<article class="jar-card" style="--jar-color:${jar.color}">
      <a class="jar-card__link" href="${href}" aria-label="Open ${esc(jar.name)}">
        <div class="jar-card__head">
          <span class="jar-card__dot"></span>
          <span class="jar-card__name">${esc(jar.name)}</span>
        </div>
        <div class="jar-card__amounts">
          <span class="jar-card__saved">${formatMoney(total, person.currency)}</span>
          <span class="jar-card__target">of ${formatMoney(jar.target, person.currency)}</span>
        </div>
        <div class="bar jar-card__bar" aria-hidden="true"><span class="bar__fill" style="width:${clamp(pct, 0, 100)}%"></span></div>
        <div class="jar-card__foot">
          <span class="jar-card__pct">${pct}%</span>
          <span class="jar-card__auto">${esc(autoText)}</span>
        </div>
      </a>
      <button class="jar-card__add" type="button" data-action="add-contribution" data-jar="${jar.id}" aria-label="Add money to ${esc(jar.name)}">${ICONS.plus}</button>
    </article>`;
  }

  function recentWeighInRows(person) {
    const unit = person.weightUnit;
    const entries = [...person.weighIns].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    }).slice(0, 3);

    return `<div class="recent">${entries.map((entry) => `
      <button class="recent__row" type="button" data-action="edit-weighin" data-id="${entry.id}" aria-label="Edit weigh-in for ${formatShortDate(entry.date)}">
        <span class="recent__date">${formatShortDate(entry.date)}</span>
        <span class="recent__weight">${weightText(entry.kg, unit)}</span>
        <span class="recent__edit">${ICONS.pencil}</span>
      </button>`).join('')}</div>`;
  }

  function weightCardHTML(person, stats) {
    const unit = person.weightUnit;
    const range = ui.chartRange[person.id] || '3m';
    const latest = stats.latest;
    const rangeLabels = { '3m': 'Last 3 months', '6m': 'Last 6 months', '1y': 'Last 12 months' };
    const weekText = stats.weekLogged
      ? (!latest ? 'Starting weight set this week' : (deltaSummary(stats, unit) || 'Weigh-in logged this week'))
      : 'This week’s weigh-in is due';

    return `<article class="weight-card${stats.complete ? ' weight-card--reached' : ''}">
      <div class="weight-top">
        <div>
          <span class="stat-label">Current</span>
          <div class="weight-current">${displayWeight(stats.currentKg, unit)}<span>${unit}</span></div>
        </div>
        <button class="weight-goal" type="button" data-action="weight-goal" aria-label="Edit weight goal">
          <span>Goal</span>
          <strong>${displayWeight(stats.goal.targetKg, unit)} ${unit}</strong>
        </button>
      </div>

      <div class="weight-progress">
        <div class="weight-progress__meta">
          <span><strong>${stats.pct}%</strong> of the way</span>
          <span>${stats.complete ? 'Goal reached' : `${weightText(stats.toGoKg, unit)} to go`}</span>
        </div>
        <div class="bar" aria-hidden="true"><span class="bar__fill" style="width:${stats.pct}%"></span></div>
      </div>

      <div class="weight-week${stats.weekLogged ? ' is-done' : ''}">
        <span class="weight-week__dot"></span>
        ${esc(weekText)}
      </div>

      <div class="chart-toolbar">
        <span class="chart-caption">${rangeLabels[range]}</span>
        <div class="range" role="group" aria-label="Chart range">
          ${['3m', '6m', '1y'].map((key) => `<button type="button" data-action="range" data-range="${key}" aria-pressed="${range === key}">${key === '3m' ? '3M' : key === '6m' ? '6M' : '1Y'}</button>`).join('')}
        </div>
      </div>

      <div class="chart" id="weightChart" role="img" aria-label="Weight trend chart"></div>

      ${person.weighIns.length
        ? recentWeighInRows(person)
        : `<p class="weight-hint">Log once a week — same day if you can. Small trends beat daily noise.</p>`}
    </article>`;
  }

  function weightSectionHTML(person) {
    const stats = weightStats(person);
    if (!stats) {
      return `<section class="section" aria-labelledby="weightTitle">
        <div class="section__head">
          <h2 class="section__title" id="weightTitle">Weight</h2>
        </div>
        ${emptyWeightHTML(person)}
      </section>`;
    }

    return `<section class="section" aria-labelledby="weightTitle">
      <div class="section__head">
        <h2 class="section__title" id="weightTitle">Weight</h2>
        <div class="section__actions">
          <button class="btn btn--ghost btn--sm" type="button" data-action="weight-history">History</button>
          <button class="btn btn--primary btn--sm" type="button" data-action="log-weight">${ICONS.plus} Log</button>
        </div>
      </div>
      ${weightCardHTML(person, stats)}
    </section>`;
  }

  function personPageHTML(person) {
    const total = personTotal(person);
    const target = personTarget(person);
    const pct = personPercent(person);
    const jarCount = person.jars.length;

    return `${personSwitchHTML(person.id)}
    <section class="hero" aria-label="${esc(person.name)} overview">
      <div class="hero__head">
        <span class="avatar">${esc(initial(person.name))}</span>
        <div class="hero__identity">
          <h1 class="hero__name">${esc(person.name)}</h1>
          <span class="currency-chip">${person.currency}</span>
        </div>
      </div>
      <div class="hero__amount-row">
        <span class="hero__label">Total saved</span>
        <div class="hero__amount">${formatMoney(total, person.currency)}</div>
        <p class="hero__meta">${jarCount
          ? `${jarCount} jar${jarCount === 1 ? '' : 's'} · ${pct}% of ${formatMoney(target, person.currency)}`
          : 'No jars yet — start with a small goal.'}</p>
      </div>
      <div class="bar hero__bar" aria-hidden="true"><span class="bar__fill" style="width:${clamp(pct, 0, 100)}%"></span></div>
    </section>

    <div class="page-grid">
      <section class="section" aria-labelledby="savingsTitle">
        <div class="section__head">
          <h2 class="section__title" id="savingsTitle">Savings jars <span class="section__count">${jarCount}</span></h2>
          <button class="btn btn--soft btn--sm" type="button" data-action="new-jar">${ICONS.plus} New jar</button>
        </div>
        <div class="jar-list">
          ${jarCount ? person.jars.map((jar) => jarCardHTML(person, jar)).join('') : emptyJarsHTML()}
        </div>
      </section>
      ${weightSectionHTML(person)}
    </div>`;
  }

  /* ---------- jar detail page ---------- */
  function txRowHTML(person, jar, entry) {
    const title = entry.note || (entry.source === 'auto' ? 'Recurring contribution' : 'Contribution');
    const autoBadge = entry.source === 'auto' ? '<span class="badge">Auto</span>' : '';
    return `<button class="tx" type="button" data-action="edit-contribution" data-jar="${jar.id}" data-id="${entry.id}" aria-label="Edit ${esc(title)} on ${formatShortDate(entry.date)}">
      <span class="tx__main">
        <span class="tx__title">${esc(title)} ${autoBadge}</span>
        <span class="tx__date">${formatLongDate(entry.date)}</span>
      </span>
      <span class="tx__amount">${formatMoney(entry.amount, person.currency)}</span>
      <span class="tx__edit">${ICONS.pencil}</span>
    </button>`;
  }

  function ruleRowHTML(person, jar, rule) {
    const status = ruleStatus(rule);
    return `<button class="rule" type="button" data-action="edit-rule" data-jar="${jar.id}" data-id="${rule.id}" aria-label="Edit recurring rule of ${formatMoney(rule.amount, person.currency)}">
      <span class="rule__icon">${ICONS.repeat}</span>
      <span class="rule__main">
        <span class="rule__title">${formatMoney(rule.amount, person.currency)} · ${ruleFrequencyLabel(rule.frequency)}</span>
        <span class="rule__sub">${ruleSubtext(rule)}</span>
      </span>
      <span class="badge badge--${status.key}">${status.label}</span>
      <span class="rule__chev">${ICONS.chevronRight}</span>
    </button>`;
  }

  function emptyContributionsHTML(person, jar) {
    return `<div class="empty-inline">
      <span>No contributions yet. Every jar starts somewhere.</span>
      <div><button class="btn btn--soft btn--sm" type="button" data-action="add-contribution" data-jar="${jar.id}">${ICONS.plus} Add the first one</button></div>
    </div>`;
  }

  function emptyRulesHTML(person, jar) {
    return `<div class="empty-inline">
      <span>No recurring contributions yet. Set one up so you don’t have to remember.</span>
      <div><button class="btn btn--soft btn--sm" type="button" data-action="new-rule" data-jar="${jar.id}">${ICONS.repeat} Create a rule</button></div>
    </div>`;
  }

  function jarPageHTML(person, jar) {
    const total = jarTotal(jar);
    const pct = jarPercent(jar);
    const reached = total >= jar.target;
    const over = total - jar.target;
    const groups = groupContributions(jar);
    const rules = sortRules(jar.rules);
    const contributionCount = jar.contributions.length;
    const meta = `${contributionCount} contribution${contributionCount === 1 ? '' : 's'} · ${person.currency}`;

    return `<div class="detail">
      <a class="back-link" href="#/${person.id}">${ICONS.arrowLeft} ${esc(person.name)}’s jars</a>

      <header class="detail__head">
        <div>
          <h1 class="detail__title">${esc(jar.name)}</h1>
          <p class="detail__meta">${meta}</p>
        </div>
        <div class="detail__tools">
          <button class="icon-btn" type="button" data-action="edit-jar" data-jar="${jar.id}" aria-label="Edit jar">${ICONS.pencil}</button>
          <button class="icon-btn" type="button" data-action="delete-jar" data-jar="${jar.id}" aria-label="Delete jar">${ICONS.trash}</button>
        </div>
      </header>

      <section class="jar-hero" style="--jar-color:${jar.color}" aria-label="${esc(jar.name)} progress">
        <span class="jar-hero__label">Saved</span>
        <div class="jar-hero__amount">${formatMoney(total, person.currency)}</div>
        <div class="jar-hero__meta">
          of ${formatMoney(jar.target, person.currency)} · ${pct}%${reached ? ` <span class="reached-pill">${ICONS.check} Goal reached</span>` : over > 0 ? ` · ${formatMoney(over, person.currency)} over target` : ''}
        </div>
        <div class="bar jar-hero__bar" aria-hidden="true"><span class="bar__fill" style="width:${clamp(pct, 0, 100)}%"></span></div>
        <div class="jar-hero__actions">
          <button class="btn btn--primary" type="button" data-action="add-contribution" data-jar="${jar.id}">${ICONS.plus} Add money</button>
          <button class="btn btn--ghost" type="button" data-action="new-rule" data-jar="${jar.id}">${ICONS.repeat} Recurring</button>
        </div>
      </section>

      <section class="detail-section" aria-labelledby="contributionsTitle">
        <div class="section__head">
          <h2 class="section__title" id="contributionsTitle">Contributions <span class="section__count">${contributionCount}</span></h2>
          <button class="btn btn--ghost btn--sm" type="button" data-action="add-contribution" data-jar="${jar.id}">${ICONS.plus} Add</button>
        </div>
        ${groups.length ? groups.map((group) => `
          <div class="month-group">
            <div class="month-head"><span>${group.label}</span><span>${formatMoney(group.total, person.currency)}</span></div>
            <div class="tx-list">${group.entries.map((entry) => txRowHTML(person, jar, entry)).join('')}</div>
          </div>`).join('') : emptyContributionsHTML(person, jar)}
      </section>

      <section class="detail-section" aria-labelledby="recurringTitle">
        <div class="section__head">
          <h2 class="section__title" id="recurringTitle">Recurring</h2>
          <button class="btn btn--ghost btn--sm" type="button" data-action="new-rule" data-jar="${jar.id}">${ICONS.plus} New rule</button>
        </div>
        ${rules.length ? `<div class="rule-list">${rules.map((rule) => ruleRowHTML(person, jar, rule)).join('')}</div>` : emptyRulesHTML(person, jar)}
      </section>
    </div>`;
  }

  /* ---------- settings page ---------- */
  function currencyOptionsHTML(selected) {
    return Object.keys(CURRENCIES).map((code) => `<option value="${code}"${code === selected ? ' selected' : ''}>${code} · ${CURRENCIES[code].symbol}</option>`).join('');
  }

  function personSettingsHTML(person) {
    return `<div class="person-settings accent-${person.id}">
      <div class="person-settings__head">
        <span class="avatar avatar--sm">${esc(initial(person.name))}</span>
        <div>
          <strong>${esc(person.name)}</strong>
          <span>Currency &amp; weight unit</span>
        </div>
      </div>
      <div class="person-settings__fields">
        <label class="settings-field">
          <span>Currency</span>
          <select class="input" data-setting="currency" data-person="${person.id}" aria-label="${esc(person.name)} currency">
            ${currencyOptionsHTML(person.currency)}
          </select>
        </label>
        <div class="settings-field">
          <span>Weight unit</span>
          <div class="theme-seg" role="group" aria-label="${esc(person.name)} weight unit">
            <button type="button" data-action="set-unit" data-person="${person.id}" data-unit-value="lb" aria-pressed="${person.weightUnit === 'lb'}">lb</button>
            <button type="button" data-action="set-unit" data-person="${person.id}" data-unit-value="kg" aria-pressed="${person.weightUnit === 'kg'}">kg</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function settingsPageHTML() {
    return `<div class="settings">
      <a class="back-link" href="#/">${ICONS.arrowLeft} Back</a>
      <h1 class="settings__title">Settings</h1>
      <p class="settings__sub">Your data stays in this browser. No accounts, no sync.</p>

      <section class="settings-card" aria-labelledby="appearanceTitle">
        <div class="settings-card__head">
          <h2 id="appearanceTitle">Appearance</h2>
          <p>Follow your device, or pick a side.</p>
        </div>
        <div class="settings-row">
          <div class="settings-row__main">
            <span class="settings-row__title">Theme</span>
            <span class="settings-row__sub">System uses your phone setting.</span>
          </div>
          <div class="theme-seg" role="group" aria-label="Theme">
            ${['system', 'light', 'dark'].map((choice) => `<button type="button" data-action="set-theme" data-theme-choice="${choice}" aria-pressed="${data.settings.theme === choice}">${choice[0].toUpperCase() + choice.slice(1)}</button>`).join('')}
          </div>
        </div>
      </section>

      <section class="settings-card" aria-labelledby="peopleTitle">
        <div class="settings-card__head">
          <h2 id="peopleTitle">People &amp; currencies</h2>
          <p>Two people, two currencies. Totals are never mixed.</p>
        </div>
        <div class="settings-people">
          ${PEOPLE.map((id) => personSettingsHTML(data.people[id])).join('')}
        </div>
        <p class="settings-note">Changing a currency changes the symbol and number formatting only. It does not convert the amounts you have already saved.</p>
      </section>

      <section class="settings-card" aria-labelledby="dataTitle">
        <div class="settings-card__head">
          <h2 id="dataTitle">Data</h2>
          <p>Back up before clearing browser data or switching phones.</p>
        </div>
        <div class="settings-actions">
          <button class="btn btn--ghost" type="button" data-action="export-data">${ICONS.download} Export JSON</button>
          <button class="btn btn--ghost" type="button" data-action="import-data">${ICONS.upload} Import JSON</button>
          <button class="btn btn--danger-text" type="button" data-action="reset-data">${ICONS.trash} Reset all</button>
        </div>
        <p class="settings-note">Recurring rules catch up automatically the next time you open the app. Exported backups include jars, contributions, rules, goals, and weigh-ins.</p>
      </section>

      <section class="settings-card" aria-labelledby="phoneTitle">
        <div class="settings-card__head">
          <h2 id="phoneTitle">On your phone</h2>
          <p>Use it like an app when it is hosted online.</p>
        </div>
        ${ui.installPrompt
          ? `<div class="settings-row">
              <div class="settings-row__main">
                <span class="settings-row__title">Install Northstar</span>
                <span class="settings-row__sub">Full screen, with offline support.</span>
              </div>
              <button class="btn btn--soft btn--sm" type="button" data-action="install-app">${ICONS.smartphone} Install</button>
            </div>`
          : ''}
        <p class="install-hint">iPhone: open in Safari, tap <kbd>Share</kbd> → <kbd>Add to Home Screen</kbd>.<br>Android: open the browser menu and choose <kbd>Install app</kbd>.</p>
      </section>

      <p class="settings-version">Northstar v1 · Made for Ian &amp; Caca</p>
    </div>`;
  }

  /* ---------- weight chart ---------- */
  function drawWeightChart() {
    if (!route || route.name !== 'person') return;
    const person = data.people[route.personId];
    const container = $('#weightChart');
    if (!person || !person.weightGoal || !container) return;

    const goal = person.weightGoal;
    const unit = person.weightUnit;
    const range = ui.chartRange[person.id] || '3m';
    const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
    const today = todayISO();
    const cutoff = addMonthsISO(today, -months, Number(today.slice(8, 10)));
    const entries = person.weighIns
      .filter((entry) => entry.date >= cutoff && entry.date <= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    const points = [];
    if (goal.startDate >= cutoff && goal.startDate <= today && !entries.some((entry) => entry.date === goal.startDate)) {
      points.push({ date: goal.startDate, kg: goal.startKg, baseline: true });
    }
    for (const entry of entries) points.push({ date: entry.date, kg: entry.kg, baseline: false });
    points.sort((a, b) => a.date.localeCompare(b.date));

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 20 || height < 20) return;

    if (!points.length) {
      container.innerHTML = `<div class="chart__empty"><span>No weigh-ins in this range.</span><button class="btn btn--soft btn--sm" type="button" data-action="log-weight">Log a weigh-in</button></div>`;
      container.setAttribute('aria-label', 'No weigh-ins in the selected range');
      return;
    }

    const targetValue = weightInUnit(goal.targetKg, unit);
    const values = points.map((point) => weightInUnit(point.kg, unit)).concat([targetValue]);
    let low = Math.min(...values);
    let high = Math.max(...values);
    const spread = Math.max(high - low, 0.8);
    low -= Math.max(spread * 0.18, 0.4);
    high += Math.max(spread * 0.18, 0.4);

    const padLeft = width < 330 ? 37 : 42;
    const padRight = 10;
    const padTop = 17;
    const padBottom = 23;
    const plotW = Math.max(10, width - padLeft - padRight);
    const plotH = Math.max(10, height - padTop - padBottom);
    const totalDays = Math.max(1, daysBetween(cutoff, today));

    const xFor = (iso) => padLeft + (daysBetween(cutoff, iso) / totalDays) * plotW;
    const yFor = (value) => padTop + (1 - ((value - low) / (high - low))) * plotH;

    const coords = points.map((point) => ({
      x: xFor(point.date),
      y: yFor(weightInUnit(point.kg, unit)),
      point
    }));

    const linePath = coords.map((coord, index) => `${index ? 'L' : 'M'}${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`).join(' ');
    const bottom = padTop + plotH;
    const areaPath = coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)} ${bottom.toFixed(1)} L${coords[0].x.toFixed(1)} ${bottom.toFixed(1)} Z`
      : '';

    const yTicks = [high, (high + low) / 2, low];
    const midpoint = addDaysISO(cutoff, Math.round(totalDays / 2));
    const xTicks = [cutoff, midpoint, today];
    const targetY = yFor(targetValue);
    const gradientId = `weight-fill-${person.id}`;

    const grid = yTicks.map((value) => {
      const y = yFor(value);
      return `<line class="grid-line" x1="${padLeft}" y1="${y.toFixed(1)}" x2="${padLeft + plotW}" y2="${y.toFixed(1)}"/>`;
    }).join('');

    const yLabels = yTicks.map((value) => {
      const y = yFor(value);
      return `<text x="${padLeft - 8}" y="${(y + 3.2).toFixed(1)}" text-anchor="end">${value.toFixed(1)}</text>`;
    }).join('');

    const xLabels = xTicks.map((iso, index) => {
      const x = index === 0 ? padLeft : index === xTicks.length - 1 ? padLeft + plotW : xFor(iso);
      const anchor = index === 0 ? 'start' : index === xTicks.length - 1 ? 'end' : 'middle';
      return `<text x="${x.toFixed(1)}" y="${height - 5}" text-anchor="${anchor}">${formatDate(iso, { month: 'short', day: 'numeric' })}</text>`;
    }).join('');

    const dots = coords.map((coord, index) => {
      const isLast = index === coords.length - 1;
      const radius = isLast ? 3.9 : 2.8;
      const fill = coord.point.baseline ? 'var(--surface)' : 'var(--accent)';
      const title = `${formatLongDate(coord.point.date)} — ${weightText(coord.point.kg, unit)}`;
      return `<circle cx="${coord.x.toFixed(1)}" cy="${coord.y.toFixed(1)}" r="${radius}" fill="${fill}" stroke="var(--accent)" stroke-width="${isLast ? 2 : 1.7}"><title>${esc(title)}</title></circle>`;
    }).join('');

    const targetLabelY = targetY < padTop + 12 ? targetY + 12 : targetY - 5;
    const last = coords[coords.length - 1];
    const lastAnchor = last.x > padLeft + plotW - 62 ? 'end' : last.x < padLeft + 54 ? 'start' : 'middle';
    const lastLabelX = lastAnchor === 'end' ? last.x - 4 : lastAnchor === 'start' ? last.x + 4 : last.x;
    const lastLabelY = last.y < padTop + 14 ? last.y + 17 : last.y - 10;
    const lastLabel = `${displayWeight(last.point.kg, unit)} ${unit}`;
    const emptyNote = entries.length === 0
      ? `<text class="chart-note" x="${(padLeft + plotW / 2).toFixed(1)}" y="${(bottom - 7).toFixed(1)}" text-anchor="middle">Log a weigh-in to start your trend</text>`
      : '';

    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Weight trend from ${formatDate(cutoff)} to ${formatDate(today)}">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity=".2"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      ${yLabels}
      <line class="goal-line" x1="${padLeft}" y1="${targetY.toFixed(1)}" x2="${padLeft + plotW}" y2="${targetY.toFixed(1)}"/>
      <text class="goal-label" x="${padLeft + plotW}" y="${targetLabelY.toFixed(1)}" text-anchor="end">Goal ${targetValue.toFixed(1)}</text>
      ${areaPath ? `<path d="${areaPath}" fill="url(#${gradientId})"/>` : ''}
      ${coords.length > 1 ? `<path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${dots}
      <text class="last-value" x="${lastLabelX.toFixed(1)}" y="${lastLabelY.toFixed(1)}" text-anchor="${lastAnchor}">${lastLabel}</text>
      ${emptyNote}
      ${xLabels}
    </svg>`;

    const latestText = latestWeighIn(person);
    container.setAttribute('aria-label', latestText
      ? `Weight trend. Latest ${weightText(latestText.kg, unit)}. Goal ${weightText(goal.targetKg, unit)}.`
      : `Weight goal ${weightText(goal.targetKg, unit)}. No weigh-ins yet.`);
  }

  function setupChart() {
    const container = $('#weightChart');
    if (!container) {
      teardownChart();
      return;
    }
    drawWeightChart();
    if ('ResizeObserver' in window) {
      if (!ui.chartObserver) {
        ui.chartObserver = new ResizeObserver(() => {
          cancelAnimationFrame(ui.chartFrame);
          ui.chartFrame = requestAnimationFrame(drawWeightChart);
        });
      }
      ui.chartObserver.disconnect();
      ui.chartObserver.observe(container);
    }
  }

  function teardownChart() {
    if (ui.chartObserver) ui.chartObserver.disconnect();
  }

  /* ---------- theme ---------- */
  function resolvedTheme() {
    const choice = data.settings.theme;
    if (choice === 'light' || choice === 'dark') return choice;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme() {
    const theme = resolvedTheme();
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f0f12' : '#f5f3ee');
  }

  /* ---------- toasts ---------- */
  function showToast(message, options = {}) {
    const container = $('#toasts');
    if (!container) return;
    while (container.children.length >= 3) container.removeChild(container.firstElementChild);

    const toast = document.createElement('div');
    toast.className = 'toast';
    const text = document.createElement('span');
    text.className = 'toast__text';
    text.textContent = message;
    toast.appendChild(text);

    let actionButton = null;
    if (options.actionLabel && typeof options.onAction === 'function') {
      actionButton = document.createElement('button');
      actionButton.type = 'button';
      actionButton.className = 'toast__action';
      actionButton.textContent = options.actionLabel;
      actionButton.addEventListener('click', () => {
        removeToast(toast);
        options.onAction();
      });
      toast.appendChild(actionButton);
    }

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-in'));

    const timeout = window.setTimeout(() => removeToast(toast), options.actionLabel ? 6500 : 4200);
    toast.addEventListener('transitionend', () => {}, { once: true });
    toast._remove = () => window.clearTimeout(timeout);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    if (toast._remove) toast._remove();
    toast.classList.remove('is-in');
    window.setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }

  /* ---------- routing ---------- */
  function safeDecode(value) {
    try { return decodeURIComponent(value); } catch (error) { return value; }
  }

  function parseRoute() {
    const raw = String(location.hash || '').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(safeDecode);

    if (!parts.length) {
      return { name: 'person', personId: data.settings.lastPerson, replace: true };
    }
    if (parts[0] === 'settings') return { name: 'settings' };

    if (!data.people[parts[0]]) {
      return { name: 'person', personId: data.settings.lastPerson, replace: true };
    }

    const personId = parts[0];
    if (parts[1] === 'jar' && parts[2]) {
      const jar = data.people[personId].jars.find((item) => item.id === parts[2]);
      if (!jar) return { name: 'person', personId, replace: true };
      return { name: 'jar', personId, jarId: jar.id };
    }
    return { name: 'person', personId };
  }

  function routeKey(value) {
    if (!value) return '';
    if (value.name === 'settings') return 'settings';
    if (value.name === 'jar') return `${value.personId}/jar/${value.jarId}`;
    return value.personId;
  }

  function updateHeader() {
    const theme = resolvedTheme();
    const themeButton = $('#themeToggle');
    if (themeButton) {
      themeButton.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      themeButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    const settingsLink = $('#settingsLink');
    if (settingsLink) {
      if (route && route.name === 'settings') settingsLink.setAttribute('aria-current', 'page');
      else settingsLink.removeAttribute('aria-current');
    }
    if (route) {
      if (route.name === 'person') {
        document.title = `${data.people[route.personId].name} · Northstar`;
      } else if (route.name === 'jar') {
        const person = data.people[route.personId];
        const jar = person.jars.find((item) => item.id === route.jarId);
        document.title = `${jar ? jar.name : 'Jar'} · Northstar`;
      } else {
        document.title = 'Settings · Northstar';
      }
    }
  }

  function rememberRoutePerson() {
    if (!route || route.name === 'settings') return;
    if (data.settings.lastPerson === route.personId) return;
    data.settings.lastPerson = route.personId;
    saveData();
  }

  function render(options = {}) {
    const previousKey = currentRouteKey;
    const scrollY = window.scrollY;
    route = parseRoute();

    if (route.replace) {
      history.replaceState(null, '', `#/${route.personId}`);
    }

    const generated = catchUpAll();
    if (generated) saveData();

    if (route.name === 'settings') {
      delete document.documentElement.dataset.person;
    } else {
      document.documentElement.dataset.person = route.personId;
    }

    const view = $('#view');
    if (route.name === 'person') {
      view.innerHTML = personPageHTML(data.people[route.personId]);
    } else if (route.name === 'jar') {
      const person = data.people[route.personId];
      const jar = person.jars.find((item) => item.id === route.jarId);
      view.innerHTML = jar ? jarPageHTML(person, jar) : personPageHTML(person);
    } else {
      view.innerHTML = settingsPageHTML();
    }

    updateHeader();

    const key = routeKey(route);
    if (options.scrollTop || !previousKey || key !== previousKey) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, scrollY);
    }
    currentRouteKey = key;

    if (route.name === 'person') setupChart();
    else teardownChart();

    if (generated) {
      window.setTimeout(() => {
        showToast(`${generated} recurring contribution${generated === 1 ? '' : 's'} added`);
      }, 350);
    }
  }

  /* ---------- sheets ---------- */
  function openSheet(id, options = {}) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    if (!options.stack) {
      $$('dialog[open]').forEach((item) => {
        if (item !== dialog) item.close();
      });
    }
    if (!dialog.open) {
      try { dialog.showModal(); } catch (error) { dialog.setAttribute('open', ''); }
    }
    document.body.classList.add('modal-open');

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.setTimeout(() => {
        if (!dialog.open) return;
        const firstField = dialog.querySelector('input:not([type="hidden"]):not([type="file"]), select, textarea');
        if (firstField) firstField.focus({ preventScroll: true });
      }, 40);
    }
  }

  function closeSheet(id) {
    const dialog = document.getElementById(id);
    if (dialog && dialog.open) dialog.close();
  }

  function closeAllDialogs() {
    $$('dialog[open]').forEach((dialog) => dialog.close());
  }

  function setError(id, message) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = message || '';
    element.hidden = !message;
  }

  function askConfirm(config) {
    $('#confirmTitle').textContent = config.title || 'Are you sure?';
    $('#confirmMessage').textContent = config.message || '';
    $('#confirmAccept').textContent = config.confirmLabel || 'Delete';
    confirmAction = typeof config.onConfirm === 'function' ? config.onConfirm : null;
    openSheet('confirmDialog', { stack: true });
  }

  /* ---------- jar dialog ---------- */
  function renderJarSwatches() {
    const container = $('#jarColors');
    if (!container) return;
    container.innerHTML = JAR_COLORS.map((color) => `<button class="swatch" type="button" data-action="jar-color" data-color="${color}" style="--sw:${color}" aria-label="${JAR_COLOR_NAMES[color] || 'Accent'}" aria-pressed="${draftJarColor === color}"></button>`).join('');
  }

  function openJarDialog(personId, jar = null) {
    const person = data.people[personId];
    if (!person) return;
    draftJarColor = jar ? jar.color : JAR_COLORS[person.jars.length % JAR_COLORS.length];
    $('#jarPersonId').value = personId;
    $('#jarId').value = jar ? jar.id : '';
    $('#jarDialogTitle').textContent = jar ? 'Edit jar' : 'New savings jar';
    $('#jarDialogSubtitle').textContent = jar
      ? 'Update the name, target, or accent.'
      : `Saving toward something in ${person.currency}.`;
    $('#jarSubmit').textContent = jar ? 'Save changes' : 'Create jar';
    $('#jarName').value = jar ? jar.name : '';
    $('#jarTarget').value = jar ? jar.target : '';
    $('#jarCurrencySymbol').textContent = currencySymbol(person.currency);
    configureAmountInput($('#jarTarget'), person.currency);
    renderJarSwatches();
    setError('jarError', '');
    openSheet('jarDialog');
  }

  function saveJar(event) {
    event.preventDefault();
    const personId = $('#jarPersonId').value;
    const person = data.people[personId];
    if (!person) return;

    const id = $('#jarId').value;
    const name = $('#jarName').value.trim();
    const target = parseAmountInput($('#jarTarget').value, person.currency);

    if (!name) {
      setError('jarError', 'Give the jar a name.');
      $('#jarName').focus();
      return;
    }
    if (target == null || target <= 0) {
      setError('jarError', 'Enter a target greater than zero.');
      $('#jarTarget').focus();
      return;
    }

    if (id) {
      const jar = person.jars.find((item) => item.id === id);
      if (!jar) return;
      jar.name = name;
      jar.target = target;
      jar.color = draftJarColor;
      showToast('Jar updated');
    } else {
      person.jars.unshift({
        id: makeId(),
        name,
        target,
        color: draftJarColor,
        createdAt: new Date().toISOString(),
        contributions: [],
        rules: []
      });
      showToast('Jar created');
    }

    saveData();
    closeSheet('jarDialog');
    render();
  }

  /* ---------- contribution dialog ---------- */
  function openContributionDialog(personId, jarId, contribution = null) {
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;

    $('#contributionPersonId').value = personId;
    $('#contributionJarId').value = jarId;
    $('#contributionId').value = contribution ? contribution.id : '';
    $('#contributionDialogTitle').textContent = contribution ? 'Edit contribution' : 'Add contribution';
    $('#contributionSubtitle').textContent = `${jar.name} · ${formatMoney(jarTotal(jar), person.currency)} saved`;
    $('#contributionCurrency').textContent = currencySymbol(person.currency);
    $('#contributionAmount').value = contribution ? contribution.amount : '';
    $('#contributionDate').value = contribution ? contribution.date : todayISO();
    $('#contributionDate').max = todayISO();
    $('#contributionNote').value = contribution ? contribution.note : '';
    $('#contributionDelete').hidden = !contribution;
    $('#contributionHint').hidden = !(contribution && contribution.source === 'auto');
    configureAmountInput($('#contributionAmount'), person.currency);
    setError('contributionError', '');
    openSheet('contributionDialog');
  }

  function saveContribution(event) {
    event.preventDefault();
    const personId = $('#contributionPersonId').value;
    const jarId = $('#contributionJarId').value;
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;

    const id = $('#contributionId').value;
    const amount = parseAmountInput($('#contributionAmount').value, person.currency);
    const date = $('#contributionDate').value;
    const note = $('#contributionNote').value.trim().slice(0, 100);

    if (amount == null || amount <= 0) {
      setError('contributionError', 'Enter an amount greater than zero.');
      $('#contributionAmount').focus();
      return;
    }
    if (!isValidISODate(date) || date > todayISO()) {
      setError('contributionError', 'Choose a valid date up to today.');
      $('#contributionDate').focus();
      return;
    }

    const wasComplete = jarTotal(jar) >= jar.target;

    if (id) {
      const entry = jar.contributions.find((item) => item.id === id);
      if (!entry) return;
      entry.amount = amount;
      entry.date = date;
      entry.note = note;
      showToast('Contribution updated');
    } else {
      jar.contributions.push({
        id: makeId(),
        date,
        amount,
        note,
        source: 'manual',
        ruleId: '',
        occurrence: '',
        createdAt: new Date().toISOString()
      });
      showToast('Contribution added');
    }

    const isComplete = jarTotal(jar) >= jar.target;
    if (!wasComplete && isComplete) {
      showToast(`Jar complete — ${jar.name}`);
    }

    saveData();
    closeSheet('contributionDialog');
    render();
  }

  function deleteContribution() {
    const personId = $('#contributionPersonId').value;
    const jarId = $('#contributionJarId').value;
    const contributionId = $('#contributionId').value;
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;

    const index = jar.contributions.findIndex((item) => item.id === contributionId);
    if (index < 0) return;
    const removed = jar.contributions.splice(index, 1)[0];

    saveData();
    closeSheet('contributionDialog');
    render();
    showToast('Contribution deleted', {
      actionLabel: 'Undo',
      onAction: () => {
        jar.contributions.splice(Math.min(index, jar.contributions.length), 0, removed);
        saveData();
        render();
      }
    });
  }

  /* ---------- recurring rule dialog ---------- */
  function openRuleDialog(personId, jarId, rule = null) {
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;

    $('#rulePersonId').value = personId;
    $('#ruleJarId').value = jarId;
    $('#ruleId').value = rule ? rule.id : '';
    $('#ruleDialogTitle').textContent = rule ? 'Edit recurring rule' : 'New recurring rule';
    $('#ruleSubtitle').textContent = jar.name;
    $('#ruleCurrency').textContent = currencySymbol(person.currency);
    $('#ruleAmount').value = rule ? rule.amount : '';
    $('#ruleFrequency').value = rule ? rule.frequency : 'weekly';
    $('#ruleStart').value = rule ? rule.startDate : todayISO();
    $('#ruleEnd').value = rule ? rule.endDate : '';
    $('#ruleEnd').min = $('#ruleStart').value;
    $('#ruleNote').value = rule ? rule.note : '';
    $('#ruleActive').checked = rule ? rule.active : true;
    $('#ruleDelete').hidden = !rule;
    $('#ruleHint').textContent = rule
      ? 'Changes apply going forward. Contributions already added stay the same. Pausing a rule skips the missed period when you resume it.'
      : 'If the start date is in the past, missed contributions are added now. You can pause or edit the rule later.';
    configureAmountInput($('#ruleAmount'), person.currency);
    setError('ruleError', '');
    openSheet('ruleDialog');
  }

  function saveRule(event) {
    event.preventDefault();
    const personId = $('#rulePersonId').value;
    const jarId = $('#ruleJarId').value;
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;

    const id = $('#ruleId').value;
    const amount = parseAmountInput($('#ruleAmount').value, person.currency);
    const frequency = $('#ruleFrequency').value;
    const startDate = $('#ruleStart').value;
    const endDate = $('#ruleEnd').value;
    const note = $('#ruleNote').value.trim().slice(0, 100);
    const active = $('#ruleActive').checked;

    if (amount == null || amount <= 0) {
      setError('ruleError', 'Enter an amount greater than zero.');
      $('#ruleAmount').focus();
      return;
    }
    if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
      setError('ruleError', 'Choose a frequency.');
      return;
    }
    if (!isValidISODate(startDate)) {
      setError('ruleError', 'Choose a valid start date.');
      $('#ruleStart').focus();
      return;
    }
    if (endDate && (!isValidISODate(endDate) || endDate < startDate)) {
      setError('ruleError', 'The end date must be on or after the start date.');
      $('#ruleEnd').focus();
      return;
    }

    let generated = 0;
    if (id) {
      const rule = jar.rules.find((item) => item.id === id);
      if (!rule) return;
      rule.amount = amount;
      rule.frequency = frequency;
      rule.startDate = startDate;
      rule.endDate = endDate;
      rule.note = note;
      rule.active = active;
      rule.anchorDay = Number(startDate.slice(8, 10));

      if (active) {
        rule.nextDate = firstOccurrenceOnOrAfter(rule, todayISO());
        if (rule.endDate && rule.nextDate && rule.nextDate > rule.endDate) rule.nextDate = '';
        generated = runRule(rule, jar);
      } else {
        rule.nextDate = '';
      }
      showToast(generated ? `Rule updated · ${generated} contribution${generated === 1 ? '' : 's'} added` : 'Recurring rule updated');
    } else {
      const rule = {
        id: makeId(),
        amount,
        frequency,
        startDate,
        endDate,
        note,
        active,
        anchorDay: Number(startDate.slice(8, 10)),
        nextDate: active ? startDate : '',
        createdAt: new Date().toISOString()
      };
      jar.rules.push(rule);
      if (active) generated = runRule(rule, jar);
      showToast(generated
        ? `Rule created · ${generated} past contribution${generated === 1 ? '' : 's'} added`
        : active ? 'Recurring rule created' : 'Recurring rule created — paused');
    }

    saveData();
    closeSheet('ruleDialog');
    render();
  }

  function deleteRule() {
    const personId = $('#rulePersonId').value;
    const jarId = $('#ruleJarId').value;
    const ruleId = $('#ruleId').value;
    const person = data.people[personId];
    const jar = person && person.jars.find((item) => item.id === jarId);
    if (!person || !jar) return;
    const rule = jar.rules.find((item) => item.id === ruleId);
    if (!rule) return;

    askConfirm({
      title: 'Delete this rule?',
      message: 'Future contributions will stop. Contributions already added to the jar will stay.',
      confirmLabel: 'Delete rule',
      onConfirm: () => {
        jar.rules = jar.rules.filter((item) => item.id !== ruleId);
        saveData();
        closeSheet('ruleDialog');
        render();
        showToast('Recurring rule deleted');
      }
    });
  }

  /* ---------- weight goal dialog ---------- */
  function setWeightDialogUnits(person) {
    $$('#weightGoalDialog [data-unit], #weighInDialog [data-unit]').forEach((element) => {
      element.textContent = person.weightUnit;
    });
  }

  function updateWeightDirectionHint() {
    const personId = $('#weightPersonId').value;
    const person = data.people[personId];
    if (!person) return;
    const unit = person.weightUnit;
    const start = Number($('#weightStart').value);
    const target = Number($('#weightTarget').value);
    const hint = $('#weightDirectionHint');

    if (!Number.isFinite(start) || !Number.isFinite(target) || !$('#weightStart').value || !$('#weightTarget').value) {
      hint.textContent = `All weights are in ${unit}. You can change the unit in Settings.`;
      return;
    }
    const diff = Math.abs(start - target);
    if (diff < 0.05) {
      hint.textContent = 'Choose a goal weight different from your starting weight.';
      return;
    }
    hint.textContent = `${target < start ? 'Lose' : 'Gain'} ${diff.toFixed(1)} ${unit} to reach your goal.`;
  }

  function openWeightGoalDialog(personId) {
    const person = data.people[personId];
    if (!person) return;
    const goal = person.weightGoal;
    const unit = person.weightUnit;

    $('#weightPersonId').value = personId;
    $('#weightGoalTitle').textContent = goal ? 'Edit weight goal' : 'Set a weight goal';
    $('#weightGoalSubtitle').textContent = `${person.name} · all weights in ${unit}`;
    setWeightDialogUnits(person);
    $('#weightStart').value = goal ? displayWeight(goal.startKg, unit) : '';
    $('#weightTarget').value = goal ? displayWeight(goal.targetKg, unit) : '';
    $('#weightStartDate').value = goal ? goal.startDate : todayISO();
    $('#weightStartDate').max = todayISO();
    $('#weightGoalRemove').hidden = !goal;
    $('#weightGoalSubmit').textContent = goal ? 'Save goal' : 'Set goal';
    setError('weightGoalError', '');
    updateWeightDirectionHint();
    openSheet('weightGoalDialog');
  }

  function saveWeightGoal(event) {
    event.preventDefault();
    const personId = $('#weightPersonId').value;
    const person = data.people[personId];
    if (!person) return;

    const unit = person.weightUnit;
    const startRaw = Number($('#weightStart').value);
    const targetRaw = Number($('#weightTarget').value);
    const startDate = $('#weightStartDate').value;

    if (!Number.isFinite(startRaw) || !startRaw || startRaw <= 0 || !Number.isFinite(targetRaw) || !targetRaw || targetRaw <= 0) {
      setError('weightGoalError', 'Enter both a starting weight and a goal weight.');
      return;
    }
    if (Math.abs(startRaw - targetRaw) < 0.05) {
      setError('weightGoalError', 'Choose a goal weight different from your starting weight.');
      $('#weightTarget').focus();
      return;
    }
    const startKg = roundKg(toKg(startRaw, unit));
    const targetKg = roundKg(toKg(targetRaw, unit));
    if (startKg < 1 || startKg > 500 || targetKg < 1 || targetKg > 500) {
      setError('weightGoalError', 'Enter a weight between 1 and 500 kg (about 2–1,100 lb).');
      return;
    }
    if (!isValidISODate(startDate) || startDate > todayISO()) {
      setError('weightGoalError', 'Choose a start date up to today.');
      $('#weightStartDate').focus();
      return;
    }

    person.weightGoal = { startKg, targetKg, startDate };
    saveData();
    closeSheet('weightGoalDialog');
    render();
    showToast(person.weightGoal ? 'Weight goal saved' : 'Weight goal removed');
  }

  function removeWeightGoal() {
    const personId = $('#weightPersonId').value;
    const person = data.people[personId];
    if (!person) return;
    askConfirm({
      title: 'Remove weight goal?',
      message: 'This also deletes all weigh-in history for this person. Export a backup first if you want to keep it.',
      confirmLabel: 'Remove goal',
      onConfirm: () => {
        person.weightGoal = null;
        person.weighIns = [];
        saveData();
        closeSheet('weightGoalDialog');
        render();
        showToast('Weight goal removed');
      }
    });
  }

  /* ---------- weigh-in dialog ---------- */
  function openWeighInDialog(personId, entry = null) {
    const person = data.people[personId];
    if (!person || !person.weightGoal) return;
    const goal = person.weightGoal;
    const unit = person.weightUnit;
    const latest = latestWeighIn(person);
    const startingValue = latest ? latest.kg : goal.startKg;

    $('#weighPersonId').value = personId;
    $('#weighId').value = entry ? entry.id : '';
    $('#weighInTitle').textContent = entry ? 'Edit weigh-in' : 'Log a weigh-in';
    $('#weighInSubtitle').textContent = `${person.name} · all weights in ${unit}`;
    setWeightDialogUnits(person);
    $('#weighValue').value = entry ? displayWeight(entry.kg, unit) : displayWeight(startingValue, unit);
    $('#weighDate').value = entry ? entry.date : todayISO();
    $('#weighDate').min = goal.startDate;
    $('#weighDate').max = todayISO();
    $('#weighNote').value = entry ? entry.note : '';
    $('#weighDelete').hidden = !entry;
    $('#weighSubmit').textContent = entry ? 'Save changes' : 'Save weigh-in';
    setError('weighInError', '');
    openSheet('weighInDialog');
  }

  function saveWeighIn(event) {
    event.preventDefault();
    const personId = $('#weighPersonId').value;
    const person = data.people[personId];
    if (!person || !person.weightGoal) return;

    const unit = person.weightUnit;
    const goal = person.weightGoal;
    const id = $('#weighId').value;
    const rawWeight = Number($('#weighValue').value);
    const date = $('#weighDate').value;

    if (!Number.isFinite(rawWeight) || rawWeight <= 0) {
      setError('weighInError', 'Enter a valid weight.');
      $('#weighValue').focus();
      return;
    }
    const kg = roundKg(toKg(rawWeight, unit));
    if (kg < 1 || kg > 500) {
      setError('weighInError', 'Enter a weight between 1 and 500 kg (about 2–1,100 lb).');
      return;
    }
    if (!isValidISODate(date) || date > todayISO()) {
      setError('weighInError', 'Choose a valid date up to today.');
      $('#weighDate').focus();
      return;
    }
    if (date < goal.startDate) {
      setError('weighInError', `Choose a date on or after your start date (${formatShortDate(goal.startDate)}).`);
      $('#weighDate').focus();
      return;
    }

    const sameDate = person.weighIns.find((item) => item.date === date && item.id !== id);
    if (id) {
      if (sameDate) {
        setError('weighInError', 'There is already a weigh-in for that date. Edit that one instead.');
        return;
      }
      const entry = person.weighIns.find((item) => item.id === id);
      if (!entry) return;
      entry.kg = kg;
      entry.date = date;
      entry.note = $('#weighNote').value.trim().slice(0, 100);
      showToast('Weigh-in updated');
    } else if (sameDate) {
      sameDate.kg = kg;
      sameDate.note = $('#weighNote').value.trim().slice(0, 100);
      sameDate.createdAt = new Date().toISOString();
      showToast('Weigh-in updated');
    } else {
      person.weighIns.push({
        id: makeId(),
        date,
        kg,
        note: $('#weighNote').value.trim().slice(0, 100),
        createdAt: new Date().toISOString()
      });
      showToast('Weigh-in logged');
    }

    person.weighIns.sort((a, b) => a.date.localeCompare(b.date));
    saveData();
    closeSheet('weighInDialog');
    render();
  }

  function deleteWeighIn() {
    const personId = $('#weighPersonId').value;
    const weighId = $('#weighId').value;
    const person = data.people[personId];
    if (!person) return;
    const index = person.weighIns.findIndex((item) => item.id === weighId);
    if (index < 0) return;
    const removed = person.weighIns.splice(index, 1)[0];

    saveData();
    closeSheet('weighInDialog');
    render();
    showToast('Weigh-in deleted', {
      actionLabel: 'Undo',
      onAction: () => {
        person.weighIns.splice(Math.min(index, person.weighIns.length), 0, removed);
        person.weighIns.sort((a, b) => a.date.localeCompare(b.date));
        saveData();
        render();
      }
    });
  }

  /* ---------- weight history ---------- */
  function openHistoryDialog(personId) {
    const person = data.people[personId];
    if (!person) return;
    const unit = person.weightUnit;
    const entries = [...person.weighIns].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });

    $('#historySubtitle').textContent = `${person.name} · ${entries.length} weigh-in${entries.length === 1 ? '' : 's'} in ${unit}`;
    if (!entries.length) {
      $('#historyList').innerHTML = '<div class="empty-inline">No weigh-ins yet. Log your first one to start the trend.</div>';
    } else {
      const groups = new Map();
      for (const entry of entries) {
        const key = entry.date.slice(0, 7);
        if (!groups.has(key)) groups.set(key, { label: formatMonthYear(entry.date), entries: [] });
        groups.get(key).entries.push(entry);
      }
      $('#historyList').innerHTML = Array.from(groups.values()).map((group) => `
        <div class="month-group">
          <div class="month-head"><span>${group.label}</span><span>${group.entries.length} ${group.entries.length === 1 ? 'entry' : 'entries'}</span></div>
          <div class="tx-list">${group.entries.map((entry) => `
            <button class="tx" type="button" data-action="edit-weighin" data-id="${entry.id}" aria-label="Edit weigh-in for ${formatShortDate(entry.date)}">
              <span class="tx__main">
                <span class="tx__title">${weightText(entry.kg, unit)}</span>
                <span class="tx__date">${formatLongDate(entry.date)}${entry.note ? ` · ${esc(entry.note)}` : ''}</span>
              </span>
              <span class="tx__edit">${ICONS.pencil}</span>
            </button>`).join('')}</div>
        </div>`).join('');
    }
    openSheet('historyDialog');
  }

  /* ---------- backup / install ---------- */
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `northstar-backup-${todayISO()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Backup downloaded');
  }

  function importBackup(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('That file is too large to be a Northstar backup.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result || ''));
      } catch (error) {
        showToast('That file is not valid JSON.');
        return;
      }
      if (!parsed || typeof parsed !== 'object' || !parsed.people || !parsed.people.ian || !parsed.people.caca) {
        showToast('That does not look like a Northstar backup.');
        return;
      }
      askConfirm({
        title: 'Import this backup?',
        message: 'This replaces all jars, contributions, goals, and weigh-ins currently stored in this browser.',
        confirmLabel: 'Import backup',
        onConfirm: () => {
          data = normalizeData(parsed);
          catchUpAll();
          saveData();
          applyTheme();
          const target = `#/${data.settings.lastPerson}`;
          if (location.hash === target) render({ scrollTop: true });
          else location.hash = target;
          showToast('Backup imported');
        }
      });
    };
    reader.onerror = () => showToast('Could not read that file.');
    reader.readAsText(file);
  }

  function resetAllData() {
    askConfirm({
      title: 'Reset everything?',
      message: 'This deletes all jars, contributions, recurring rules, weight goals, and weigh-ins from this browser. This cannot be undone.',
      confirmLabel: 'Reset everything',
      onConfirm: () => {
        data = defaultData();
        saveData();
        applyTheme();
        const target = '#/ian';
        if (location.hash === target) render({ scrollTop: true });
        else location.hash = target;
        showToast('All data reset');
      }
    });
  }

  async function installApp() {
    if (!ui.installPrompt) {
      showToast('Use your browser menu to add Northstar to your home screen.');
      return;
    }
    ui.installPrompt.prompt();
    try {
      await ui.installPrompt.userChoice;
    } catch (error) { /* dismissed */ }
    ui.installPrompt = null;
    if (route && route.name === 'settings') render();
  }

  /* ---------- actions ---------- */
  function chooseTheme(choice) {
    if (!['system', 'light', 'dark'].includes(choice)) return;
    data.settings.theme = choice;
    saveData();
    applyTheme();
    updateHeader();
    if (route && route.name === 'settings') render();
  }

  function chooseUnit(personId, unit) {
    if (unit !== 'lb' && unit !== 'kg') return;
    const person = data.people[personId];
    if (!person || person.weightUnit === unit) return;
    person.weightUnit = unit;
    saveData();
    render();
    showToast(`${person.name}: weights now in ${unit}`);
  }

  function handleAction(action, element) {
    const person = route && route.personId ? data.people[route.personId] : null;

    switch (action) {
      case 'toggle-theme':
        chooseTheme(resolvedTheme() === 'dark' ? 'light' : 'dark');
        break;
      case 'set-theme':
        chooseTheme(element.dataset.themeChoice);
        break;
      case 'set-unit':
        chooseUnit(element.dataset.person, element.dataset.unitValue);
        break;
      case 'new-jar':
        if (person) openJarDialog(person.id);
        break;
      case 'edit-jar': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        if (jar) openJarDialog(person.id, jar);
        break;
      }
      case 'delete-jar': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        if (!jar) break;
        askConfirm({
          title: `Delete ${jar.name}?`,
          message: 'This removes the jar, its contributions, and its recurring rules from this device.',
          confirmLabel: 'Delete jar',
          onConfirm: () => {
            person.jars = person.jars.filter((item) => item.id !== jar.id);
            saveData();
            if (route && route.name === 'jar' && route.jarId === jar.id) {
              location.hash = `#/${person.id}`;
            } else {
              render();
            }
            showToast('Jar deleted');
          }
        });
        break;
      }
      case 'jar-color':
        if (JAR_COLORS.includes(element.dataset.color)) {
          draftJarColor = element.dataset.color;
          renderJarSwatches();
        }
        break;
      case 'add-contribution': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        if (jar) openContributionDialog(person.id, jar.id);
        break;
      }
      case 'edit-contribution': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        const entry = jar && jar.contributions.find((item) => item.id === element.dataset.id);
        if (jar && entry) openContributionDialog(person.id, jar.id, entry);
        break;
      }
      case 'new-rule': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        if (jar) openRuleDialog(person.id, jar.id);
        break;
      }
      case 'edit-rule': {
        if (!person) break;
        const jar = person.jars.find((item) => item.id === element.dataset.jar);
        const rule = jar && jar.rules.find((item) => item.id === element.dataset.id);
        if (jar && rule) openRuleDialog(person.id, jar.id, rule);
        break;
      }
      case 'weight-goal':
        if (person) openWeightGoalDialog(person.id);
        break;
      case 'log-weight':
        if (!person) break;
        if (person.weightGoal) openWeighInDialog(person.id);
        else openWeightGoalDialog(person.id);
        break;
      case 'edit-weighin':
        if (!person) break;
        const weighIn = person.weighIns.find((item) => item.id === element.dataset.id);
        if (weighIn) openWeighInDialog(person.id, weighIn);
        break;
      case 'weight-history':
        if (person) openHistoryDialog(person.id);
        break;
      case 'range':
        if (!person || !['3m', '6m', '1y'].includes(element.dataset.range)) break;
        ui.chartRange[person.id] = element.dataset.range;
        $$('.range button').forEach((button) => button.setAttribute('aria-pressed', String(button === element)));
        const caption = $('.chart-caption');
        if (caption) {
          caption.textContent = element.dataset.range === '3m' ? 'Last 3 months' : element.dataset.range === '6m' ? 'Last 6 months' : 'Last 12 months';
        }
        drawWeightChart();
        break;
      case 'export-data':
        exportData();
        break;
      case 'import-data': {
        const input = $('#importFile');
        if (input) {
          input.value = '';
          input.click();
        }
        break;
      }
      case 'reset-data':
        resetAllData();
        break;
      case 'install-app':
        installApp();
        break;
      default:
        break;
    }
  }

  /* ---------- events ---------- */
  function bindEvents() {
    const errorMap = {
      jarForm: 'jarError',
      contributionForm: 'contributionError',
      ruleForm: 'ruleError',
      weightGoalForm: 'weightGoalError',
      weighInForm: 'weighInError'
    };

    Object.entries(errorMap).forEach(([formId, errorId]) => {
      const form = document.getElementById(formId);
      if (!form) return;
      const clear = () => setError(errorId, '');
      form.addEventListener('input', clear);
      form.addEventListener('change', clear);
    });

    const jarForm = $('#jarForm');
    if (jarForm) jarForm.addEventListener('submit', saveJar);

    const contributionForm = $('#contributionForm');
    if (contributionForm) contributionForm.addEventListener('submit', saveContribution);

    const ruleForm = $('#ruleForm');
    if (ruleForm) ruleForm.addEventListener('submit', saveRule);

    const weightGoalForm = $('#weightGoalForm');
    if (weightGoalForm) weightGoalForm.addEventListener('submit', saveWeightGoal);

    const weighInForm = $('#weighInForm');
    if (weighInForm) weighInForm.addEventListener('submit', saveWeighIn);

    const contributionDelete = $('#contributionDelete');
    if (contributionDelete) contributionDelete.addEventListener('click', deleteContribution);

    const ruleDelete = $('#ruleDelete');
    if (ruleDelete) ruleDelete.addEventListener('click', deleteRule);

    const weighDelete = $('#weighDelete');
    if (weighDelete) weighDelete.addEventListener('click', deleteWeighIn);

    const weightGoalRemove = $('#weightGoalRemove');
    if (weightGoalRemove) weightGoalRemove.addEventListener('click', removeWeightGoal);

    const confirmAccept = $('#confirmAccept');
    if (confirmAccept) {
      confirmAccept.addEventListener('click', () => {
        const action = confirmAction;
        confirmAction = null;
        closeSheet('confirmDialog');
        if (action) window.setTimeout(action, 0);
      });
    }

    const importFile = $('#importFile');
    if (importFile) {
      importFile.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (file) importBackup(file);
      });
    }

    const weightStart = $('#weightStart');
    const weightTarget = $('#weightTarget');
    if (weightStart) weightStart.addEventListener('input', updateWeightDirectionHint);
    if (weightTarget) weightTarget.addEventListener('input', updateWeightDirectionHint);

    const ruleStart = $('#ruleStart');
    if (ruleStart) {
      ruleStart.addEventListener('change', () => {
        const start = ruleStart.value;
        const end = $('#ruleEnd');
        if (!end) return;
        end.min = start || '';
        if (end.value && start && end.value < start) end.value = '';
      });
    }

    $$('dialog').forEach((dialog) => {
      dialog.addEventListener('close', () => {
        if (dialog.id === 'confirmDialog') confirmAction = null;
        if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
      });
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    document.addEventListener('click', (event) => {
      const target = event.target && event.target.closest ? event.target : null;
      if (!target) return;

      const closer = target.closest('[data-close]');
      if (closer) closeSheet(closer.dataset.close);

      const actionElement = target.closest('[data-action]');
      if (!actionElement || actionElement.disabled) return;
      handleAction(actionElement.dataset.action, actionElement);
    });

    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!target || !target.matches) return;
      if (target.matches('select[data-setting="currency"]')) {
        const person = data.people[target.dataset.person];
        const currency = target.value;
        if (!person || !CURRENCIES[currency] || person.currency === currency) return;
        person.currency = currency;
        saveData();
        render();
        showToast(`${person.name}: ${currency}. Existing amounts were not converted.`);
      }
    });

    window.addEventListener('hashchange', () => {
      closeAllDialogs();
      document.body.classList.remove('modal-open');
      render({ scrollTop: true });
      rememberRoutePerson();
    });

    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      closeAllDialogs();
      document.body.classList.remove('modal-open');
      data = loadData();
      applyTheme();
      currentRouteKey = '';
      render({ scrollTop: true });
      showToast('Data updated from another tab');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      const generated = catchUpAll();
      if (generated) saveData();
      if (!document.querySelector('dialog[open]')) render();
      if (generated) {
        showToast(`${generated} recurring contribution${generated === 1 ? '' : 's'} added`);
      }
    });

    const colorMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorChange = () => {
      if (data.settings.theme !== 'system') return;
      applyTheme();
      updateHeader();
      if (route && route.name === 'settings') render();
    };
    if (colorMedia.addEventListener) colorMedia.addEventListener('change', handleColorChange);
    else if (colorMedia.addListener) colorMedia.addListener(handleColorChange);

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      ui.installPrompt = event;
      if (route && route.name === 'settings') render();
    });

    window.addEventListener('appinstalled', () => {
      ui.installPrompt = null;
      showToast('Northstar installed');
      if (route && route.name === 'settings') render();
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support is a bonus; the app still works without it */
    });
  }

  function init() {
    applyTheme();
    bindEvents();
    saveData();

    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      history.replaceState(null, '', `#/${data.settings.lastPerson}`);
    }

    render({ scrollTop: true });
    rememberRoutePerson();

    if (loadWarning) {
      window.setTimeout(() => showToast(loadWarning), 600);
    }

    if (document.readyState === 'complete') registerServiceWorker();
    else window.addEventListener('load', registerServiceWorker, { once: true });
  }

  init();
})();
