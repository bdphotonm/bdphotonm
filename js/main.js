// =============================================
//  B.D. Photography - main.js
//  Handles:
//    1. Nav scroll effect + hamburger menu
//    2. Hero slideshow with Ken Burns
//    3. Scroll-triggered fade-up animations
//    4. Lightbox photo viewer
//    5. Contact form validation
//    6. Quick contact form validation (homepage)
//    7. Client portal password + session tabs
// =============================================


// ─────────────────────────────────────────────
// 1. NAV - SCROLL EFFECT + HAMBURGER
// ─────────────────────────────────────────────
(function initNav() {
   var nav    = document.getElementById('mainNav');
   var toggle = document.getElementById('navToggle');
   var links  = document.getElementById('navLinks');

   // Add .scrolled class when page is scrolled
   if (nav) {
      window.addEventListener('scroll', function () {
         if (window.scrollY > 60) {
            nav.classList.add('scrolled');
         } else {
            nav.classList.remove('scrolled');
         }
      });
   }

   if (!toggle || !links) return;

   // Hamburger open/close
   toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
   });

   // Close on nav link click
   links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
         links.classList.remove('open');
         toggle.classList.remove('open');
         toggle.setAttribute('aria-expanded', 'false');
      });
   });

   // Close on outside click
   document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
         links.classList.remove('open');
         toggle.classList.remove('open');
         toggle.setAttribute('aria-expanded', 'false');
      }
   });
}());


// ─────────────────────────────────────────────
// 2. HERO SLIDESHOW - KEN BURNS + DOTS
// ─────────────────────────────────────────────
(function initSlideshow() {
   var slides  = document.querySelectorAll('.hero-slide');
   var dots    = document.querySelectorAll('.hero-dot');
   if (slides.length === 0) return;

   var current  = 0;
   var interval = null;
   var duration = 6000; // ms between slides

   function goTo(index) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');

      // Restart Ken Burns animation on the new slide's image
      var img = slides[current].querySelector('img');
      if (img) {
         img.style.animation = 'none';
         // Force reflow
         void img.offsetWidth;
         img.style.animation = 'kenBurns 8s ease-in-out forwards';
      }
   }

   function next() {
      goTo(current + 1);
   }

   function startAutoplay() {
      interval = setInterval(next, duration);
   }

   function stopAutoplay() {
      clearInterval(interval);
   }

   // Dot click handlers
   dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
         var index = parseInt(dot.getAttribute('data-index'), 10);
         stopAutoplay();
         goTo(index);
         startAutoplay();
      });
   });

   // Keyboard support for dots
   dots.forEach(function (dot) {
      dot.addEventListener('keydown', function (e) {
         if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dot.click();
         }
      });
   });

   // Pause on hover
   var hero = document.querySelector('.hero');
   if (hero) {
      hero.addEventListener('mouseenter', stopAutoplay);
      hero.addEventListener('mouseleave', startAutoplay);
   }

   // Touch swipe support
   var touchStartX = 0;
   if (hero) {
      hero.addEventListener('touchstart', function (e) {
         touchStartX = e.touches[0].clientX;
      }, { passive: true });

      hero.addEventListener('touchend', function (e) {
         var diff = touchStartX - e.changedTouches[0].clientX;
         if (Math.abs(diff) > 50) {
            stopAutoplay();
            diff > 0 ? goTo(current + 1) : goTo(current - 1);
            startAutoplay();
         }
      }, { passive: true });
   }

   startAutoplay();
}());


// ─────────────────────────────────────────────
// 3. SCROLL-TRIGGERED FADE-UP ANIMATIONS
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

      elements.forEach(function (el) {
         observer.observe(el);
      });
   } else {
      // Fallback for older browsers
      elements.forEach(function (el) {
         el.classList.add('visible');
      });
   }
}());


