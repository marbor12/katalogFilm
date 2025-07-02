class LoadingUtils {
  static show() {
    const loadingIndicator = document.getElementById("loading-indicator")
    if (loadingIndicator) {
      loadingIndicator.style.display = "flex"
      loadingIndicator.setAttribute("aria-hidden", "false")
    }
  }

  static hide() {
    const loadingIndicator = document.getElementById("loading-indicator")
    if (loadingIndicator) {
      loadingIndicator.style.display = "none"
      loadingIndicator.setAttribute("aria-hidden", "true")
    }
  }
}

export default LoadingUtils
