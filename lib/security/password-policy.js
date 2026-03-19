import { COMMON_PASSWORDS } from "@/lib/security/common-passwords";

export const MIN_MEMBER_PASSWORD_LENGTH = 12;
export const MAX_MEMBER_PASSWORD_LENGTH = 128;

const COMMON_PASSWORD_SET = new Set(COMMON_PASSWORDS.map((value) => String(value).toLowerCase()));

function normalizeText(value) {
  return String(value || "").trim();
}

function tokenizeContext({ fullName = "", email = "" }) {
  const tokens = new Set();
  const normalizedName = normalizeText(fullName).toLowerCase();
  const normalizedEmail = normalizeText(email).toLowerCase();
  const emailLocal = normalizedEmail.split("@")[0] || "";

  [normalizedName, emailLocal].forEach((source) => {
    source
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
      .forEach((token) => tokens.add(token));
  });

  return Array.from(tokens);
}

function normalizeLeetSpeak(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9]/g, "");
}

function isCommonPassword(password) {
  const lowered = String(password || "").toLowerCase();
  if (COMMON_PASSWORD_SET.has(lowered)) {
    return true;
  }

  const normalized = normalizeLeetSpeak(lowered);
  return Boolean(normalized && COMMON_PASSWORD_SET.has(normalized));
}

function containsPersonalContext(password, context) {
  const lowered = String(password || "").toLowerCase();
  const normalized = normalizeLeetSpeak(lowered);

  return context.some((token) => lowered.includes(token) || (normalized && normalized.includes(token)));
}

export function validateMemberPassword(password, context = {}) {
  const raw = String(password || "");
  const lowered = raw.toLowerCase();
  const contextTokens = tokenizeContext(context);

  if (raw.length < MIN_MEMBER_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Use at least ${MIN_MEMBER_PASSWORD_LENGTH} characters.`,
      code: "too_short",
    };
  }

  if (raw.length > MAX_MEMBER_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Use no more than ${MAX_MEMBER_PASSWORD_LENGTH} characters.`,
      code: "too_long",
    };
  }

  if (/\s/.test(raw)) {
    return {
      valid: false,
      message: "Do not use spaces in your password.",
      code: "whitespace",
    };
  }

  if (!/[a-z]/.test(raw) || !/[A-Z]/.test(raw) || !/[0-9]/.test(raw) || !/[^A-Za-z0-9]/.test(raw)) {
    return {
      valid: false,
      message: "Use uppercase, lowercase, a number, and a symbol.",
      code: "missing_complexity",
    };
  }

  if (/(.)\1{3,}/.test(lowered)) {
    return {
      valid: false,
      message: "Avoid repeating the same character many times.",
      code: "repeated_characters",
    };
  }

  if (isCommonPassword(raw)) {
    return {
      valid: false,
      message: "That password is too common. Choose a less predictable one.",
      code: "common_password",
    };
  }

  if (containsPersonalContext(raw, contextTokens)) {
    return {
      valid: false,
      message: "Do not include your name or email in your password.",
      code: "contains_personal_info",
    };
  }

  return {
    valid: true,
    message: "",
    code: "ok",
  };
}
