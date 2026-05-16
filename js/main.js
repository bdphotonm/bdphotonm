// =============================================
//  B.D. Photography — main.js
//  Handles:
//    1. Nav scroll effect + hamburger
//    2. Hero slideshow with Ken Burns
//    3. Scroll-triggered fade-up animations
//    4. Lightbox photo viewer
//    5. Dynamic gallery builder
//    6. Contact form validation
//    7. Quick contact form validation
//    8. Client portal password + session tabs
// =============================================


// ─────────────────────────────────────────────
// 1. NAV — SCROLL EFFECT + HAMBURGER
// ─────────────────────────────────────────────
(function initNav() {
   var nav    = document.getElementById('mainNav');
   var toggle = document.getElementById('navToggle');
   var links  = document.getElementById('navLinks');

   if (nav) {
      window.addEventListener('scroll', function () {
         nav.classList.toggle('scrolled', window.scrollY > 60);
      });
   }

   if (!toggle || !links) return;

   toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
   });

   links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
         links.classList.remove('open');
         toggle.classList.remove('open');
         toggle.setAttribute('aria-expanded', 'false');
      });
   });

   document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
         links.classList.remove('open');
         toggle.classList.remove('open');
         toggle.setAttribute('aria-expanded', 'false');
      }
   });
}());


// ─────────────────────────────────────────────
// 2. HERO SLIDESHOW
// ─────────────────────────────────────────────
(function initSlideshow() {
   var slides   = document.querySelectorAll('.hero-slide');
   var dots     = document.querySelectorAll('.hero-dot');
   if (slides.length === 0) return;

   var current  = 0;
   var interval = null;
   var duration = 6000;

   function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
      var img = slides[current].querySelector('img');
      if (img) {
         img.style.animation = 'none';
         void img.offsetWidth;
         img.style.animation = 'kenBurns 8s ease-in-out forwards';
      }
   }

   function startAutoplay() { interval = setInterval(function () { goTo(current + 1); }, duration); }
   function stopAutoplay()  { clearInterval(interval); }

   dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
         stopAutoplay();
         goTo(parseInt(dot.getAttribute('data-index'), 10));
         startAutoplay();
      });
   });

   var hero = document.querySelector('.hero');
   if (hero) {
      hero.addEventListener('mouseenter', stopAutoplay);
      hero.addEventListener('mouseleave', startAutoplay);
      var touchStartX = 0;
      hero.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
      hero.addEventListener('touchend', function (e) {
         var diff = touchStartX - e.changedTouches[0].clientX;
         if (Math.abs(diff) > 50) { stopAutoplay(); diff > 0 ? goTo(current + 1) : goTo(current - 1); startAutoplay(); }
      }, { passive: true });
   }

   startAutoplay();
}());


// ─────────────────────────────────────────────
// 3. FADE-UP ANIMATIONS
// ─────────────────────────────────────────────
(function initFadeUp() {
   var elements = document.querySelectorAll('.fade-up');
   if (elements.length === 0) return;

   if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (entry.isIntersecting) {
               entry.target.classList.add('visible');
               observer.unobserve(entry.target);
            }
         });
      }, { threshold: 0.12 });
      elements.forEach(function (el) { observer.observe(el); });
   } else {
      elements.forEach(function (el) { el.classList.add('visible'); });
   }
}());


// ─────────────────────────────────────────────
// 4. LIGHTBOX
// ─────────────────────────────────────────────
(function initLightbox() {
   var lightbox  = document.getElementById('lightbox');
   var lbImg     = document.getElementById('lightboxImg');
   var lbCaption = document.getElementById('lightboxCaption');
   var lbClose   = document.getElementById('lightboxClose');
   var lbPrev    = document.getElementById('lightboxPrev');
   var lbNext    = document.getElementById('lightboxNext');
   if (!lightbox || !lbImg) return;

   var galleryItems = [];
   var currentIndex = 0;

   function buildGallery() {
      galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
   }

   function showImage(index) {
      var item = galleryItems[index];
      var img  = item ? item.querySelector('img') : null;
      if (img && lbImg) { lbImg.src = img.src; lbImg.alt = img.alt; }
      if (lbCaption) lbCaption.textContent = item ? (item.getAttribute('data-caption') || '') : '';
      if (lbPrev) lbPrev.style.display = index > 0 ? 'flex' : 'none';
      if (lbNext) lbNext.style.display = index < galleryItems.length - 1 ? 'flex' : 'none';
   }

   function openLightbox(index) {
      buildGallery();
      currentIndex = index;
      showImage(currentIndex);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
   }

   function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
   }

   function prevImage() { if (currentIndex > 0) { currentIndex--; showImage(currentIndex); } }
   function nextImage() { if (currentIndex < galleryItems.length - 1) { currentIndex++; showImage(currentIndex); } }

   document.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (item) {
         buildGallery();
         var index = galleryItems.indexOf(item);
         if (index !== -1) openLightbox(index);
      }
   });

   if (lbClose) lbClose.addEventListener('click', closeLightbox);
   if (lbPrev)  lbPrev.addEventListener('click', prevImage);
   if (lbNext)  lbNext.addEventListener('click', nextImage);
   lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

   document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  prevImage();
      if (e.key === 'ArrowRight') nextImage();
   });

   var touchStartX = 0;
   lightbox.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
   lightbox.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextImage() : prevImage(); }
   }, { passive: true });
}());


