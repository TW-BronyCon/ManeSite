<script setup lang="ts">
import { computed } from "vue";
import crewData from "~/content/crew.json";
import generatedCrew from "~/content/.generated-crew.json";

const { t, locale } = useI18n();
const isEn = computed(() => locale.value.startsWith("en"));
const route = useRoute();
const siteUrl = "https://twbronycon.org";

definePageMeta({
  underDevelopment: false,
});

interface CrewMember {
  name?: string;
  nameHint?: string;
  discordId?: string;
  avatar?: string;
}

interface CrewGroup {
  groupName: {
    zh: string;
    en: string;
  };
  roleId?: string;
  members: CrewMember[];
}

const crewGroups = computed<CrewGroup[]>(() => {
  return (
    (generatedCrew as unknown as CrewGroup[]) ||
    (crewData as unknown as CrewGroup[]) ||
    []
  );
});

function getAvatarUrl(member: CrewMember): string {
  if (member.avatar && member.avatar.trim() !== "") {
    return member.avatar;
  }
  return "/img/default-avatar.avif";
}

useSeoMeta({
  title: () => t("crewPage.title"),
  ogTitle: () => t("crewPage.title"),
  twitterTitle: () => t("crewPage.title"),
  description: () => t("crewPage.intro"),
  ogDescription: () => t("crewPage.intro"),
  twitterDescription: () => t("crewPage.intro"),
  ogImage: `${siteUrl}/img/text-logo.avif`,
  twitterImage: `${siteUrl}/img/text-logo.avif`,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("crewPage.title") }}</h1>
      <p>{{ t("crewPage.subtitle") }}</p>
    </template>

    <template #surface>
      <div class="crew-wrapper">
        <!-- Intro Hero Card -->
        <div class="crew-intro-banner">
          <div class="banner-sparkle left"></div>
          <p>{{ t("crewPage.intro") }}</p>
          <div class="banner-sparkle right">
            <i class="fa-solid fa-sparkles"></i>
          </div>
        </div>

        <!-- Department Groups -->
        <div class="crew-departments">
          <section
            v-for="(group, idx) in crewGroups"
            :key="idx"
            class="department-group"
          >
            <div class="department-header">
              <div class="header-tag">
                <h2>
                  {{
                    group.groupName[isEn ? "en" : "zh"] || group.groupName.zh
                  }}
                </h2>
              </div>
              <div class="header-line"></div>
            </div>

            <!-- Members Cards Grid -->
            <div class="members-grid">
              <div
                v-for="(member, mIdx) in group.members"
                :key="mIdx"
                class="crew-member-card"
              >
                <div class="avatar-halo">
                  <img
                    :src="getAvatarUrl(member)"
                    :alt="
                      member.name ||
                      member.nameHint ||
                      member.discordId ||
                      t('crewPage.memberAlt')
                    "
                    class="avatar-image"
                    loading="lazy"
                  />
                </div>

                <div class="member-info">
                  <span class="member-name">{{
                    member.name || member.nameHint || member.discordId
                  }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
.crew-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.crew-intro-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.8rem 2.2rem;
  background: radial-gradient(
    ellipse at top,
    rgba(72, 38, 82, 0.5) 0%,
    rgba(20, 10, 30, 0.65) 100%
  );
  border: 1px solid rgba(226, 184, 102, 0.2);
  border-radius: 1.2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.crew-intro-banner p {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.95);
  max-width: 900px;
}

.banner-sparkle {
  font-size: 1.4rem;
  color: var(--color-gold);
  opacity: 0.7;
}

.banner-sparkle.left {
  margin-right: 1.2rem;
}

.banner-sparkle.right {
  margin-left: 1.2rem;
}

@media (max-width: 700px) {
  .banner-sparkle {
    display: none;
  }
}

.crew-departments {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.department-group {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.department-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.header-tag {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 1.2rem;
}

.header-tag .icon {
  font-size: 1.1rem;
  color: var(--color-gold);
}

.header-tag h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.03em;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(226, 184, 102, 0.3) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.8rem 1.5rem;
}

@media (max-width: 600px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 1.4rem 1rem;
  }

  .avatar-halo,
  .avatar-image {
    width: 75px;
    height: 75px;
  }
}

.crew-member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.4rem 1rem 1.2rem;
  background: rgba(25, 12, 35, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.2rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.crew-member-card:hover {
  transform: translateY(-6px);
  background: radial-gradient(
    circle at top,
    rgba(72, 38, 82, 0.5) 0%,
    rgba(25, 12, 35, 0.65) 100%
  );
  border-color: rgba(226, 184, 102, 0.35);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 15px rgba(226, 184, 102, 0.15);
}

.avatar-halo {
  position: relative;
  width: 90px;
  height: 90px;
  margin-bottom: 0.9rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crew-member-card:hover .avatar-ring {
  transform: scale(1.06);
  box-shadow:
    0 6px 22px rgba(226, 184, 102, 0.45),
    0 0 20px rgba(255, 130, 178, 0.35);
}

.avatar-image {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  background: #140a1e;
  display: block;
}

.member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.member-name {
  font-size: 0.96rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.35;
  word-break: break-word;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
</style>
