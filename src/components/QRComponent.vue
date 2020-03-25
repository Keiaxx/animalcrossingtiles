<template>
  <fish-card fluid color="purple">
    <div slot="header">QR for tile {{tile}}</div>

    <canvas ref="qrcanvas" width="200" height="200"></canvas>
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
      generate() {
        let dm = new DataManager()

        dm.setTitle(this.title)
        dm.setAuthor(this.author)
        dm.setTown(this.town)

        let succ = dm.setPalette(this.palette)

        if(succ){
          dm.injectPhotoData(this.pdata)
        }

        QRCode.toCanvas(this.$refs.qrcanvas,
          [{ data: dm.getPreparedData(), mode: 'byte' }],
          {
            errorCorrectionLevel: 'M' // Nintendo app seems to want medium error correction
          },
          (error) => {
            if (error) {
              console.error(error)
              return
            }

            console.log("Generated QR Code for " + this.tile)
          })
      }
    },
    mounted: function() {
      console.log("QR COMPONENT FOR TILE " + this.tile)
      this.generate()
    }
  }
</script>

<style scoped>

</style>
