class CameraUtils {
  constructor() {
    this.stream = null
    this.video = null
    this.canvas = null
  }

  async initializeCamera(videoElement) {
    try {
      this.video = videoElement

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Use back camera if available
        },
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.video.srcObject = this.stream

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play()
          resolve()
        }
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      throw new Error("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.")
    }
  }

  capturePhoto() {
    if (!this.video || !this.stream) {
      throw new Error("Kamera belum diinisialisasi")
    }

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = this.video.videoWidth
    canvas.height = this.video.videoHeight

    context.drawImage(this.video, 0, 0, canvas.width, canvas.height)

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        "image/jpeg",
        0.8,
      )
    })
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
      this.stream = null
    }

    if (this.video) {
      this.video.srcObject = null
    }
  }
}

export default CameraUtils