// ─────────────────────────────────────────────
// 5. DYNAMIC GALLERY BUILDER
// ─────────────────────────────────────────────

// =====================================================
//  GALLERY PHOTO LISTS
//
//  To add a new photo:
//    1. Drop the file in the correct images/gallery/
//       subfolder (e.g. images/gallery/landscapes/)
//    2. Add ONE line to the array below:
//       { file: 'filename.jpg', caption: 'Your Caption' }
//
//  To remove a photo: delete its line
//  To reorder photos: move lines around
//  That's it — no HTML to touch!
// =====================================================

var GALLERIES = {

   landscapes: [
      { file: 'landscapes-01.jpg', caption: 'Grand Canyon 1' },
      { file: 'landscapes-02.jpg', caption: 'Grand Canyon 2' },
      { file: 'landscapes-03.jpg', caption: 'Grand Canyon 3' },
      { file: 'landscapes-04.jpg', caption: 'Grand Canyon 4' },
      { file: 'landscapes-05.jpg', caption: 'Grand Canyon 5' },
      // Add more landscape photos here:
      // { file: 'landscapes-06.jpg', caption: 'Your Caption' },
   ],

   nature: [
      // Add nature photos here:
      // { file: 'nature-01.jpg', caption: 'Your Caption' },
   ],

   portraits: [
      // Add portrait photos here:
      // { file: 'portraits-01.jpg', caption: 'Your Caption' },
   ],

   travel: [
      // Add travel photos here:
      // { file: 'travel-01.jpg', caption: 'Your Caption' },
   ],

   cars: [
      // Add car photos here:
      // { file: 'cars-01.jpg', caption: 'Your Caption' },
   ],

   pets: [
      // Add pet photos here:
      // { file: 'pets-01.jpg', caption: 'Your Caption' },
   ],

   realestate: [
      // Add real estate photos here:
      // { file: 'realestate-01.jpg', caption: 'Your Caption' },
   ]

};

// Builds gallery HTML from the arrays above
function buildGallery(category, gridId, imagePath) {
   var grid   = document.getElementById(gridId);
   var photos = GALLERIES[category];
   if (!grid || !photos) return;

   if (photos.length === 0) {
      grid.innerHTML =
         '<div class="gallery-placeholder" style="height:300px; grid-column:1/-1;">' +
         '<div style="text-align:center;">' +
         '<div style="font-size:2rem; margin-bottom:10px;">🖼</div>' +
         '<p style="margin:0; font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-light);">' +
         'Photos coming soon</p></div></div>';
      return;
   }

   grid.innerHTML = photos.map(function (photo) {
      return '<div class="gallery-item" data-caption="' + photo.caption + '">' +
         '<img src="' + imagePath + photo.file + '" alt="' + photo.caption + '" loading="lazy">' +
         '<div class="gallery-overlay">' +
         '<span class="gallery-overlay-text">' + photo.caption + '</span>' +
         '</div></div>';
   }).join('');
}

