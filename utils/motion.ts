enum TransitionDirection {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
}

enum TransitionType {
  spring = 'spring',
  tween = 'tween',
  inertia = 'inertia',
}

enum TransitionEase {
  easeIn = 'easeIn',
  easeOut = 'easeOut',
  easeInOut = 'easeInOut',
  linear = 'linear',
  circIn = 'circIn',
  circOut = 'circOut',
  circInOut = 'circInOut',
  backIn = 'backIn',
  backOut = 'backOut',
  backInOut = 'backInOut',
  anticipate = 'anticipate',
}

export const navVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 140,
    },
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      delay: 1,
    },
  },
};



export const slideIn = (direction: TransitionDirection, type: TransitionType, delay: number, duration: number) => ({
  hidden: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '100%' : 0,
  },
  show: {
    x: 0,
    y: 0,
    transition: {
      type: type,
      dealy: delay,
      duration: duration,
      ease: 'easeOut',
    },
  },
});

export const staggerContainer = (staggerChildren: number, delayChildren: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren,
      delayChildren: delayChildren,
    },
  },
});



export const textContainer = {
  hidden: {
    opacity: 0,
  },
  show: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: i * 0.1 },
  }),
};

export const textVariant = (delay: number) => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 1.25,
      delay: delay,
    },
  },
});

export const textVariant2 = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      ease: 'easeIn',
    },
  },
};

export const fadeIn = (direction: TransitionDirection, type: TransitionType, delay: number, duration: number) => ({
  hidden: {
    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export const zoomIn = (delay: number, duration: number) => ({
  hidden: {
    scale: 0,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'tween',
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});
