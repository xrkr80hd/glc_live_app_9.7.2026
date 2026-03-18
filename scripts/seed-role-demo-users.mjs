import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filepath) {
  if (!fs.existsSync(filepath)) {
    return;
  }

  const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_PUBLIC_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    ""
  );
}

function normalizeRoleKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

const ROLE_DEMO_CONFIG = [
  {
    slug: "member",
    roleKey: null,
    label: "General Member",
    dashboardPath: "/dashboard/member",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "worship-team",
    roleKey: "worship_team",
    label: "Worship Team",
    dashboardPath: "/dashboard/worship",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "worship-leader",
    roleKey: "worship_leader",
    label: "Music Minister",
    dashboardPath: "/dashboard/music-minister",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "media",
    roleKey: "media_team",
    label: "Media Team",
    dashboardPath: "/dashboard/media",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "foh",
    roleKey: "foh_sound",
    label: "FOH Sound",
    dashboardPath: "/dashboard/foh",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "youth-minister",
    roleKey: "youth_minister",
    label: "Youth Minister",
    dashboardPath: "/dashboard/youth",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "youth-assistant",
    roleKey: "youth_minister_assistant",
    label: "Youth Assistant",
    dashboardPath: "/dashboard/youth/assistant",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "kids",
    roleKey: "kids_church",
    label: "Kids Ministry",
    dashboardPath: "/dashboard/kids",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "bookkeeper",
    roleKey: "bookkeeper",
    label: "Bookkeeper",
    dashboardPath: "/dashboard/bookkeeper",
    isSuperuser: false,
    isRoleAdmin: false,
  },
  {
    slug: "pastor",
    roleKey: "pastor",
    label: "Pastor",
    dashboardPath: "/dashboard/pastor",
    isSuperuser: false,
    isRoleAdmin: true,
  },
  {
    slug: "superuser",
    roleKey: "superuser",
    label: "Superuser",
    dashboardPath: "/dashboard/superuser",
    isSuperuser: true,
    isRoleAdmin: true,
  },
];

async function listAllAuthUsersByEmail(supabase, targetEmail) {
  let page = 1;
  const perPage = 200;
  const normalizedTarget = String(targetEmail || "").trim().toLowerCase();

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Unable to list auth users: ${error.message}`);
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    const match = users.find(
      (user) => String(user?.email || "").trim().toLowerCase() === normalizedTarget,
    );
    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(supabase, { email, password, fullName, phone }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const existing = await listAllAuthUsersByEmail(supabase, normalizedEmail);
  if (existing?.id) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || "",
      },
    });

    if (updateError) {
      throw new Error(`Unable to update auth user ${normalizedEmail}: ${updateError.message}`);
    }

    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone: phone || "",
    },
  });

  if (error) {
    throw new Error(`Unable to create auth user ${normalizedEmail}: ${error.message}`);
  }

  return data?.user?.id || null;
}

async function getExistingMemberByIdentity(supabase, { email, username }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedUsername = String(username || "").trim().toLowerCase();

  if (normalizedEmail) {
    const { data, error } = await supabase
      .from("team_members")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to read team_members by email: ${error.message}`);
    }

    if (data?.id) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read team_members by username: ${error.message}`);
  }

  return data || null;
}

async function ensureTeamMember(supabase, {
  authUserId,
  email,
  username,
  fullName,
  notes,
  isSuperuser,
}) {
  const existing = await getExistingMemberByIdentity(supabase, { email, username });
  const payload = {
    auth_user_id: authUserId,
    email,
    username,
    full_name: fullName,
    phone: null,
    notes,
    is_superuser: Boolean(isSuperuser),
    is_active: true,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("team_members")
      .update(payload)
      .eq("id", existing.id)
      .select("id, username, email")
      .single();

    if (error) {
      throw new Error(`Unable to update team member ${email}: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("team_members")
    .insert(payload)
    .select("id, username, email")
    .single();

  if (error) {
    throw new Error(`Unable to insert team member ${email}: ${error.message}`);
  }

  return data;
}

