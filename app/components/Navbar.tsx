'use client';

import {motion} from 'framer-motion';
import styles from '@/styles';
import {navVariants} from '@/utils/motion';
import ConnectWallet from './ConnectWallet';

const Navbar = () => (
  <motion.nav
   variants={navVariants}
   initial="hidden"
   whileInView="show"
   className={`${styles.xPaddings} py-8 relative`}>
    <div className='absolute w-[50%] inset-0 gradient-01'/>
    <div className={`${styles.innerWidth} mx-auto flex justify-between gap-8`}>
      <div  className='pl-5'>
        <img src="/logo_pretzel_dao.svg"
        alt="logo"
        className='w-[64px] h-[64px] object-contain'/>
      </div>
      
      <h2 className='font-extrabold text-[24px] leading-[30px] text-white'>PretzelDao - Membership Card</h2>
      
      <div className='pr-5'>
      <ConnectWallet />
      </div>
    </div>
    
  </motion.nav>
);

export default Navbar;