// ─────────────────────────────────────────────
// 4. LIGHTBOX PHOTO VIEWER
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

   function openLightbox(index) {
      if (galleryItems.length === 0) buildGallery();
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

   function showImage(index) {
      var item    = galleryItems[index];
      var img     = item ? item.querySelector('img') : null;
      var caption = item ? item.getAttribute('data-caption') : '';

      if (img && lbImg) {
         lbImg.src = img.src;
         lbImg.alt = img.alt;
      }

      if (lbCaption) {
         lbCaption.textContent = caption || '';
      }

      // Show/hide prev/next
      if (lbPrev) lbPrev.style.display = index > 0 ? 'flex' : 'none';
      if (lbNext) lbNext.style.display = index < galleryItems.length - 1 ? 'flex' : 'none';
   }

   function prevImage() {
      if (currentIndex > 0) {
         currentIndex--;
         showImage(currentIndex);
      }
   }

   function nextImage() {
      if (currentIndex < galleryItems.length - 1) {
         currentIndex++;
         showImage(currentIndex);
      }
   }

   // Attach click to gallery items (delegated to handle dynamic content)
   document.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (item) {
         buildGallery();
         var index = galleryItems.indexOf(item);
         if (index !== -1) openLightbox(index);
      }
   });

   // Controls
   if (lbClose) lbClose.addEventListener('click', closeLightbox);
   if (lbPrev)  lbPrev.addEventListener('click', prevImage);
   if (lbNext)  lbNext.addEventListener('click', nextImage);

   // Close on backdrop click
   lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
   });

   // Keyboard navigation
   document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      switch (e.key) {
         case 'Escape':    closeLightbox(); break;
         case 'ArrowLeft': prevImage();     break;
         case 'ArrowRight': nextImage();    break;
      }
   });

   // Touch swipe in lightbox
   var touchStartX = 0;
   lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
   }, { passive: true });

   lightbox.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
         diff > 0 ? nextImage() : prevImage();
      }
   }, { passive: true });
}());


// ─────────────────────────────────────────────
// 5. MAIN CONTACT FORM VALIDATION
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

   // Real-time blur validation
   function blurRule(id, errorId, testFn) {
      var el  = document.getElementById(id);
      var err = document.getElementById(errorId);
      if (!el) return;
      el.addEventListener('blur', function () {
         testFn(el.value) ? setValid(el, err) : setInvalid(el, err);
      });
   }

   blurRule('firstName', 'firstNameError', function (v) { return v.trim().length > 0; });
   blurRule('lastName',  'lastNameError',  function (v) { return v.trim().length > 0; });
   blurRule('email',     'emailError',     function (v) { return emailRegex.test(v.trim()); });
   blurRule('location',  'locationError',  function (v) { return v.trim().length > 0; });
   blurRule('message',   'messageError',   function (v) { return v.trim().length >= 10; });

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

   // Submit validation
   form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var fields = [
         { id: 'firstName',   errId: 'firstNameError',   test: function (v) { return v.trim().length > 0; } },
         { id: 'lastName',    errId: 'lastNameError',    test: function (v) { return v.trim().length > 0; } },
         { id: 'email',       errId: 'emailError',       test: function (v) { return emailRegex.test(v.trim()); } },
         { id: 'sessionType', errId: 'sessionTypeError', test: function (v) { return v !== ''; } },
         { id: 'location',    errId: 'locationError',    test: function (v) { return v.trim().length > 0; } },
         { id: 'message',     errId: 'messageError',     test: function (v) { return v.trim().length >= 10; } }
      ];

      fields.forEach(function (field) {
         var el  = document.getElementById(field.id);
         var err = document.getElementById(field.errId);
         if (!el) return;
         if (field.test(el.value)) { setValid(el, err); }
         else { setInvalid(el, err); valid = false; }
      });

      // Optional phone
      if (phoneEl && phoneEl.value.trim() !== '') {
         var digits = phoneEl.value.replace(/\D/g, '');
         var phErr  = document.getElementById('phoneError');
         if (digits.length < 10) { setInvalid(phoneEl, phErr); valid = false; }
         else { setValid(phoneEl, phErr); }
      }

      if (valid) {
         var successEl = document.getElementById('formSuccess');
         var submitBtn = document.getElementById('submitBtn');
         if (successEl) successEl.classList.add('visible');
         if (submitBtn) submitBtn.style.display = 'none';
         if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

         // Reset fields after short delay
         setTimeout(function () {
            form.reset();
            form.querySelectorAll('input, textarea, select').forEach(function (el) {
               el.classList.remove('valid', 'invalid');
            });
         }, 600);

         // Note: with data-netlify="true", Netlify intercepts the actual submission.
         // For a real send uncomment the line below and remove e.preventDefault() above.
         // form.submit();

      } else {
         var firstInvalid = form.querySelector('.invalid');
         if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
         }
      }
   });
}());


