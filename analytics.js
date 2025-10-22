/**
 * PixelProdigy Analytics - Lightweight Privacy-First Tracking
 * Eugene Ousos <eugeneousxr2025@outlook.com>
 */

(function() {
    'use strict';
    
    const ANALYTICS_KEY = 'pp_analytics';
    const SESSION_KEY = 'pp_session';
    
    // Generate session ID
    function generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get or create session
    function getSession() {
        let session = sessionStorage.getItem(SESSION_KEY);
        if (!session) {
            session = generateSessionId();
            sessionStorage.setItem(SESSION_KEY, session);
        }
        return session;
    }
    
    // Get analytics data
    function getAnalytics() {
        const data = localStorage.getItem(ANALYTICS_KEY);
        return data ? JSON.parse(data) : {
            pageviews: [],
            events: [],
            sessions: []
        };
    }
    
    // Save analytics data
    function saveAnalytics(data) {
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    }
    
    // Track pageview
    function trackPageview(page) {
        const analytics = getAnalytics();
        const session = getSession();
        
        analytics.pageviews.push({
            page: page || window.location.pathname,
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            session: session,
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        });
        
        // Keep last 1000 pageviews
        if (analytics.pageviews.length > 1000) {
            analytics.pageviews = analytics.pageviews.slice(-1000);
        }
        
        saveAnalytics(analytics);
        console.log('[Analytics] Pageview tracked:', page || window.location.pathname);
    }
    
    // Track event
    function trackEvent(eventName, eventData = {}) {
        const analytics = getAnalytics();
        const session = getSession();
        
        analytics.events.push({
            name: eventName,
            data: eventData,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            session: session
        });
        
        // Keep last 5000 events
        if (analytics.events.length > 5000) {
            analytics.events = analytics.events.slice(-5000);
        }
        
        saveAnalytics(analytics);
        console.log('[Analytics] Event tracked:', eventName, eventData);
    }
    
    // Track session start
    function trackSessionStart() {
        const analytics = getAnalytics();
        const session = getSession();
        
        // Check if session already exists
        const existingSession = analytics.sessions.find(s => s.id === session);
        if (!existingSession) {
            analytics.sessions.push({
                id: session,
                startTime: new Date().toISOString(),
                startPage: window.location.pathname,
                userAgent: navigator.userAgent
            });
            
            // Keep last 100 sessions
            if (analytics.sessions.length > 100) {
                analytics.sessions = analytics.sessions.slice(-100);
            }
            
            saveAnalytics(analytics);
            console.log('[Analytics] Session started:', session);
        }
    }
    
    // Get analytics summary
    function getAnalyticsSummary() {
        const analytics = getAnalytics();
        
        // Count unique pages
        const uniquePages = new Set(analytics.pageviews.map(p => p.page));
        
        // Count unique sessions
        const uniqueSessions = new Set(analytics.pageviews.map(p => p.session));
        
        // Count events by type
        const eventCounts = {};
        analytics.events.forEach(e => {
            eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
        });
        
        return {
            totalPageviews: analytics.pageviews.length,
            uniquePages: uniquePages.size,
            totalSessions: uniqueSessions.size,
            totalEvents: analytics.events.length,
            eventCounts: eventCounts,
            lastPageview: analytics.pageviews[analytics.pageviews.length - 1],
            lastEvent: analytics.events[analytics.events.length - 1]
        };
    }
    
    // Export analytics data
    function exportAnalytics() {
        const analytics = getAnalytics();
        const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixelprodigy-analytics-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Initialize analytics
    function init() {
        trackSessionStart();
        trackPageview();
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                trackEvent('page_visible');
            } else {
                trackEvent('page_hidden');
            }
        });
        
        // Track time on page (every 30 seconds)
        let timeOnPage = 0;
        setInterval(() => {
            if (!document.hidden) {
                timeOnPage += 30;
                trackEvent('time_on_page', { seconds: timeOnPage });
            }
        }, 30000);
        
        console.log('[Analytics] Initialized - Privacy-first tracking active');
    }
    
    // Public API
    window.PixelProdigyAnalytics = {
        track: trackEvent,
        trackPageview: trackPageview,
        getSummary: getAnalyticsSummary,
        export: exportAnalytics,
        getSession: getSession
    };
    
    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
