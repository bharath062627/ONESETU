import { BlockchainRecord } from '../types';

// Cryptographic hash simulation using standard Web Crypto API (SHA-256)
export async function generateSha256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40).toUpperCase();
  }
  // Fallback pseudorandom hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x82A7${hex.toUpperCase()}91FD`;
}

// Initial verifiable records in the local ledger
export const initialBlockchainRecords: BlockchainRecord[] = [
  {
    txHash: '0x82A7C491024DFE56890B91FD',
    blockNumber: 18492041,
    timestamp: '2026-04-12 11:42:19 UTC',
    eventType: 'PROVIDER_VERIFICATION',
    entityId: 'worker-1',
    entityName: 'Ramesh Electrical Services',
    payloadHash: '0x3f72a49b81e4c30291e98cfae498327192837190',
    status: 'MINED',
    explorerUrl: 'https://sepolia.etherscan.io/tx/0x82A7C491024DFE56890B91FD',
    details: {
      providerType: 'Electrician',
      licenseVerified: 'KA-EL-2019-9481',
      identityProof: 'Aadhaar ID Hash (Zero-Knowledge)',
      policeClearance: 'Verified (Mysuru East)',
      smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)',
    }
  },
  {
    txHash: '0x992B431D084FFE22108781AB',
    blockNumber: 18492095,
    timestamp: '2026-04-12 12:15:04 UTC',
    eventType: 'BOOKING_COMPLETION',
    entityId: 'booking-2',
    entityName: 'Electrician Service - Fan & Switchboard Repair',
    payloadHash: '0x5501bc83920192847a9847e93028190283719283',
    status: 'MINED',
    explorerUrl: 'https://sepolia.etherscan.io/tx/0x992B431D084FFE22108781AB',
    details: {
      customerId: 'cust-1 (Ravi)',
      providerId: 'worker-1 (Ramesh)',
      amountPaid: '₹400',
      ratingGiven: 5,
      proofHash: '0x992B...81AB',
      smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)',
    }
  },
  {
    txHash: '0x430E789B1002DA493019FA82',
    blockNumber: 18492144,
    timestamp: '2026-04-13 09:30:00 UTC',
    eventType: 'PROVIDER_VERIFICATION',
    entityId: 'vehicle-1',
    entityName: 'Sharma Logistics (Tata 407)',
    payloadHash: '0x9812401827401928471092837401928374019283',
    status: 'MINED',
    explorerUrl: 'https://sepolia.etherscan.io/tx/0x430E789B1002DA493019FA82',
    details: {
      vehicleNumber: 'KA 09 AB 4912',
      fitnessCertValid: '2027-11-30',
      insuranceValid: '2027-03-15',
      driverVerified: 'Ramesh Sharma',
      smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)',
    }
  }
];
