"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const urls = [
    '/packages/dom/lib/dom.js',
    '/packages/dom/lib/style.js',
    '/packages/fs/lib/fs.js',
    '/packages/commands/lib/commands.js',
    '/packages/service/lib/sw.js',
    '/packages/service/lib/urls.js',
    '/packages/term/lib/term.js',
    '/index.html'
];
class SW {
    static load() {
        addEventListener("install", SW.onInstall);
        addEventListener("fetch", SW.onFetch);
    }
    static handleCommands(ev) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static onInstall(ev) {
        ev.waitUntil(caches.open('v0.1')
            .then((cache) => {
            return cache.addAll(urls);
        }));
    }
    static onFetch(ev) {
        ev.respondWith(caches.match(ev.request).then((matchResponse) => {
            return matchResponse || fetch(ev.request).then((fetchResponse) => {
                return caches.open('v0.1').then((cache) => {
                    cache.put(ev.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }));
    }
}
SW.load();
