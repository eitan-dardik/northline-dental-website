/* Loads Umami for this address's environment (from config.js). Do not edit.
   Each page has <script src=".../analytics.js" data-website-id="from-config"> in its head. The real Umami
   script is added here with the website id from config.js. If the tag carries data-tag (test runs add one),
   it is copied to Umami, so test traffic is labelled and can be taken out of the real numbers.
   No identify call, no data-distinct-id: Umami never learns who a visitor is (SOP R6). */
(function () {
  var me = document.currentScript
  var cfg = window.EVENT_KIT_CONFIG || {}
  var env = (cfg.environments || {})[location.hostname]
  if (!env || !env.umamiScriptUrl || !env.umamiWebsiteId || /REPLACE/.test(env.umamiScriptUrl + env.umamiWebsiteId)) return
  var s = document.createElement('script')
  s.defer = true
  s.src = env.umamiScriptUrl
  s.setAttribute('data-website-id', env.umamiWebsiteId)
  var tag = me && me.getAttribute('data-tag')
  if (tag) s.setAttribute('data-tag', tag)
  var host = me && me.getAttribute('data-host-url')
  if (host) s.setAttribute('data-host-url', host)
  s.onload = function () { if (window.EventKit) window.EventKit.analyticsReady() }
  document.head.appendChild(s)
})()
