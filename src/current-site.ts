import { sites } from '@/const';

export const currentSite = sites.find((site) => {
    return site.hostname === window.location.hostname && (site.basePath ? window.location.pathname.startsWith(site.basePath) : true);
}) ?? null;
