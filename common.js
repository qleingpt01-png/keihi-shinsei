// ------------------------------------------------------------
// 経費申請データの共有ストレージ（GAS / スプレッドシート連携）
// ------------------------------------------------------------
// デプロイしたGASのWebアプリのURLを設定してください
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbythW6m2tKZ1h0S4Dq5nKMECxT1njdDaIUUwThoj6qjPgx8LRxHmzXGR2o3BnBmJGyt/exec";

// GASとの通信を行う共通ヘルパー関数
async function fetchFromGas(payload) {
  if (!GAS_WEB_APP_URL) {
    throw new Error("GAS_WEB_APP_URL が設定されていません。common.js を確認してください。");
  }
  const res = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || (data && data.error)) {
    throw new Error((data && data.error) ? (data.error.message || data.error) : "GASとの通信に失敗しました。");
  }
  return data;
}

const statusLabel = { pending: '申請中', approved: '承認済み', rejected: '却下' };
const statusClass = { pending: 'stamp-pending', approved: 'stamp-approved', rejected: 'stamp-rejected' };

async function loadApplications() {
  try {
    return await fetchFromGas({ action: "get" });
  } catch (e) {
    console.error('データの読み込みに失敗しました', e);
    showToast("データの取得に失敗しました: " + e.message, true);
    return [];
  }
}

function getSeedApplications() {
  return [
    {
      id: 1, name: '山田 太郎', department: '営業部', date: '2026-07-10',
      amount: 12500, store: 'JR東海', purpose: '大阪出張', account: '交通費',
      receipt: null, receiptIsImage: false, status: 'approved',
      submittedAt: new Date().toISOString()
    },
    {
      id: 2, name: '佐藤 花子', department: 'マーケティング部', date: '2026-07-15',
      amount: 1800, store: 'スターバックス', purpose: '取引先との打ち合わせ', account: '会議飲食費',
      receipt: null, receiptIsImage: false, status: 'pending',
      submittedAt: new Date().toISOString()
    },
    {
      id: 3, name: '鈴木 一郎', department: '開発部', date: '2026-07-18',
      amount: 8200, store: 'ジュンク堂書店', purpose: '技術書籍の購入', account: '新聞図書費',
      receipt: null, receiptIsImage: false, status: 'rejected',
      submittedAt: new Date().toISOString()
    }
  ];
}

async function saveApplications(apps) {
  // スプレッドシート連携化に伴い非推奨（個別の追加・更新・削除APIを使用します）
  console.warn("saveApplications は非推奨です。");
  return true;
}

function nextApplicationId(apps) {
  return apps.reduce((max, a) => Math.max(max, a.id), 0) + 1;
}

function formatYen(n) {
  return '¥' + Number(n).toLocaleString('ja-JP');
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

let toastTimer = null;
function showToast(msg, isError) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.toggle('err', !!isError);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
