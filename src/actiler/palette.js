const palette = {
  //pinks
  0x00: '#FFEFFF',
  0x01: '#FF9AAD',
  0x02: '#EF559C',
  0x03: '#FF65AD',
  0x04: '#FF0063',
  0x05: '#BD4573',
  0x06: '#CE0052',
  0x07: '#9C0031',
  0x08: '#522031',

  //reds
  0x10: '#FFBACE',
  0x11: '#FF7573',
  0x12: '#DE3010',
  0x13: '#FF5542',
  0x14: '#FF0000',
  0x15: '#CE6563',
  0x16: '#BD4542',
  0x17: '#BD0000',
  0x18: '#8C2021',

  //oranges
  0x20: '#DECFBD',
  0x21: '#FFCF63',
  0x22: '#DE6521',
  0x23: '#FFAA21',
  0x24: '#FF6500',
  0x25: '#BD8A52',
  0x26: '#DE4500',
  0x27: '#BD4500',
  0x28: '#633010',

  //pastels or something, I guess?
  0x30: '#FFEFDE',
  0x31: '#FFDFCE',
  0x32: '#FFCFAD',
  0x33: '#FFBA8C',
  0x34: '#FFAA8C',
  0x35: '#DE8A63',
  0x36: '#BD6542',
  0x37: '#9C5531',
  0x38: '#8C4521',

  //purple
  0x40: '#FFCFFF',
  0x41: '#EF8AFF',
  0x42: '#CE65DE',
  0x43: '#BD8ACE',
  0x44: '#CE00FF',
  0x45: '#9C659C',
  0x46: '#8C00AD',
  0x47: '#520073',
  0x48: '#310042',

  // more pink
  0x50: '#FFBAFF',
  0x51: '#FF9AFF',
  0x52: '#DE20BD',
  0x53: '#FF55EF',
  0x54: '#FF00CE',
  0x55: '#8C5573',
  0x56: '#BD009C',
  0x57: '#8C0063',
  0x58: '#520042',

  // brown
  0x60: '#DEBA9C',
  0x61: '#CEAA73',
  0x62: '#734531',
  0x63: '#AD7542',
  0x64: '#9C3000',
  0x65: '#733021',
  0x66: '#522000',
  0x67: '#311000',
  0x68: '#211000',

  // yellow
  0x70: '#FFFFCE',
  0x71: '#FFFF73',
  0x72: '#DEDF21',
  0x73: '#FFFF00',
  0x74: '#FFDF00',
  0x75: '#CEAA00',
  0x76: '#9C9A00',
  0x77: '#8C7500',
  0x78: '#525500',

  // blue
  0x80: '#DEBAFF',
  0x81: '#BD9AEF',
  0x82: '#6330CE',
  0x83: '#9C55FF',
  0x84: '#6300FF',
  0x85: '#52458C',
  0x86: '#42009C',
  0x87: '#210063',
  0x88: '#211031',

  // ehm... also blue?
  0x90: '#BDBAFF',
  0x91: '#8C9AFF',
  0x92: '#3130AD',
  0x93: '#3155EF',
  0x94: '#0000FF',
  0x95: '#31308C',
  0x96: '#0000AD',
  0x97: '#101063',
  0x98: '#000021',

  // green
  0xA0: '#9CEFBD',
  0xA1: '#63CF73',
  0xA2: '#216510',
  0xA3: '#42AA31',
  0xA4: '#008A31',
  0xA5: '#527552',
  0xA6: '#215500',
  0xA7: '#103021',
  0xA8: '#002010',

  // icky greenish yellow
  0xB0: '#DEFFBD',
  0xB1: '#CEFF8C',
  0xB2: '#8CAA52',
  0xB3: '#ADDF8C',
  0xB4: '#8CFF00',
  0xB5: '#ADBA9C',
  0xB6: '#63BA00',
  0xB7: '#529A00',
  0xB8: '#316500',

  // Wtf? More blue?
  0xC0: '#BDDFFF',
  0xC1: '#73CFFF',
  0xC2: '#31559C',
  0xC3: '#639AFF',
  0xC4: '#1075FF',
  0xC5: '#4275AD',
  0xC6: '#214573',
  0xC7: '#002073',
  0xC8: '#001042',

  // gonna call this cyan
  0xD0: '#ADFFFF',
  0xD1: '#52FFFF',
  0xD2: '#008ABD',
  0xD3: '#52BACE',
  0xD4: '#00CFFF',
  0xD5: '#429AAD',
  0xD6: '#00658C',
  0xD7: '#004552',
  0xD8: '#002031',

  // more cyan, because we didn't have enough blue-like colors yet
  0xE0: '#CEFFEF',
  0xE1: '#ADEFDE',
  0xE2: '#31CFAD',
  0xE3: '#52EFBD',
  0xE4: '#00FFCE',
  0xE5: '#73AAAD',
  0xE6: '#00AA9C',
  0xE7: '#008A73',
  0xE8: '#004531',

  // also green. Fuck it, whatever.
  0xF0: '#ADFFAD',
  0xF1: '#73FF73',
  0xF2: '#63DF42',
  0xF3: '#00FF00',
  0xF4: '#21DF21',
  0xF5: '#52BA52',
  0xF6: '#00BA00',
  0xF7: '#008A00',
  0xF8: '#214521',

  //greys
  0x0F: '#FFFFFF',
  0x1F: '#ECECEC',
  0x2F: '#DADADA',
  0x3F: '#C8C8C8',
  0x4F: '#B6B6B6',
  0x5F: '#A3A3A3',
  0x6F: '#919191',
  0x7F: '#7F7F7F',
  0x8F: '#6D6D6D',
  0x9F: '#5B5B5B',
  0xAF: '#484848',
  0xBF: '#363636',
  0xCF: '#242424',
  0xDF: '#121212',
  0xEF: '#000000',
}

const ACPalette = {
  toRGBArray: () => {
    let output = {}

    for (let p in palette) {
      let hex = palette[p]

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      let toadd = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        rawh: p
      } : null

      output[hex] = toadd
    }

    return output
  },
  getHexMap: () => {
    let output = {}

    for (let p in palette) {
      let hex = palette[p]

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

      output[String(result[1] + result[2] + result[3]).toLowerCase()] = p
    }

    return output
  },
  dec2hex: d => Number(d).toString(16).padStart(2, '0')
}

export default ACPalette
