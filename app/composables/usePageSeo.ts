import { toValue, type MaybeRefOrGetter } from "vue";
import { SITE_ORIGIN } from "~/utils/site";

export function usePageSeo(options: {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  image?: MaybeRefOrGetter<string>;
  originalImageSize?: boolean;
}): void {
  const route = useRoute();
  const title = () => toValue(options.title);
  const description = () => toValue(options.description);
  const image = () =>
    options.image === undefined
      ? `${SITE_ORIGIN}/img/text-logo.avif`
      : toValue(options.image);

  useSeoMeta({
    title,
    ogTitle: title,
    twitterTitle: title,
    description,
    ogDescription: description,
    twitterDescription: description,
    ogImage: image,
    twitterImage: image,
    ogUrl: () => `${SITE_ORIGIN}${route.path}`,
    ...(options.originalImageSize
      ? { ogImageWidth: null, ogImageHeight: null }
      : {}),
  });
}
