// ==UserScript==
// @name            Adguard for VK posts
// @description     Userscript for blocking sponsored posts in VK groups. Based on http://pastebin.com/JXHpU0ku
// @description:ru  Расширение для блокирования рекламных постов в ВК. Основано на http://pastebin.com/JXHpU0ku
// @author          Adguard
// @version         1.0.2
// @include         *://vk.com/*
// @run-at          document-end
// @downloadURL     https://github.com/AdguardTeam/Userscripts/raw/master/adguardForVk/adguard-vk.user.js
// @updateURL       https://github.com/AdguardTeam/Userscripts/raw/master/adguardForVk/adguard-vk.user.js
// @grant           none
// ==/UserScript==

(function () {

    'use strict';
    
    // Ad words groups.
    // Each item describes a one rule with `and` boolean logic, so rule '[1,2,3]' will hide posts 
    // that contains '1', '2' and '3' irrespective of order.
    // Original text will be lowercased before search operation, so each rule should be in lowercase to work.
    var junkGroups = [
        ['vk.cc/'],
        ['$link-text=покaзaть пoлнocтью'],
        ['$link-text=продолжение'],
        ['$link-text=кликай'],
        ['$link-text=смотреть'],
        ['$link-text=тебе сюда'],
        ['$link-text=я парень'],
        ['$link-text="•"'],
        ['$repost-author=max twain'],
        ['$repost-author=nine store'],
        ['$repost-author=стоп бред!'],
        ['$repost-author=красное&белое 18+'],
        ['$repost-author=яуза парк'],
        ['$repost-author=дисконт'],
        ['$repost-author=fisher-price'],
        ['$repost-author=adidas originals'],
        ['$repost-author=drinkenergy.ru'],
        ['$repost-author=history porn'],
        ['$repost-author=apple room'],
        ['$repost-text=жми '],
        ['подпишись'],
        ['подписывайся'],
        ['подписывайтесь'],
        ['подписываемся'],
        ['уже подписался'],
        ['подписался на'],
        ['подписалась на'],
        ['не подписан'],
        ['присоединяйтесь к нам'],
        ['присоединяй', 'только самое полезное'],
        ['присоединяйтесь', 'vk.com/'],
        ['заказать сейчас'],
        ['заказать', 'акци'],
        ['заказать', 'здесь'],
        ['для заказа писать'],
        ['успей заказать'],
        ['смотреть ответ'],
        ['узнать ответ'],
        ['ответ в источнике'],
        ['результат в источнике'],
        ['смотри сюда'],
        ['смотреть фото в'],
        ['читать продолжени'],
        ['читать все'],
        ['подробности здесь'],
        ['тут подробности'],
        ['узнайте подробности'],
        ['узнать подробности в'],
        ['узнать больше', 'зарегистрироваться'],
        ['инфа здесь'],
        ['читать полностью'],
        ['читать далее'],
        ['читайте далее'],
        ['прoчитaть пoлнocтью'],
        ['розыгрыш', 'репост'],
        ['розыгрыш', 'условия'],
        ['конкурс', 'репост'],
        ['конкурс', 'рекомендую'],
        ['репост', 'если'],
        ['за репост', 'к карме'],
        ['максимальный репост'],
        ['нашёл', 'рекомендую'],
        ['набира', 'лайков', 'сколько набер'],
        ['набира', 'лайков', 'заслужива'],
        ['распродажа'],
        ['скачaть', 'android'],
        ['скачaть', 'ios'],
        ['только у нас'],
        ['успей купить'],
        ['заработок', 'онлайн'],
        ['зарабатыва', 'в день'],
        ['зарабатыва', 'в месяц'],
        ['зарабатыва', 'вступай'],
        ['заработать', 'ответ'],
        ['заработал', 'в день'],
        ['заработал', 'в месяц'],
        ['заработал сам'],
        ['эффективный способ', 'заработка'],
        ['регистрируй', 'зарабатывай'],
        ['зарабатыв', 'ставк'],
        ['гарантированные бонусы'],
        ['получаю', 'в день'],
        ['получай выгоду'],
        ['играй онлайн'],
        ['испытай', 'удачу'],
        ['шикарный подарок'],
        ['по лучшей цене'],
        ['акция', 'цена'],
        ['акция', 'супер'],
        ['правила акции'],
        ['условия акции'],
        ['невероятная акция'],
        ['эксклюзивные бонусы'],
        ['по', 'низким ценам'],
        ['супер предложение'],
        ['оформить заказ'],
        ['оформите заказ'],
        ['закажите сейчас'],
        ['закажи сейчас'],
        ['успейте оформить'],
        ['успей оформить'],
        ['цена', 'доставка'],
        ['суперцен'],
        ['доставка', 'заказать'],
        ['оплата при получении'],
        ['проверь', 'прямо сейчас'],
        ['проверить себя', 'здесь', 'http'],
        ['заходи на'],
        ['заходи в паблик'],
        ['от подписчика', 'добавляйтесь'],
        ['только подумайте', 'игра'],
        ['группа номер один'],
        ['группа', 'знает все', 'советуем ознакомиться'],
        ['перейти к просмотру'],
        ['смотрите в источнике'],
        ['смотреть в источнике'],
        ['смотри в источнике'],
        ['полезное сообщество'],
        ['нас рекомендуют'],
        ['у нас интересно'],
        ['у нас весело'],
        ['паблик', 'сложно оторваться'],
        ['вступай', 'паблик'],
        ['вступай в ряды'],
        ['го к нам'],
        ['рекомендую зайти'],
        ['всем советую'],
        ['ищу', 'добавляйтесь'],
        ['добавляйте в друзья'],
        ['жми на фото'],
        ['жми сюда'],
        ['учёнными доказано'],
        ['за кого ты'],
        ['заходи', 'голосуй'],
        ['загляни к нам'],
        ['iphone', 'репост'],
        ['iphone', 'бесплатно'],
        ['скачать', 'iphone', 'android'],
        ['бесплатно на'],
        ['бесплатный', 'за две недели'],
        ['гороскоп на'],
        ['узнай', 'гороскоп'],
        ['пожалуй', 'самый'],
        ['скачать на'],
        ['скачай', 'удиви'],
        ['успей скачать'],
        ['скачать', 'в itunes'],
        ['смотреть все'],
        ['скидк'],
        ['некоммерческ', 'идеи', 'подробнее'],
        ['необычны', 'доставка', 'подробнее'],
        ['подробнее в приложении'],
        ['отправлено через приложение'],
        ['анонимные знакомства'],
        ['только для совершеннолетних'],
        ['похудеть', 'реально'],
        ['заказывал тут'],
        ['заказывала тут'],
        ['купил тут'],
        ['купила тут'],
        ['егэ', 'присоединяйтесь'],
        ['бесплатное образование'],
        ['как привлечь клиентов'],
        ['купить полис'],
        ['для старта', 'бизнеса'],
        ['портал', 'аренды'],
        ['однажды', 'может пpоизoйти c тoбoй'],
        ['смoтреть рецепт'],
        ['смoтреть', 'рецепты'],
        ['смотри', 'удивляйся'],
        ['просто попробуй'],
        ['вдохните жизнь'],
        ['начни играть'],
        ['начать играть'],
        ['затягивает', 'играть'],
        ['начинайте экономить'],
        ['посмотреть по ссылке'],
        ['смотреть здесь'],
        ['просто нажми'],
        ['диплом', 'поступить', 'подробнее'],
        ['выиграть подарки'],
        ['одевайтесь в'],
        ['перевернут', 'представление'],
        ['не для слабонервных', 'не смотреть'],
        ['новая коллекция', 'доставка'],
        ['доставка', 'бесплатная', 'заказ'],
        ['курс', 'записывайтесь'],
        ['сохраняй', 'на стенку'],
        ['получи', 'кросс'],
        ['подать заявку'],
        ['бизнес-идея'],
        ['круто', 'добавить нечего'],
        ['новейший хит'],
        ['только сегодня', 'цена'],
        ['огромный выбор'],
        ['заказ', 'в подарок'],
        ['жилье посуточно'],
        ['подписыва', 'там смешно'],
        ['рекоменду', 'подписаться'],
        ['подробнее на стене'],
        ['легко и просто', 'смотреть полностью'],
        ['суперэффективн', 'тренировк'],
        ['советуем, чтобы не быть обманутыми'],
        ['советуем', 'подписаться'],
        ['уникальн', 'подойдет всем'],
        ['шок', 'бесплатно'],
        ['регистрация', 'за пару секунд'],
        ['хочешь', 'стоит заглянуть'],
        ['выиграл', 'казино'],
        ['прямо сейчас', 'бесплатно'],
        ['не пожалеете', 'групп'],
        ['новый тизер', 'шикарны'],
        ['полезный сервис', 'геймер'],
        ['взломать блогеров'],
        ['открытие китая с евгением'],
        ['бесплатный билет'],
        ['пройди тест', 'узнай'],
        ['нет времени объяснять', 'тебя ждет'],
        ['ломаем стереотипы', 'вместе'],
        ['присоединяйся', 'ждет тебя'],
        ['взорвала интернет', 'подробнее'],
        ['куплен', 'здесь', 'цена'],
        ['заказ', 'подробности'],
        ['fastppc.net'],
        ['amsterdamday.ru'],
        ['бесплатный мастер-класс'],
        ['курс', 'условия', 'подробности'],
        ['курс', 'абсолютно бесплатно'],
        ['добавляйтесь в друзья'],
        ['для заказа пишите'],
        ['телефон', 'наша группа'],
        ['выигрывайте приз'],
        ['читaть продолжение'],
        ['заказать', 'на нашем сайте'],
        ['нашли', 'рекомендуем'],
        ['підписуйся'],
        ['підписуйтесь'],
        ['підпишись'],
        ['вступай', 'паблік'],
        ['хочется', 'новенького'],
        ['розіграш'],
        ['знижк'],
        ['дивитися відповідь'],
        ['акція', 'ціна'],
        ['акція', 'супер'],
        ['розіграш', 'репост'],
        ['ціна', 'супер'],
        ['цін', 'придбати'],
        ['завантажуйте безкоштовно'],
        ['вигравай', 'iphone'],
        ['скачай', 'виграй'],
        ['ловіть фішку'],
        ['тільки у нас'],
        ['для покупки пишіть'],
        ['шукаєш', 'заробіток'],
        ['оформити замовлення'],
        ['доставка', 'замовити'],
        ['замовляйте зараз'],
        ['замовляй', 'на сайті'],
        ['долучайтесь', 'буде цікаво', 'спільнота'],
        ['додаток', 'заробив'],
        ['пропоную послуги']
    ];

    // Check post to contain one or more 'junkGroups'.
    function isJunk(post) {
        var postTextDiv = post.querySelector('.wall_post_text');
        if (postTextDiv) {
            var postText = postTextDiv.textContent.toLowerCase();
            var repostDiv = post.querySelector('.copy_quote');
            if (repostDiv) {
                var repostAuthorA = repostDiv.querySelector('.copy_author');
                var repostAuthor = '"' + repostAuthorA.textContent.toLowerCase() + '"';
                var repostTextDiv = repostDiv.querySelector('.wall_post_text');
                if (repostTextDiv) {
                    if (postTextDiv != repostTextDiv) {
                        var repostText = repostTextDiv.textContent.toLowerCase();
                        postText += '\n' + repostText;
                    } else {
                        postText = repostText = repostTextDiv.textContent.toLowerCase();
                    }
                }
            }
            var postLinks = postTextDiv.querySelectorAll('.mem_link');
            if (postLinks) {
                var postLinksTexts = [];
                postLinks.forEach(function(e) {
                    postLinksTexts.push('"' + e.textContent.toLowerCase() + '"');
                });
            }
            return junkGroups.some(function(junkGroup) {
                var isJunkDetected = junkGroup.every(function(junk) {
                    var linkTextModifier = junk.indexOf('$link-text=');
                    if (linkTextModifier == 0) {
                        if (postLinks) {
                            var junkText = junk.slice(11); // '$link-text='.length
                            return postLinksTexts.some(function(e) {
                                return e.indexOf(junkText) >= 0;
                            });
                        }
                        return false;
                    }
                    var repostAuthorModifier = junk.indexOf('$repost-author=');
                    if (repostAuthorModifier == 0) {
                        if (repostDiv) {
                            var junkText = junk.slice(15); // '$repost-author='.length
                            return repostAuthor.indexOf(junkText) >= 0;
                        }
                        return false;
                    }
                    var repostTextModifier = junk.indexOf('$repost-text=');
                    if (repostTextModifier == 0) {
                        if (repostTextDiv) {
                            var junkText = junk.slice(13); // '$repost-text='.length
                            return repostText.indexOf(junkText) >= 0;
                        }
                        return false;
                    }
                    return postText.indexOf(junk) >= 0;
                });
                if (isJunkDetected) {
                    console.log('\nJunk detected!');
                    console.log('Rule: ' + junkGroup);
                    console.log('Text: ' + postText);
                    if (repostDiv) {
                        console.log('Repost author: ' + repostAuthor);
                    }
                    if (repostTextDiv) {
                        console.log('Repost text: ' + repostText);
                    }
                    if (postLinks) {
                        postLinksTexts.forEach(function(e) {
                            console.log('Link text: ' + e);
                        });
                    }
                }
                return isJunkDetected;
            });
        }
    }

    function isHidden(post) {
        return post.style.display == 'none';
    }

    function hide(post) {
        post.style.display = 'none';
    }

    /**
     * Helper class that uses either MutationObserver or DOMNode* events to keep an eye on DOM changes
     * <br/>
     * Two public methods:
     * <br/>
     * <pre>observe</pre> starts observing the DOM changes
     * <pre>dispose</pre> stops doing it
     */
    var DomObserver = (function () { // jshint ignore:line

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var eventListenerSupported = window.addEventListener;

        return function (callback) {

            var mutationObserver;

            var observeDom = function (callback) {
                if (!document.body) {
                    return;
                }

                if (MutationObserver) {
                    mutationObserver = new MutationObserver(function (mutations) {
                        if (mutations && mutations.length) {
                            callback();
                        }
                    });
                    mutationObserver.observe(document.body, { childList: true, subtree: true });
                } else if (eventListenerSupported) {
                    document.addEventListener('DOMNodeInserted', callback, false);
                    document.addEventListener('DOMNodeRemoved', callback, false);
                }
            };

            // EXPOSE
            this.observe = function () {
                if (!document.body) {
                    document.addEventListener('DOMContentLoaded', function () {
                        observeDom(callback);
                    });
                } else {
                    observeDom(callback);
                }
            };

            this.dispose = function () {
                if (mutationObserver) {
                    mutationObserver.disconnect();
                } else if (eventListenerSupported) {
                    document.removeEventListener('DOMNodeInserted', callback, false);
                    document.removeEventListener('DOMNodeRemoved', callback, false);
                }
            };
        };
    })();

    // Periodic main function
    function inner() {
        var posts = document.querySelectorAll('.post');
        for (var i = 0; i < posts.length && i < 10; i++) {
            var post = posts[posts.length - 1 - i];
            if (!isHidden(post) && isJunk(post)) {
                hide(post);
                console.log('Junk removed!');
            }
        }
    }

    // First time execution
    inner();

    // Handle dynamically added elements
    var domObserver = new DomObserver(inner);
    domObserver.observe();
})();
