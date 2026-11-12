// node --test tests/unit/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const sandbox = {};
vm.runInNewContext(readFileSync(new URL('../../lang/langs.js', import.meta.url), 'utf8') + '\nthis.langs = langs;', sandbox);
vm.runInNewContext(readFileSync(new URL('../../script/lang-detect.js', import.meta.url), 'utf8'), sandbox);
const detect = (prefs) => sandbox.detectLang(prefs, sandbox.langs);

test('traditional Chinese browsers get zh_tw', () => {
	for (const tag of ['zh-TW', 'zh-tw', 'zh-Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO']) {
		assert.equal(detect([tag]), 'zh_tw', tag);
	}
});

test('simplified Chinese browsers get zh_cn', () => {
	for (const tag of ['zh', 'zh-CN', 'zh-Hans', 'zh-SG']) {
		assert.equal(detect([tag]), 'zh_cn', tag);
	}
});

test('region and case variants map to the table keys', () => {
	assert.equal(detect(['pt-BR']), 'pt_br');
	assert.equal(detect(['pt-PT']), 'pt');
	assert.equal(detect(['lt-LT']), 'lt_LT');
	assert.equal(detect(['lt']), 'lt_LT');
	assert.equal(detect(['ja-JP']), 'ja');
	assert.equal(detect(['en-US']), 'en');
});

test('first supported preference wins, unknown means default', () => {
	assert.equal(detect(['xx-YY', 'zh-TW', 'en']), 'zh_tw');
	assert.equal(detect(['xx']), null);
	assert.equal(detect([]), null);
	assert.equal(detect(undefined), null);
});
