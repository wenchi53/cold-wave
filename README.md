> **寒流來了（cold-wave）**：這是 [A Dark Room](https://github.com/doublespeakgames/adarkroom)（doublespeakgames，MPL-2.0）的修改版，修改後的原始碼就在本 repo，授權與標頭都保留，詳見 [NOTICE.md](NOTICE.md)。目前是第 1 階段（手機能玩），遊戲名稱和劇情還沒改。

## 手機版改了什麼

- **不再擋手機**：拿掉 `script/engine.js` 把手機導到 `mobileWarning.html` 的判斷，手機直接進遊戲。
- **單欄版面**（`css/mobile.css`，寬度 939px 以下才生效，電腦版外觀不變）：
  通知在最上面、接著分頁、目前的面板、最下面是選單；只有目前的面板佔高度，所以不會左右捲動、面板不會疊在一起。
  面板寬度原本在 JS 寫死 700px，改成 `Engine.panelWidth()`（手機上等於畫面寬度），轉向或改視窗大小會重新排版。
- **按鈕**：手機上一列兩個、至少 44px 高；工人和行囊的 ▲▼ 加大成 34×23px。
- **提示（tooltip）**：按鈕的花費直接顯示在按鈕裡（點一下就是按下去，不用先點出提示）；
  倉庫、工人、補給、技能這類列表，點一下那一列顯示提示，再點一下或點別的地方收起。
- **事件視窗**固定在畫面內、太長可以捲動；戰鬥的武器／治療按鈕各自換行。
- **倉庫**原本是跟著面板滑動的浮動框，手機上改成接在目前面板的最下面。
- **世界地圖**：地圖字級自動縮到 61 欄剛好塞滿螢幕寬（約 9px），再加上畫面右下（手機是正下方）的**方向鍵**。
  也可以在地圖上滑動或點地圖（點在 @ 的哪一邊就往哪邊走）。走到畫面外會自動捲回來。
  選這個做法的理由：整張地圖都看得到才能規劃路線，雙指放大仍然可用；
  只顯示 @ 周圍一塊雖然字比較大，但要一直捲動、看不到全局。方向鍵比滑動好發現，也不會跟捲頁面打架
  （手機上只有從地圖開始的滑動才會移動）。
- **太空**（最後的小行星關）：700×700 的場地等比例縮小，用同一組方向鍵（按住移動）。
- **語言**：沒有 `?lang=` 也沒選過語言時，跟著瀏覽器語言；zh-TW／zh-Hant／zh-HK／zh-MO 自動用 `zh_tw`（`script/lang-detect.js`）。
  選單裡的「language.」在手機上點一下展開。存檔和語言照舊存在 localStorage。
- **其他**：加上 viewport meta、關掉雙擊放大（快速連點按鈕時會誤觸），雙指縮放保留。

## 本機怎麼跑

```sh
python3 -m http.server 8080
# 打開 http://localhost:8080/ （手機要在同一個網路，用電腦的 IP）
```

測試：

```sh
node --test tests/unit/*.test.mjs          # 語言偵測的單元測試，不用安裝任何東西
npm install --no-save @playwright/test@1.55.0
npx playwright install chromium webkit
npx playwright test                  # 需要先開著上面的 http.server
```

CI（`.github/workflows/test.yml`）在 iPhone 15（WebKit）、Pixel 7（Chromium）、Desktop Chrome 上跑：
開遊戲、關掉音效詢問、生火、添柴兩次、重新載入確認存檔還在，中英文各一次；
檢查沒有 console 錯誤、不會左右捲動、主要按鈕在畫面內沒被蓋住、手機上至少 44px 高；
另外直接給補給走一次村莊→路線→世界地圖，用方向鍵移動一格。截圖上傳成 artifact `screenshots`。

---

A Dark Room
===========
> "awake. head throbbing. vision blurry. come light the fire."

a minimalist text adventure game for your browser

[Click to play](http://adarkroom.doublespeakgames.com)

<table>
<tr><th colspan=4>Available Languages</tr>
<tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=zh_cn">Chinese (Simplified)</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=zh_tw">Chinese (Traditional)</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=en">English</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=fr">French</a></td>
</tr><tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=de">German</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=el">Greek</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=id">Indonesian</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=it">Italian</a></td>
</tr><tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=ja">Japanese</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=ko">Korean</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=nb">Norwegian</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=pl">Polish</a></td>
</tr><tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=pt">Portuguese</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=pt_br">Portuguese (Brazil)</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=ru">Russian</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=es">Spanish</a></td>
</tr><tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=sv">Swedish</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=th">Thai</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=tr">Turkish</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=uk">Ukrainian</a></td>
</tr><tr>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=vi">Vietnamese</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=lt_LT">Lithuanian</a></td>
	<td><a href="http://adarkroom.doublespeakgames.com/?lang=gl">Galician</a></td>
</tr>
</table>

or play the latest on [GitHub](http://doublespeakgames.github.io/adarkroom)

<a href="https://itunes.apple.com/us/app/a-dark-room/id736683061"><img src="http://i.imgur.com/DMdnDYq.png" height="50"></a>
<a href="https://play.google.com/store/apps/details?id=com.yourcompany.adarkroom"><img src="http://i.imgur.com/bLWWj4r.png" height="50"></a>
<a href="https://store.steampowered.com/app/2460660/A_Dark_Room/"><img src="https://i.imgur.com/yz6cnU0.png" height="50"></a>
