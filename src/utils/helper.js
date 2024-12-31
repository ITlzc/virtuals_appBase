// Your CryptoCompare API key
// export const apiKey = "<api-key>";

// Makes requests to CryptoCompare API
export async function makeApiRequest(path) {
    console.log(`Making request to CryptoCompare API: ${path}`)
    try {
        const url = new URL(`https://xjlxljoqbenbvslttrfu.supabase.co/functions/v1/minibackend/api/v1/chart?token=0x3fF1b1272e05A2c15D0F37b9201503E23B0EFc8E&start=0&end=1734935196&interval=60`);
        // url.searchParams.append('api_key',apiKey)
        const response = await fetch(`https://xjlxljoqbenbvslttrfu.supabase.co/functions/v1/minibackend/api/v1/chart?token=0x3fF1b1272e05A2c15D0F37b9201503E23B0EFc8E&start=0&end=1734935196&interval=60`);
        console.log(response)
        return response.json();
    } catch (error) {
        throw new Error(`CryptoCompare request error: ${error.status}`);
    }
}

// Generates a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
    const short = `${fromSymbol}/${toSymbol}`;
    return {
        short,
    };
}

// Returns all parts of the symbol
export function parseFullSymbol(fullSymbol) {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
    if (!match) {
        return null;
    }
    return { exchange: match[1], fromSymbol: match[2], toSymbol: match[3] };
}