// Auto-detect which gallery page we're on and build it
(function initGalleryBuilder() {
   var path = window.location.pathname;

   if (path.indexOf('landscapes') !== -1) {
      buildGallery('landscapes', 'galleryGrid', '../images/gallery/landscapes/');
   } else if (path.indexOf('nature') !== -1) {
      buildGallery('nature', 'galleryGrid', '../images/gallery/nature/');
   } else if (path.indexOf('portraits') !== -1) {
      buildGallery('portraits', 'galleryGrid', '../images/gallery/portraits/');
   } else if (path.indexOf('travel') !== -1) {
      buildGallery('travel', 'galleryGrid', '../images/gallery/travel/');
   } else if (path.indexOf('cars') !== -1) {
      buildGallery('cars', 'galleryGrid', '../images/gallery/cars/');
   } else if (path.indexOf('pets') !== -1) {
      buildGallery('pets', 'galleryGrid', '../images/gallery/pets/');
   } else if (path.indexOf('realestate') !== -1) {
      buildGallery('realestate', 'galleryGrid', '../images/gallery/realestate/');
   }
}());


// ─────────────────────────────────────────────
// 6. CONTACT FORM VALIDATION
// ─────────────────────────────────────────────
(function initContactForm() {
   var form = document.getElementById('contactForm');
   if (!form) return;

   var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   function setValid(input, errEl) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      if (errEl) errEl.classList.remove('visible');
   }

   function setInvalid(input, errEl) {
      input.classList.remove('valid');
      input.classList.add('invalid');
      if (errEl) errEl.classList.add('visible');
   }

   function clearState(input, errEl) {
      input.classList.remove('valid', 'invalid');
      if (errEl) errEl.classList.remove('visible');
   }

   function blurRule(id, errorId, testFn) {
      var el  = document.getElementById(id);
      var err = document.getElementById(errorId);
      if (!el) return;
      el.addEventListener('blur', function () {
         testFn(el.value) ? setValid(el, err) : setInvalid(el, err);
      });
   }

   blurRule('firstName',   'firstNameError',   function (v) { return v.trim().length > 0; });
   blurRule('lastName',    'lastNameError',     function (v) { return v.trim().length > 0; });
   blurRule('email',       'emailError',        function (v) { return emailRegex.test(v.trim()); });
   blurRule('location',    'locationError',     function (v) { return v.trim().length > 0; });
   blurRule('message',     'messageError',      function (v) { return v.trim().length >= 10; });

   var phoneEl = document.getElementById('phone');
   if (phoneEl) {
      phoneEl.addEventListener('blur', function () {
         var err    = document.getElementById('phoneError');
         var digits = phoneEl.value.replace(/\D/g, '');
         if (phoneEl.value.trim() === '') { clearState(phoneEl, err); return; }
         digits.length >= 10 ? setValid(phoneEl, err) : setInvalid(phoneEl, err);
      });
   }

   var sessionTypeEl = document.getElementById('sessionType');
   if (sessionTypeEl) {
      sessionTypeEl.addEventListener('change', function () {
         var err = document.getElementById('sessionTypeError');
         sessionTypeEl.value ? setValid(sessionTypeEl, err) : setInvalid(sessionTypeEl, err);
      });
   }

   form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var fields = [
         { id: 'firstName',   errId: 'firstNameError',   test: function (v) { return v.trim().length > 0; } },
         { id: 'lastName',    errId: 'lastNameError',     test: function (v) { return v.trim().length > 0; } },
         { id: 'email',       errId: 'emailError',        test: function (v) { return emailRegex.test(v.trim()); } },
         { id: 'sessionType', errId: 'sessionTypeError',  test: function (v) { return v !== ''; } },
         { id: 'location',    errId: 'locationError',     test: function (v) { return v.trim().length > 0; } },
         { id: 'message',     errId: 'messageError',      test: function (v) { return v.trim().length >= 10; } }
      ];

      fields.forEach(function (field) {
         var el  = document.getElementById(field.id);
         var err = document.getElementById(field.errId);
         if (!el) return;
         field.test(el.value) ? setValid(el, err) : (setInvalid(el, err), valid = false);
      });

      if (phoneEl && phoneEl.value.trim() !== '') {
         var digits = phoneEl.value.replace(/\D/g, '');
         var phErr  = document.getElementById('phoneError');
         digits.length >= 10 ? setValid(phoneEl, phErr) : (setInvalid(phoneEl, phErr), valid = false);
      }

      if (valid) {
         form.submit(); // Actually send to Netlify
         setTimeout(function () {
            form.reset();
            form.querySelectorAll('input, textarea, select').forEach(function (el) {
               el.classList.remove('valid', 'invalid');
            });
         }, 600);
      } else {
         var firstInvalid = form.querySelector('.invalid');
         if (firstInvalid) { firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' }); firstInvalid.focus(); }
      }
   });
}());


