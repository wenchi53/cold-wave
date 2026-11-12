/**
 * Picks a game language from the browser's preferred languages
 * (navigator.languages), e.g. zh-TW / zh-Hant / zh-HK -> zh_tw.
 * Returns a key of `available` (the `langs` table), or null for the
 * default (English).
 */
(function(root) {
	function detectLang(preferred, available) {
		var keys = {};
		for(var key in available) {
			keys[key.toLowerCase()] = key;
		}
		for(var i = 0; i < (preferred || []).length; i++) {
			var tag = String(preferred[i] || '').toLowerCase().replace(/-/g, '_');
			if(!tag) {
				continue;
			}
			if(tag === 'zh' || tag.indexOf('zh_') === 0) {
				// Traditional script: Taiwan, Hong Kong, Macau or explicit Hant
				tag = /^zh_(hant|tw|hk|mo)(_|$)/.test(tag) ? 'zh_tw' : 'zh_cn';
			}
			if(keys[tag]) {
				return keys[tag];
			}
			var base = tag.split('_')[0];
			if(keys[base]) {
				return keys[base];
			}
			// e.g. plain "lt" -> "lt_LT"
			for(var k in keys) {
				if(k.split('_')[0] === base) {
					return keys[k];
				}
			}
		}
		return null;
	}
	root.detectLang = detectLang;
})(this);
