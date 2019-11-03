const urls : string[] = [
    '/packages/dom/lib/dom.js',
    '/packages/dom/lib/style.js',
    '/packages/fs/lib/fs.js',
    '/packages/commands/lib/commands.js',
    '/packages/service/lib/sw.js',
    '/packages/service/lib/urls.js',
    '/packages/term/lib/term.js',
    '/index.html'
]
class SW {
    public static load() : void {
        addEventListener("install",  SW.onInstall);
        addEventListener("fetch", SW.onFetch);
    }
    public static async handleCommands(ev: any) {
        
    }
    public static onInstall(ev :any) : void {
     ev.waitUntil(
         caches.open('v0.1')
               .then((cache) => {
                     return cache.addAll(
                                  urls   
                            )
                     })
        );
    }
    public static onFetch(ev: any) : void {
        ev.respondWith(
            caches.match(ev.request).then((matchResponse) => {
                return matchResponse || fetch(ev.request).then((fetchResponse)=>{
                     return caches.open('v0.1').then((cache) => {
                                cache.put(ev.request, fetchResponse.clone());
                                return fetchResponse;
                    });
                })
            } 
        ));
    }
}
SW.load();