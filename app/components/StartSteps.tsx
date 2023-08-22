import styles from '@/styles';

type StartStepsProps = {
  number: number
  text: string
}

export const StartSteps = ({number, text}:StartStepsProps) => (
  <div className={`${styles.flexCenter} flex-row`}>
    <div className={`${styles.flexCenter} w-[50px] h-[50px] rounded-[15px] bg-[#0077FF]`}>
      <p className='font-bold text-[20px] text-white'>0{number}</p>   
    </div>
    <p className='flex-1 ml-[30px] font-normal text-[18px] text-white leading-[32px]'> {text}</p>
  </div>
);


