<script setup lang="ts">
import { ref, computed } from "vue";

const { t } = useI18n();
const route = useRoute();
const siteUrl = "https://twbronycon.org";
const contactEmail = "twbronycon2@gmail.com";

definePageMeta({
  underDevelopment: false,
});

const socialLinks = [
  {
    name: "YouTube",
    icon: "fa-brands fa-youtube",
    url: "https://www.youtube.com/@TWBronyCon2",
    class: "youtube",
  },
  {
    name: "Discord",
    icon: "fa-brands fa-discord",
    url: "https://discord.gg/k83NMPUKxG",
    class: "discord",
  },
  {
    name: "Facebook",
    icon: "fa-brands fa-facebook",
    url: "https://www.facebook.com/profile.php?id=61583292256078",
    class: "facebook",
  },
  {
    name: "X (Twitter)",
    icon: "fa-brands fa-x-twitter",
    url: "https://x.com/TWBronycon2",
    class: "twitter",
  },
  {
    name: "Instagram",
    icon: "fa-brands fa-instagram",
    url: "https://www.instagram.com/taiwanbronycon2",
    class: "instagram",
  },
];

interface InquiryCategory {
  key: string;
  tag: string;
  icon: string;
}

const inquiryCategories: InquiryCategory[] = [
  {
    key: "general",
    tag: "[TWBC - General]",
    icon: "fa-regular fa-comment-dots",
  },
  { key: "vendor", tag: "[TWBC - Vendor]", icon: "fa-solid fa-store" },
  {
    key: "volunteer",
    tag: "[TWBC - Staff]",
    icon: "fa-solid fa-hands-holding-child",
  },
  { key: "media", tag: "[TWBC - Media]", icon: "fa-solid fa-newspaper" },
  { key: "other", tag: "[TWBC - Other]", icon: "fa-solid fa-paper-plane" },
];

const selectedCategory = ref<InquiryCategory>(inquiryCategories[0]!);
const isCopied = ref(false);

const selectCategory = (category: InquiryCategory) => {
  selectedCategory.value = category;
};

const mailtoUrl = computed(() => {
  const subject = encodeURIComponent(selectedCategory.value.tag + " ");
  return `mailto:${contactEmail}?subject=${subject}`;
});

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(contactEmail);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (e) {
    console.error("Failed to copy email:", e);
  }
};

useSeoMeta({
  title: () => t("contactPage.title"),
  ogTitle: () => t("contactPage.title"),
  twitterTitle: () => t("contactPage.title"),
  description: () => t("contactPage.subtitle"),
  ogDescription: () => t("contactPage.subtitle"),
  twitterDescription: () => t("contactPage.subtitle"),
  ogImage: `${siteUrl}/img/text-logo.avif`,
  twitterImage: `${siteUrl}/img/text-logo.avif`,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("contactPage.title") }}</h1>
      <p>{{ t("contactPage.subtitle") }}</p>
    </template>

    <template #surface>
      <div class="contact-grid">
        <!-- Social Info Column -->
        <div class="social-info-col">
          <div class="info-card">
            <h3>{{ t("contactPage.socialTitle") }}</h3>
            <p>{{ t("contactPage.socialDesc") }}</p>

            <div class="social-list">
              <a
                v-for="link in socialLinks"
                :key="link.name"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                :class="['social-btn', link.class]"
              >
                <i :class="link.icon"></i>
                <span>{{ link.name }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Direct Email Card Column -->
        <div class="email-col">
          <div class="email-card">
            <h3>{{ t("contactPage.emailTitle") }}</h3>
            <p class="email-desc">{{ t("contactPage.emailDesc") }}</p>

            <!-- Main Email Address Display Box -->
            <div class="email-display-box">
              <div class="email-address-wrapper">
                <i class="fa-solid fa-envelope email-icon"></i>
                <div class="email-text-group">
                  <span class="email-label">{{
                    t("contactPage.officialEmail")
                  }}</span>
                  <a :href="mailtoUrl" class="email-address">{{
                    contactEmail
                  }}</a>
                </div>
              </div>

              <div class="email-actions">
                <button
                  type="button"
                  class="action-btn copy-btn"
                  @click="copyEmail"
                >
                  <i
                    :class="
                      isCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'
                    "
                  ></i>
                  <span>{{
                    isCopied
                      ? t("contactPage.emailCopied")
                      : t("contactPage.copyEmail")
                  }}</span>
                </button>

                <a
                  :href="mailtoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="action-btn send-btn"
                >
                  <i class="fa-solid fa-paper-plane"></i>
                  <span>{{ t("contactPage.sendMail") }}</span>
                </a>
              </div>
            </div>

            <!-- Subject Recommendation & Helper -->
            <div class="topics-section">
              <h4>{{ t("contactPage.inquiryTopicsTitle") }}</h4>
              <p class="topics-desc">
                {{ t("contactPage.inquiryTopicsDesc") }}
              </p>

              <div class="category-pills">
                <button
                  v-for="cat in inquiryCategories"
                  :key="cat.key"
                  type="button"
                  :class="[
                    'category-pill',
                    { active: selectedCategory.key === cat.key },
                  ]"
                  @click="selectCategory(cat)"
                >
                  <i :class="cat.icon"></i>
                  <span>{{ t(`contactPage.categories.${cat.key}`) }}</span>
                </button>
              </div>

              <div class="subject-preview">
                <span class="preview-label">Prefilled Subject:</span>
                <code class="preview-code">{{ selectedCategory.tag }} ...</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2.5rem;
  align-items: stretch;
}

@media (max-width: 850px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

.social-info-col,
.email-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-card,
.email-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 1.8rem;
  background: rgba(20, 10, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}

.info-card h3,
.email-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  color: var(--color-gold);
}

.info-card p,
.email-desc {
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

.social-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  justify-content: space-between;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateX(4px);
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.social-btn i {
  font-size: 1.3rem;
}

/* Email Display Box */
.email-display-box {
  background: rgba(10, 5, 15, 0.6);
  border: 1px solid rgba(226, 184, 102, 0.25);
  border-radius: 0.8rem;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.8rem;
}

.email-address-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.email-icon {
  font-size: 1.6rem;
  color: var(--color-gold);
  background: rgba(226, 184, 102, 0.1);
  padding: 0.8rem;
  border-radius: 50%;
}

.email-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.email-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.email-address {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.25s ease;
}

.email-address:hover {
  color: var(--color-gold);
}

.email-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: #ffffff;
}

.send-btn {
  background: var(--color-gold);
  border: none;
  color: #140a1e;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(226, 184, 102, 0.35);
}

/* Topics Section */
.topics-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: auto;
}

.topics-section h4 {
  margin: 0;
  font-size: 1rem;
  color: #ffffff;
}

.topics-desc {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.7);
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-pill:hover {
  border-color: rgba(226, 184, 102, 0.5);
  color: #ffffff;
}

.category-pill.active {
  background: rgba(226, 184, 102, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
  font-weight: 600;
}

.subject-preview {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 0.5rem;
  font-size: 0.82rem;
  margin-top: 0.4rem;
}

.preview-label {
  color: rgba(255, 255, 255, 0.5);
}

.preview-code {
  color: var(--color-gold);
  font-family: monospace;
}
</style>
