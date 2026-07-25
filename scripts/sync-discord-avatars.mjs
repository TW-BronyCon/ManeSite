import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Attempt to load .env if present
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const val = valueParts
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key && val && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

// Fetch with timeout helper
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

const crewPath = path.join(rootDir, "app", "content", "crew.json");
const generatedCrewPath = path.join(
  rootDir,
  "app",
  "content",
  ".generated-crew.json",
);
const avatarsDir = path.join(rootDir, "public", "img", "avatar", "discord");

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(crewPath)) {
  console.error(`${crewPath} does not exist.`);
  process.exit(1);
}

// Always read fresh source configuration from crew.json
const rawCrew = fs.readFileSync(crewPath, "utf-8");
const crewGroups = JSON.parse(rawCrew);

if (!BOT_TOKEN) {
  console.warn("DISCORD_BOT_TOKEN is not set.");
  console.warn(
    "To sync Discord avatars and usernames, set DISCORD_BOT_TOKEN in your environment or .env file.\n",
  );

  // Populate fallback name from nameHint if BOT_TOKEN is missing
  for (const group of crewGroups) {
    if (group.members && Array.isArray(group.members)) {
      for (const m of group.members) {
        if (!m.name && m.nameHint) {
          m.name = m.nameHint;
        }
      }
    }
  }

  // Always overwrite .generated-crew.json from fresh source
  fs.writeFileSync(
    generatedCrewPath,
    JSON.stringify(crewGroups, null, 2) + "\n",
  );
  process.exit(0);
}

// Step 1: Process groups and merge role-based dynamic members if roleId is set
if (BOT_TOKEN && GUILD_ID) {
  for (const group of crewGroups) {
    const roleId =
      group.roleId ||
      (group.groupName?.zh === "現場志工"
        ? process.env.DISCORD_VOLUNTEER_ROLE_ID
        : null);
    group.members = group.members || [];

    if (roleId && String(roleId).trim() !== "") {
      const cleanRoleId = String(roleId).trim();
      console.log(
        `Fetching members for role ID ${cleanRoleId} (${group.groupName?.zh || "Group"})...`,
      );
      try {
        const rRes = await fetchWithTimeout(
          `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`,
          {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
              "User-Agent": "DiscordBot (https://twbronycon.org, 1.0.0)",
            },
          },
        );

        if (rRes.ok) {
          const allGuildMembers = await rRes.json();
          const roleMembers = allGuildMembers.filter(
            (m) => m.roles && m.roles.includes(cleanRoleId),
          );
          if (roleMembers.length > 0) {
            console.log(
              `Found ${roleMembers.length} member(s) with role ID ${cleanRoleId}`,
            );

            const finalMembers = [...group.members];
            const existingDiscordIds = new Set(
              group.members
                .filter((m) => m.discordId)
                .map((m) => String(m.discordId).trim()),
            );

            for (const rm of roleMembers) {
              const dId = rm.user.id;
              const defaultName =
                rm.nick || rm.user?.global_name || rm.user?.username;

              if (existingDiscordIds.has(dId)) {
                const item = finalMembers.find(
                  (m) => String(m.discordId).trim() === dId,
                );
                if (item && !item.name) {
                  item.name = defaultName;
                }
              } else {
                finalMembers.push({
                  name: defaultName,
                  discordId: dId,
                });
                existingDiscordIds.add(dId);
              }
            }

            group.members = finalMembers;
          }
        } else {
          console.warn(
            `Failed to fetch guild members list for role ${cleanRoleId}: HTTP ${rRes.status}`,
          );
        }
      } catch (err) {
        console.warn(
          `Error fetching role members for ${cleanRoleId}:`,
          err.message,
        );
      }
    }
  }
}

let updatedCount = 0;
const activeDiscordIds = new Set();

