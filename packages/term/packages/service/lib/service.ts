function registerWorker() : void {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('packages/service/lib/sw.js')
            .then((reg) => console.log(`registration complete ${reg.scope}`))
            .catch((err) => console.error(`error: ${err}`));
    }
}
registerWorker();