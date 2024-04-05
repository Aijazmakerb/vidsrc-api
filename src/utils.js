import axios from "axios";
import { decode } from "html-entities";

export function adecode(str) {
    const keyBytes = Buffer.from('WXrUARXb1aDLaZjI', 'utf-8');
    let j = 0;
    const s = Buffer.from(Array(256).fill().map((_, i) => i));

    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + keyBytes[i % keyBytes.length]) & 0xff;
        [s[i], s[j]] = [s[j], s[i]];
    }

    const decoded = Buffer.alloc(str.length);
    let i = 0;
    let k = 0;

    for (let index = 0; index < str.length; index++) {
        i = (i + 1) & 0xff;
        k = (k + s[i]) & 0xff;
        [s[i], s[k]] = [s[k], s[i]];
        const t = (s[i] + s[k]) & 0xff;
        decoded[index] = str[index] ^ s[t];
    }

    return decoded;
}

export function decodeBase64UrlSafe(s) {
    const standardizedInput = s.replace('_', '/').replace('-', '+');
    const binaryData = Buffer.from(standardizedInput, 'base64');

    return Buffer.from(binaryData);
}

export function decryptSourceUrl(sourceUrl) {
    const encoded = decodeBase64UrlSafe(sourceUrl);
    const decoded = adecode(encoded);

    const decodedText = decoded.toString('utf-8');
    return decode(decodedText);
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

export async function encodeId(v_id) {
    const response = await axios.get('https://github.com/Ciarands/vidsrc-keys/blob/main/keys.json');
    //const response = await axios.get('https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json');
    //const [key1, key2] = await response.data;
    const rawLines = response.data.match(/"rawLines":\s*\[([\s\S]*?)\]/)[1];
    const [key1, key2] = JSON.parse(`${rawLines.substring(1).replace(/\\"/g, '"')}]`);
    const decoded_id = keyPermutation(key1, v_id).toString('latin1');
    const encoded_result = keyPermutation(key2, decoded_id).toString('latin1');
    const encoded_base64 = btoa(encoded_result);
    return encoded_base64.replace('/', '_');
}

export async function getFutoken(key, url) {
    const response = await axios.get("https://vidplay.online/futoken", { headers: { "Referer": url } });
    const fuKey = response.data.match(/var\s+k\s*=\s*'([^']+)'/)[1];
    const fuToken = `${fuKey},${Array.from({ length: key.length }, (_, i) => (fuKey.charCodeAt(i % fuKey.length) + key.charCodeAt(i)).toString()).join(',')}`;
    return fuToken;
}

export async function getSourceUrl(sourceId) {
    const response = await axios.get(`https://vidsrc.to/ajax/embed/source/${sourceId}`);
    const encryptedSourceUrl = response.data.result?.url;
    return this.decryptSourceUrl(encryptedSourceUrl);
}

export async function getSources(dataId) {
    const response = await axios.get(`https://vidsrc.to/ajax/embed/episode/${dataId}/sources`);
    const data = response.data.result;
    return data.reduce((acc, video) => {
        acc[video.title] = video.id;
        return acc;
    }, {});
}
