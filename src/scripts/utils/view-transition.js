class ViewTransition {
  static async transitionTo(callback) {
    console.log("Starting view transition");
    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      console.log("View Transition API not supported, using fallback");
      // Fallback for browsers that don't support View Transition API
      try {
        await callback();
        console.log("Fallback transition completed successfully");
      } catch (error) {
        console.error("Error during fallback transition:", error);
      }
      return;
    }

    console.log("Using View Transition API");
    // Use View Transition API
    const transition = document.startViewTransition(async () => {
      try {
        await callback();
        console.log("View transition callback completed");
      } catch (error) {
        console.error("Error in view transition callback:", error);
      }
    });

    try {
      await transition.finished;
      console.log("View transition finished successfully");
    } catch (error) {
      console.error("View transition failed:", error);
    }
  }

  static addCustomTransition(element, animationName) {
    if (element && CSS.supports("view-transition-name", animationName)) {
      element.style.viewTransitionName = animationName;
    }
  }
}

export default ViewTransition;
