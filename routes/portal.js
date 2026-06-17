// routes/portal.js
const express = require('express');
const router  = express.Router();
const path    = require('path');
const ejs     = require('ejs');

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  next();
}

router.use(requireAuth);

/**
 * renderPage — sends full shell on first load, inner partial on HTMX swap.
 */
function renderPage(req, res, page, locals = {}) {
  const isHtmxRequest = req.headers['hx-request'] === 'true';

  const userName    = req.session?.userName || '';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'ME';

  const data = {
    pageTitle:  locals.pageTitle  || 'Dashboard',
    activePage: locals.activePage || '/dashboard',
    userEmail:  req.session.user,
    userName,
    userInitials,
    ...locals,
  };

  if (isHtmxRequest) {
    res.render(`pages/${page}`, data);
  } else {
    ejs.renderFile(
      path.join(__dirname, '../views/pages', `${page}.ejs`),
      data,
      (err, body) => {
        if (err) return res.status(500).send(err.message);
        res.render('layouts/shell', { ...data, body });
      }
    );
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/dashboard', (req, res) => {
  renderPage(req, res, 'dashboard', {
    pageTitle:    'Dashboard',
    activePage:   '/dashboard',
    userOrg:      req.session.userOrg      || '',
    userOrgType:  req.session.userOrgType  || '',
    userIndustry: req.session.userIndustry || '',
  });
});

router.get('/jointinitiatives', (req, res) => {
  renderPage(req, res, 'jointinitiatives', {
    pageTitle:  'Joint Initiatives',
    activePage: '/jointinitiatives',
  });
});

router.get('/reports', (req, res) => {
  renderPage(req, res, 'reports', {
    pageTitle:  'Market Opportunity',
    activePage: '/reports',
  });
});

router.get('/domains', (req, res) => {
  renderPage(req, res, 'domains', {
    pageTitle:  'Domains',
    activePage: '/domains',
  });
});

router.get('/financials', (req, res) => {
  renderPage(req, res, 'financials', {
    pageTitle:  'Financials',
    activePage: '/financials',
  });
});

router.get('/registrars', (req, res) => {
  renderPage(req, res, 'registrars', {
    pageTitle:  'Registrars',
    activePage: '/registrars',
  });
});

router.get('/settings', (req, res) => {
  renderPage(req, res, 'settings', {
    pageTitle:  'Settings',
    activePage: '/settings',
    user: {
      name:     req.session.userName     || '',
      email:    req.session.user         || '',
      org:      req.session.userOrg      || '',
      orgType:  req.session.userOrgType  || '',
      industry: req.session.userIndustry || '',
      phone:    req.session.userPhone    || '',
    },
  });
});

module.exports = router;