async function setRoleAssignment(supabase, { memberId, roleId, isRoleAdmin }) {
  const { error: deleteError } = await supabase
    .from("team_member_roles")
    .delete()
    .eq("member_id", memberId);

  if (deleteError) {
    throw new Error(`Unable to clear existing role assignments: ${deleteError.message}`);
  }

  if (!roleId) {
    return;
  }

  const { error: insertError } = await supabase.from("team_member_roles").insert({
    member_id: memberId,
    role_id: roleId,
    is_role_admin: Boolean(isRoleAdmin),
  });

  if (insertError) {
    throw new Error(`Unable to insert role assignment: ${insertError.message}`);
  }
}

function buildRoleDemoIdentity(roleConfig, emailDomain) {
  const slug = String(roleConfig.slug || "member")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const username = `demo.${slug}`;
  const email = `${username}@${emailDomain}`;
  const fullName = `Demo ${roleConfig.label}`;
  return { username, email, fullName };
}

async function main() {
  loadEnvFile(path.join(projectRoot, ".env.local"));
  loadEnvFile(path.join(projectRoot, ".env"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = getServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY in env.",
    );
  }

  const demoPassword = process.env.DEMO_MEMBER_PASSWORD || "DemoRole123!";
  const emailDomain = process.env.DEMO_MEMBER_EMAIL_DOMAIN || "golibertychurch.local";
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: roles, error: rolesError } = await supabase
    .from("team_roles")
    .select("id, role_key");

  if (rolesError) {
    throw new Error(`Unable to load team_roles: ${rolesError.message}`);
  }

  const roleIdByKey = new Map(
    (roles || []).map((role) => [normalizeRoleKey(role.role_key), role.id]),
  );

  const missingRoleKeys = ROLE_DEMO_CONFIG
    .map((entry) => normalizeRoleKey(entry.roleKey))
    .filter(Boolean)
    .filter((roleKey) => !roleIdByKey.has(roleKey));

  if (missingRoleKeys.length) {
    throw new Error(
      `Missing role keys in team_roles: ${Array.from(new Set(missingRoleKeys)).join(", ")}`,
    );
  }

  const results = [];

  for (const config of ROLE_DEMO_CONFIG) {
    const identity = buildRoleDemoIdentity(config, emailDomain);
    const authUserId = await ensureAuthUser(supabase, {
      email: identity.email,
      password: demoPassword,
      fullName: identity.fullName,
      phone: "",
    });

    if (!authUserId) {
      throw new Error(`No auth user id returned for ${identity.email}`);
    }

    const member = await ensureTeamMember(supabase, {
      authUserId,
      email: identity.email,
      username: identity.username,
      fullName: identity.fullName,
      notes: `Role demo user for ${config.label}`,
      isSuperuser: Boolean(config.isSuperuser),
    });

    const roleId = config.roleKey ? roleIdByKey.get(normalizeRoleKey(config.roleKey)) : null;
    await setRoleAssignment(supabase, {
      memberId: member.id,
      roleId,
      isRoleAdmin: Boolean(config.isRoleAdmin),
    });

    results.push({
      role: config.label,
      roleKey: config.roleKey || "(none)",
      email: identity.email,
      username: identity.username,
      password: demoPassword,
      dashboardUrl: `${appBaseUrl}${config.dashboardPath}`,
      memberAccessUrl: `${appBaseUrl}/member-access`,
      adminLoginUrl: `${appBaseUrl}/admin/login`,
    });
  }

  console.log("");
  console.log("Demo role users are ready:");
  for (const item of results) {
    console.log(`- ${item.role} [${item.roleKey}]`);
    console.log(`  email: ${item.email}`);
    console.log(`  username: ${item.username}`);
    console.log(`  password: ${item.password}`);
    console.log(`  member login: ${item.memberAccessUrl}`);
    console.log(`  dashboard: ${item.dashboardUrl}`);
    if (item.roleKey === "pastor" || item.roleKey === "superuser") {
      console.log(`  admin login upgrade path: ${item.adminLoginUrl}`);
    }
  }
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("seed-role-demo-users failed:");
  console.error(error?.message || error);
  console.error("");
  process.exit(1);
});
