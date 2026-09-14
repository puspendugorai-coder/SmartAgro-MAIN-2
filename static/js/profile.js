/* =========================================================================
   profile.js — SmartAgro User Profile & Onboarding
   -------------------------------------------------------------------------
   On first run, shows a two-step onboarding modal asking for:
     Step 1: Name, Age
     Step 2: Mobile (10-digit), Country (India-only)
   Profile is persisted in localStorage until app is uninstalled.
   Renders a profile badge in the navbar (#userProfileBadge).
   ========================================================================= */

window.SmartAgroProfile = (function () {

  var PROFILE_KEY = 'smartagro_user_profile';

  var INDIA_VARIANTS = [
    'india', 'bharat', 'hindustan',
    '\u092d\u093e\u0930\u0924',          // Hindi
    '\u0a2d\u0a3e\u0a30\u0a24',          // Punjabi
    '\u09ad\u09be\u09b0\u09a4',          // Bengali
    '\u0c2d\u0c3e\u0c30\u0c24\u0c26\u0c47\u0c36\u0c02', // Telugu
    '\u0b87\u0ba8\u0bcd\u0ba4\u0bbf\u0baf\u0bbe',        // Tamil
    '\u0d07\u0d28\u0d4d\u0d24\u0d4d\u0d2f',              // Malayalam
    '\u0c95\u0cb0\u0ccd\u0ca8\u0cbe\u0c9f\u0c95',        // Kannada
    '\u0aad\u0abe\u0ab0\u0aa4',          // Gujarati
    '\u0b2d\u0b3e\u0b30\u0b24',          // Odia
    '\u0d1c\u0d28\u0d4d\u0d24\u0d4d\u0d28\u0d4d', // (alt)
    'ind', '\u0bef\u0bc8', 'in',
  ];

  function isIndia(val) {
    if (!val) return false;
    var v = val.trim().toLowerCase();
    for (var i = 0; i < INDIA_VARIANTS.length; i++) {
      if (v === INDIA_VARIANTS[i]) return true;
    }
    return false;
  }

  function getProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveProfile(profile) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
  }

  function renderBadge() {
    var badge = document.getElementById('userProfileBadge');
    if (!badge) return;
    var profile = getProfile();
    if (!profile) { badge.style.display = 'none'; return; }
    var initials = profile.name ? profile.name.trim().split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('').toUpperCase() : '?';
    badge.innerHTML =
      '<div class="upb-avatar" title="' + profile.name + '" id="userProfileAvatarBtn">' + initials + '</div>'
      + '<span class="upb-name" id="userProfileNameSpan">' + profile.name.split(' ')[0] + '</span>';
    badge.style.display = 'flex';
    var avatarBtn = document.getElementById('userProfileAvatarBtn');
    if (avatarBtn) avatarBtn.addEventListener('click', function() { showProfileCard(); });
    var nameSpan = document.getElementById('userProfileNameSpan');
    if (nameSpan) nameSpan.addEventListener('click', function() { showProfileCard(); });
  }

  function showProfileCard() {
    var profile = getProfile();
    if (!profile) return;
    var existing = document.getElementById('profileCardPopup');
    if (existing) { existing.remove(); return; }
    var popup = document.createElement('div');
    popup.id = 'profileCardPopup';
    popup.className = 'profile-card-popup';
    popup.innerHTML =
      '<div class="pcp-avatar">' + (profile.name ? profile.name.trim().split(' ').map(function(w){return w[0];}).slice(0,2).join('').toUpperCase() : '?') + '</div>'
      + '<div class="pcp-name">' + profile.name + '</div>'
      + '<div class="pcp-detail"><i class="fas fa-phone"></i> +91 ' + profile.mobile + '</div>'
      + '<div class="pcp-detail"><i class="fas fa-cake-candles"></i> Age: ' + profile.age + '</div>'
      + '<div class="pcp-detail"><i class="fas fa-flag"></i> ' + profile.country + '</div>'
      + '<button class="pcp-edit-btn" id="pcpEditBtn"><i class="fas fa-pen"></i> Edit Profile</button>';
    document.body.appendChild(popup);
    // Position near badge
    var badge = document.getElementById('userProfileBadge');
    if (badge) {
      var rect = badge.getBoundingClientRect();
      popup.style.top  = (rect.bottom + 8) + 'px';
      popup.style.right = (window.innerWidth - rect.right) + 'px';
    }
    document.getElementById('pcpEditBtn').addEventListener('click', function() {
      popup.remove();
      showOnboardingModal(true);
    });
    // Close on outside click
    setTimeout(function() {
      document.addEventListener('click', function handler(e) {
        if (!popup.contains(e.target) && e.target.id !== 'userProfileAvatarBtn' && e.target.id !== 'userProfileNameSpan') {
          popup.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 100);
  }

  function showOnboardingModal(isEdit) {
    isEdit = isEdit || false;
    var existingProfile = getProfile() || {};
    var existing = document.getElementById('onboardingModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'onboardingModal';
    modal.className = 'onboarding-overlay';
    modal.innerHTML =
      '<div class="onboarding-panel">'
      + '<div class="onboarding-header">'
      + '<div class="onboarding-logo"><i class="fas fa-seedling"></i></div>'
      + '<h2 class="onboarding-title">Welcome to <span>Smart<span class="ob-accent">Agro</span></span></h2>'
      + '<p class="onboarding-sub">' + (isEdit ? 'Update your profile' : 'Built for India\'s farmers. Let\'s set up your profile.') + '</p>'
      + '</div>'
      // Step 1
      + '<div class="ob-step" id="obStep1">'
      + '<div class="ob-step-title"><span class="ob-step-num">1</span> Personal Details</div>'
      + '<div class="ob-field">'
      + '<label class="ob-label"><i class="fas fa-user"></i> Full Name</label>'
      + '<input type="text" id="obName" class="ob-input" placeholder="e.g. Ramesh Kumar" maxlength="60" value="' + (existingProfile.name || '') + '">'
      + '</div>'
      + '<div class="ob-field">'
      + '<label class="ob-label"><i class="fas fa-cake-candles"></i> Age</label>'
      + '<input type="number" id="obAge" class="ob-input" placeholder="e.g. 35" min="10" max="120" value="' + (existingProfile.age || '') + '">'
      + '</div>'
      + '<div class="ob-error" id="obStep1Error" style="display:none"></div>'
      + '<button class="ob-btn-next" id="obNextBtn"><i class="fas fa-arrow-right"></i> Next</button>'
      + '</div>'
      // Step 2
      + '<div class="ob-step" id="obStep2" style="display:none">'
      + '<div class="ob-step-title"><span class="ob-step-num">2</span> Contact & Location</div>'
      + '<div class="ob-field">'
      + '<label class="ob-label"><i class="fas fa-phone"></i> Mobile Number</label>'
      + '<div class="ob-phone-wrap"><span class="ob-phone-prefix">+91</span><input type="tel" id="obMobile" class="ob-input ob-phone-input" placeholder="10-digit number" maxlength="10" value="' + (existingProfile.mobile || '') + '"></div>'
      + '</div>'
      + '<div class="ob-field">'
      + '<label class="ob-label"><i class="fas fa-globe"></i> Country</label>'
      + '<input type="text" id="obCountry" class="ob-input" placeholder="e.g. India" value="' + (existingProfile.country || 'India') + '">'
      + '<span class="ob-field-note"><i class="fas fa-info-circle"></i> This app is designed exclusively for Indian farmers</span>'
      + '</div>'
      + '<div class="ob-error" id="obStep2Error" style="display:none"></div>'
      + '<div class="ob-btns-row">'
      + '<button class="ob-btn-back" id="obBackBtn"><i class="fas fa-arrow-left"></i> Back</button>'
      + '<button class="ob-btn-submit" id="obSubmitBtn"><i class="fas fa-check"></i> ' + (isEdit ? 'Save Changes' : 'Get Started') + '</button>'
      + '</div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modal);
    requestAnimationFrame(function() { modal.classList.add('visible'); });

    document.getElementById('obNextBtn').addEventListener('click', function() {
      var name = document.getElementById('obName').value.trim();
      var age  = parseInt(document.getElementById('obAge').value);
      var err  = document.getElementById('obStep1Error');
      if (!name || name.length < 2) { err.textContent = 'Please enter your full name (at least 2 characters).'; err.style.display = ''; return; }
      if (!age || age < 10 || age > 120) { err.textContent = 'Please enter a valid age (10-120).'; err.style.display = ''; return; }
      err.style.display = 'none';
      document.getElementById('obStep1').style.display = 'none';
      document.getElementById('obStep2').style.display = '';
      document.getElementById('obMobile').focus();
    });

    document.getElementById('obBackBtn').addEventListener('click', function() {
      document.getElementById('obStep2').style.display = 'none';
      document.getElementById('obStep1').style.display = '';
    });

    document.getElementById('obSubmitBtn').addEventListener('click', function() {
      var mobile  = document.getElementById('obMobile').value.trim();
      var country = document.getElementById('obCountry').value.trim();
      var err2    = document.getElementById('obStep2Error');

      if (!/^\d{10}$/.test(mobile)) {
        err2.textContent = 'Please enter a valid 10-digit Indian mobile number.';
        err2.style.display = ''; return;
      }
      if (!isIndia(country)) {
        err2.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Sorry! SmartAgro is exclusively built for <strong>Indian farmers</strong>. This app does not support other countries.';
        err2.style.display = '';
        document.getElementById('obCountry').classList.add('ob-input-error');
        showIndiaOnlyBlock(modal);
        return;
      }
      err2.style.display = 'none';

      var profile = {
        name:    document.getElementById('obName').value.trim(),
        age:     parseInt(document.getElementById('obAge').value),
        mobile:  mobile,
        country: 'India',
        createdAt: Date.now()
      };
      saveProfile(profile);
      modal.classList.remove('visible');
      setTimeout(function() { modal.remove(); }, 400);
      renderBadge();
      if (typeof showToast === 'function') showToast('\uD83C\uDF3E Welcome, ' + profile.name + '! Profile saved.', 'success');
    });
  }

  function showIndiaOnlyBlock(modal) {
    var panel = modal.querySelector('.onboarding-panel');
    panel.innerHTML =
      '<div style="text-align:center;padding:40px 24px;">'
      + '<div style="font-size:3rem;margin-bottom:16px">\uD83C\uDDEE\uD83C\uDDF3</div>'
      + '<h2 style="color:var(--green,#4ade80);margin-bottom:12px;font-family:Syne,sans-serif">India Only</h2>'
      + '<p style="color:var(--text-2,#a7c4a8);font-size:0.95rem;line-height:1.6;margin-bottom:24px">SmartAgro is designed exclusively for <strong style="color:var(--amber,#fbbf24)">Indian farmers</strong>.<br>This app provides mandi prices, weather, and crop advisory services specific to India.</p>'
      + '<p style="color:var(--text-3,#6b8c6c);font-size:0.8rem;margin-bottom:28px">If you are from India, please go back and enter "India" as your country.</p>'
      + '<button class="ob-btn-back" id="indiaOnlyBackBtn" style="margin:0 auto"><i class="fas fa-arrow-left"></i> Go Back</button>'
      + '</div>';
    document.getElementById('indiaOnlyBackBtn').addEventListener('click', function() {
      panel.innerHTML = '';
      panel.remove();
      modal.remove();
      showOnboardingModal(false);
    });
  }

  function checkAndShowOnboarding() {
    if (!getProfile()) {
      setTimeout(function() { showOnboardingModal(false); }, 800);
    } else {
      renderBadge();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowOnboarding);
  } else {
    checkAndShowOnboarding();
  }

  return { getProfile: getProfile, renderBadge: renderBadge, showOnboardingModal: showOnboardingModal };

})();
