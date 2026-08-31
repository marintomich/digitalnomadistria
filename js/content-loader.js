(function () {
  "use strict";

  function get(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  function applyTextFields(content) {
    document.querySelectorAll("[data-field]").forEach(function (el) {
      var value = get(content, el.getAttribute("data-field"));
      if (typeof value === "string") el.textContent = value;
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderWhyRows(content) {
    var el = document.getElementById("whyRows");
    if (!el || !content.why || !Array.isArray(content.why.rows)) return;
    el.innerHTML = content.why.rows
      .map(function (row) {
        return (
          '<div class="why-row"><span class="why-row-label">' +
          escapeHtml(row.label) +
          '</span><p class="why-row-text">' +
          escapeHtml(row.text) +
          "</p></div>"
        );
      })
      .join("");
  }

  function renderWorkGrid(content) {
    var el = document.getElementById("workGrid");
    if (!el || !content.work || !Array.isArray(content.work.spaces)) return;
    el.innerHTML = content.work.spaces
      .map(function (space) {
        return (
          '<article class="work-card"><div class="work-card-media"><img src="' +
          escapeHtml(space.image || "images/pulaCoworking.jpg") +
          '" alt="Placeholder photo — replace with real photography of ' +
          escapeHtml(space.name) +
          '"></div><div class="work-card-body"><span class="work-card-tag">' +
          escapeHtml(space.tag || "") +
          "</span><h3>" +
          escapeHtml(space.name) +
          '</h3><span class="work-card-town">' +
          escapeHtml(space.town || "") +
          '</span><p class="work-card-note">' +
          escapeHtml(space.note || "") +
          "</p></div></article>"
        );
      })
      .join("");
  }

  function renderStayList(content) {
    var el = document.getElementById("stayList");
    if (!el || !content.stay || !Array.isArray(content.stay.regions)) return;
    el.innerHTML = content.stay.regions
      .map(function (region, i) {
        var flip = i % 2 === 1 ? " flip" : "";
        return (
          '<div class="stay-spread' +
          flip +
          '"><div class="stay-media"><img src="' +
          escapeHtml(region.image || "images/rovinj.jpg") +
          '" alt="' +
          escapeHtml(region.alt || "Placeholder photo — replace with real photography") +
          '"></div><div class="stay-copy"><h3>' +
          escapeHtml(region.name) +
          "</h3><p>" +
          escapeHtml(region.text) +
          "</p></div></div>"
        );
      })
      .join("");
  }

  function renderLifestyleGrid(content) {
    var el = document.getElementById("lifestyleGrid");
    if (!el || !content.lifestyle || !Array.isArray(content.lifestyle.items)) return;
    el.innerHTML = content.lifestyle.items
      .map(function (item) {
        return (
          '<div class="lifestyle-item"><h3>' +
          escapeHtml(item.town) +
          "</h3><p>" +
          escapeHtml(item.note) +
          "</p></div>"
        );
      })
      .join("");
  }

  function renderCommunityGrid(content) {
    var el = document.getElementById("communityGrid");
    if (!el || !content.community || !Array.isArray(content.community.services)) return;
    el.innerHTML = content.community.services
      .map(function (service) {
        return (
          '<div class="community-item"><h3>' +
          escapeHtml(service.title) +
          "</h3><p>" +
          escapeHtml(service.text) +
          "</p></div>"
        );
      })
      .join("");
  }

  function applyContactExtras(content) {
    if (!content.contact) return;
    var keyInput = document.getElementById("web3formsKey");
    if (keyInput && content.contact.web3forms_access_key) {
      keyInput.value = content.contact.web3forms_access_key;
    }
    var fallback = document.getElementById("fallbackEmail");
    if (fallback && content.contact.fallback_email) {
      fallback.textContent = content.contact.fallback_email;
      fallback.href = "mailto:" + content.contact.fallback_email;
    }
    var socialList = document.getElementById("socialLinks");
    if (socialList && Array.isArray(content.contact.social)) {
      socialList.innerHTML = content.contact.social
        .map(function (item) {
          return (
            '<li><a href="' +
            escapeHtml(item.url) +
            '" target="_blank" rel="noopener">' +
            escapeHtml(item.label) +
            "</a></li>"
          );
        })
        .join("");
    }
  }

  function applyMeta(content) {
    if (content.meta && content.meta.site_title) document.title = content.meta.site_title;
    if (content.meta && content.meta.site_description) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", content.meta.site_description);
    }
  }

  fetch("content/site.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("content fetch failed");
      return res.json();
    })
    .then(function (content) {
      applyMeta(content);
      applyTextFields(content);
      renderWhyRows(content);
      renderWorkGrid(content);
      renderStayList(content);
      renderLifestyleGrid(content);
      renderCommunityGrid(content);
      applyContactExtras(content);
      // Re-run scroll reveal setup for freshly rendered nodes.
      document.dispatchEvent(new CustomEvent("content:rendered"));
    })
    .catch(function () {
      // If content/site.json is unreachable (e.g. opened via file://),
      // the page's own static HTML is already a complete, correct fallback.
    });
})();