// ─────────────────────────────────────────────
// 6. QUICK CONTACT FORM (Homepage)
// ─────────────────────────────────────────────
(function initQuickForm() {
   var form = document.getElementById('quickContactForm');
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

   form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var nameEl    = document.getElementById('qcName');
      var emailEl   = document.getElementById('qcEmail');
      var typeEl    = document.getElementById('qcType');
      var messageEl = document.getElementById('qcMessage');

      if (nameEl) {
         var nameErr = document.getElementById('qcNameError');
         nameEl.value.trim().length > 0
            ? setValid(nameEl, nameErr)
            : (setInvalid(nameEl, nameErr), valid = false);
      }

      if (emailEl) {
         var emailErr = document.getElementById('qcEmailError');
         emailRegex.test(emailEl.value.trim())
            ? setValid(emailEl, emailErr)
            : (setInvalid(emailEl, emailErr), valid = false);
      }

      if (typeEl) {
         var typeErr = document.getElementById('qcTypeError');
         typeEl.value
            ? setValid(typeEl, typeErr)
            : (setInvalid(typeEl, typeErr), valid = false);
      }

      if (messageEl) {
         var msgErr = document.getElementById('qcMessageError');
         messageEl.value.trim().length >= 10
            ? setValid(messageEl, msgErr)
            : (setInvalid(messageEl, msgErr), valid = false);
      }

      if (valid) {
         var successEl = document.getElementById('qcFormSuccess');
         var submitBtn = document.getElementById('qcSubmitBtn');
         if (successEl) successEl.classList.add('visible');
         if (submitBtn) submitBtn.style.display = 'none';
         if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
         setTimeout(function () {
            form.reset();
            form.querySelectorAll('input, textarea, select').forEach(function (el) {
               el.classList.remove('valid', 'invalid');
            });
         }, 600);
      }
   });
}());


// ─────────────────────────────────────────────
// 7. CLIENT PORTAL - PASSWORD + SESSION TABS
// ─────────────────────────────────────────────
(function initClientPortal() {
   var loginEl  = document.getElementById('portalLogin');
   var galleryEl = document.getElementById('portalGallery');
   if (!loginEl || !galleryEl) return;

   // =====================================================
   //  CLIENT PASSWORDS - ADD / EDIT HERE
   //
   //  Format: 'password': 'Client Name'
   //
   //  To add a new client:
   //    1. Add a line below: 'theirpassword': 'Their Name'
   //    2. Create their gallery folder: images/clients/theirname/
   //    3. Add their photos to the portal HTML above
   //
   //  Keep passwords hard to guess - mix of words and
   //  numbers works well. Example: 'canyon2026photos'
   // =====================================================
   var PASSWORDS = {
      'bdphoto2026':  'Demo Client',
      'canyon2026':   'Canyon Session',
      'portrait2026': 'Portrait Client'
      // Add more clients here:
      // 'clientpassword': 'Client Name',
   };

   var SESSION_KEY = 'bdphoto_portal_auth';

   function unlock() {
      loginEl.style.display  = 'none';
      galleryEl.style.display = 'block';
      // Trigger fade-up animations in the gallery
      setTimeout(function () {
         document.querySelectorAll('.fade-up').forEach(function (el) {
            el.classList.add('visible');
         });
      }, 100);
   }

   function lock() {
      loginEl.style.display   = 'flex';
      galleryEl.style.display = 'none';
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
   }

   // Check for saved session
   try {
      if (sessionStorage.getItem(SESSION_KEY) === 'authenticated') {
         unlock();
      }
   } catch (e) {}

   // Password submit button
   var submitBtn    = document.getElementById('portalSubmit');
   var passwordInput = document.getElementById('portalPassword');
   var errorEl      = document.getElementById('portalError');

   function attemptLogin() {
      var entered = passwordInput ? passwordInput.value.trim() : '';
      if (PASSWORDS.hasOwnProperty(entered)) {
         // Correct password
         if (errorEl) errorEl.classList.remove('visible');
         try { sessionStorage.setItem(SESSION_KEY, 'authenticated'); } catch (e) {}
         unlock();
      } else {
         // Wrong password
         if (errorEl) errorEl.classList.add('visible');
         if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
            passwordInput.style.borderBottomColor = '#c0392b';
            setTimeout(function () {
               passwordInput.style.borderBottomColor = '';
            }, 1500);
         }
      }
   }

   if (submitBtn) {
      submitBtn.addEventListener('click', attemptLogin);
   }

   if (passwordInput) {
      passwordInput.addEventListener('keydown', function (e) {
         if (e.key === 'Enter') attemptLogin();
      });
   }

   // Logout button
   var logoutBtn = document.getElementById('portalLogout');
   if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
         lock();
         if (passwordInput) passwordInput.value = '';
      });
   }

   // Session tabs
   var tabs   = document.querySelectorAll('.portal-tab');
   var panels = document.querySelectorAll('.session-panel');

   tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
         var target = tab.getAttribute('data-session');

         // Update tab states
         tabs.forEach(function (t) {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
         });
         tab.classList.add('active');
         tab.setAttribute('aria-selected', 'true');

         // Show target panel
         panels.forEach(function (panel) {
            panel.style.display = panel.id === target + 'panel' ? 'block' : 'none';
         });
      });
   });
}());