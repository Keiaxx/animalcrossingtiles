<template>
  <fish-card color="purple" fluid>
    <div slot="header">QR for tile {{tile}}</div>

    <img ref="qrimage">
  </fish-card>
</template>

<script>
  import QRCode from 'qrcode'
  import DataManager from '../actiler/datamanager'

  import * as iq from 'image-q'

  export default {
    name: 'QRComponent',
    props: {
      tile: String,
      title: String,
      author: String,
      town: String,
      pdata: iq.utils.PointContainer,
      palette: Object,
    },
    methods: {
      generate () {
        let dm = new DataManager()

        dm.setTitle(this.tile + "-" + this.title)
        dm.setAuthor(this.author)
        dm.setTown(this.town)

        let succ = dm.setPalette(this.palette)

        if (succ) {
          dm.injectPhotoData(this.pdata)
        }

        var opts = {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          margin: 3,
        }

        QRCode.toDataURL([{ data: dm.getPreparedData(), mode: 'byte' }], opts, (err, url) => {
          if (err) throw err

          this.$refs.qrimage.src = url

          this.$emit('generated',  {
            num: this.tile,
            image: url
          })
        })
      }
    },
    mounted: function () {
      console.log('QR COMPONENT FOR TILE ' + this.tile)
      this.generate()
    }
  }
</script>

<style scoped>
  img {
    max-width: 95%;
    max-height: 300px;
    width: auto !important;
  }
</style>
