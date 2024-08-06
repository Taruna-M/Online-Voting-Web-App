import { motion, useScroll, useSpring } from "framer-motion"
import './styling/style.css'
 export const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
    <motion.div
      className="progress-bar prog-bar bg-success"
      style={{ scaleX }}
    />
    </div>
  );
};

