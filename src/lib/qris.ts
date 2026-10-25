/**
 * EMVCo / QRIS String Converter & Helper Library
 * Implements static-to-dynamic conversion and CRC-16/CCITT-FALSE calculation
 * compatible with standard ASPI/EMVCo QRIS specification.
 */

// Standard EMVCo CRC-16/CCITT-FALSE calculation (Polynomial: 0x1021, Init: 0xFFFF)
export function calcCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface TLVTag {
  tag: string;
  length: number;
  value: string;
}

/**
 * Parse an EMVCo string into a record of TLV tags.
 */
export function parseEMVCo(qrisString: string): Map<string, string> {
  const tags = new Map<string, string>();
  let i = 0;
  while (i < qrisString.length) {
    if (i + 4 > qrisString.length) break;
    const tag = qrisString.substring(i, i + 2);
    const len = parseInt(qrisString.substring(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > qrisString.length) break;
    const val = qrisString.substring(i + 4, i + 4 + len);
    tags.set(tag, val);
    i += 4 + len;
  }
  return tags;
}

/**
 * Default fallback ShopeePay Static QRIS string for testing.
 */
export const DEFAULT_SHOPEEPAY_STATIC_QRIS =
  '00020101021126580016COM.SHOPEE.WWW011893600914000000000002155204939953033605802ID5912Shopee Merchant6008JAKARTA6105123456304ABCD';

/**
 * Convert a Static QRIS payload into a Dynamic QRIS payload with specified nominal.
 */
export function convertStaticToDynamicQris(
  staticQrisPayload: string,
  amount: number,
  _terminalLabel?: string
): string {
  const cleanQris = (staticQrisPayload || '').trim();
  if (!cleanQris) return '';

  const tags = parseEMVCo(cleanQris);
  if (tags.size === 0) {
    return cleanQris;
  }

  // Set Point of Initiation Method to '12' (Dynamic)
  tags.set('01', '12');

  // Set Transaction Amount (Tag 54)
  const amountStr = Math.round(amount).toString();
  tags.set('54', amountStr);

  // Ensure Currency is IDR (Tag 53 = '360')
  if (!tags.has('53')) {
    tags.set('53', '360');
  }

  // Set Country Code (Tag 58 = 'ID')
  if (!tags.has('58')) {
    tags.set('58', 'ID');
  }

  // Remove Tag 63 (CRC) so we can recalculate it
  tags.delete('63');

  // Reconstruct sorted TLV string
  const sortedTags = Array.from(tags.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  let basePayload = '';
  for (const tag of sortedTags) {
    const val = tags.get(tag)!;
    const lenStr = val.length.toString().padStart(2, '0');
    basePayload += `${tag}${lenStr}${val}`;
  }

  // Append Tag 63 header ('6304') and compute CRC16
  const payloadForCrc = basePayload + '6304';
  const checksum = calcCRC16(payloadForCrc);

  return payloadForCrc + checksum;
}

/**
 * Generate standard ASPI Dynamic QRIS with valid CRC-16 checksum
 */
export function buildAspiQrisPayload(invoiceId: string, amount: number): string {
  const amountStr = Math.round(amount).toString();
  const amtTag = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  const invTag = `07${invoiceId.length.toString().padStart(2, '0')}${invoiceId}`;
  const additionalDataTag = `62${invTag.length.toString().padStart(2, '0')}${invTag}`;
  const base = `00020101021226670016ID.GOV.DLH.LUMAJANG01189360091400000000000215520493995303360${amtTag}5802ID5912DLH LUMAJANG6008LUMAJANG610567311${additionalDataTag}6304`;
  const checksum = calcCRC16(base);
  return base + checksum;
}
