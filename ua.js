/*
 * UA Aggregator for Lampa 1.0.0 | 2026-09-08 | ES5
 * One movie-card entry point for Online Mod and installed video providers.
 * Online Mod is loaded from its author's immutable revision, not copied here.
 * Availability of a plugin is not proof of availability of a movie or voice.
 * Sources/review: ua-sources.md alongside this file.
 */
(function () {
    'use strict';
    if (window.lampaUaAggregator) return;
    var state = { version: '1.0.0', started: false, loading: false, restartRequired: false, lastError: '', engine: '' };
    window.lampaUaAggregator = state;
    var L, $, attempts = 0, sequence = 0, lastMovie = null, returnTo = 'content';
    var MOD_URL = 'https://cdn.jsdelivr.net/gh/nb557/plugins@5cd0cb37d2ca0321acf3471ad5e2048567ecdfef/online_mod.js';
    var MOD_INTEGRITY = 'sha384-Ju5poKIRm/gJEFvqSb5DtL/5cEAuYoTbqvUCqTZ0ra+LGGFevn544HGBzSgpkpcB';
    var UA_RE = /укра[їи]н|ukrain|(^|[\s([_-])(ua|uk|ukr)([\s)\]_-]|$)|dniprofilm|дн[іи]про.?ф[іи]льм/i;
    var VOICE_RE = /озвуч|перевод|переклад|voice|translation|audio|аудіо|аудио/i;
    var PROVIDERS = [
        { id: 'rezka2', name: 'HDRezka', note: 'Переклади залежать від фільму; частина потребує доступу до сервісу' },
        { id: 'filmix', name: 'Filmix', note: 'Може знадобитися власний токен Filmix' },
        { id: 'cdnvideohub', name: 'CDNVideoHub', note: 'Доступність і переклади залежать від фільму' },
        { id: 'kodik', name: 'Kodik', note: 'Переважно аніме та серіали; мови залежать від релізу' }
    ];

    function escape(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function notify(value) { if (L.Noty) L.Noty.show(value); }
    function restore() { L.Controller.toggle(returnTo || 'content'); }
    function active() { return L.Activity.active ? L.Activity.active() : null; }
    function rememberController() {
        var value = L.Controller.enabled ? L.Controller.enabled() : null;
        returnTo = value && value.name && value.name !== 'select' ? value.name : 'content';
    }
    function select(title, items, back) {
        L.Select.show({ title: title, items: items, onSelect: function (item) {
            if (item.run) item.run();
        }, onBack: back || restore });
    }
    function manifests() {
        var list = L.Manifest && L.Manifest.plugins;
        if (Object.prototype.toString.call(list) !== '[object Array]') return [];
        return list.filter(function (item) {
            return item && item.type === 'video' && item.component !== 'ua_aggregator' &&
                (typeof item.onContextLauch === 'function' || typeof item.onContextLaunch === 'function');
        });
    }
    function modManifest() {
        var found = null;
        manifests().forEach(function (item) { if (item.component === 'online_mod') found = item; });
        return found;
    }
    function copy(source) {
        var result = {};
        Object.keys(source || {}).forEach(function (key) {
            if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') result[key] = source[key];
        });
        return result;
    }
    function movieCopy(movie) {
        var card = copy(movie);
        card.title = card.title || card.name || '';
        card.original_title = card.original_title || card.original_name || card.title;
        return card;
    }
    function launchManifest(manifest, movie) {
        if (!movie || !(movie.title || movie.name)) { notify('Спочатку відкрийте картку фільму чи серіалу'); restore(); return; }
        state.engine = manifest.component || '';
        restore();
        try {
            (manifest.onContextLauch || manifest.onContextLaunch).call(manifest, movieCopy(movie));
        } catch (error) {
            state.lastError = 'Не вдалося відкрити ' + (manifest.name || manifest.component);
            notify(state.lastError);
        }
    }
    function chooseModSource(provider, movie) {
        if (!provider) return;
        // This is the source the user explicitly selected. Preserve other movies' choices.
        L.Storage.set('online_mod_balanser', provider.id);
        if (movie && movie.id != null && !/^(?:__proto__|constructor|prototype)$/.test(String(movie.id))) {
            var history = copy(L.Storage.get('online_mod_last_balanser', {}));
            history[String(movie.id)] = provider.id;
            L.Storage.set('online_mod_last_balanser', history);
        }
    }
    function loadMod(done) {
        if (modManifest()) { done(true); return; }
        if (state.loading) { notify('Online Mod ще підключається'); return; }
        if (state.restartRequired) { notify(state.lastError); done(false); return; }
        // Respect an installed copy even if it has no usable launch manifest.
        if (L.Component && L.Component.get && L.Component.get('online_mod')) {
            state.lastError = 'Встановлений Online Mod не надав спосіб запуску. Оновіть його та перезапустіть Lampa.';
            notify(state.lastError); done(false); return;
        }
        state.loading = true; state.lastError = '';
        var script = document.createElement('script'), timer, settled = false;
        function finish(ok, message) {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            state.loading = false;
            script.onload = null; script.onerror = null;
            if (!ok) {
                state.lastError = message;
                if (script.parentNode) script.parentNode.removeChild(script);
                notify(message);
            }
            done(ok);
        }
        script.type = 'text/javascript'; script.async = true;
        script.crossOrigin = 'anonymous'; script.referrerPolicy = 'no-referrer';
        script.integrity = MOD_INTEGRITY; script.src = MOD_URL;
        script.onload = function () {
            if (!modManifest()) state.restartRequired = true;
            finish(!!modManifest(), 'Online Mod завантажився, але не зареєструвався. Перезапустіть Lampa.');
        };
        script.onerror = function () {
            finish(false, 'Не вдалося завантажити Online Mod. Перевірте інтернет і доступ до jsDelivr.');
        };
        timer = window.setTimeout(function () {
            state.restartRequired = true;
            finish(false, 'Час підключення Online Mod вичерпано. Перезапустіть Lampa перед повтором.');
        }, 25000);
        (document.head || document.body).appendChild(script);
    }
    function openMod(provider, movie) {
        if (state.loading && !modManifest()) { restore(); notify('Online Mod ще підключається. Зачекайте завершення.'); return; }
        var request = ++sequence, origin = active();
        restore();
        if (!modManifest()) notify('Підключаємо Online Mod…');
        loadMod(function (ok) {
            if (!ok || request !== sequence) return;
            if (active() !== origin) { notify('Online Mod підключено. Відкрийте «Дивитися · UA» у потрібній картці.'); return; }
            chooseModSource(provider, movie);
            launchManifest(modManifest(), movie);
        });
    }
    function listedPlugins() {
        var seen = {}, items = [];
        manifests().forEach(function (plugin) {
            var id = '$' + (plugin.component || '') + '|' + (plugin.name || '');
            if (plugin.component === 'online_mod' || seen[id]) return;
            seen[id] = true;
            items.push(plugin);
        });
        return items.map(function (item, index) { return { item: item, index: index }; }).sort(function (a, b) {
            var first = UA_RE.test(a.item.name + ' ' + a.item.description) ? 0 : 1;
            var second = UA_RE.test(b.item.name + ' ' + b.item.description) ? 0 : 1;
            return first - second || a.index - b.index;
        }).map(function (entry) { return entry.item; });
    }
    function showSources(movie) {
        if (!movie) { help(); return; }
        lastMovie = movie;
        var items = [];
        listedPlugins().forEach(function (plugin) {
            items.push({ title: escape(plugin.name || plugin.component), subtitle: 'Встановлений відеоплагін', run: function () { launchManifest(plugin, movie); } });
        });
        PROVIDERS.forEach(function (provider) {
            items.push({ title: provider.name, subtitle: provider.note + ' · Online Mod', run: function () { openMod(provider, movie); } });
        });
        items.push({ title: 'Усі джерела Online Mod', subtitle: 'Додаткові джерела, які доступні саме на вашому пристрої', run: function () { openMod(null, movie); } });
        items.push({ title: 'UA-Serials, UAKino, Eneyida — стан підключення', subtitle: 'Вимоги та результати перевірки', run: sourceStatus });
        items.push({ title: 'Налаштування й допомога', run: help });
        select('Дивитися · UA — ' + (movie.title || movie.name || ''), items);
    }
    function backToMovie() { if (lastMovie) showSources(lastMovie); else restore(); }
    function sourceStatus() {
        select('Українські джерела · перевірка 08.09.2026', [
            { title: 'UA-Serials', subtitle: 'Робочий відкритий TV-плагін не підтверджено. Знайдені JS застаріли; UAFilms потребує ключа або перевірки в браузері.', run: backToMovie },
            { title: 'Eneyida / UAKino / KinoUkr / UAFilm', subtitle: 'Є модулі Lampac. Потрібен доступний сервер; відкриті тестові адреси дали помилки або запит авторизації.', run: backToMovie },
            { title: 'Ваш встановлений Lampac або UA-плагін', subtitle: 'З’явиться у нашому списку, якщо підтримує стандартний запуск відеоплагінів Lampa.', run: backToMovie },
            { title: 'HDRezka та інші джерела Online Mod', subtitle: 'Код і завантаження перевірені. Конкретний фільм, переклад і доступ на вашому ТВ ще треба перевірити.', run: backToMovie },
            { title: 'Назад', run: backToMovie }
        ], backToMovie);
    }
    function help() {
        select('Наш UA-агрегатор · 1.0.0', [
            { title: 'Як дивитися', subtitle: 'Відкрийте фільм або серіал → «Дивитися · UA» → джерело → потрібний переклад.', run: backToMovie },
            { title: 'Українські переклади першими: ' + (L.Storage.get('ua_aggregator_prefer_uk', true) ? 'так' : 'ні'),
                subtitle: 'Сортує список перекладів, коли його відкрито. Не перемикає звукову доріжку автоматично.', run: function () {
                    L.Storage.set('ua_aggregator_prefer_uk', !L.Storage.get('ua_aggregator_prefer_uk', true)); help();
                } },
            { title: 'Статус Online Mod', subtitle: modManifest() ? 'Підключено' : state.loading ? 'Підключається…' : state.lastError || 'Завантажиться при першому виборі джерела', run: help },
            { title: 'Доступ до сервісів', subtitle: 'Агрегатор не надає підписок. Авторизація й токени налаштовуються у відповідному відеоплагіні.', run: backToMovie },
            { title: 'Перевірені та відхилені кандидати', subtitle: 'UA-Serials, UAKino, Eneyida, Lampac, UAFilms', run: sourceStatus },
            { title: 'Назад', run: backToMovie }
        ], backToMovie);
    }
    function prioritizeVoices(event) {
        if (!L.Storage.get('ua_aggregator_prefer_uk', true)) return;
        var current = active(), menu = event && event.active;
        if (!current || !state.engine || current.component !== state.engine || !menu || !VOICE_RE.test(String(menu.title || ''))) return;
        if (Object.prototype.toString.call(menu.items) !== '[object Array]') return;
        // Keep separators, action rows and provider-owned indexes untouched.
        var slots = [], rows = [];
        menu.items.forEach(function (item, index) {
            if (!item || item.separator || item.reset || (item.index == null && item.id == null)) return;
            slots.push(index);
            rows.push({ item: item, order: index, rank: UA_RE.test(String(item.title || '') + ' ' + String(item.subtitle || '') + ' ' + String(item.language || '')) ? 0 : 1 });
        });
        rows.sort(function (a, b) { return a.rank - b.rank || a.order - b.order; });
        slots.forEach(function (slot, index) { menu.items[slot] = rows[index].item; });
    }
    function onFull(event) {
        if (!event || event.type !== 'complite' || !event.data || !event.data.movie) return;
        var body = event.body;
        if (!body && event.object && event.object.activity) body = event.object.activity.render();
        if (!body || body.find('.view--ua-aggregator').length) return;
        var host = body.find('.buttons--container');
        if (!host.length) host = body.find('.full-start-new__buttons');
        if (!host.length) return;
        var button = $('<div class="full-start__button selector view--ua-aggregator"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg><span>Дивитися · UA</span></div>');
        button.on('hover:enter', function () { rememberController(); showSources(event.data.movie); });
        host.append(button);
    }
    function start() {
        if (state.started || !$ || !L.Select || !L.Controller) return;
        state.started = true;
        L.Listener.follow('full', onFull);
        if (L.Select.listener && L.Select.listener.follow) L.Select.listener.follow('preshow', prioritizeVoices);
        if (L.Manifest) L.Manifest.plugins = {
            type: 'video', name: 'Дивитися · UA', version: state.version, component: 'ua_aggregator',
            onContextMenu: function () { return { name: 'Дивитися · UA', description: 'Єдиний вибір джерел' }; },
            onContextLauch: function (movie) { rememberController(); showSources(movie); }
        };
        if (L.Menu && L.Menu.addButton) L.Menu.addButton('<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>', 'UA-агрегатор', function () { rememberController(); lastMovie = null; help(); });
        var current = active();
        if (current && current.component === 'full' && current.activity) {
            var card = current.card || current.movie;
            if (card) onFull({ type: 'complite', body: current.activity.render(), data: { movie: card } });
        }
        notify('UA-агрегатор підключено. Відкрийте картку фільму.');
    }
    function boot() {
        L = window.Lampa; $ = window.jQuery || window.$;
        if (!L || !L.Listener) { if (++attempts < 120) window.setTimeout(boot, 500); return; }
        if (window.appready) start();
        else L.Listener.follow('app', function (event) { if (event.type === 'ready') start(); });
    }
    boot();
}());