// ─────────────────────────────────────────────
// 7. QUICK CONTACT FORM (Homepage)
// ─────────────────────────────────────────────
(function initQuickForm() {
   var form = document.getElementById('quickContactForm');
   if (!form) return;

   var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   function setValid(input, errEl) { input.classList.remove('invalid'); input.classList.add('valid'); if (errEl) errEl.classList.remove('visible'); }
   function setInvalid(input, errEl) { input.classList.remove('valid'); input.classList.add('invalid'); if (errEl) errEl.classList.add('visible'); }

   form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var fields = [
         { id: 'qcName',    errId: 'qcNameError',    test: function (v) { return v.trim().length > 0; } },
         { id: 'qcEmail',   errId: 'qcEmailError',   test: function (v) { return emailRegex.test(v.trim()); } },
         { id: 'qcType',    errId: 'qcTypeError',    test: function (v) { return v !== ''; } },
         { id: 'qcMessage', errId: 'qcMessageError', test: function (v) { return v.trim().length >= 10; } }
      ];

      fields.forEach(function (field) {
         var el  = document.getElementById(field.id);
         var err = document.getElementById(field.errId);
         if (!el) return;
         field.test(el.value) ? setValid(el, err) : (setInvalid(el, err), valid = false);
      });

      if (valid) {
         var successEl = document.getElementById('qcFormSuccess');
         var submitBtn = document.getElementById('qcSubmitBtn');
         if (successEl) successEl.classList.add('visible');
         if (submitBtn) submitBtn.style.display = 'none';
         if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
         setTimeout(function () {
            form.reset();
            form.querySelectorAll('input, textarea, select').forEach(function (el) { el.classList.remove('valid', 'invalid'); });
         }, 600);
      }
   });
}());


// ─────────────────────────────────────────────
// 8. CLIENT PORTAL
// ─────────────────────────────────────────────
(function initClientPortal() {
   var loginEl   = document.getElementById('portalLogin');
   var galleryEl = document.getElementById('portalGallery');
   if (!loginEl || !galleryEl) return;

   // =====================================================
   //  CLIENT PASSWORDS
   //
   //  Add a new client:
   //    'theirpassword': 'Their Name'
   //
   //  Give the client their password in the delivery email.
   //  Passwords are case sensitive.
   // =====================================================
   var PASSWORDS = {
      'bdphoto2026':  'Demo Client',
      'canyon2026':   'Canyon Session',
      'portrait2026': 'Portrait Client'
      // 'newpassword': 'Client Name',
   };

   var SESSION_KEY = 'bdphoto_portal_auth';

   function unlock() {
      loginEl.style.display   = 'none';
      galleryEl.style.display = 'block';
      setTimeout(function () {
         document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('visible'); });
      }, 100);
   }

   function lock() {
      loginEl.style.display   = 'flex';
      galleryEl.style.display = 'none';
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
   }

   try { if (sessionStorage.getItem(SESSION_KEY) === 'authenticated') unlock(); } catch (e) {}

   var submitBtn     = document.getElementById('portalSubmit');
   var passwordInput = document.getElementById('portalPassword');
   var errorEl       = document.getElementById('portalError');

   function attemptLogin() {
      var entered = passwordInput ? passwordInput.value.trim() : '';
      if (PASSWORDS.hasOwnProperty(entered)) {
         if (errorEl) errorEl.classList.remove('visible');
         try { sessionStorage.setItem(SESSION_KEY, 'authenticated'); } catch (e) {}
         unlock();
      } else {
         if (errorEl) errorEl.classList.add('visible');
         if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
            passwordInput.style.borderBottomColor = '#c0392b';
            setTimeout(function () { passwordInput.style.borderBottomColor = ''; }, 1500);
         }
      }
   }

   if (submitBtn)     submitBtn.addEventListener('click', attemptLogin);
   if (passwordInput) passwordInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') attemptLogin(); });

   var logoutBtn = document.getElementById('portalLogout');
   if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
         lock();
         if (passwordInput) passwordInput.value = '';
      });
   }

   var tabs   = document.querySelectorAll('.portal-tab');
   var panels = document.querySelectorAll('.session-panel');

   tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
         var target = tab.getAttribute('data-session');
         tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
         tab.classList.add('active');
         tab.setAttribute('aria-selected', 'true');
         panels.forEach(function (panel) { panel.style.display = panel.id === target + 'panel' ? 'block' : 'none'; });
      });
   });
}());