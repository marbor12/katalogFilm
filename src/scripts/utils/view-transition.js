class ViewTransition {
  static async transitionTo(callback) {
    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      // Fallback for browsers that don't support View Transition API
      await callback()
      return
    }

    // Use View Transition API
    const transition = document.startViewTransition(async () => {
      await callback()
    })

    try {
      await transition.finished
    } catch (error) {
      console.warn("View transition failed:", error)
    }
  }

  static addCustomTransition(element, animationName) {
    if (element && CSS.supports("view-transition-name", animationName)) {
      element.style.viewTransitionName = animationName
    }
  }
}

export default ViewTransition
