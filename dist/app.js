class Router {
    constructor() {
        this.basePath = this.detectBasePath();
        this.currentPage = null;
        this.init();
    }

    detectBasePath() {
        const path = window.location.pathname;
        return path.startsWith('/dev') ? '/dev' : '';
    }

    init() {
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    setupEventListeners() {
        // Navigation links
        document.querySelectorAll('nav a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigate(page);
            });
        });

        // Evidence form submission
        document.getElementById('evidence-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const evidenceLink = document.getElementById('evidence-input').value;
            this.navigate('submit', { evidenceLink });
        });

        // Submission form submission
        document.getElementById('submission-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmissionSubmit();
        });

        // Browser back/forward
        window.addEventListener('popstate', () => {
            this.handleInitialRoute();
        });
    }

    handleInitialRoute() {
        const path = window.location.pathname;
        const cleanPath = path.replace(this.basePath, '') || '/';

        if (cleanPath === '/submit') {
            this.showPage('submit');
        } else if (cleanPath === '/archive') {
            this.showPage('archive');
        } else if (cleanPath === '/') {
            this.showPage('home');
        } else {
            this.showPage('404');
        }
    }

    navigate(page, data = {}) {
        const url = this.basePath + (page === 'home' ? '/' : `/${page}`);
        window.history.pushState({ page, data }, '', url);
        this.showPage(page, data);
    }

    showPage(page, data = {}) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show current page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }

        // Update navigation (don't highlight nav for 404)
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`nav a[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Handle page-specific data
        if (page === 'submit' && data.evidenceLink) {
            document.getElementById('evidence-link').value = data.evidenceLink;
        }

        this.currentPage = page;
    }

    handleSubmissionSubmit() {
        const form = document.getElementById('submission-form');
        const formData = new FormData(form);

        // Convert form data to object
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Handle checkbox tags
        const tagCheckboxes = document.querySelectorAll('input[name="tags"]:checked');
        const selectedTags = Array.from(tagCheckboxes).map(checkbox => checkbox.value);
        data.tags = selectedTags;

        // In a real application, this would send data to a server
        console.log('Evidence submission:', data);
        alert('Thank you for your submission! Your evidence has been recorded and will be reviewed.');

        // Navigate back to home
        this.navigate('home');
    }

    updateLinks() {
        document.querySelectorAll('nav a[data-page]').forEach(link => {
            const page = link.getAttribute('data-page');
            const href = this.basePath + (page === 'home' ? '/' : `/${page}`);
            link.setAttribute('href', href);
        });
    }

    getResourcePath(resourcePath) {
        // Remove leading slash if present
        const cleanPath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
        return this.basePath + '/' + cleanPath;
    }
}

// Initialize the router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make router global for 404 page buttons
    window.router = new Router();
    router.updateLinks();

    // Update resource links to handle /dev vs / paths
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
            link.setAttribute('href', router.getResourcePath(href));
        }
    });

    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
            script.setAttribute('src', router.getResourcePath(src));
        }
    });
});
