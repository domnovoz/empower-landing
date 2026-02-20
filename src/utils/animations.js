export const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  restDelta: 0.01,
};
export const gentleSpring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
  restDelta: 0.01,
};
export const collapseSpring = {
  type: "spring",
  stiffness: 200,
  damping: 28,
  restDelta: 0.01,
};
export const expoOut = [0.16, 1, 0.3, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { ...gentleSpring } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.45, ease: expoOut } },
};

export const softExit = {
  opacity: 0,
  y: -2,
  transition: { duration: 0.3, ease: expoOut },
};

export const collapseExit = {
  opacity: 0,
  height: 0,
  overflow: "hidden",
  transition: {
    opacity: { duration: 0.2, ease: expoOut },
    height: { duration: 0.35, ease: expoOut, delay: 0.05 },
  },
};