// Step 2: Download avatars and update names/paths in compiled output
for (const group of crewGroups) {
  if (!group.members || !Array.isArray(group.members)) continue;

  for (const member of group.members) {
    if (!member.discordId) continue;

    const discordId = String(member.discordId).trim();
    if (!discordId) continue;

    activeDiscordIds.add(discordId);

    // Check for explicit custom avatar overrides
    if (
      member.override ||
      (member.avatar && !member.avatar.startsWith("/img/avatar/discord/"))
    ) {
      console.log(
        `Skipping Discord avatar download for ${member.name || member.nameHint || discordId} (custom avatar override)`,
      );
      continue;
    }

    const displayNameHint = member.nameHint || member.name || discordId;
    console.log(`Fetching profile for ${displayNameHint} (${discordId})...`);

    try {
      let discordName = member.name;
      let avatarUrl = "";

      // Option 1: Try fetching guild member if GUILD_ID is provided (gets per-guild nickname & per-guild Nitro avatar)
      if (GUILD_ID) {
        try {
          const gRes = await fetchWithTimeout(
            `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`,
            {
              headers: {
                Authorization: `Bot ${BOT_TOKEN}`,
                "User-Agent": "DiscordBot (https://twbronycon.org, 1.0.0)",
              },
            },
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            discordName =
              discordName ||
              gData.nick ||
              gData.user?.global_name ||
              gData.user?.username;

            // Prioritize Guild Avatar (per-server avatar, e.g. for Nitro users)
            if (gData.avatar) {
              const fileExt = gData.avatar.startsWith("a_") ? "gif" : "png";
              avatarUrl = `https://cdn.discordapp.com/guilds/${GUILD_ID}/users/${discordId}/avatars/${gData.avatar}.${fileExt}?size=256`;
            } else if (gData.user?.avatar) {
              const fileExt = gData.user.avatar.startsWith("a_")
                ? "gif"
                : "png";
              avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${gData.user.avatar}.${fileExt}?size=256`;
            }
          } else {
            console.warn(
              `Guild member fetch for ${discordId} returned HTTP ${gRes.status} (${gRes.statusText}). Falling back to global user profile...`,
            );
          }
        } catch (e) {
          console.warn(
            `Guild member fetch failed for ${discordId}, falling back to user endpoint.`,
            e.message,
          );
        }
      }

      // Option 2: Fallback to global user endpoint
      if (!avatarUrl || !discordName) {
        const uRes = await fetchWithTimeout(
          `https://discord.com/api/v10/users/${discordId}`,
          {
            headers: {
              Authorization: `Bot ${BOT_TOKEN}`,
              "User-Agent": "DiscordBot (https://twbronycon.org, 1.0.0)",
            },
          },
        );

        if (!uRes.ok) {
          console.error(
            `Failed to fetch global user ${discordId}: HTTP ${uRes.status} ${uRes.statusText}`,
          );
          member.name = member.name || member.nameHint;
          continue;
        }

        const uData = await uRes.json();
        discordName = discordName || uData.global_name || uData.username;

        if (uData.avatar) {
          const fileExt = uData.avatar.startsWith("a_") ? "gif" : "png";
          avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${uData.avatar}.${fileExt}?size=256`;
        } else {
          const defaultIdx = Number((BigInt(discordId) >> 22n) % 6n);
          avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
        }
      }

      if (discordName && !member.nameOverride) {
        member.name = discordName;
      } else if (!member.name && member.nameHint) {
        member.name = member.nameHint;
      }

      // Download avatar image
      const imgRes = await fetchWithTimeout(avatarUrl);
      if (imgRes.ok) {
        const urlPath = new URL(avatarUrl).pathname;
        const fileExt = urlPath.endsWith(".gif") ? "gif" : "png";
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const fileName = `${discordId}.${fileExt}`;
        const filePath = path.join(avatarsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        member.avatar = `/img/avatar/discord/${fileName}`;
        updatedCount++;
        console.log(
          `Saved ${member.name}'s info & avatar to /img/avatar/discord/${fileName}`,
        );
      } else {
        console.error(`Failed to download avatar image from ${avatarUrl}`);
      }
    } catch (err) {
      console.error(
        `Error processing ${displayNameHint} (${discordId}):`,
        err.message,
      );
    }
  }
}

// Step 3: Clean up stale avatar files not in active members set
try {
  const existingFiles = fs.readdirSync(avatarsDir);
  for (const file of existingFiles) {
    const ext = path.extname(file);
    if (ext === ".png" || ext === ".gif" || ext === ".webp") {
      const fileDiscordId = path.basename(file, ext);
      if (!activeDiscordIds.has(fileDiscordId)) {
        console.log(
          `🧹 Pruned stale avatar image: /img/avatar/discord/${file}`,
        );
        fs.unlinkSync(path.join(avatarsDir, file));
      }
    }
  }
} catch (e) {
  // Ignore cleanup errors
}

// Always overwrite .generated-crew.json with fresh compiled output
fs.writeFileSync(generatedCrewPath, JSON.stringify(crewGroups, null, 2) + "\n");
console.log(
  `\nFresh compiled crew data written to app/content/.generated-crew.json (${updatedCount} avatar(s) processed).`,
);
