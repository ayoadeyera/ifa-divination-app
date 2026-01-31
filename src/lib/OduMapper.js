export class IfaOduMapper {
  constructor() {
    // 4-bit binary map to Name. 1 = Open (I), 0 = Closed (II)
    this.apolaMap = {
      '1111': { name: 'Ogbe',     rank: 1 },
      '0000': { name: 'Oyeku',    rank: 2 },
      '0110': { name: 'Iwori',    rank: 3 },
      '1001': { name: 'Odi',      rank: 4 },
      '1101': { name: 'Irosun',   rank: 5 },
      '1011': { name: 'Owonrin',  rank: 6 },
      '1000': { name: 'Obara',    rank: 7 },
      '0001': { name: 'Okanran',  rank: 8 },
      '1110': { name: 'Ogunda',   rank: 9 },
      '0111': { name: 'Osa',      rank: 10 },
      '0011': { name: 'Ika',      rank: 11 },
      '1100': { name: 'Oturupon', rank: 12 },
      '0101': { name: 'Otura',    rank: 13 },
      '1010': { name: 'Irete',    rank: 14 },
      '1000': { name: 'Ose',      rank: 15 },
      '0100': { name: 'Ofun',     rank: 16 }
    };
  }

  toBinary(num) {
    return num.toString(2).padStart(8, '0');
  }

  getOduProfile(seed) {
    const cleanSeed = seed % 256;
    const binaryString = this.toBinary(cleanSeed);

    // Split legs: Right (first 4 bits in this logic) / Left (last 4 bits)
    const rightBits = binaryString.slice(0, 4);
    const leftBits = binaryString.slice(4, 8);

    const rightApola = this.apolaMap[rightBits] || { name: 'Unknown' };
    const leftApola = this.apolaMap[leftBits]   || { name: 'Unknown' };

    let fullName = "";
    if (rightBits === leftBits) {
      // Meji (Double)
      if (rightApola.name === 'Ogbe') fullName = "Eji Ogbe";
      else fullName = `${rightApola.name} Meji`;
    } else {
      // Amulu (Mixed)
      fullName = `${rightApola.name}-${leftApola.name}`;
    }

    // Visual Mapping: 1='open', 0='closed'
    // This returns arrays like ['open', 'closed', 'open', 'open']
    const visualLegRight = rightBits.split('').map(b => b === '1' ? 'open' : 'closed');
    const visualLegLeft = leftBits.split('').map(b => b === '1' ? 'open' : 'closed');

    return {
      index: cleanSeed,
      name: fullName,
      visuals: {
        right: visualLegRight,
        left: visualLegLeft
      }
    };
  }
}