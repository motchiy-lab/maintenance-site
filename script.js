const MAINTENANCE_CONFIG = {
  // 1. メンテナンスの種類 ('regular', 'emergency', 'update')
  type: "update",

  // 2. 詳細説明
  // 種類に応じた説明は自動的に挿入されます。ここに追記したい詳細があれば記述してください。
  details: "・サーバーパーツの交換<br>・OSの再セットアップ",

  // 3. 実施日時 (YYYY/MM/DD HH:mm 形式)
  // 緊急メンテナンス ('emergency') の場合はこれらは表示されません
  startTime: "2026/09/07 17:50",
  endTime: "2026/09/07 23:30",

  // 4. 外部リンク設定
  links: [
    {
      name: "公式 X",
      url: "https://x.com/motchiy_tuti",
      icon: "images/x-logo.png",
      isImage: true,
    },
    {
      name: "Discord サーバー",
      url: "https://discord.gg/2e73nVc2bh",
      icon: "images/discord-logo.png",
      isImage: true,
    },
    {
      name: "お問い合わせ",
      url: "mailto:info@motchiy.com",
      icon: "mail",
      isImage: false,
    },
  ],
};

// =================================================================
// SYSTEM CONTROLLER (以下は自動的に処理を行います)
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const badgeEl = document.getElementById("maintenance-badge");
  const titleEl = document.getElementById("maintenance-title");
  const reasonEl = document.getElementById("maintenance-reason");
  const detailContainerEl = document.getElementById("detail-container");
  const detailEl = document.getElementById("maintenance-detail");
  const periodEl = document.getElementById("maintenance-period");
  const progressBarEl = document.getElementById("progress-bar");
  const progressPercentEl = document.getElementById("progress-percent");
  const countdownAreaEl = document.getElementById("countdown-area");
  const countdownLabelEl = document.getElementById("countdown-label");
  const linksAreaEl = document.getElementById("links-area");
  const yearEl = document.getElementById("current-year");

  // Timer Elements
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  // Set current year in footer
  yearEl.textContent = new Date().getFullYear();

  // 1. Initialize static text from config
  const typeMessages = {
    regular: "定期的なメンテナンスを行っています。",
    emergency: "緊急のメンテナンスを行っています。",
    update: "システムの更新を行っています。",
  };

  const globalMessage = "ご不便をおかけしますが、完了まで少々お待ちください。";

  titleEl.textContent =
    MAINTENANCE_CONFIG.type === "emergency"
      ? "緊急メンテナンスのお知らせ"
      : "システムメンテナンスのお知らせ";
  reasonEl.innerHTML = `${typeMessages[MAINTENANCE_CONFIG.type]}<br>${globalMessage}`;
  if (MAINTENANCE_CONFIG.details && MAINTENANCE_CONFIG.details.trim() !== "") {
    detailEl.innerHTML = MAINTENANCE_CONFIG.details;
  } else {
    detailContainerEl.style.display = "none";
  }

  // Automatically format period from start/end times (skip if emergency)
  if (MAINTENANCE_CONFIG.type !== "emergency") {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const isSameYear = date.getFullYear() === now.getFullYear();

      return date.toLocaleString("ja-JP", {
        year: isSameYear ? undefined : "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    periodEl.textContent = `${formatDate(MAINTENANCE_CONFIG.startTime)} 〜 ${formatDate(MAINTENANCE_CONFIG.endTime)}`;
  } else {
    periodEl.textContent = "現在、作業状況を確認中です。";
    document.querySelector(".time-box").style.display = "none";
    document.getElementById("countdown-area").style.display = "none";
  }

  // 2. Initialize Badge style based on type
  let badgeClass = "badge-regular";
  let badgeIconName = "clock";
  let badgeText = "定期メンテナンス";

  if (MAINTENANCE_CONFIG.type === "emergency") {
    badgeClass = "badge-emergency";
    badgeIconName = "alert-triangle";
    badgeText = "緊急メンテナンス";
  } else if (MAINTENANCE_CONFIG.type === "update") {
    badgeClass = "badge-update";
    badgeIconName = "sparkles";
    badgeText = "アップデート";
  }

  badgeEl.className = `badge ${badgeClass}`;
  badgeEl.innerHTML = `<i data-lucide="${badgeIconName}"></i><span>${badgeText}</span>`;

  // 3. Dynamic Links Generation
  linksAreaEl.innerHTML = "";
  MAINTENANCE_CONFIG.links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "btn-link";

    if (link.isImage) {
      const img = document.createElement("img");
      img.src = link.icon;
      img.alt = link.name;
      img.style.height = "16px";
      img.style.width = "auto";
      img.style.objectFit = "contain";
      a.appendChild(img);
    } else {
      const icon = document.createElement("i");
      icon.setAttribute("data-lucide", link.icon);
      if (link.name === "お問い合わせ") {
        icon.style.width = "22px";
        icon.style.height = "22px";
      }
      a.appendChild(icon);
    }

    const span = document.createElement("span");
    span.textContent = link.name;

    a.appendChild(span);
    linksAreaEl.appendChild(a);
  });

  // Re-initialize lucide icons since we added dynamic elements
  setTimeout(() => {
    lucide.createIcons();
  }, 100);

  // 4. Time Progress & Countdown Updates
  const startTimestamp = new Date(MAINTENANCE_CONFIG.startTime).getTime();
  const endTimestamp = new Date(MAINTENANCE_CONFIG.endTime).getTime();

  function updateTimeStats() {
    const nowTimestamp = Date.now();

    // Calculate Progress Bar %
    let progressPercent = 0;
    if (nowTimestamp <= startTimestamp) {
      progressPercent = 0;
    } else if (nowTimestamp >= endTimestamp) {
      progressPercent = 100;
    } else {
      const totalDuration = endTimestamp - startTimestamp;
      const elapsedDuration = nowTimestamp - startTimestamp;
      progressPercent = Math.round((elapsedDuration / totalDuration) * 100);
    }

    progressBarEl.style.width = `${progressPercent}%`;
    progressPercentEl.textContent = `${progressPercent}%`;

    // Calculate Countdown
    let targetTime = endTimestamp;
    let isBeforeStart = false;

    if (nowTimestamp < startTimestamp) {
      // Maintenance hasn't started yet
      targetTime = startTimestamp;
      isBeforeStart = true;
      countdownLabelEl.textContent = "メンテナンス開始まで";
    } else {
      countdownLabelEl.textContent = "メンテナンス終了まで";
    }

    const timeLeft = targetTime - nowTimestamp;

    if (timeLeft <= 0 && !isBeforeStart) {
      // Maintenance has ended
      countdownAreaEl.innerHTML = `
                <div class="countdown-label" style="color: var(--badge-update); font-weight: bold;">
                    <i data-lucide="check-circle" style="display: inline-block; vertical-align: middle; margin-right: 4px; width: 16px; height: 16px;"></i>
                    メンテナンスは終了しました
                </div>
                <div style="margin-top: 12px;">
                    <button onclick="window.location.reload();" class="btn-link" style="border-color: var(--primary-color); color: var(--white); background-color: var(--primary-color); width: auto; display: inline-flex; justify-content: center; margin: 0 auto;">
                        <i data-lucide="refresh-cw"></i> ページを再読み込みする
                    </button>
                </div>
            `;
      lucide.createIcons();
      clearInterval(timerInterval);
      return;
    }

    // Format Time calculations
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Pad zeros
    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  // Run immediately and then start interval
  updateTimeStats();
  const timerInterval = setInterval(updateTimeStats, 1000);
});
