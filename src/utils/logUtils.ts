export function startLog(tag: string, prefix: string, commands: number, slash: number) {
    console.clear();
    console.log("Autenticado em: " + tag);
    console.log("Prefixo selecionado: " + prefix);
    console.log("");
    console.log("Commands: " + `${commands} registered`)
    console.log("Slash Commands: " + `${slash} registered`)
    console.log("");
}