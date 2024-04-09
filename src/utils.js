import { decode } from "html-entities";
import { vidsrcBase } from "./common.js";

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

export async function getSourceUrl(sourceId) {
    const response = await (await fetch(`${vidsrcBase}/ajax/embed/source/${sourceId}`.json()));
    const encryptedSourceUrl = response.result?.url;
    return this.decryptSourceUrl(encryptedSourceUrl);
}

export async function getSources(dataId) {
    const response = await (await fetch(`${vidsrcBase}/ajax/embed/episode/${dataId}/sources`)).json();
    const data = response.result;
    return data.reduce((acc, video) => {
        acc[video.title] = video.id;
        return acc;
    }, {});
}