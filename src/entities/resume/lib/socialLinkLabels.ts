import {
  SOCIAL_LINK_TYPES,
  normalizeSocialLinkLabel,
  type SocialLinkType,
} from "@/utils/socialLinks";

const KEY_BY_TYPE: Record<SocialLinkType, string> = {
  Email: "form.linkTypeEmail",
  LinkedIn: "form.linkTypeLinkedIn",
  Telegram: "form.linkTypeTelegram",
  GitHub: "form.linkTypeGitHub",
  Link: "form.linkTypeOther",
};

export function socialLinkLabel(
  value: string,
  t: (key: string) => string,
): string {
  return t(KEY_BY_TYPE[normalizeSocialLinkLabel(value)]);
}

export function socialLinkOptions(t: (key: string) => string) {
  return SOCIAL_LINK_TYPES.map((value) => ({
    value,
    label: socialLinkLabel(value, t),
  }));
}
