'use client';

import {motion} from 'framer-motion';
import {TypingText} from '@/app/components/CustomTexts';
import styles from '@/styles';
import {fadeIn, staggerContainer} from '@/utils/motion';

const About = () => (
  <section className={`${styles.paddings} flex justify-center max-w-[1024px] mt-10`}>
    <motion.div
    variants={staggerContainer(0.1, 0.1)}
    initial="hidden"
    whileInView="show"
    viewport={{once: false, amount: 0.25}}
    className={`${styles.innerWidth} mx-auto ${styles.flexCenter} flex-col`}>
      <TypingText
      title="| About PretzelDAO"
      textStyles="text-center"/>
      <motion.p
      variants={fadeIn('up', 'tween', 0.2, 1)}
      className='mt-[8px] font-normal text-[24px] text-center text-white'>
        We are a Web3 family born in Munich. We’re bringing Munich Web3 enthusiasts together to create a network of builders and those interested to push web3 products forward. 
        <br/><br/>
        We are connecting people from all backgrounds and creating a shared space to exchange ideas and developments related to Web3.
        <br/><br/>
        We are engaging with the global web3 community, for example, by visiting international conferences and participating in hackathons.
      </motion.p>
    </motion.div>
  </section>
);

export default About;
