export const SOCIAL_LINK_TYPES = ['Email', 'LinkedIn', 'Telegram', 'GitHub', 'Link'];
export function normalizeSocialLinkLabel(value) {
    return SOCIAL_LINK_TYPES.includes(value) ? value : 'Link';
}
export function normalizeSocialLink(link) {
    const label = normalizeSocialLinkLabel(link.label);
    return {
        ...link,
        label,
        url: label === 'Email' ? stripMailto(link.url) : link.url.trim(),
    };
}
export function buildSocialLinkHref(link) {
    const url = link.url.trim();
    const label = normalizeSocialLinkLabel(link.label);
    if (!url)
        return '';
    if (label === 'Email' && !/^[a-z]+:/i.test(url)) {
        return `mailto:${url}`;
    }
    if (!/^[a-z]+:/i.test(url)) {
        return `https://${url}`;
    }
    return url;
}
export function getSocialLinkDisplayText(link, resolveLabel) {
    const label = normalizeSocialLinkLabel(link.label);
    const url = link.url.trim();
    if (!url && label === 'Link') {
        return '';
    }
    if (label === 'Email') {
        return stripMailto(url);
    }
    if (label === 'Link') {
        return url;
    }
    return resolveLabel ? resolveLabel(label) : label;
}
function stripMailto(value) {
    return value.trim().replace(/^mailto:/i, '');
}
