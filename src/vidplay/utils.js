import { vidplayBase } from "./common.js";
import randomUseragent from 'random-useragent';

// This file is based on https://github.com/Ciarands/vidsrc-to-resolver/blob/dffa45e726a4b944cb9af0c9e7630476c93c0213/vidsrc.py#L16
// Full credits to @Ciarands!

export async function encodeId(v_id) {
    const resp = await (await fetch('https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json')).json();
    const [key1, key2] = resp;
    const decoded_id = keyPermutation(key1, v_id).toString('latin1');
    const encoded_result = keyPermutation(key2, decoded_id).toString('latin1');
    const encoded_base64 = btoa(encoded_result);
    return encoded_base64.replace('/', '_');
}

export async function getFutoken(key, url) {
    const response = await (await fetch(`${vidplayBase}/futoken`, { headers: { "Referer": `${url}/` } })).text();
    const fuKey = response.match(/var\s+k\s*=\s*'([^']+)'/)[1];
    const fuToken = `${fuKey},${Array.from({ length: key.length }, (_, i) => (fuKey.charCodeAt(i % fuKey.length) + key.charCodeAt(i)).toString()).join(',')}`;
    return fuToken;
}

export const generateRandomIp = () => {
    return (Math.floor(Math.random() * 255) + 1)+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255))+"."+(Math.floor(Math.random() * 255));
}

export const generateRandomUserAgent = () => {
    return randomUseragent.getRandom();
}

function keyPermutation(key, data) {
    var state = Array.from(Array(256).keys());
    var index_1 = 0;
    for (var i = 0; i < 256; i++) {
        index_1 = ((index_1 + state[i]) + key.charCodeAt(i % key.length)) % 256;
        var temp = state[i];
        state[i] = state[index_1];
        state[index_1] = temp;
    }
    var index_1 = 0;
    var index_2 = 0;
    var final_key = '';
    for (var char = 0; char < data.length; char++) {
        index_1 = (index_1 + 1) % 256;
        index_2 = (index_2 + state[index_1]) % 256;
        var temp = state[index_1];
        state[index_1] = state[index_2];
        state[index_2] = temp;
        if (typeof data[char] === 'string') {
            final_key += String.fromCharCode(data[char].charCodeAt(0) ^ state[(state[index_1] + state[index_2]) % 256]);
        } else if (typeof data[char] === 'number') {
            final_key += String.fromCharCode(data[char] ^ state[(state[index_1] + state[index_2]) % 256]);
        }
    }
    return final_key;
}