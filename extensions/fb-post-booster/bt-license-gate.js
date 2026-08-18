(function () {
  var API = "https://basictrickhub.com/api/extension/license";
  var BOT = "https://t.me/basictrickbot";
  var GROUP = "https://t.me/basictrick";
  var overlay = document.getElementById("bt-license-gate");
  var input = document.getElementById("bt-license-input");
  var err = document.getElementById("bt-license-err");
  var btn = document.getElementById("bt-license-activate");
  if (!overlay) return;

  document.title = "Basictrick Post Booster";

  function setErr(msg) {
    if (err) err.textContent = msg || "";
  }

  function hideGate() {
    overlay.hidden = true;
    overlay.style.display = "none";
  }

  function showGate() {
    overlay.hidden = false;
    overlay.style.display = "flex";
  }

  function newDeviceId() {
    var bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    var hex = "";
    for (var i = 0; i < bytes.length; i++) hex += ("0" + bytes[i].toString(16)).slice(-2);
    return "BTPC-" + hex;
  }

  function storageGet(keys, cb) {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, function (res) {
          cb(res || {});
        });
        return;
      }
    } catch (e) {}
    var out = {};
    keys.forEach(function (k) {
      try {
        out[k] = localStorage.getItem(k) || "";
      } catch (err) {
        out[k] = "";
      }
    });
    cb(out);
  }

  function storageSet(obj) {
    try {
      Object.keys(obj).forEach(function (k) {
        localStorage.setItem(k, obj[k]);
      });
    } catch (e) {}
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(obj);
      }
    } catch (e) {}
  }

  function withDeviceId(cb) {
    storageGet(["bt_device_id"], function (res) {
      var id = (res && res.bt_device_id) || "";
      if (!id) {
        id = newDeviceId();
        storageSet({ bt_device_id: id });
      }
      cb(id);
    });
  }

  function validate(key, deviceId) {
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key, deviceId: deviceId }),
    }).then(function (r) {
      return r.json();
    });
  }

  function applyKey(key) {
    setErr("");
    if (!key) {
      setErr("License key paste করুন");
      return;
    }
    if (btn) btn.disabled = true;
    withDeviceId(function (deviceId) {
      validate(key, deviceId)
        .then(function (data) {
          if (data && data.valid) {
            storageSet({ bt_license_key: key.trim().toUpperCase() });
            hideGate();
          } else {
            setErr((data && data.error) || "Invalid / expired / other PC");
            showGate();
          }
        })
        .catch(function () {
          setErr("Server unreachable. basictrickhub.com চেক করুন");
          showGate();
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  function heartbeat() {
    storageGet(["bt_license_key"], function (res) {
      var key = (res && res.bt_license_key) || "";
      if (!key) {
        showGate();
        return;
      }
      withDeviceId(function (deviceId) {
        validate(key, deviceId)
          .then(function (data) {
            if (!(data && data.valid)) {
              setErr((data && data.error) || "License locked / expired");
              showGate();
            }
          })
          .catch(function () {});
      });
    });
  }

  storageGet(["bt_license_key"], function (res) {
    var saved = (res && res.bt_license_key) || "";
    if (saved) {
      if (input) input.value = saved;
      applyKey(saved);
    } else {
      showGate();
    }
  });

  setInterval(heartbeat, 4 * 60 * 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") heartbeat();
  });

  if (btn) {
    btn.addEventListener("click", function () {
      applyKey((input && input.value) || "");
    });
  }
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") applyKey(input.value);
    });
  }

  var botLink = document.getElementById("bt-license-bot");
  var groupLink = document.getElementById("bt-license-group");
  if (botLink) botLink.href = BOT;
  if (groupLink) groupLink.href = GROUP;
})();
