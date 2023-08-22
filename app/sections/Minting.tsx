'use client';

import styles from '@/styles';
import MintModule from '@/app/components/MintModule';
import { TypingText } from '../components/CustomTexts';



const Minting = () => (
    <section className={`${styles.paddings} relative z-10 mt-[50px]`}>
        <div className='flex justify-center'>

             <MintModule />
            <div className="gradient-03" />
        </div>

          
    </section>
  );
  
  export default Minting;