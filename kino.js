/* Kino for Lampa v1.0.0. ES5. Independent plugin; no paid subscriptions included.
 * Catalog data: TMDB through the host Lampa application.
 * Open films: Blender Studio; attribution is displayed before playback.
 */
(function () {
    'use strict';
    if (window.lampaKinoPlugin) return;
    var state = { version: '1.0.0', started: false };
    window.lampaKinoPlugin = state;
    var L, $, tries = 0, returnController = 'menu';
    var films = [
  {
    "title": "Singularity",
    "year": 2026,
    "url": "https://video.blender.org/object-storage/web_videos/f91fd74e-a81f-48ec-b92b-c9504ac46e31-1080.mp4",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "credit": "(CC) Blender Foundation | studio.blender.org",
    "source": "https://studio.blender.org/projects/singularity/pages/licensing/",
    "watch": "https://video.blender.org/w/1ba07bbb-1456-4293-99a6-833fa450eda0",
    "duration": 391,
    "width": 2578,
    "height": 1080,
    "codec": "H.264 High level 5.0, AAC-LC stereo",
    "notes": "Official original release 2026-05-11; width 2578 and level 5.0 may fail older TV decoders. Currently only one progressive full-video MP4 in official API.",
    "note": "7 мин · оригинальная дорожка · требуется современный ТВ"
  },
  {
    "title": "Wing It!",
    "year": 2023,
    "url": "https://video.blender.org/object-storage/web_videos/1be4c93c-1fd2-498d-adc7-50126823033e-480.mp4",
    "fallbackUrl": "https://video.blender.org/object-storage/web_videos/1be4c93c-1fd2-498d-adc7-50126823033e-480.mp4",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "credit": "(CC) Blender Foundation | studio.blender.org",
    "source": "https://studio.blender.org/projects/wing-it/pages/licensing/",
    "watch": "https://video.blender.org/w/bd0084a5-1d26-4816-ab5e-1bad9e2fb990",
    "duration": 238,
    "width": 1920,
    "height": 1080,
    "codec": "H.264 High level 5.0, AAC-LC stereo",
    "notes": "480p fallback is H.264 High level 3.0, 854x480, AAC-LC stereo. Official 1080p level 5.0 may fail older TVs.",
    "note": "4 мин · без диалогов · 480p для совместимости"
  },
  {
    "title": "Sprite Fright",
    "year": 2021,
    "url": "https://video.blender.org/object-storage/web_videos/a69d68a5-a0e0-4a80-9d66-49f093c97aaf-720.mp4",
    "license": "CC BY 1.0 (as stated by the current official project About page)",
    "licenseUrl": "https://creativecommons.org/licenses/by/1.0/",
    "credit": "(CC) Blender Foundation | studio.blender.org",
    "source": "https://studio.blender.org/projects/sprite-fright/pages/about/",
    "watch": "https://video.blender.org/w/a69d68a5-a0e0-4a80-9d66-49f093c97aaf",
    "duration": 630,
    "width": 1718,
    "height": 720,
    "codec": "H.264 High level 3.1, AAC-LC stereo",
    "notes": "Official video description rates it PG-13; horror comedy, not preschool content. Other sites call it CC BY 4.0, but current primary About page explicitly says 1.0. Use CC BY generically if avoiding version ambiguity.",
    "note": "11 мин · английский · ужасы, PG-13"
  },
  {
    "title": "Spring",
    "year": 2019,
    "url": "https://video.blender.org/object-storage/web_videos/3d95fb3d-c866-42c8-9db1-fe82f48ccb95-720.mp4",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "credit": "© Blender Foundation | cloud.blender.org/spring",
    "source": "https://studio.blender.org/projects/spring/pages/about/",
    "watch": "https://video.blender.org/w/3d95fb3d-c866-42c8-9db1-fe82f48ccb95",
    "duration": 464,
    "width": 1718,
    "height": 720,
    "codec": "H.264 High level 3.1, AAC-LC stereo",
    "notes": "No dialogue. Official description audience 6+ PG. PeerTube generic licence enum incorrectly/differently says ShareAlike; current dedicated primary About grant explicitly links CC BY 4.0.",
    "note": "8 мин · без диалогов · 6+ по описанию автора"
  },
  {
    "title": "Sintel",
    "year": 2010,
    "url": "https://video.blender.org/object-storage/web_videos/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40-720.mp4",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
    "credit": "© copyright Blender Foundation | www.sintel.org",
    "source": "https://durian.blender.org/sharing/",
    "watch": "https://video.blender.org/w/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40",
    "duration": 888,
    "width": 1688,
    "height": 720,
    "codec": "H.264 High level 3.1, AAC-LC stereo",
    "notes": "Original English dialogue, dramatic fantasy short.",
    "note": "15 мин · английский · драматическое фэнтези"
  },
  {
    "title": "Big Buck Bunny",
    "year": 2008,
    "url": "https://video.blender.org/object-storage/web_videos/bf1f3fb5-b119-4f9f-9930-8e20e892b898-720.mp4",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
    "credit": "© 2008 Blender Foundation / www.bigbuckbunny.org",
    "source": "https://peach.blender.org/about/",
    "watch": "https://video.blender.org/w/bf1f3fb5-b119-4f9f-9930-8e20e892b898",
    "duration": 596,
    "width": 1280,
    "height": 720,
    "codec": "H.264 High level 3.1, AAC-LC 5.1",
    "notes": "Official encode has six audio channels; unusual TVs might need stereo downmix/external player. No dialogue.",
    "note": "10 мин · без диалогов · звук 5.1"
  }
];

    function notify(message) { L.Noty.show(message); }
    function restore() { L.Controller.toggle(returnController || 'content'); }
    function safe(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function dateString(date) {
        function pad(n) { return n < 10 ? '0' + n : String(n); }
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }
    function choose(title, items, back) {
        L.Select.show({
            title: title, items: items,
            onSelect: function (item) { if (item.run) item.run(); },
            onBack: back || home
        });
    }
    function catalog(kind) {
        if (!L.Api || !L.Api.sources || !L.Api.sources.tmdb) {
            notify('Источник TMDB недоступен в этой версии Lampa.');
            home();
            return;
        }
        var today = new Date();
        var since = new Date(today.getTime());
        since.setDate(since.getDate() - 365);
        var filter = {
            'primary_release_date.gte': dateString(since),
            'primary_release_date.lte': dateString(today),
            include_adult: 'false', include_video: 'false',
            sort_by: kind === 'popular' ? 'popularity.desc' : 'primary_release_date.desc'
        };
        if (kind === 'animation') filter.with_genres = '16';
        L.Activity.push({
            component: 'category_full', source: 'tmdb', url: 'discover/movie', page: 1,
            title: kind === 'animation' ? 'Новые мультфильмы' : kind === 'popular' ? 'Популярные новинки' : 'Последние релизы',
            filter: filter
        });
    }
    function playFilm(film) {
        restore();
        var playlist = films.map(function (item) { return { title: item.title, url: item.url }; });
        L.Player.play({ title: film.title, url: film.url, playlist: playlist });
        if (L.Player.playlist) L.Player.playlist(playlist);
    }
    function filmInfo(film) {
        choose(film.title, [
            { title: 'Смотреть', subtitle: safe(film.year + ' · ' + film.note), run: function () { playFilm(film); } },
            { title: 'Авторы и лицензия', subtitle: safe(film.credit + ' · ' + film.license), run: function () {
                choose('Авторы и лицензия', [
                    { title: safe(film.credit), subtitle: safe(film.license), run: function () { filmInfo(film); } },
                    { title: 'Условия лицензии', subtitle: safe(film.licenseUrl), run: function () { filmInfo(film); } },
                    { title: 'Страница фильма', subtitle: safe(film.source), run: function () { filmInfo(film); } },
                    { title: 'Назад к фильму', run: function () { filmInfo(film); } }
                ], function () { filmInfo(film); });
            } }
        ], openFilms);
    }
    function openFilms() {
        choose('Смотреть сейчас · открытые фильмы', films.map(function (film) {
            return { title: film.title, subtitle: safe(film.year + ' · ' + film.note + ' · ' + film.credit + ' · ' + film.license),
                run: function () { filmInfo(film); } };
        }));
    }
    function directUrl(value) {
        value = String(value || '').replace(/^\s+|\s+$/g, '');
        if (!/^https?:\/\/[^\s<>"']+$/i.test(value)) return null;
        return value;
    }
    function inputLink() {
        if (!L.Input || !L.Input.edit) { notify('Ввод ссылок недоступен в этой версии Lampa.'); home(); return; }
        L.Input.edit({ title: 'Прямая ссылка на видео MP4 или HLS', value: '', free: true, nosave: true }, function (value) {
            var url = directUrl(value);
            if (!value) { home(); return; }
            if (!url) { notify('Введите прямую ссылку, начинающуюся с https:// или http://'); home(); return; }
            choose('Открыть ваше видео', [
                { title: 'Воспроизвести', subtitle: 'Прямая ссылка должна быть доступна вашему телевизору', run: function () {
                    restore(); L.Player.play({ title: 'Ваше видео', url: url, playlist: [] });
                    if (L.Player.playlist) L.Player.playlist([]);
                } },
                { title: 'Отмена', run: home }
            ]);
        });
    }
    function about() {
        choose('Кино для Lampa · 1.0.0', [
            { title: 'Новинки и мультфильмы', subtitle: 'Каталог TMDB за последние 365 дней. Даты пересчитываются при открытии.', run: home },
            { title: 'Просмотр новинок', subtitle: 'Для полного фильма нужен ваш источник просмотра. Плагин не предоставляет подписки.', run: home },
            { title: 'Смотреть сейчас', subtitle: 'Открытые фильмы Blender с прямыми видеоссылками. Язык и возрастные особенности указаны в списке.', run: openFilms },
            { title: 'Если видео не запускается', subtitle: 'Проверьте интернет и выбранный плеер в настройках Lampa. Доступность источников зависит от сети и региона.', run: home }
        ]);
    }
    function home() {
        choose('Кино · новинки', [
            { title: 'Последние релизы', subtitle: 'Фильмы за год, сначала самые свежие · каталог', run: function () { catalog('latest'); } },
            { title: 'Популярные новинки', subtitle: 'Фильмы за год по популярности · каталог', run: function () { catalog('popular'); } },
            { title: 'Новые мультфильмы', subtitle: 'Свежие анимационные фильмы · каталог', run: function () { catalog('animation'); } },
            { title: 'Смотреть сейчас', subtitle: 'Открытые фильмы Blender · полные версии', run: openFilms },
            { title: 'Открыть свою видеоссылку', subtitle: 'Прямой MP4 или HLS из доступного вам источника', run: inputLink },
            { title: 'О плагине и просмотре', run: about }
        ], restore);
    }
    function launch() {
        var active = L.Controller.enabled ? L.Controller.enabled() : null;
        returnController = active && active.name && active.name !== 'select' ? active.name : 'menu';
        home();
    }
    function start() {
        if (state.started) return;
        if (!L.Select || !L.Activity || !L.Player || !L.Controller) return;
        var icon = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
        if (L.Menu && L.Menu.addButton) L.Menu.addButton(icon, 'Кино · новинки', launch);
        else if ($) {
            var list = $('.menu .menu__list').eq(0);
            if (!list.length) return;
            var item = $('<li class="menu__item selector lampa-kino-menu"><div class="menu__ico">' + icon + '</div><div class="menu__text">Кино · новинки</div></li>');
            item.on('hover:enter', launch);
            list.append(item);
        } else return;
        state.started = true;
        notify('Кино · новинки: плагин подключён');
    }
    function boot() {
        L = window.Lampa; $ = window.jQuery || window.$;
        if (!L || !L.Listener) {
            if (++tries < 120) window.setTimeout(boot, 500);
            return;
        }
        if (window.appready) start();
        else L.Listener.follow('app', function (event) { if (event.type === 'ready') start(); });
    }
    boot();
}());
