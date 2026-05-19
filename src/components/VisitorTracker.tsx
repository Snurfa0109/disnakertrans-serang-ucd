"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Paths that should NEVER be tracked
const EXCLUDED_PREFIXES = ["/admin", "/api", "/_next"];
const EXCLUDED_EXTENSIONS = [".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".css", ".js", ".woff", ".woff2", ".webp"];

function isTrackablePath(path: string): boolean {
    // Exclude admin, API, and system routes
    if (EXCLUDED_PREFIXES.some(p => path.startsWith(p))) return false;
    // Exclude static assets
    if (EXCLUDED_EXTENSIONS.some(ext => path.endsWith(ext))) return false;
    return true;
}

function getSessionId(): string {
    // Session ID — unique per browser tab session (cleared when tab closes)
    let sid = sessionStorage.getItem("sid");
    if (!sid) {
        sid = "s_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("sid", sid);
    }
    return sid;
}

function getVisitorId(): string {
    // Persistent visitor ID across sessions (for unique visitor tracking)
    let vid = localStorage.getItem("vid");
    if (!vid) {
        vid = "v_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem("vid", vid);
    }
    return vid;
}

function parseUserAgent() {
    const ua = navigator.userAgent;

    let device = "Desktop";
    if (/Mobi|Android/i.test(ua)) device = "Mobile";
    else if (/Tablet|iPad/i.test(ua)) device = "Tablet";

    let browser = "Other";
    if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/")) browser = "Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Opera") || ua.includes("OPR/")) browser = "Opera";

    let os = "Other";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

    return { device, browser, os };
}

function getReferrerSource(): string {
    const ref = document.referrer;
    if (!ref) return "Direct";
    try {
        const url = new URL(ref);
        const host = url.hostname.toLowerCase();
        if (host.includes("google")) return "Google Search";
        if (host.includes("facebook") || host.includes("instagram") || host.includes("twitter") || host.includes("tiktok") || host.includes("threads")) return "Social Media";
        if (host.includes("whatsapp") || host.includes("wa.me")) return "WhatsApp";
        if (host === window.location.hostname) return "Internal";
        return "Referral";
    } catch {
        return "Other";
    }
}

export default function VisitorTracker() {
    const pathname = usePathname();
    const trackedPages = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Only track public frontend pages
        if (!isTrackablePath(pathname)) return;

        // Prevent duplicate tracking for same page in same session (refresh/reload)
        const dedupKey = `${getSessionId()}_${pathname}`;
        if (trackedPages.current.has(dedupKey)) return;
        trackedPages.current.add(dedupKey);

        const timer = setTimeout(() => {
            try {
                const sessionId = getSessionId();
                const visitorId = getVisitorId();
                const { device, browser, os } = parseUserAgent();
                const referrer = getReferrerSource();

                fetch("/api/visitors", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: sessionId,
                        visitor_id: visitorId,
                        device,
                        browser,
                        os,
                        page_path: pathname,
                        referrer,
                    }),
                }).catch(() => {});
            } catch {
                // Silent fail
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
