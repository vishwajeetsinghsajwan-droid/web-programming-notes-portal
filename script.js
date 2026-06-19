/* ============================================================
   WEB PROGRAMMING NOTES PORTAL — MAIN SCRIPT
   ============================================================ */

(() => {
    'use strict';

    /* ------------------------------------------------------------------
       SUPABASE CONFIGURATION
       ----------------------------------------------------------------
       ★ ADMIN NOTE: Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY'
         with your actual Supabase credentials to enable serverless cloud
         database and notes storage.
       ---------------------------------------------------------------- */
    const SUPABASE_URL = 'https://kkdyznscdhqoazutvwfe.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZHl6bnNjZGhxb2F6dXR2d2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODQ5OTksImV4cCI6MjA5NzQ2MDk5OX0.-wHhxCBFnsHHeSa_2JIgyL-zTqUszs2anFjZpyCaCRU';

    let supabase = null;
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    /* ------------------------------------------------------------------
       MODULE DATA
       ----------------------------------------------------------------
       These local entries act as the default fallback structure if 
       Supabase is not configured yet.
       ---------------------------------------------------------------- */
    const MODULES = [
        {
            id: 1,
            title: 'Module 1 – Introduction to Web Technologies',
            description: 'Overview of the Web, HTTP protocol, client-server architecture, web browsers, and web standards.',
            file: 'pdfs/module1.pdf',
            size: '2.4 MB',
            updated: '2026-06-15',
            color: 'blue',
            icon: 'fa-globe'
        },
        {
            id: 2,
            title: 'Module 2 – HTML5 & CSS3 Fundamentals',
            description: 'Semantic HTML, forms, tables, CSS selectors, box model, Flexbox, Grid, and responsive design.',
            file: 'pdfs/module2.pdf',
            size: '3.1 MB',
            updated: '2026-06-15',
            color: 'violet',
            icon: 'fa-code'
        },
        {
            id: 3,
            title: 'Module 3 – JavaScript & DOM Manipulation',
            description: 'Variables, functions, events, DOM traversal, ES6+ features, and asynchronous programming.',
            file: 'pdfs/module3.pdf',
            size: '3.8 MB',
            updated: '2026-06-15',
            color: 'teal',
            icon: 'fa-laptop-code'
        },
        {
            id: 4,
            title: 'Module 4 – Server-Side Programming',
            description: 'Node.js, Express.js, REST APIs, middleware, routing, and server-side rendering basics.',
            file: 'pdfs/module4.pdf',
            size: '2.9 MB',
            updated: '2026-06-15',
            color: 'orange',
            icon: 'fa-server'
        },
        {
            id: 5,
            title: 'Module 5 – Databases & Full-Stack Integration',
            description: 'SQL & NoSQL databases, CRUD operations, MongoDB, integration with front-end and deployment.',
            file: 'pdfs/module5.pdf',
            size: '3.3 MB',
            updated: '2026-06-15',
            color: 'rose',
            icon: 'fa-database'
        }
    ];

    /* ----------------------------------------------------------------
       DOM REFERENCES
       ---------------------------------------------------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const preloader      = $('#preloader');
    const navbar         = $('#mainNavbar');
    const searchInput    = $('#searchInput');
    const searchClear    = $('#searchClear');
    const clearSearchBtn = $('#clearSearchBtn');
    const modulesGrid    = $('#modulesGrid');
    const noResults      = $('#noResults');
    const scrollTopBtn   = $('#scrollTopBtn');
    const darkToggle     = $('#darkModeToggle');
    const darkToggleMob  = $('#darkModeToggleMobile');
    const pdfModal       = $('#pdfModal');
    const pdfModalLabel  = $('#pdfModalLabel');
    const pdfViewer      = $('#pdfViewer');
    const pdfLoading     = $('#pdfLoading');
    const pdfZoomIn      = $('#pdfZoomIn');
    const pdfZoomOut     = $('#pdfZoomOut');
    const pdfZoomLevel   = $('#pdfZoomLevel');
    const pdfFullscreen  = $('#pdfFullscreen');
    const pdfDownloadBtn = $('#pdfDownloadModal');
    const downloadToast  = $('#downloadToast');
    const toastMessage   = $('#toastMessage');
    const currentYear    = $('#currentYear');

    /* ----------------------------------------------------------------
       HELPERS
       ---------------------------------------------------------------- */
    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const showToast = (msg) => {
        toastMessage.textContent = msg;
        const toast = bootstrap.Toast.getOrCreateInstance(downloadToast, { delay: 3000 });
        toast.show();
    };

    /* ----------------------------------------------------------------
       PRELOADER
       ---------------------------------------------------------------- */
    window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('hidden'), 1800);
    });

    /* ----------------------------------------------------------------
       DARK MODE
       ---------------------------------------------------------------- */
    const THEME_KEY = 'wpnotes-theme';

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
        [darkToggle, darkToggleMob].forEach(btn => {
            if (btn) btn.innerHTML = `<i class="fas ${icon}"></i>`;
        });
        localStorage.setItem(THEME_KEY, theme);
    };

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    };

    // Initialise theme from saved preference or system preference
    (() => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) return applyTheme(saved);
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return applyTheme('dark');
        applyTheme('light');
    })();

    [darkToggle, darkToggleMob].forEach(btn => btn?.addEventListener('click', toggleTheme));

    /* ----------------------------------------------------------------
       NAVBAR SCROLL
       ---------------------------------------------------------------- */
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ----------------------------------------------------------------
       ACTIVE NAV LINK (scroll-spy)
       ---------------------------------------------------------------- */
    const sections = $$('section[id], #home');
    const navLinks = $$('.nav-link[href^="#"]');

    const updateActiveLink = () => {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };
    window.addEventListener('scroll', updateActiveLink, { passive: true });

    /* ----------------------------------------------------------------
       RENDER MODULE CARDS
       ---------------------------------------------------------------- */
    const renderCards = (modules) => {
        if (modules.length === 0) {
            modulesGrid.innerHTML = '';
            noResults.classList.remove('d-none');
            return;
        }
        noResults.classList.add('d-none');
        modulesGrid.innerHTML = modules.map((m, i) => `
            <div class="col-sm-6 col-lg-4" data-animate="fade-up" data-delay="${i * 80}">
                <div class="module-card" data-color="${m.color}" id="module-card-${m.id}">
                    <div class="card-accent-bar"></div>
                    <div class="card-body-inner">
                        <span class="card-module-badge"><i class="fas ${m.icon}"></i> Module ${m.id}</span>
                        <h3 class="card-title">${m.title}</h3>
                        <p class="card-description">${m.description}</p>
                        <div class="card-meta">
                            <span class="meta-item"><i class="fas fa-file-pdf"></i> ${m.size}</span>
                            <span class="meta-item"><i class="fas fa-clock"></i> ${formatDate(m.updated)}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-preview" onclick="WPNotes.previewPDF(${m.id})" title="View notes in browser">
                                <i class="fas fa-eye"></i> View Notes
                            </button>
                            <button class="btn-download" onclick="WPNotes.downloadPDF(${m.id})" title="Download PDF">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Trigger entrance animations
        requestAnimationFrame(() => triggerAnimations());
    };

    const fetchModules = async () => {
        if (!supabase) {
            renderCards(MODULES);
            return;
        }
        try {
            // Fetch modules details using a standard GET request (avoiding HEAD check)
            const { data, error: selectErr } = await supabase
                .from('modules')
                .select('*')
                .order('id', { ascending: true });
            
            if (selectErr) throw selectErr;

            if (data && data.length > 0) {
                data.forEach(row => {
                    const mod = MODULES.find(m => m.id === row.id);
                    if (mod) {
                        mod.file = row.file_url || mod.file;
                        mod.size = row.size || mod.size;
                        mod.updated = row.updated_at || mod.updated;
                        const ext = mod.file.split('.').pop().toLowerCase();
                        mod.icon = (ext === 'pdf') ? 'fa-file-pdf' : 'fa-file-powerpoint';
                    }
                });
            }
        } catch (e) {
            console.warn('Supabase fetch failed, falling back to local files:', e);
        }
        renderCards(MODULES);
    };

    fetchModules();

    /* ----------------------------------------------------------------
       SEARCH
       ---------------------------------------------------------------- */
    const handleSearch = () => {
        const q = searchInput.value.trim().toLowerCase();
        searchClear.classList.toggle('d-none', q.length === 0);

        if (q.length === 0) return renderCards(MODULES);

        const filtered = MODULES.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            `module ${m.id}`.includes(q)
        );
        renderCards(filtered);
    };

    searchInput.addEventListener('input', handleSearch);
    searchClear.addEventListener('click', () => { searchInput.value = ''; handleSearch(); searchInput.focus(); });
    clearSearchBtn?.addEventListener('click', () => { searchInput.value = ''; handleSearch(); });

    // Quick-search tags
    $$('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.dataset.search;
            handleSearch();
            searchInput.focus();
        });
    });

    /* ----------------------------------------------------------------
       PDF PREVIEW
       ---------------------------------------------------------------- */
    let currentZoom = 100;
    let currentPdfFile = '';

    const previewPDF = (moduleId) => {
        const mod = MODULES.find(m => m.id === moduleId);
        if (!mod) return;

        currentPdfFile = mod.file;
        currentZoom = 100;
        pdfZoomLevel.textContent = '100%';
        pdfViewer.style.transform = 'scale(1)';
        pdfModalLabel.textContent = mod.title;
        pdfLoading.classList.remove('hidden');
        pdfViewer.src = '';

        const ext = mod.file.split('.').pop().toLowerCase();
        const isPdf = ext === 'pdf';

        // Toggle zoom and fullscreen controls for PPTs
        $('#pdfZoomOut').classList.toggle('d-none', !isPdf);
        $('#pdfZoomIn').classList.toggle('d-none', !isPdf);
        $('#pdfZoomLevel').classList.toggle('d-none', !isPdf);
        $('#pdfFullscreen').classList.toggle('d-none', !isPdf);

        const bsModal = new bootstrap.Modal(pdfModal);
        bsModal.show();

        // Small delay so modal renders first
        setTimeout(() => {
            if (isPdf) {
                pdfViewer.src = mod.file;
            } else {
                // It is a PPT/PPTX file
                const currentOrigin = window.location.origin;
                const isLocal = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1') || currentOrigin.startsWith('file://');
                
                if (isLocal) {
                    pdfLoading.classList.add('hidden');
                    pdfViewer.src = ''; // Clear iframe
                    
                    pdfLoading.innerHTML = `
                        <div class="text-center p-4">
                            <i class="fas fa-file-powerpoint text-warning" style="font-size:3.5rem;margin-bottom:1rem;"></i>
                            <h4 class="fw-bold mb-2">PowerPoint Notes (Module ${mod.id})</h4>
                            <p class="text-secondary max-width-500 mx-auto mb-4" style="max-width: 460px;">
                                Browser preview of PowerPoint files is not supported directly on <strong>localhost</strong>, but will load automatically when deployed to GitHub Pages or any live server.
                            </p>
                            <div class="d-flex gap-2 justify-content-center">
                                <button class="btn btn-primary" onclick="WPNotes.downloadPDF(${mod.id})">
                                    <i class="fas fa-download me-1"></i> Download PowerPoint Notes
                                </button>
                                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>`;
                    pdfLoading.classList.remove('hidden');
                } else {
                    // Live deployment, use Microsoft Office Online Viewer
                    const absoluteFileUrl = `${window.location.origin}/${mod.file}`;
                    pdfViewer.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteFileUrl)}`;
                }
            }
        }, 200);

        pdfViewer.onload = () => {
            if (isPdf) pdfLoading.classList.add('hidden');
        };
        pdfViewer.onerror = () => {
            pdfLoading.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--text-muted);margin-bottom:0.5rem;"></i>
                <p>Notes not available yet. Please upload notes first.</p>`;
        };
    };

    // Zoom
    const setZoom = (delta) => {
        currentZoom = Math.min(200, Math.max(50, currentZoom + delta));
        pdfZoomLevel.textContent = `${currentZoom}%`;
        pdfViewer.style.transform = `scale(${currentZoom / 100})`;
        pdfViewer.style.transformOrigin = 'top center';
    };
    pdfZoomIn.addEventListener('click', () => setZoom(10));
    pdfZoomOut.addEventListener('click', () => setZoom(-10));

    // Fullscreen
    pdfFullscreen.addEventListener('click', () => {
        const el = pdfViewer;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    // Download from modal
    pdfDownloadBtn.addEventListener('click', () => {
        if (currentPdfFile) triggerDownload(currentPdfFile);
    });

    // Reset viewer when modal closes
    pdfModal.addEventListener('hidden.bs.modal', () => {
        pdfViewer.src = '';
        pdfLoading.classList.remove('hidden');
        pdfLoading.innerHTML = `
            <div class="spinner-border" role="status"><span class="visually-hidden">Loading…</span></div>
            <p>Loading PDF…</p>`;
    });

    /* ----------------------------------------------------------------
       DOWNLOAD
       ---------------------------------------------------------------- */
    const triggerDownload = (filePath) => {
        const a = document.createElement('a');
        a.href = filePath;
        a.download = filePath.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Download started — ${a.download}`);
    };

    const downloadPDF = (moduleId) => {
        const mod = MODULES.find(m => m.id === moduleId);
        if (!mod) return;
        triggerDownload(mod.file);
    };

    /* ----------------------------------------------------------------
       FOOTER MODULE LINKS
       ---------------------------------------------------------------- */
    $$('[data-module-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = parseInt(link.dataset.moduleLink, 10);
            const card = $(`#module-card-${id}`);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    /* ----------------------------------------------------------------
       FOOTER YEAR
       ---------------------------------------------------------------- */
    if (currentYear) currentYear.textContent = new Date().getFullYear();

    /* ----------------------------------------------------------------
       SCROLL ANIMATIONS
       ---------------------------------------------------------------- */
    const triggerAnimations = () => {
        const els = $$('[data-animate]:not(.animated)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay || 0, 10);
                    setTimeout(() => entry.target.classList.add('animated'), delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        els.forEach(el => observer.observe(el));
    };
    triggerAnimations();

    /* ----------------------------------------------------------------
       COUNTER ANIMATION (Hero Stats)
       ---------------------------------------------------------------- */
    const animateCounters = () => {
        $$('.stat-number[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 1600;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                el.textContent = Math.round(target * eased);
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    };

    // Trigger counters when hero comes into view
    const heroObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    const heroSection = $('#home');
    if (heroSection) heroObs.observe(heroSection);

    /* ----------------------------------------------------------------
       SMOOTH NAV CLOSE ON MOBILE
       ---------------------------------------------------------------- */
    const navCollapse = $('#navbarContent');
    $$('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
            if (navCollapse.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
            }
        });
    });

    /* ----------------------------------------------------------------
       KEYBOARD SHORTCUTS
       ---------------------------------------------------------------- */
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K → Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        // Escape → Clear search if focused
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            handleSearch();
            searchInput.blur();
        }
    });

    /* ----------------------------------------------------------------
       FILE UPLOAD HANDLER
       ---------------------------------------------------------------- */
    const uploadForm            = $('#uploadForm');
    const uploadModuleSelect    = $('#uploadModuleSelect');
    const uploadDropzone        = $('#uploadDropzone');
    const fileInput             = $('#fileInput');
    const selectedFileInfo      = $('#selectedFileInfo');
    const selectedFileName      = $('#selectedFileName');
    const selectedFileSize      = $('#selectedFileSize');
    const btnRemoveFile         = $('#btnRemoveFile');
    const uploadProgressCont    = $('#uploadProgressContainer');
    const uploadProgressBar     = $('#uploadProgressBar');
    const uploadProgressText    = $('#uploadProgressText');
    const uploadProgressPercent = $('#uploadProgressPercent');
    const uploadMessage         = $('#uploadMessage');
    const btnSubmitUpload       = $('#btnSubmitUpload');

    let selectedFile = null;

    if (uploadDropzone && fileInput) {
        // Click dropzone to trigger file browser
        uploadDropzone.addEventListener('click', () => fileInput.click());

        // Drag events
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadDropzone.classList.remove('dragover');
            }, false);
        });

        uploadDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const showUploadMessage = (type, text) => {
        if (uploadMessage) {
            uploadMessage.className = `alert alert-${type} mt-3`;
            uploadMessage.textContent = text;
            uploadMessage.classList.remove('d-none');
        }
    };

    const clearUploadMessage = () => {
        uploadMessage?.classList.add('d-none');
    };

    const handleFileSelect = (file) => {
        const allowedExts = ['pdf', 'ppt', 'pptx'];
        const ext = file.name.split('.').pop().toLowerCase();
        
        clearUploadMessage();

        if (!allowedExts.includes(ext)) {
            showUploadMessage('danger', 'Only PDF, PPT, and PPTX files are supported.');
            resetFileInput();
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            showUploadMessage('danger', 'File size exceeds the 20MB limit.');
            resetFileInput();
            return;
        }

        selectedFile = file;
        if (selectedFileName) selectedFileName.textContent = file.name;
        if (selectedFileSize) selectedFileSize.textContent = formatBytes(file.size);

        // Update icon in preview
        const fileIcon = selectedFileInfo?.querySelector('.file-info-icon i');
        if (fileIcon) {
            if (ext === 'pdf') {
                fileIcon.className = 'fas fa-file-pdf text-danger';
            } else {
                fileIcon.className = 'fas fa-file-powerpoint text-warning';
            }
        }

        uploadDropzone?.classList.add('d-none');
        selectedFileInfo?.classList.remove('d-none');
        checkFormValidity();
    };

    const resetFileInput = () => {
        selectedFile = null;
        if (fileInput) fileInput.value = '';
        uploadDropzone?.classList.remove('d-none');
        selectedFileInfo?.classList.add('d-none');
        checkFormValidity();
    };

    btnRemoveFile?.addEventListener('click', resetFileInput);
    uploadModuleSelect?.addEventListener('change', checkFormValidity);

    function checkFormValidity() {
        if (btnSubmitUpload && uploadModuleSelect) {
            const moduleSelected = uploadModuleSelect.value !== '';
            btnSubmitUpload.disabled = !(moduleSelected && selectedFile);
        }
    }

    uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedFile || !uploadModuleSelect.value) return;

        if (!supabase) {
            showUploadMessage('danger', 'Supabase configuration is missing. Add your project credentials at the top of script.js to activate uploads.');
            return;
        }

        const moduleId = parseInt(uploadModuleSelect.value, 10);
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        
        // Disable form elements
        uploadModuleSelect.disabled = true;
        btnSubmitUpload.disabled = true;
        if (btnRemoveFile) btnRemoveFile.disabled = true;
        clearUploadMessage();

        uploadProgressCont?.classList.remove('d-none');
        if (uploadProgressBar) {
            uploadProgressBar.style.width = '10%';
            uploadProgressBar.setAttribute('aria-valuenow', 10);
        }
        if (uploadProgressPercent) uploadProgressPercent.textContent = '10%';
        if (uploadProgressText) uploadProgressText.textContent = 'Initializing upload process…';

        try {
            // Generate filename based on module and timestamp to prevent caching issues
            const timestamp = Date.now();
            const fileName = `module${moduleId}_${timestamp}.${ext}`;

            if (uploadProgressText) uploadProgressText.textContent = 'Sending file to Supabase Storage…';
            if (uploadProgressBar) {
                uploadProgressBar.style.width = '30%';
                uploadProgressBar.setAttribute('aria-valuenow', 30);
            }
            if (uploadProgressPercent) uploadProgressPercent.textContent = '30%';

            // 1. Upload to Supabase storage bucket 'notes'
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('notes')
                .upload(fileName, selectedFile, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            if (uploadProgressText) uploadProgressText.textContent = 'Retrieving public file link…';
            if (uploadProgressBar) {
                uploadProgressBar.style.width = '60%';
                uploadProgressBar.setAttribute('aria-valuenow', 60);
            }
            if (uploadProgressPercent) uploadProgressPercent.textContent = '60%';

            // 2. Get the public file URL
            const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(fileName);

            if (uploadProgressText) uploadProgressText.textContent = 'Updating database metadata…';
            if (uploadProgressBar) {
                uploadProgressBar.style.width = '80%';
                uploadProgressBar.setAttribute('aria-valuenow', 80);
            }
            if (uploadProgressPercent) uploadProgressPercent.textContent = '80%';

            // 3. Update the database table 'modules'
            const { error: dbError } = await supabase.from('modules').update({
                file_url: publicUrl,
                size: formatBytes(selectedFile.size),
                updated_at: new Date().toISOString().split('T')[0]
            }).eq('id', moduleId);

            if (dbError) throw dbError;

            if (uploadProgressBar) {
                uploadProgressBar.style.width = '100%';
                uploadProgressBar.setAttribute('aria-valuenow', 100);
            }
            if (uploadProgressPercent) uploadProgressPercent.textContent = '100%';
            if (uploadProgressText) uploadProgressText.textContent = 'Success!';

            // Refresh cards metadata
            await fetchModules();

            showUploadMessage('success', 'File uploaded and notes metadata updated!');
            showToast(`Successfully uploaded Module ${moduleId} notes!`);
            
            setTimeout(() => {
                const modalEl = $('#uploadModal');
                const bsModal = bootstrap.Modal.getInstance(modalEl);
                if (bsModal) bsModal.hide();
                
                uploadForm.reset();
                resetFileInput();
                uploadProgressCont?.classList.add('d-none');
                clearUploadMessage();
            }, 1500);

        } catch (error) {
            console.error('Upload process failed:', error);
            showUploadMessage('danger', `Upload failed: ${error.message || error}`);
            uploadProgressCont?.classList.add('d-none');
        } finally {
            uploadModuleSelect.disabled = false;
            btnSubmitUpload.disabled = false;
            if (btnRemoveFile) btnRemoveFile.disabled = false;
        }
    });

    /* ----------------------------------------------------------------
       PUBLIC API (for inline onclick handlers)
       ---------------------------------------------------------------- */
    window.WPNotes = { previewPDF, downloadPDF };

})();
