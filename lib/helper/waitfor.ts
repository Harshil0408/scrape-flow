export function waitFor(ms: number){
    return new Promise((resolver)=> setTimeout(
        resolver, ms
    ));
}