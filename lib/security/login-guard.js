import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_MAX_ATTEMPTS = 30;
const ACCOUNT_MAX_FAILED_ATTEMPTS = 5;
const ACCOUNT_LOCK_MS = 15 * 60 * 1000;

function getStore() {
  if (!globalThis.__lcLoginGuardStore) {
    globalThis.__lcLoginGuardStore = new Map();
  }
  return globalThis.__lcLoginGuardStore;
}

function cleanExpiredIpEntries(store, now) {
  for (const [key, value] of store.entries()) {
    if (!value || value.windowEndsAt <= now) {
      store.delete(key);
    }
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function getRequestIpAddress(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const firstForwarded = forwardedFor.split(",")[0]?.trim();
  if (firstForwarded) {
    return firstForwarded;
  }

  const realIp = request.headers.get("x-real-ip") || "";
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function checkIpLoginThrottle(request) {
  const ip = getRequestIpAddress(request);
  const now = Date.now();
  const store = getStore();
  cleanExpiredIpEntries(store, now);

  const current = store.get(ip);
  if (!current) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      ip,
    };
  }

  if (current.attempts < IP_MAX_ATTEMPTS) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      ip,
    };
  }

  const retryAfterMs = Math.max(0, current.windowEndsAt - now);
  return {
    allowed: false,
    retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    ip,
  };
}

export function recordIpLoginFailure(request) {
  const ip = getRequestIpAddress(request);
  const now = Date.now();
  const store = getStore();
  const current = store.get(ip);

  if (!current || current.windowEndsAt <= now) {
    store.set(ip, {
      attempts: 1,
      windowEndsAt: now + IP_WINDOW_MS,
    });
    return;
  }

  store.set(ip, {
    attempts: current.attempts + 1,
    windowEndsAt: current.windowEndsAt,
  });
}

export function recordIpLoginSuccess(request) {
  const ip = getRequestIpAddress(request);
  const store = getStore();
  store.delete(ip);
}

async function getMemberSecurityRecord(adminClient, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!adminClient || !normalizedEmail) {
    return { member: null, hasSecurityColumns: false };
  }

  const withSecurityColumns = await adminClient
    .from("team_members")
    .select("id,email,failed_sign_in_attempts,sign_in_lock_until")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!withSecurityColumns.error) {
    return {
      member: withSecurityColumns.data || null,
      hasSecurityColumns: true,
    };
  }

  const fallback = await adminClient
    .from("team_members")
    .select("id,email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (fallback.error) {
    return { member: null, hasSecurityColumns: false };
  }

  return {
    member: fallback.data || null,
    hasSecurityColumns: false,
  };
}

export async function getAccountLockStatusByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return {
      locked: false,
      retryAfterSeconds: 0,
    };
  }

  const adminClient = createSupabaseAdminClient();
  const { member, hasSecurityColumns } = await getMemberSecurityRecord(adminClient, normalizedEmail);

  if (!member || !hasSecurityColumns) {
    return {
      locked: false,
      retryAfterSeconds: 0,
    };
  }

  const lockUntilMs = Date.parse(member.sign_in_lock_until || "");
  if (!Number.isFinite(lockUntilMs)) {
    return {
      locked: false,
      retryAfterSeconds: 0,
    };
  }

  const now = Date.now();
  if (lockUntilMs <= now) {
    return {
      locked: false,
      retryAfterSeconds: 0,
    };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((lockUntilMs - now) / 1000),
  };
}

export async function recordAccountLoginFailureByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const adminClient = createSupabaseAdminClient();
  const { member, hasSecurityColumns } = await getMemberSecurityRecord(adminClient, normalizedEmail);

  if (!adminClient || !member?.id || !hasSecurityColumns) {
    return;
  }

  const failedAttempts = Number(member.failed_sign_in_attempts || 0) + 1;
  const shouldLock = failedAttempts >= ACCOUNT_MAX_FAILED_ATTEMPTS;

  const updates = shouldLock
    ? {
        failed_sign_in_attempts: 0,
        sign_in_lock_until: new Date(Date.now() + ACCOUNT_LOCK_MS).toISOString(),
      }
    : {
        failed_sign_in_attempts: failedAttempts,
      };

  await adminClient.from("team_members").update(updates).eq("id", member.id);
}

export async function clearAccountLoginFailuresByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const adminClient = createSupabaseAdminClient();
  const { member, hasSecurityColumns } = await getMemberSecurityRecord(adminClient, normalizedEmail);

  if (!adminClient || !member?.id || !hasSecurityColumns) {
    return;
  }

  await adminClient
    .from("team_members")
    .update({
      failed_sign_in_attempts: 0,
      sign_in_lock_until: null,
    })
    .eq("id", member.id);
}
