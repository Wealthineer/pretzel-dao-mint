'use client';

import {motion} from 'framer-motion';
import styles from '@/styles';
import {staggerContainer, fadeIn} from '@/utils/motion';
import { TitleText, TypingText } from '@/app/components/CustomTexts';
import { StartSteps} from '@/app/components/StartSteps';
import {startingFeatures} from '@/constants'

const GetStarted = () => (
  <section className={`${styles.paddings} relative z-10`}>
    <motion.div
      variants={staggerContainer(0.1, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={{once: false, amount: 0.25}}
      className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-8`}>
        
        <motion.div
          variants={fadeIn('right', 'tween', 0.2, 1)}
          className="flex-[0.75] flex justify-center flex-col">
          <TypingText title={"| How to get involved"} />
          <TitleText title={<>Join Pretzel DAO - get your membership card</>} />
          <div className="mt-[31px] flex flex-col max-w-[370px] gap-[24px]">
            {startingFeatures.map((feature, index) => (
              <StartSteps
                key={feature}
                number={index+1}
                text={feature} /> 
            ))}
          </div>

        </motion.div>
        <motion.div
        variants={fadeIn('left', 'tween', 0.2, 1)}
        className={`flex-1 ${styles.flexCenter}`}>
          <img
            src="/logo_pretzel_dao.svg"
            alt="get-started"
            className="w-[90%] h-[90%] object-contain"/>

        </motion.div>
    </motion.div>
  </section>
);

export default GetStarted;
